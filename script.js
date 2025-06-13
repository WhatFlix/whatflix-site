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
  setDoc,
  getDoc,
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
  appId: "1:369819362727:web:b55af0726c7b29b8e9c282"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const TMDB_API_KEY = "406d510b8114c3a454abf556a384a949";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

// DOM elements
const signupForm = document.getElementById("signup-form");
const signinForm = document.getElementById("signin-form");
const signOutBtn = document.getElementById("signout-btn");
const profileBtn = document.getElementById("profile-btn");
const closeProfileBtn = document.getElementById("close-profile");

const authSection = document.getElementById("auth-section");
const appSection = document.getElementById("app-section");
const profileSection = document.getElementById("profile-section");
const navButtons = document.getElementById("nav-buttons");

const title = document.getElementById("title");
const overview = document.getElementById("overview");
const poster = document.getElementById("poster");
const likeBtn = document.getElementById("like");
const dislikeBtn = document.getElementById("dislike");
const watchlistContainer = document.getElementById("watchlist");

const searchInput = document.getElementById("search-input");
const genreFilter = document.getElementById("genre-filter");
const ratingFilter = document.getElementById("rating-filter");
const mediaTypeSelect = document.getElementById("media-type");
const netflixToggle = document.getElementById("netflix-toggle");

const profileUsername = document.getElementById("profile-username");
const profileEmail = document.getElementById("profile-email");
const profileWatchlist = document.getElementById("profile-watchlist");

const friendSearch = document.getElementById("friend-search");
const friendResults = document.getElementById("friend-results");
const friendsWatchlist = document.getElementById("friends-watchlist");

let currentUser = null;
let movieQueue = [];
let genres = {};

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

// ✅ AUTH
signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("signup-email").value;
  const password = document.getElementById("signup-password").value;
  const username = document.getElementById("signup-username").value.trim();

  try {
    const userCred = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, "users", userCred.user.uid), {
      username: username || null,
      email,
      watchlist: [],
      following: []
    });
  } catch (err) {
    alert("Signup error: " + err.message);
  }
});

signinForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("signin-email").value;
  const password = document.getElementById("signin-password").value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (err) {
    alert("Signin error: " + err.message);
  }
});

signOutBtn.addEventListener("click", () => signOut(auth));

onAuthStateChanged(auth, async (user) => {
  currentUser = user;
  if (user) {
    await ensureUserDoc(user);
    authSection.style.display = "none";
    appSection.style.display = "block";
    navButtons.style.visibility = "visible";
    fetchGenres();
    fetchPopular();
    loadWatchlist();
  } else {
    authSection.style.display = "block";
    appSection.style.display = "none";
    profileSection.style.display = "none";
    navButtons.style.visibility = "hidden";
  }
});

// ✅ TMDB + Filters
async function fetchGenres() {
  const type = mediaTypeSelect.value;
  const res = await fetch(`${TMDB_BASE_URL}/genre/${type}/list?api_key=${TMDB_API_KEY}`);
  const data = await res.json();
  genres = {};
  data.genres.forEach((g) => (genres[g.id] = g.name));
  genreFilter.innerHTML = '<option value="">All Genres</option>' +
    data.genres.map((g) => `<option value="${g.id}">${g.name}</option>`).join("");
}

async function fetchPopular() {
  const type = mediaTypeSelect.value;
  let results = [];
  for (let page = 1; page <= 2; page++) {
    const res = await fetch(`${TMDB_BASE_URL}/${type}/popular?api_key=${TMDB_API_KEY}&region=GB&page=${page}`);
    const data = await res.json();
    results = results.concat(data.results.filter(filterMovie));
  }
  movieQueue = results;
  showNextMovie();
}

function filterMovie(movie) {
  const minRating = parseFloat(ratingFilter.value || 0);
  const selectedGenre = genreFilter.value;
  return (!selectedGenre || movie.genre_ids.includes(parseInt(selectedGenre))) &&
         (movie.vote_average >= minRating);
}

async function checkNetflixAvailability(id, type) {
  try {
    const res = await fetch(`${TMDB_BASE_URL}/${type}/${id}/watch/providers?api_key=${TMDB_API_KEY}`);
    const data = await res.json();
    const providers = data.results?.GB?.flatrate || [];
    return providers.some((p) => p.provider_name === "Netflix");
  } catch {
    return true;
  }
}

async function showNextMovie() {
  if (movieQueue.length === 0) {
    title.innerText = "No more results!";
    poster.src = "assets/fallback.jpg";
    overview.innerText = "";
    return;
  }

  const movie = movieQueue.shift();

  if (netflixToggle.checked) {
    const isOnNetflix = await checkNetflixAvailability(movie.id, mediaTypeSelect.value);
    if (!isOnNetflix) return showNextMovie();
  }

  title.innerText = movie.title || movie.name || "Untitled";
  overview.innerText = movie.overview || "No description available.";
  poster.src = movie.poster_path ? `${TMDB_IMAGE_BASE}${movie.poster_path}` : "assets/fallback.jpg";
}

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

// ✅ Search
async function searchMovieOrShow(query) {
  const type = mediaTypeSelect.value;
  const res = await fetch(`${TMDB_BASE_URL}/search/${type}?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&region=GB`);
  const data = await res.json();
  movieQueue = data.results.filter(filterMovie);
  showNextMovie();
}

// ✅ Like / Dislike
likeBtn.addEventListener("click", () => {
  const movie = {
    title: title.innerText,
    overview: overview.innerText,
    poster_path: poster.src.includes("/w500/")
      ? "/w500/" + poster.src.split("/w500/")[1]
      : null
  };
  saveToWatchlist(movie);
  showNextMovie();
});

dislikeBtn.addEventListener("click", showNextMovie);

async function saveToWatchlist(movie) {
  if (!currentUser) return;
  const ref = doc(db, "users", currentUser.uid);
  await setDoc(ref, { watchlist: arrayUnion(movie) }, { merge: true });
  loadWatchlist();
}

// ✅ Watchlist / Profile
async function loadWatchlist() {
  if (!currentUser) return;
  const snap = await getDoc(doc(db, "users", currentUser.uid));
  const data = snap.exists() ? snap.data() : {};
  const list = data.watchlist || [];
  watchlistContainer.innerHTML = list.map(m => `<li>${m.title}</li>`).join("");
  profileWatchlist.innerHTML = list.map(m => `<li>${m.title}</li>`).join("");
}

profileBtn.addEventListener("click", async () => {
  const snap = await getDoc(doc(db, "users", currentUser.uid));
  const data = snap.data();
  profileUsername.textContent = data.username || "(no username)";
  profileEmail.textContent = data.email || "N/A";
  loadWatchlist();
  appSection.style.display = "none";
  profileSection.style.display = "block";
});

closeProfileBtn.addEventListener("click", () => {
  profileSection.style.display = "none";
  appSection.style.display = "block";
});
