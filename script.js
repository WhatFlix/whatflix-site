// Firebase imports
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

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCBAgNEOcl7QCmHQy2mJBQbwKSfmRNbRl0",
  authDomain: "whatflix-a17fb.firebaseapp.com",
  projectId: "whatflix-a17fb",
  storageBucket: "whatflix-a17fb.firebasestorage.app",
  messagingSenderId: "369819362727",
  appId: "1:369819362727:web:b55af0726c7b29b8e9c282",
  measurementId: "G-Z6RX0KXLKY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// TMDB API setup
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

let currentUser = null;
let movieQueue = [];

// Fetch popular movies from TMDB
async function fetchMovies() {
  try {
    const res = await fetch(`${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&region=GB`);
    const data = await res.json();
    movieQueue = data.results || [];
    showNextMovie();
  } catch (err) {
    console.error("Error fetching movies:", err);
  }
}

// Display next movie from queue
function showNextMovie() {
  if (movieQueue.length === 0) {
    title.innerText = "No more movies!";
    poster.src = "fallback.jpg";
    overview.innerText = "";
    return;
  }

  const movie = movieQueue.shift();

  title.innerText = movie.title;
  overview.innerText = movie.overview || "No description available";

  poster.onerror = () => {
    poster.src = "fallback.jpg";
  };
  poster.src = movie.poster_path ? `${TMDB_IMAGE_BASE}${movie.poster_path}` : "fallback.jpg";

  likeBtn.onclick = () => saveToWatchlist(movie);
  dislikeBtn.onclick = showNextMovie;
}

// Save movie to Firestore watchlist
async function saveToWatchlist(movie) {
  if (!currentUser) return;

  const userDocRef = doc(db, "watchlists", currentUser.uid);
  try {
    await setDoc(userDocRef, {
      movies: arrayUnion({
        id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path,
      })
    }, { merge: true });

    loadWatchlist();
    showNextMovie();
  } catch (err) {
    console.error("Error saving movie:", err);
  }
}

// Load user's watchlist from Firestore
async function loadWatchlist() {
  if (!currentUser) return;

  const userDoc = await getDoc(doc(db, "watchlists", currentUser.uid));
  const movies = userDoc.exists() ? userDoc.data().movies || [] : [];

  watchlistContainer.innerHTML = movies
    .map(m => `<li>${m.title}</li>`)
    .join("");
}

// Event listeners for auth forms
signUpForm.addEventListener("submit", async e => {
  e.preventDefault();
  const email = signUpForm["signup-email"].value;
  const password = signUpForm["signup-password"].value;

  try {
    await createUserWithEmailAndPassword(auth, email, password);
  } catch (err) {
    alert(err.message);
  }
});

signInForm.addEventListener("submit", async e => {
  e.preventDefault();
  const email = signInForm["signin-email"].value;
  const password = signInForm["signin-password"].value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (err) {
    alert(err.message);
  }
});

signOutBtn.addEventListener("click", () => {
  signOut(auth);
});

// Monitor auth state
onAuthStateChanged(auth, user => {
  currentUser = user;
  authSection.style.display = user ? "none" : "block";
  appSection.style.display = user ? "block" : "none";

  if (user) {
    fetchMovies();
    loadWatchlist();
  } else {
    // Clear UI on sign out
    watchlistContainer.innerHTML = "";
    title.innerText = "";
    overview.innerText = "";
    poster.src = "";
  }
});
