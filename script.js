import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  collection,
  getDocs,
  query,
  where
} from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCBAgNEOcl7QCmHQy2mJBQbwKSfmRNbRl0",
  authDomain: "whatflix-a17fb.firebaseapp.com",
  projectId: "whatflix-a17fb",
  storageBucket: "whatflix-a17fb.appspot.com",
  messagingSenderId: "369819362727",
  appId: "1:369819362727:web:b55af0726c7b29b8e9c282",
  measurementId: "G-Z6RX0KXLKY"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const TMDB_API_KEY = "406d510b8114c3a454abf556a384a949";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

// DOM
const poster = document.getElementById("poster");
const title = document.getElementById("title");
const overview = document.getElementById("overview");
const likeBtn = document.getElementById("like");
const dislikeBtn = document.getElementById("dislike");
const watchlistContainer = document.getElementById("watchlist");
const friendsWatchlist = document.getElementById("friends-watchlist");
const friendSearch = document.getElementById("friend-search");
const friendResults = document.getElementById("friend-results");
const authSection = document.getElementById("auth-section");
const appSection = document.getElementById("app-section");
const signUpForm = document.getElementById("signup-form");
const signInForm = document.getElementById("signin-form");
const signOutBtn = document.getElementById("signout-btn");
const profileBtn = document.getElementById("profile-btn");
const closeProfileBtn = document.getElementById("close-profile");
const profileSection = document.getElementById("profile-section");
const profileUsername = document.getElementById("profile-username");
const profileEmail = document.getElementById("profile-email");
const profileWatchlist = document.getElementById("profile-watchlist");
const searchInput = document.getElementById("search-input");
const genreFilter = document.getElementById("genre-filter");
const ratingFilter = document.getElementById("rating-filter");
const mediaTypeSelect = document.getElementById("media-type");

let currentUser = null;
let movieQueue = [];
let genres = {};

async function fetchGenres() {
  const type = mediaTypeSelect.value;
  const res = await fetch(`${TMDB_BASE_URL}/genre/${type}/list?api_key=${TMDB_API_KEY}`);
  const data = await res.json();
  genres = {};
  data.genres.forEach(g => {
    genres[g.id] = g.name;
  });
  genreFilter.innerHTML = '<option value="">All Genres</option>' +
    data.genres.map(g => `<option value="${g.id}">${g.name}</option>`).join("");
}

async function fetchPopular() {
  const type = mediaTypeSelect.value;
  let combined = [];
  for (let page = 1; page <= 3; page++) {
    const res = await fetch(`${TMDB_BASE_URL}/${type}/popular?api_key=${TMDB_API_KEY}&region=GB&page=${page}`);
    const data = await res.json();
    combined = combined.concat(data.results.filter(m => filterMovie(m)));
  }
  movieQueue = combined;
  showNextMovie();
}

function filterMovie(movie) {
  const minRating = parseFloat(ratingFilter.value || 0);
  const selectedGenre = genreFilter.value;
  return (!selectedGenre || movie.genre_ids.includes(parseInt(selectedGenre))) &&
         (movie.vote_average >= minRating);
}

async function searchMovieOrShow(query) {
  const type = mediaTypeSelect.value;
  const res = await fetch(`${TMDB_BASE_URL}/search/${type}?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&region=GB`);
  const data = await res.json();
  movieQueue = data.results.filter(m => filterMovie(m));
  showNextMovie();
}

async function showNextMovie() {
  if (movieQueue.length === 0) {
    title.innerText = "No more results!";
    poster.src = "";
    overview.innerText = "";
    return;
  }
  const movie = movieQueue.shift();
  const isOnNetflix = await checkNetflixAvailability(movie.id, mediaTypeSelect.value);
  if (!isOnNetflix) return showNextMovie();

  title.innerText = movie.title || movie.name;
  poster.src = movie.poster_path ? `${TMDB_IMAGE_BASE}${movie.poster_path}` : "fallback.jpg";
  overview.innerText = movie.overview;
}

