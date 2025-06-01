// Import Firebase modules
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
  updateDoc,
  arrayUnion,
  arrayRemove
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

// TMDB API Setup
const TMDB_API_KEY = "406d510b8114c3a454abf556a384a949";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

const movieCard = document.getElementById("movie-card");
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
    });
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
  poster.onerror = () => poster.src = "fallback.jpg";
  likeBtn.onclick = () => saveToWatchlist(movie);
  dislikeBtn.onclick = showNextMovie;
}

async function saveToWatchlist(movie) {
  if (!currentUser) return;
  const userDocRef = doc(db, "watchlists", currentUser.uid);
  await setDoc(userDocRef, { movies: arrayUnion(movie) }, { merge: true });
  showNextMovie();
  loadWatchlist();
}

async function loadWatchlist() {
  if (!currentUser) return;
  const userDoc = await getDoc(doc(db, "watchlists", currentUser.uid));
  const movies = userDoc.exists() ? userDoc.data().movies || [] : [];
  watchlistContainer.innerHTML = movies.map(m => `<li>${m.title}</li>`).join("");
}

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

onAuthStateChanged(auth, user => {
  currentUser = user;
  authSection.style.display = user ? "none" : "block";
  appSection.style.display = user ? "block" : "none";
  if (user) {
    fetchRandomMovie();
    loadWatchlist();
  }
});
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const signInBtn = document.getElementById("signInBtn");
const signUpBtn = document.getElementById("signUpBtn");
const authMessage = document.getElementById("auth-message");
const authContainer = document.getElementById("auth-container");
const mainApp = document.getElementById("main-app");

// Sign Up
signUpBtn.addEventListener("click", async () => {
  const email = emailInput.value;
  const password = passwordInput.value;

  try {
    await createUserWithEmailAndPassword(auth, email, password);
    authMessage.textContent = "✅ Sign-up successful!";
  } catch (error) {
    authMessage.textContent = `⚠️ Sign-up failed: ${error.message}`;
  }
});

// Sign In
signInBtn.addEventListener("click", async () => {
  const email = emailInput.value;
  const password = passwordInput.value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    authMessage.textContent = "✅ Sign-in successful!";
  } catch (error) {
    authMessage.textContent = `⚠️ Sign-in failed: ${error.message}`;
  }
});

// Listen for auth state changes
onAuthStateChanged(auth, (user) => {
  if (user) {
    authContainer.classList.add("hidden");
    mainApp.classList.remove("hidden");
  } else {
    mainApp.classList.add("hidden");
    authContainer.classList.remove("hidden");
  }
});
