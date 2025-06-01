// Firebase Imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion
} from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyCBAgNEOcl7QCmHQy2mJBQbwKSfmRNbRl0",
  authDomain: "whatflix-a17fb.firebaseapp.com",
  projectId: "whatflix-a17fb",
  storageBucket: "whatflix-a17fb.appspot.com",
  messagingSenderId: "369819362727",
  appId: "1:369819362727:web:b55af0726c7b29b8e9c282",
  measurementId: "G-Z6RX0KXLKY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// DOM Elements
const authContainer = document.getElementById("auth-container");
const mainApp = document.getElementById("main-app");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const signInBtn = document.getElementById("signInBtn");
const signUpBtn = document.getElementById("signUpBtn");
const signOutBtn = document.getElementById("signOutBtn");

const movieTitleEl = document.getElementById("movie-title");
const moviePosterEl = document.getElementById("movie-poster");
const movieOverviewEl = document.getElementById("movie-overview");
const loadingEl = document.getElementById("loading");
const watchlistEl = document.getElementById("watchlist-items");

const likeBtn = document.getElementById("likeBtn");
const dislikeBtn = document.getElementById("dislikeBtn");

// State
let movies = [];
let currentIndex = 0;
let currentUser = null;
let watchlist = [];

// TMDB API
const TMDB_API_KEY = "406d510b8114c3a454abf556a384a949";

// Show loading spinner
function showLoading(show) {
  if (show) {
    loadingEl.classList.remove("hidden");
  } else {
    loadingEl.classList.add("hidden");
  }
}

// Load movies from TMDB
async function loadMovies() {
  showLoading(true);
  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&with_watch_providers=8&watch_region=GB`
    );
    const data = await res.json();
    movies = data.results || [];
    currentIndex = 0;
    showMovie();
  } catch (error) {
    console.error("Error loading movies:", error);
    movieTitleEl.textContent = "Failed to load movies. Please try again later.";
    moviePosterEl.src = "";
    movieOverviewEl.textContent = "";
  } finally {
    showLoading(false);
  }
}

// Show current movie
function showMovie() {
  if (!movies.length || currentIndex >= movies.length) {
    movieTitleEl.textContent = "No more movies!";
    moviePosterEl.src = "";
    movieOverviewEl.textContent = "";
    return;
  }
  const movie = movies[currentIndex];
  movieTitleEl.textContent = movie.title;
  moviePosterEl.src = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : "";
  moviePosterEl.alt = movie.title + " poster";
  movieOverviewEl.textContent = movie.overview || "";
}

// Update watchlist UI
function updateWatchlistUI() {
  watchlistEl.innerHTML = "";
  watchlist.forEach((movie) => {
    const li = document.createElement("li");
    li.textContent = movie.title;
    watchlistEl.appendChild(li);
  });
}

// Save watchlist to Firestore
async function saveWatchlistToFirestore() {
  if (!currentUser) return;
  try {
    const userDocRef
