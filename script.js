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
  setDoc,
  getDoc
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

// TMDB Logic
const TMDB_API_KEY = "406d510b8114c3a454abf556a384a949";
let movies = [];
let currentIndex = 0;
let watchlist = [];

// Load movies from TMDB API
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

// Show current movie in swipe zone
function showMovie() {
  const titleEl = document.getElementById("movie-title");
  const posterEl = document.getElementById("movie-poster");
  const overviewEl = document.getElementById("movie-overview");

  if (!movies.length || currentIndex >= movies.length) {
    titleEl.textContent = "No more movies!";
    posterEl.src = "";
    overviewEl.textContent = "";
    return;
  }

  const movie = movies[currentIndex];
  titleEl.textContent = movie.title;
  posterEl.src = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
  overviewEl.textContent = movie.overview;
}

// Update watchlist UI
function updateWatchlist() {
  const listEl = document.getElementById("watchlist-items");
  listEl.innerHTML = ""; // Clear existing items
  watchlist.forEach((movie) => {
    const li = document.createElement("li");
    li.textContent = movie.title;
    listEl.appendChild(li);
  });
}

// Save watchlist to Firestore
async function saveWatchlist(userId, watchlist) {
  try {
    await setDoc(doc(db, "watchlists", userId), { movies: watchlist });
  } catch (error) {
    console.error("Error saving watchlist:", error);
  }
}

// Load watchlist from Firestore
async function loadWatchlist(userId) {
  try {
    const docRef = doc(db, "watchlists", userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      watchlist = docSnap.data().movies || [];
      updateWatchlist();
    } else {
      watchlist = [];
      updateWatchlist();
    }
  } catch (error) {
    console.error("Error loading watchlist:", error);
  }
}

// Swipe button events
document.getElementById("likeBtn").addEventListener("click", async () => {
  if (movies[currentIndex]) {
    watchlist.push(movies[currentIndex]);
    updateWatchlist();
    if (auth.currentUser) {
      await saveWatchlist(auth.currentUser.uid, watchlist);
    }
  }
  currentIndex++;
  showMovie();
});

document.getElementById("dislikeBtn").addEventListener("click", () => {
  currentIndex++;
  showMovie();
});

// Auth state listener - toggles UI and loads data
onAuthStateChanged(auth, (user) => {
  if (user) {
    authContainer.classList.add("hidden");
    mainApp.classList.remove("hidden");
    loadMovies();
    loadWatchlist(user.uid);
  } else {
    authContainer.classList.remove("hidden");
    mainApp.classList.add("hidden");
    watchlist = [];
  }
});
