// script.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js"; import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";

const firebaseConfig = { apiKey: "AIzaSyCBAgNEOcl7QCmHQy2mJBQbwKSfmRNbRl0", authDomain: "whatflix-a17fb.firebaseapp.com", projectId: "whatflix-a17fb", storageBucket: "whatflix-a17fb.appspot.com", messagingSenderId: "369819362727", appId: "1:369819362727:web:b55af0726c7b29b8e9c282", measurementId: "G-Z6RX0KXLKY" };

const app = initializeApp(firebaseConfig); const auth = getAuth(app);

const apiKey = "406d510b8114c3a454abf556a384a949";

const signUpForm = document.getElementById("signUpForm"); const signInForm = document.getElementById("signInForm"); const signOutBtn = document.getElementById("signOutBtn");

signUpForm?.addEventListener("submit", (e) => { e.preventDefault(); const email = signUpForm.email.value; const password = signUpForm.password.value; createUserWithEmailAndPassword(auth, email, password) .then(() => alert("Signed up successfully!")) .catch((error) => alert(error.message)); });

signInForm?.addEventListener("submit", (e) => { e.preventDefault(); const email = signInForm.email.value; const password = signInForm.password.value; signInWithEmailAndPassword(auth, email, password) .then(() => { document.getElementById("authSection").classList.add("hidden"); document.getElementById("mainContent").classList.remove("hidden"); fetchPopular(); }) .catch((error) => alert(error.message)); });

signOutBtn?.addEventListener("click", () => { signOut(auth).then(() => { document.getElementById("authSection").classList.remove("hidden"); document.getElementById("mainContent").classList.add("hidden"); }); });

onAuthStateChanged(auth, (user) => { if (user) { document.getElementById("authSection").classList.add("hidden"); document.getElementById("mainContent").classList.remove("hidden"); fetchPopular(); } });

function fetchPopular() { fetch(https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}) .then((res) => res.json()) .then((data) => { const moviesDiv = document.getElementById("popularMovies"); moviesDiv.innerHTML = ""; data.results.forEach((movie) => { const card = document.createElement("div"); card.className = "card"; card.innerHTML = <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}"> <h3>${movie.title}</h3> <button onclick="addToWatchlist('${movie.title}')">Add to Watchlist</button>; moviesDiv.appendChild(card); }); }); }

window.addToWatchlist = function(title) { const list = document.getElementById("watchlistItems"); const li = document.createElement("li"); li.textContent = title; list.appendChild(li); }

