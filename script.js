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

// Firebase config (replace with your own keys)
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

const poster = document.getElementById("poster");
const title = document.getElementById("title");
const overview = document.getElementById("overview");
const likeBtn = document.getElementById("like");
const dislikeBtn = document.getElementById("dislike");
const surpriseBtn = document.getElementById("surprise");
const watchlistContainer = document.getElementById("watchlist");
const authSection = document.getElementById("auth-section");
const appSection = document.getElementById("app-section");
const signOutBtn = document.getElementById("signout-btn");
const btnShowSignIn = document.getElementById("btn-show-signin");
const btnShowSignUp = document.getElementById("btn-show-signup");
const signInForm = document.getElementById("signin-form");
const signUpForm = document.getElementById("signup-form");
const moodSelect = document.getElementById("mood-select");

let currentUser = null;
let movieQueue = [];
let dislikedMovies = new Set();

function buildApiUrl(mood = "") {
  // Map moods to genres TMDB IDs
  const genres = {
    action: 28,
    comedy: 35,
    drama: 18,
    horror: 27,
    romance: 10749,
    "sci-fi": 878,
  };
  const genreId = genres[mood.toLowerCase()] || "";
  const genreParam = genreId ? `&with_genres=${genreId}` : "";
  return `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&sort_by=popularity.desc&region=GB${genreParam}`;
}

async function fetchMovies(mood = "") {
  try {
    const url = buildApiUrl(mood);
    const res = await fetch(url);
    const data = await res.json();
    if (data.results && data.results.length) {
      movieQueue = data.results;
      dislikedMovies.clear();
      showNextMovie();
    } else {
      clearMovieDisplay("No movies found for this mood.");
    }
  } catch (e) {
    clearMovieDisplay("Error fetching movies.");
    console.error(e);
  }
}

function clearMovieDisplay(message) {
  poster.src = "";
  title.innerText = message;
  overview.innerText = "";
}

function showNextMovie() {
  while (movieQueue.length && dislikedMovies.has(movieQueue[0].id)) {
    movieQueue.shift();
  }
  if (movieQueue.length === 0) {
    clearMovieDisplay("No more movies! Try changing your mood or refreshing.");
    return;
  }
  const movie = movieQueue[0];
  poster.src = movie.poster_path
    ? `${TMDB_IMAGE_BASE}${movie.poster_path}`
    : "";
  poster.alt = movie.title + " poster";
  title.innerText = movie.title;
  overview.innerText = movie.overview || "No description available.";
}

async function saveToWatchlist(movie) {
  if (!currentUser) return;
  try {
    const userDocRef = doc(db, "watchlists", currentUser.uid);
    await setDoc(
      userDocRef,
      { movies: arrayUnion(movie) },
      { merge: true }
    );
    loadWatchlist();
    dislikeNextMovie(); // Automatically skip liked movie from queue
  } catch (e) {
    console.error("Error saving to watchlist:", e);
  }
}

async function loadWatchlist() {
  if (!currentUser) return;
  try {
    const userDoc = await getDoc(doc(db, "watchlists", currentUser.uid));
    const movies = userDoc.exists() ? userDoc.data().movies || [] : [];
    watchlistContainer.innerHTML = movies
      .map(
        (m) =>
          `<li title="${m.overview || "No description"}">${m.title}</li>`
      )
      .join("");
  } catch (e) {
    console.error("Error loading watchlist:", e);
  }
}

function dislikeNextMovie() {
  if (movieQueue.length === 0) return;
  dislikedMovies.add(movieQueue[0].id);
  movieQueue.shift();
  showNextMovie();
}

likeBtn.onclick = () => {
  if (movieQueue.length === 0) return;
  saveToWatchlist(movieQueue[0]);
};

dislikeBtn.onclick = () => {
  dislikeNextMovie();
};

surpriseBtn.onclick = () => {
  // Just reshuffle and pick a random movie from the current queue
  if (movieQueue.length === 0) return;
  const idx = Math.floor(Math.random() * movieQueue.length);
  const movie = movieQueue[idx];
  // Move selected movie to front of queue
  movieQueue.splice(idx, 1);
  movieQueue.unshift(movie);
  showNextMovie();
};

moodSelect.onchange = () => {
  fetchMovies(moodSelect.value);
};

btnShowSignIn.onclick = () => {
  signInForm.style.display = "block";
  signUpForm.style.display = "none";
  authSection.style.display = "block";
  appSection.style.display = "none";
};

btnShowSignUp.onclick = () => {
  signUpForm.style.display = "block";
  signInForm.style.display = "none";
  authSection.style.display = "block";
  appSection.style.display = "none";
};

signOutBtn.onclick = () => {
  signOut(auth);
};

signUpForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = signUpForm["signup-email"].value;
  const password = signUpForm["signup-password"].value;
  createUserWithEmailAndPassword(auth, email, password).catch((err) =>
    alert(err.message)
  );
});

signInForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = signInForm["signin-email"].value;
  const password = signInForm["signin-password"].value;
  signInWithEmailAndPassword(auth, email, password).catch((err) =>
    alert(err.message)
  );
});

onAuthStateChanged(auth, (user) => {
  currentUser = user;
  if (user) {
    authSection.style.display = "none";
    appSection.style.display = "block";
    signOutBtn.style.display = "inline-block";
    btnShowSignIn.style.display = "none";
    btnShowSignUp.style.display = "none";
    fetchMovies(moodSelect.value);
    loadWatchlist();
  } else {
    authSection.style.display = "block";
    appSection.style.display = "none";
    signOutBtn.style.display = "none";
    btnShowSignIn.style.display = "inline-block";
    btnShowSignUp.style.display = "inline-block";
  }
});
