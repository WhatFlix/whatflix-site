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
  setDoc
} from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCBAgNEOcl7QCmHQy2mJBQbwKSfmRNbRl0",
  authDomain: "whatflix-a17fb.firebaseapp.com",
  projectId: "whatflix-a17fb",
  storageBucket: "whatflix-a17fb.appspot.com",
  messagingSenderId: "369819362727",
  appId: "1:369819362727:web:b55af0726c7b29b8e9c282",
  measurementId: "G-Z6RX0KXLKY"
};

// Initialize Firebase and services
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// DOM elements
const authContainer = document.getElementById("auth-container");
const mainApp = document.getElementById("main-app");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const signInBtn = document.getElementById("signInBtn");
const signUpBtn = document.getElementById("signUpBtn");
const signOutBtn = document.getElementById("signOutBtn");

const titleEl = document.getElementById("movie-title");
const posterEl = document.getElementById("movie-poster");
const overviewEl = document.getElementById("movie-overview");
const watchlistEl = document.getElementById("watchlist-items");

// Loading spinner element (create and add it)
const loadingSpinner = document.createElement("div");
loadingSpinner.className = "loading-spinner";
loadingSpinner.style.display = "none";
posterEl.parentElement.insertBefore(loadingSpinner, posterEl);

// Auth events
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

// TMDB API key and variables
const TMDB_API_KEY = "406d510b8114c3a454abf556a384a949";
let movies = [];
let currentIndex = 0;
let watchlist = [];

// Listen for auth state changes
onAuthStateChanged(auth, async (user) => {
  if (user) {
    authContainer.classList.add("hidden");
    mainApp.classList.remove("hidden");

    // Load watchlist from Firestore for this user
    const watchlistDocRef = doc(db, "watchlists", user.uid);
    const docSnap = await getDoc(watchlistDocRef);
    if (docSnap.exists()) {
      watchlist = docSnap.data().movies || [];
    } else {
      watchlist = [];
    }
    updateWatchlist();

    loadMovies();
  } else {
    authContainer.classList.remove("hidden");
    mainApp.classList.add("hidden");
    watchlist = [];
    updateWatchlist();
  }
});

// Load movies with loading spinner
async function loadMovies() {
  showLoading(true);
  try {
    const res = await fetch(`https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&with_watch_providers=8&watch_region=GB`);
    const data = await res.json();
    movies = data.results;
    currentIndex = 0;
    showMovie();
  } catch (err) {
    console.error("Error loading movies:", err);
    titleEl.textContent = "Failed to load movies.";
    posterEl.src = "";
    overviewEl.textContent = "";
  } finally {
    showLoading(false);
  }
}

function showLoading(isLoading) {
  if (isLoading) {
    loadingSpinner.style.display = "block";
    posterEl.style.display = "none";
  } else {
    loadingSpinner.style.display = "none";
    posterEl.style.display = "block";
  }
}

// Show current movie details
function showMovie() {
  if (!movies.length || currentIndex >= movies.length) {
    titleEl.textContent = "No more movies!";
    posterEl.src = "";
    overviewEl.textContent = "";
    return;
  }

  const movie = movies[currentIndex];
  titleEl.textContent = movie.title;
  overviewEl.textContent = movie.overview || "";
  posterEl.src = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
}

// Like button event: add movie to watchlist and save
document.getElementById("likeBtn").addEventListener("click", async () => {
  if (movies[currentIndex]) {
    watchlist.push(movies[currentIndex]);
    updateWatchlist();

    const user = auth.currentUser;
    if (user) {
      const watchlistDocRef = doc(db, "watchlists", user.uid);
      await setDoc(watchlistDocRef, { movies: watchlist });
    }
  }
  currentIndex++;
  showMovie();
});

// Dislike button event: just advance
document.getElementById("dislikeBtn").addEventListener("click", () => {
  currentIndex++;
  showMovie();
});

// Update watchlist UI
function updateWatchlist() {
  watchlistEl.innerHTML = ""; // Clear existing items
  watchlist.forEach((movie) => {
    const li = document.createElement("li");
    li.textContent = movie.title;
    watchlistEl.appendChild(li);
  });
}
