// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
} from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCBAgNEOcl7QCmHQy2mJBQbwKSfmRNbRl0",
  authDomain: "whatflix-a17fb.firebaseapp.com",
  projectId: "whatflix-a17fb",
  storageBucket: "whatflix-a17fb.firebasestorage.app",
  messagingSenderId: "369819362727",
  appId: "1:369819362727:web:b55af0726c7b29b8e9c282",
  measurementId: "G-Z6RX0KXLKY",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// TMDB API Setup
const TMDB_API_KEY = "406d510b8114c3a454abf556a384a949";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

// DOM Elements
const authSection = document.getElementById("auth-section");
const appSection = document.getElementById("app-section");
const signUpForm = document.getElementById("signup-form");
const signInForm = document.getElementById("signin-form");
const signOutBtn = document.getElementById("signout-btn");

const poster = document.getElementById("poster");
const title = document.getElementById("title");
const overview = document.getElementById("overview");
const likeBtn = document.getElementById("like");
const dislikeBtn = document.getElementById("dislike");
const watchlistContainer = document.getElementById("watchlist");

const tabButtons = document.querySelectorAll(".tab-button");

let currentUser = null;
let currentMovies = [];
let currentIndex = 0;

// Fetch movies by category
async function fetchMovies(category) {
  let url = "";
  switch (category) {
    case "Top Picks":
      url = `${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&region=GB`;
      break;
    case "New Releases":
      url = `${TMDB_BASE_URL}/movie/now_playing?api_key=${TMDB_API_KEY}&region=GB`;
      break;
    case "Surprise Me":
      // For surprise me: get popular movies but shuffle and pick randomly
      url = `${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&region=GB`;
      break;
    default:
      url = `${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&region=GB`;
  }

  try {
    const res = await fetch(url);
    const data = await res.json();
    let movies = data.results || [];

    if (category === "Surprise Me") {
      // Shuffle movies and pick first 20 for randomness
      movies = movies.sort(() => 0.5 - Math.random()).slice(0, 20);
    }
    return movies;
  } catch (error) {
    console.error("Error fetching movies:", error);
    return [];
  }
}

// Show movie at currentIndex
function showMovie() {
  if (currentMovies.length === 0) {
    title.innerText = "No movies to show.";
    poster.src = "";
    overview.innerText = "";
    return;
  }
  if (currentIndex >= currentMovies.length) currentIndex = 0;

  const movie = currentMovies[currentIndex];
  title.innerText = movie.title || movie.name || "Untitled";
  poster.src = movie.poster_path
    ? TMDB_IMAGE_BASE + movie.poster_path
    : "";
  overview.innerText = movie.overview || "No description available.";
}

// Save movie to user's watchlist
async function saveToWatchlist(movie) {
  if (!currentUser) return;

  const userDocRef = doc(db, "watchlists", currentUser.uid);

  try {
    await setDoc(
      userDocRef,
      { movies: arrayUnion(movie) },
      { merge: true }
    );
    alert(`Added "${movie.title}" to your watchlist!`);
    loadWatchlist();
    nextMovie();
  } catch (error) {
    console.error("Error saving to watchlist:", error);
    alert("Failed to add movie to watchlist.");
  }
}

// Load user's watchlist from Firestore
async function loadWatchlist() {
  if (!currentUser) {
    watchlistContainer.innerHTML = "<li>Please sign in to see your watchlist.</li>";
    return;
  }

  try {
    const userDoc = await getDoc(doc(db, "watchlists", currentUser.uid));
    const movies = userDoc.exists() ? userDoc.data().movies || [] : [];
    if (movies.length === 0) {
      watchlistContainer.innerHTML = "<li>Your watchlist is empty.</li>";
      return;
    }
    watchlistContainer.innerHTML = movies
      .map(
        (m) =>
          `<li><strong>${m.title}</strong> (${m.release_date?.slice(0,4) || "N/A"})</li>`
      )
      .join("");
  } catch (error) {
    console.error("Error loading watchlist:", error);
  }
}

function nextMovie() {
  currentIndex++;
  if (currentIndex >= currentMovies.length) currentIndex = 0;
  showMovie();
}

// Tab switching logic
async function switchTab(category) {
  tabButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.textContent.trim() === category);
  });

  currentMovies = await fetchMovies(category);
  currentIndex = 0;
  showMovie();
}

// Auth event handlers
signUpForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = signUpForm["signup-email"].value;
  const password = signUpForm["signup-password"].value;
  try {
    await createUserWithEmailAndPassword(auth, email, password);
  } catch (err) {
    alert(err.message);
  }
});

signInForm.addEventListener("submit", async (e) => {
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

// Like / Dislike buttons
likeBtn.addEventListener("click", () => {
  if (!currentMovies.length) return;
  saveToWatchlist(currentMovies[currentIndex]);
});

dislikeBtn.addEventListener("click", () => {
  nextMovie();
});

// Tab buttons event listeners
tabButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    switchTab(btn.textContent.trim());
  });
});

// On auth state change
onAuthStateChanged(auth, (user) => {
  currentUser = user;
  if (user) {
    authSection.style.display = "none";
    appSection.style.display = "block";
    switchTab("Top Picks");
    loadWatchlist();
  } else {
    authSection.style.display = "block";
    appSection.style.display = "none";
    watchlistContainer.innerHTML = "";
  }
});
