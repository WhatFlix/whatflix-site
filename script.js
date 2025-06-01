// script.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";

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

// UI references
const authContainer = document.getElementById("auth-container");
const mainApp = document.getElementById("main-app");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const signInBtn = document.getElementById("signInBtn");
const signUpBtn = document.getElementById("signUpBtn");
const signOutBtn = document.getElementById("signOutBtn");

const moviePoster = document.getElementById("movie-poster");
const movieTitle = document.getElementById("movie-title");
const likeBtn = document.getElementById("likeBtn");
const dislikeBtn = document.getElementById("dislikeBtn");
const watchlistItems = document.getElementById("watchlist-items");

let currentMovie = null;
let watchlist = [];

const TMDB_API_KEY = "406d510b8114c3a454abf556a384a949";

function loadRandomMovie() {
  fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_API_KEY}&language=en-US&page=1`)
    .then(res => res.json())
    .then(data => {
      const randomIndex = Math.floor(Math.random() * data.results.length);
      currentMovie = data.results[randomIndex];
      moviePoster.src = `https://image.tmdb.org/t/p/w500${currentMovie.poster_path}`;
      movieTitle.textContent = currentMovie.title;
    });
}

likeBtn.addEventListener("click", () => {
  if (currentMovie) {
    const listItem = document.createElement("li");
    listItem.textContent = currentMovie.title;
    watchlistItems.appendChild(listItem);
    loadRandomMovie();
  }
});

dislikeBtn.addEventListener("click", () => {
  loadRandomMovie();
});

signUpBtn.addEventListener("click", () => {
  const email = emailInput.value;
  const password = passwordInput.value;
  createUserWithEmailAndPassword(auth, email, password)
    .then(() => {
      console.log("Signed up");
    })
    .catch((error) => {
      alert(error.message);
    });
});

signInBtn.addEventListener("click", () => {
  const email = emailInput.value;
  const password = passwordInput.value;
  signInWithEmailAndPassword(auth, email, password)
    .then(() => {
      console.log("Signed in");
    })
    .catch((error) => {
      alert(error.message);
    });
});

signOutBtn.addEventListener("click", () => {
  signOut(auth).then(() => {
    console.log("Signed out");
  });
});

onAuthStateChanged(auth, (user) => {
  if (user) {
    authContainer.classList.add("hidden");
    mainApp.classList.remove("hidden");
    loadRandomMovie();
  } else {
    authContainer.classList.remove("hidden");
    mainApp.classList.add("hidden");
  }
});
