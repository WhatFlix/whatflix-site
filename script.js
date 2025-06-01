import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";

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

// DOM elements
const authContainer = document.getElementById("auth-container");
const mainApp = document.getElementById("main-app");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const signInBtn = document.getElementById("signInBtn");
const signUpBtn = document.getElementById("signUpBtn");
const signOutBtn = document.getElementById("signOutBtn");

// Auth Events
signInBtn.addEventListener("click", () => {
  const email = emailInput.value;
  const password = passwordInput.value;
  signInWithEmailAndPassword(auth, email, password)
    .then(() => console.log("Signed in!"))
    .catch((error) => alert("Sign In Error: " + error.message));
});

signUpBtn.addEventListener("click", () => {
  const email = emailInput.value;
  const password = passwordInput.value;
  createUserWithEmailAndPassword(auth, email, password)
    .then(() => console.log("User created!"))
    .catch((error) => alert("Sign Up Error: " + error.message));
});

signOutBtn.addEventListener("click", () => {
  signOut(auth);
});

// Auth State Listener
onAuthStateChanged(auth, (user) => {
  if (user) {
    authContainer.classList.add("hidden");
    mainApp.classList.remove("hidden");
    loadMovies();
  } else {
    authContainer.classList.remove("hidden");
    mainApp.classList.add("hidden");
  }
});

// TMDB Logic
const TMDB_API_KEY = "406d510b8114c3a454abf556a384a949";
let movies = [];
let currentIndex = 0;
let watchlist = [];

async function loadMovies() {
  try {
    const res = await fetch(`https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&with_watch_providers=8&watch_region=GB`);
    const data = await res.json();
    movies = data.results;
    currentIndex = 0;
    showMovie();
  } catch (err) {
    console.error("Error loading movies:", err);
  }
}

function showMovie() {
  const titleEl = document.getElementById("movie-title");
  const posterEl = document.getElementById("movie-poster");

  if (!movies.length || currentIndex >= movies.length) {
    titleEl.textContent = "No more movies!";
    posterEl.src = "";
    return;
  }

  const movie = movies[currentIndex];
  titleEl.textContent = movie.title;
  posterEl.src = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
}

// Swipe Events
document.getElementById("likeBtn").addEventListener("click", () => {
  if (movies[currentIndex]) {
    watchlist.push(movies[currentIndex]);
    updateWatchlist();
  }
  currentIndex++;
  showMovie();
});

document.getElementById("dislikeBtn").addEventListener("click", () => {
  currentIndex++;
  showMovie();
});

function updateWatchlist() {
  const listEl = document.getElementById("watchlist");
  listEl.innerHTML = ""; // Clear existing items
  watchlist.forEach((movie) => {
    const li = document.createElement("li");
    li.textContent = movie.title;
    listEl.appendChild(li);
  });
}
