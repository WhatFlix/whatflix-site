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

const TMDB_API_KEY = "406d510b8114c3a454abf556a384a949";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

let currentUser = null;
let movieQueue = [];
let selectedGenre = '';

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
const genreSelect = document.getElementById("genre-select");
const userEmail = document.getElementById("user-email");

function fetchGenres() {
  fetch(`${TMDB_BASE_URL}/genre/movie/list?api_key=${TMDB_API_KEY}`)
    .then(res => res.json())
    .then(data => {
      genreSelect.innerHTML = '<option value="">All Genres</option>' +
        data.genres.map(g => `<option value="${g.id}">${g.name}</option>`).join("");
    });
}

function fetchRandomMovie() {
  let endpoint = selectedGenre
    ? `/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${selectedGenre}`
    : `/trending/movie/week?api_key=${TMDB_API_KEY}`;

  fetch(`${TMDB_BASE_URL}${endpoint}`)
    .then(res => res.json())
    .then(data => {
      movieQueue = shuffleArray(data.results);
      showNextMovie();
    })
    .catch(err => console.error("Fetch error:", err));
}

function showNextMovie() {
  if (movieQueue.length === 0) {
    title.innerText = "🎬 You've seen them all!";
    poster.src = "fallback.jpg";
    overview.innerText = "Try again later for more suggestions.";
    return;
  }
  const movie = movieQueue.shift();
  title.innerText = movie.title;
  poster.src = movie.poster_path ? `${TMDB_IMAGE_BASE}${movie.poster_path}` : "fallback.jpg";
  overview.innerText = movie.overview;

  likeBtn.onclick = () => saveToWatchlist(movie);
  dislikeBtn.onclick = showNextMovie;
}

async function saveToWatchlist(movie) {
  if (!currentUser) return;
  const ref = doc(db, "watchlists", currentUser.uid);
  try {
    await setDoc(ref, { movies: arrayUnion(movie) }, { merge: true });
    showNextMovie();
    loadWatchlist();
  } catch (err) {
    console.error("Error saving movie:", err);
  }
}

async function loadWatchlist() {
  if (!currentUser) return;
  const ref = doc(db, "watchlists", currentUser.uid);
  try {
    const docSnap = await getDoc(ref);
    const movies = docSnap.exists() ? docSnap.data().movies || [] : [];
    watchlistContainer.innerHTML = movies.map(movie => `
      <li>
        <img src="${TMDB_IMAGE_BASE + movie.poster_path}" class="watchlist-poster" />
        <span>${movie.title}</span>
      </li>`).join("");
  } catch (err) {
    console.error("Error loading watchlist:", err);
  }
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

signUpForm.addEventListener("submit", e => {
  e.preventDefault();
  const email = signUpForm["signup-email"].value;
  const password = signUpForm["signup-password"].value;
  createUserWithEmailAndPassword(auth, email, password).catch(err => alert(err.message));
});

signInForm.addEventListener("submit", e => {
  e.preventDefault();
  const email = signInForm["signin-email"].value;
  const password = signInForm["signin-password"].value;
  signInWithEmailAndPassword(auth, email, password).catch(err => alert(err.message));
});

signOutBtn.addEventListener("click", () => {
  signOut(auth);
});

genreSelect.addEventListener("change", e => {
  selectedGenre = e.target.value;
  fetchRandomMovie();
});

onAuthStateChanged(auth, user => {
  currentUser = user;
  authSection.style.display = user ? "none" : "block";
  appSection.style.display = user ? "block" : "none";
  if (user) {
    userEmail.innerText = user.email;
    fetchGenres();
    fetchRandomMovie();
    loadWatchlist();
  }
});
