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

// Config
const firebaseConfig = {
  apiKey: "AIzaSyCBAgNEOcl7QCmHQy2mJBQbwKSfmRNbRl0",
  authDomain: "whatflix-a17fb.firebaseapp.com",
  projectId: "whatflix-a17fb",
  storageBucket: "whatflix-a17fb.firebasestorage.app",
  messagingSenderId: "369819362727",
  appId: "1:369819362727:web:b55af0726c7b29b8e9c282",
  measurementId: "G-Z6RX0KXLKY"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// TMDB
const TMDB_API_KEY = "406d510b8114c3a454abf556a384a949";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

// Elements
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

function fetchRandomMovie() {
  fetch(`${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&region=GB`)
    .then(res => res.json())
    .then(data => {
      movieQueue = data.results;
      showNextMovie();
    })
    .catch(err => console.error("Fetch error:", err));
}

function showNextMovie() {
  if (movieQueue.length === 0) {
    title.innerText = "No more movies!";
    poster.src = "";
    overview.innerText = "";
    return;
  }

  const movie = movieQueue.shift();
  title.innerText = movie.title;
  poster.src = movie.poster_path ? `${TMDB_IMAGE_BASE}${movie.poster_path}` : "";
  overview.innerText = movie.overview;
  poster.onerror = () => (poster.src = "fallback.jpg");

  likeBtn.onclick = () => saveToWatchlist(movie);
  dislikeBtn.onclick = showNextMovie;
}

async function saveToWatchlist(movie) {
  if (!currentUser) return;
  const userDocRef = doc(db, "watchlists", currentUser.uid);

  try {
    await setDoc(userDocRef, { movies: arrayUnion(movie) }, { merge: true });
    showNextMovie();
    loadWatchlist();
  } catch (err) {
    console.error("Watchlist save error:", err);
  }
}

async function loadWatchlist() {
  if (!currentUser) return;
  try {
    const userDoc = await getDoc(doc(db, "watchlists", currentUser.uid));
    const movies = userDoc.exists() ? userDoc.data().movies || [] : [];
    watchlistContainer.innerHTML = movies.map(m => `<li>${m.title}</li>`).join("");
  } catch (err) {
    console.error("Watchlist load error:", err);
  }
}

// Auth
signUpForm.addEventListener("submit", e => {
  e.preventDefault();
  const email = document.getElementById("signup-email").value;
  const password = document.getElementById("signup-password").value;
  createUserWithEmailAndPassword(auth, email, password)
    .catch(err => alert("Signup error: " + err.message));
});

signInForm.addEventListener("submit", e => {
  e.preventDefault();
  const email = document.getElementById("signin-email").value;
  const password = document.getElementById("signin-password").value;
  signInWithEmailAndPassword(auth, email, password)
    .catch(err => alert("Signin error: " + err.message));
});

signOutBtn.addEventListener("click", () => {
  signOut(auth);
});

onAuthStateChanged(auth, user => {
  currentUser = user;
  authSection.style.display = user ? "none" : "block";
  appSection.style.display = user ? "block" : "none";
  if (user) {
    fetchRandomMovie();
    loadWatchlist();
  }
});