async function checkNetflixAvailability(id, type) {
  const res = await fetch(`${TMDB_BASE_URL}/${type}/${id}/watch/providers?api_key=${TMDB_API_KEY}`);
  const data = await res.json();
  const providers = data.results?.GB?.flatrate || [];
  return providers.some(p => p.provider_name === "Netflix");
}

async function saveToWatchlist(movie) {
  if (!currentUser) return;
  const userDocRef = doc(db, "users", currentUser.uid);
  await setDoc(userDocRef, { watchlist: arrayUnion(movie) }, { merge: true });
  loadWatchlist();
}

async function loadWatchlist() {
  if (!currentUser) return;
  const userDoc = await getDoc(doc(db, "users", currentUser.uid));
  const movies = userDoc.exists() ? userDoc.data().watchlist || [] : [];
  watchlistContainer.innerHTML = movies.map(m => `<li>${m.title || m.name}</li>`).join("");
  profileWatchlist.innerHTML = movies.map(m => `<li>${m.title || m.name}</li>`).join("");
  loadFriendsWatchlist();
}

// 🔍 FRIEND SEARCH
friendSearch.addEventListener("input", async () => {
  const term = friendSearch.value.trim().toLowerCase();
  friendResults.innerHTML = "";
  if (!term || !currentUser) return;

  const usersRef = collection(db, "users");
  const q = query(usersRef, where("username", ">=", term), where("username", "<=", term + "\uf8ff"));
  const snapshot = await getDocs(q);
  const currentUserData = (await getDoc(doc(db, "users", currentUser.uid))).data();
  const following = currentUserData?.following || [];

  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    if (docSnap.id !== currentUser.uid) {
      const li = document.createElement("li");
      li.textContent = data.username || "(no username)";
      const btn = document.createElement("button");
      btn.className = "follow-btn";
      btn.textContent = following.includes(docSnap.id) ? "Unfollow" : "Follow";
      btn.onclick = async () => {
        const action = following.includes(docSnap.id) ? arrayRemove : arrayUnion;
        await updateDoc(doc(db, "users", currentUser.uid), {
          following: action(docSnap.id)
        });
        friendSearch.dispatchEvent(new Event("input")); // refresh list
        loadFriendsWatchlist();
      };
      li.appendChild(btn);
      friendResults.appendChild(li);
    }
  });
});

// 📥 FRIENDS' WATCHLISTS
async function loadFriendsWatchlist() {
  if (!currentUser) return;
  const userSnap = await getDoc(doc(db, "users", currentUser.uid));
  const following = userSnap.data()?.following || [];
  let all = [];

  for (const friendId of following) {
    const friendSnap = await getDoc(doc(db, "users", friendId));
    const friend = friendSnap.data();
    if (friend?.watchlist?.length) {
      friend.watchlist.forEach(movie => {
        all.push(`<li>${movie.title || movie.name} <span style="color:#888;">(${friend.username})</span></li>`);
      });
    }
  }

  friendsWatchlist.innerHTML = all.join("") || "<li>No picks from friends yet.</li>";
}

