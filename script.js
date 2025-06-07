// Firebase + Auth + Fixes to show/hide nav buttons and auto-create user docs
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

// DOM references
const profileBtn = document.getElementById("profile-btn");
const signOutBtn = document.getElementById("signout-btn");
const navButtons = document.getElementById("nav-buttons");

// DOM elements (as before)
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
  const ref = doc(db, "users", currentUser.uid);
  await setDoc(ref, { watchlist: arrayUnion(movie) }, { merge: true });
  loadWatchlist();
}

likeBtn.addEventListener("click", () => {
  const movie = {
    title: title.innerText,
    overview: overview.innerText,
    poster_path: poster.src.includes("/w500/") ? "/w500/" + poster.src.split("/w500/")[1] : null
  };
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

async function searchMovieOrShow(query) {
  const type = mediaTypeSelect.value;
  const res = await fetch(`${TMDB_BASE_URL}/search/${type}?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&region=GB`);
  const data = await res.json();
  movieQueue = data.results.filter(m => filterMovie(m));
  showNextMovie();
}

async function loadWatchlist() {
  if (!currentUser) return;
  const ref = doc(db, "users", currentUser.uid);
  const snap = await getDoc(ref);
  const movies = snap.exists() ? snap.data().watchlist || [] : [];
  watchlistContainer.innerHTML = movies.map(m => `<li>${m.title || m.name}</li>`).join("");
  profileWatchlist.innerHTML = movies.map(m => `<li>${m.title || m.name}</li>`).join("");
}

// Auto-create user doc if it doesn't exist
async function ensureUserDoc(user) {
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      email: user.email,
      username: null,
      watchlist: [],
      following: []
    });
  }
}

// Profile panel
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

// Auth events
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

signInForm.addEventListener("submit", e => {
  e.preventDefault();
  const email = signInForm["signin-email"].value;
  const password = signInForm["signin-password"].value;
  signInWithEmailAndPassword(auth, email, password).catch(console.error);
});

signOutBtn.addEventListener("click", () => {
  signOut(auth);
});

onAuthStateChanged(auth, async user => {
  currentUser = user;
  authSection.style.display = user ? "none" : "block";
  appSection.style.display = user ? "block" : "none";
  profileSection.style.display = "none";
  if (navButtons) navButtons.style.visibility = user ? "visible" : "hidden";
  if (user) {
    await ensureUserDoc(user);
    await fetchGenres();
    await fetchPopular();
    loadWatchlist();
  }
});
