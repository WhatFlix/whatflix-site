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
  arrayUnion
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

// DOM elements
const poster = document.getElementById("poster");
const title = document.getElementById("title");
const overview = document.getElementById("overview");
const likeBtn = document.getElementById("like");
const dislikeBtn = document.getElementById("dislike");
const watchlistContainer = document.getElementById("watchlist");
const authSection = document.getElementById("auth-section");
const appSection = document.getElementById("app-section");
const signUpForm = document.getElementById("signup-form");
const signInForm = document.getElementById("signin-form");
const signOutBtn = document.getElementById("signout-btn");
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
  const userDocRef = doc(db, "watchlists", currentUser.uid);
  await setDoc(userDocRef, { movies: arrayUnion(movie) }, { merge: true });
  loadWatchlist();
  showNextMovie();
}

async function loadWatchlist() {
  if (!currentUser) return;
  const userDoc = await getDoc(doc(db, "watchlists", currentUser.uid));
  const movies = userDoc.exists() ? userDoc.data().movies || [] : [];
  watchlistContainer.innerHTML = movies.map(m => `<li>${m.title || m.name}</li>`).join("");
}

// Auth events
signUpForm.addEventListener("submit", e => {
  e.preventDefault();
  const email = signUpForm["signup-email"].value;
  const password = signUpForm["signup-password"].value;
  createUserWithEmailAndPassword(auth, email, password).catch(console.error);
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

// Swipe buttons
likeBtn.addEventListener("click", () => {
  saveToWatchlist({
    title: title.innerText,
    poster_path: poster.src,
    overview: overview.innerText
  });
});

dislikeBtn.addEventListener("click", showNextMovie);

// Search and filters
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

// On user login
onAuthStateChanged(auth, user => {
  currentUser = user;
  authSection.style.display = user ? "none" : "block";
  appSection.style.display = user ? "block" : "none";
  if (signOutBtn) {
    signOutBtn.style.display = user ? "inline-block" : "none";
  }
  if (user) {
    fetchGenres();
    fetchPopular();
    loadWatchlist();
  }
});