// 👤 Sign Up — username optional
signUpForm.addEventListener("submit", async e => {
  e.preventDefault();
  const usernameInput = signUpForm["signup-username"];
  const username = usernameInput ? usernameInput.value.trim() : null;
  const email = signUpForm["signup-email"].value;
  const password = signUpForm["signup-password"].value;

  try {
    const userCred = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCred.user.uid;
    await setDoc(doc(db, "users", uid), {
      username: username || null,
      email,
      watchlist: [],
      following: []
    });
  } catch (err) {
    console.error(err);
  }
});
// Firebase + TMDB setup with follow/friends/watchlist fix // Updated June 2025 — full functionality with follow, likes, profiles

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js"; import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js"; import { getFirestore, doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove, collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";

const firebaseConfig = { apiKey: "AIzaSyCBAgNEOcl7QCmHQy2mJBQbwKSfmRNbRl0", authDomain: "whatflix-a17fb.firebaseapp.com", projectId: "whatflix-a17fb", storageBucket: "whatflix-a17fb.appspot.com", messagingSenderId: "369819362727", appId: "1:369819362727:web:b55af0726c7b29b8e9c282", measurementId: "G-Z6RX0KXLKY" };

const app = initializeApp(firebaseConfig); const auth = getAuth(app); const db = getFirestore(app);

const TMDB_API_KEY = "406d510b8114c3a454abf556a384a949"; const TMDB_BASE_URL = "https://api.themoviedb.org/3"; const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

const poster = document.getElementById("poster"); const title = document.getElementById("title"); const overview = document.getElementById("overview"); const likeBtn = document.getElementById("like"); const dislikeBtn = document.getElementById("dislike"); const watchlistContainer = document.getElementById("watchlist"); const friendsWatchlist = document.getElementById("friends-watchlist"); const friendSearch = document.getElementById("friend-search"); const friendResults = document.getElementById("friend-results"); const authSection = document.getElementById("auth-section"); const appSection = document.getElementById("app-section"); const signUpForm = document.getElementById("signup-form"); const signInForm = document.getElementById("signin-form"); const signOutBtn = document.getElementById("signout-btn"); const profileBtn = document.getElementById("profile-btn"); const closeProfileBtn = document.getElementById("close-profile"); const profileSection = document.getElementById("profile-section"); const profileUsername = document.getElementById("profile-username"); const profileEmail = document.getElementById("profile-email"); const profileWatchlist = document.getElementById("profile-watchlist"); const searchInput = document.getElementById("search-input"); const genreFilter = document.getElementById("genre-filter"); const ratingFilter = document.getElementById("rating-filter"); const mediaTypeSelect = document.getElementById("media-type");

let currentUser = null; let movieQueue = []; let genres = {};

async function fetchGenres() { const type = mediaTypeSelect.value; const res = await fetch(${TMDB_BASE_URL}/genre/${type}/list?api_key=${TMDB_API_KEY}); const data = await res.json(); genres = {}; data.genres.forEach(g => { genres[g.id] = g.name; }); genreFilter.innerHTML = '<option value="">All Genres</option>' + data.genres.map(g => <option value="${g.id}">${g.name}</option>).join(""); }

async function fetchPopular() { const type = mediaTypeSelect.value; let combined = []; for (let page = 1; page <= 3; page++) { const res = await fetch(${TMDB_BASE_URL}/${type}/popular?api_key=${TMDB_API_KEY}&region=GB&page=${page}); const data = await res.json(); combined = combined.concat(data.results.filter(m => filterMovie(m))); } movieQueue = combined; showNextMovie(); }

function filterMovie(movie) { const minRating = parseFloat(ratingFilter.value || 0); const selectedGenre = genreFilter.value; return (!selectedGenre || movie.genre_ids.includes(parseInt(selectedGenre))) && (movie.vote_average >= minRating); }

async function searchMovieOrShow(query) { const type = mediaTypeSelect.value; const res = await fetch(${TMDB_BASE_URL}/search/${type}?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&region=GB); const data = await res.json(); movieQueue = data.results.filter(m => filterMovie(m)); showNextMovie(); }

async function showNextMovie() { if (movieQueue.length === 0) { title.innerText = "No more results!"; poster.src = ""; overview.innerText = ""; return; } const movie = movieQueue.shift(); const isOnNetflix = await checkNetflixAvailability(movie.id, mediaTypeSelect.value); if (!isOnNetflix) return showNextMovie(); title.innerText = movie.title || movie.name; poster.src = movie.poster_path ? ${TMDB_IMAGE_BASE}${movie.poster_path} : "fallback.jpg"; overview.innerText = movie.overview; }

async function checkNetflixAvailability(id, type) { const res = await fetch(${TMDB_BASE_URL}/${type}/${id}/watch/providers?api_key=${TMDB_API_KEY}); const data = await res.json(); const providers = data.results?.GB?.flatrate || []; return providers.some(p => p.provider_name === "Netflix"); }

async function saveToWatchlist(movie) { if (!currentUser) return; const userDocRef = doc(db, "users", currentUser.uid); await setDoc(userDocRef, { watchlist: arrayUnion(movie) }, { merge: true }); loadWatchlist(); }

likeBtn.addEventListener("click", () => { const movie = { title: title.innerText, overview: overview.innerText, poster_path: poster.src.includes("/w500/") ? "/w500/" + poster.src.split("/w500/")[1] : null }; saveToWatchlist(movie); });

dislikeBtn.addEventListener("click", showNextMovie);

searchInput.addEventListener("input", () => { const query = searchInput.value.trim(); if (query.length > 2) searchMovieOrShow(query); else fetchPopular(); });

genreFilter.addEventListener("change", fetchPopular); ratingFilter.addEventListener("change", fetchPopular); mediaTypeSelect.addEventListener("change", () => { fetchGenres(); fetchPopular(); });

onAuthStateChanged(auth, async user => { currentUser = user; authSection.style.display = user ? "none" : "block"; appSection.style.display = user ? "block" : "none"; profileSection.style.display = "none"; if (signOutBtn) signOutBtn.style.display = user ? "inline-block" : "none"; if (user) { await fetchGenres(); await fetchPopular(); loadWatchlist(); } });


// 🔐 Login/Logout
signInForm.addEventListener("submit", e => {
  e.preventDefault();
  const email = signInForm["signin-email"].value;
  const password = signInForm["signin-password"].value;
  signInWithEmailAndPassword(auth, email, password).catch(console.error);
});

signOutBtn.addEventListener("click", () => {
  signOut(auth);
});

// 🖱️ Buttons
likeBtn.addEventListener("click", () => {
  const movie = {
    title: title.innerText,
    overview: overview.innerText
  };

  // Rebuild TMDB-style path from full URL
  if (poster.src.includes("/w500/")) {
    const split = poster.src.split("/w500/");
    movie.poster_path = "/w500/" + split[1];
  } else {
    movie.poster_path = null;
  }

  saveToWatchlist(movie);
});

dislikeBtn.addEventListener("click", showNextMovie);

searchInput.addEventListener("input", () => {
  const query = searchInput.value.trim();
  if (query.length > 2) searchMovieOrShow(query);
  else fetchPopular();
});

genreFilter.addEventListener("change", fetchPopular);
ratingFilter.addEventListener("change", fetchPopular);
mediaTypeSelect.addEventListener("change", () => {
  fetchGenres();
  fetchPopular();
});

// 👤 Profile panel
profileBtn.addEventListener("click", async () => {
  if (!currentUser) return;
  const userDoc = await getDoc(doc(db, "users", currentUser.uid));
  const userData = userDoc.data();
  profileUsername.innerText = userData?.username || "(no username yet)";
  profileEmail.innerText = userData?.email || "Unknown";
  loadWatchlist();
  appSection.style.display = "none";
  profileSection.style.display = "block";
});

closeProfileBtn.addEventListener("click", () => {
  profileSection.style.display = "none";
  appSection.style.display = "block";
});

// 🧠 Init
onAuthStateChanged(auth, async user => {
  currentUser = user;
  authSection.style.display = user ? "none" : "block";
  appSection.style.display = user ? "block" : "none";
  profileSection.style.display = "none";
  if (signOutBtn) signOutBtn.style.display = user ? "inline-block" : "none";
  if (user) {
    await fetchGenres();
    await fetchPopular();
    loadWatchlist();
  }
});
