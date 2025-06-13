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
  updateDoc,
  arrayUnion
} from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";

// Your Firebase config (from your project)
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

// TMDB API setup
const TMDB_API_KEY = "406d510b8114c3a454abf556a384a949";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

// DOM Elements
const authSection = document.getElementById("auth-section");
const appSection = document.getElementById("app-section");
const signUpForm = document.getElementById("signup-form");
const signInForm = document.getElementById("signin-form");
const signOutBtn = document.getElementById("signout-btn");
const btnShowSignIn = document.getElementById("btnShowSignIn");
const btnShowSignUp = document.getElementById("btnShowSignUp");

const poster = document.getElementById("poster");
const titleEl = document.getElementById("title");
const overview = document.getElementById("overview");
const likeBtn = document.getElementById("like");
const dislikeBtn = document.getElementById("dislike");
const watchlistContainer = document.getElementById("watchlist");
const moodSelect = document.getElementById("mood-select");

let currentUser = null;
let movieQueue = [];

// Helper: Fetch movies by mood/genre
async function fetchMovies(mood = "popular") {
  // Map moods to TMDB genres or endpoints
  const genreMap = {
    action: 28,
    comedy: 35,
    drama: 18,
    horror: 27,
    romance: 10749,
    "sci-fi": 878,
    documentary: 99,
    popular: null
  };

  let url;
  if (mood === "popular") {
    url = `${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&region=GB`;
  } else if (genreMap[mood]) {
    url = `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${genreMap[mood]}&region=GB&sort_by=popularity.desc`;
  } else {
    url = `${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&region=GB`;
  }

  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.results && data.results.length) {
      movieQueue = data.results;
      showNextMovie();
    } else {
      console.warn("No movies found for mood:", mood);
      clearMovieCard();
    }
  } catch (err) {
    console.error("Failed to fetch movies:", err);
    clearMovieCard();
  }
}

function clearMovieCard() {
  poster.src = "";
  titleEl.textContent = "No movies found.";
  overview.textContent = "";
}

// Show next movie from the queue
function showNextMovie() {
  if (movieQueue.length === 0) {
    titleEl.textContent = "No more movies in this mood.";
    poster.src = "";
    overview.textContent = "";
    return;
  }
  const movie = movieQueue.shift();

  titleEl.textContent = movie.title;
  poster.src = movie.poster_path ? `${TMDB_IMAGE_BASE}${movie.poster_path}` : "";
  poster.alt = movie.title;
  overview.textContent = movie.overview || "No description available.";

  poster.onerror = () => {
    poster.src = "fallback.jpg"; // Provide fallback image in your project
  };
}

// Save liked movie to Firestore watchlist
async function saveToWatchlist(movie) {
  if (!currentUser) return;

  const watchlistRef = doc(db, "watchlists", currentUser.uid);

  try {
    // Use arrayUnion to add movie without duplicates
    await updateDoc(watchlistRef, {
      movies: arrayUnion({
        id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path,
        overview: movie.overview
      })
    });
  } catch (e) {
    if (e.code === "not-found") {
      // If document doesn't exist, create it
      await setDoc(watchlistRef, {
        movies: [{
          id: movie.id,
          title: movie.title,
          poster_path: movie.poster_path,
          overview: movie.overview
        }]
      });
    } else {
      console.error("Error saving watchlist:", e);
    }
  }

  loadWatchlist();
  showNextMovie();
}

// Load watchlist from Firestore
async function loadWatchlist() {
  if (!currentUser) return;

  const watchlistRef = doc(db, "watchlists", currentUser.uid);
  try {
    const docSnap = await getDoc(watchlistRef);
    if (docSnap.exists()) {
      const movies = docSnap.data().movies || [];
      renderWatchlist(movies);
    } else {
      watchlistContainer.innerHTML = "<li>Your watchlist is empty.</li>";
    }
  } catch (e) {
    console.error("Error loading watchlist:", e);
  }
}

function renderWatchlist(movies) {
  if (!movies.length) {
    watchlistContainer.innerHTML = "<li>Your watchlist is empty.</li>";
    return;
  }
  watchlistContainer.innerHTML = movies.map(m => `
    <li>
      <strong>${m.title}</strong>
    </li>
  `).join("");
}

// Event listeners

signUpForm.addEventListener("submit", async e => {
  e.preventDefault();
  const email = signUpForm["signup-email"].value;
  const password = signUpForm["signup-password"].value;

  try {
    await createUserWithEmailAndPassword(auth, email, password);
    signUpForm.reset();
  } catch (error) {
    alert("Sign Up Error: " + error.message);
  }
});

signInForm.addEventListener("submit", async e => {
  e.preventDefault();
  const email = signInForm["signin-email"].value;
  const password = signInForm["signin-password"].value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    signInForm.reset();
  } catch (error) {
    alert("Sign In Error: " + error.message);
  }
});

signOutBtn.addEventListener("click", () => {
  signOut(auth);
});

btnShowSignIn.addEventListener("click", () => {
  signInForm.style.display = "block";
  signUpForm.style.display = "none";
});

btnShowSignUp.addEventListener("click", () => {
  signUpForm.style.display = "block";
  signInForm.style.display = "none";
});

moodSelect.addEventListener("change", () => {
  fetchMovies(moodSelect.value);
});

// Auth state listener

onAuthStateChanged(auth, user => {
  currentUser = user;

  const isLoggedIn = !!user;

  authSection.style.display = isLoggedIn ? "none" : "block";
  appSection.style.display = isLoggedIn ? "block" : "none";
  signOutBtn.style.display = isLoggedIn ? "inline-block" : "none";
  btnShowSignIn.style.display = isLoggedIn ? "none" : "inline-block";
  btnShowSignUp.style.display = isLoggedIn ? "none" : "inline-block";

  if (isLoggedIn) {
    fetchMovies(moodSelect.value);
    loadWatchlist();
  } else {
    watchlistContainer.innerHTML = "";
    clearMovieCard();
  }
});

// Initial call to load popular movies for guests (optional)
// fetchMovies();
