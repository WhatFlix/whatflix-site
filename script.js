// script.js

import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js'; import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js';

const firebaseConfig = { apiKey: "AIzaSyCBAgNEOcl7QCmHQy2mJBQbwKSfmRNbRl0", authDomain: "whatflix-a17fb.firebaseapp.com", projectId: "whatflix-a17fb", storageBucket: "whatflix-a17fb.appspot.com", messagingSenderId: "369819362727", appId: "1:369819362727:web:b55af0726c7b29b8e9c282", measurementId: "G-Z6RX0KXLKY" };

const app = initializeApp(firebaseConfig); const auth = getAuth(app);

const signInBtn = document.getElementById('signInBtn'); const signUpBtn = document.getElementById('signUpBtn'); const signOutBtn = document.getElementById('signOutBtn'); const emailInput = document.getElementById('email'); const passwordInput = document.getElementById('password');

const authContainer = document.getElementById('auth-container'); const mainApp = document.getElementById('main-app');

const moviePoster = document.getElementById('movie-poster'); const movieTitle = document.getElementById('movie-title'); const likeBtn = document.getElementById('likeBtn'); const dislikeBtn = document.getElementById('dislikeBtn'); const watchlistItems = document.getElementById('watchlist-items');

let movies = []; let currentMovieIndex = 0; let watchlist = [];

const TMDB_API_KEY = '406d510b8114c3a454abf556a384a949';

const fetchMovies = async () => { const response = await fetch(https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_API_KEY}); const data = await response.json(); movies = data.results; showMovie(); };

const showMovie = () => { if (currentMovieIndex < movies.length) { const movie = movies[currentMovieIndex]; moviePoster.src = https://image.tmdb.org/t/p/w500${movie.poster_path}; movieTitle.textContent = movie.title; } else { moviePoster.src = ''; movieTitle.textContent = 'No more movies to show'; } };

const likeMovie = () => { const movie = movies[currentMovieIndex]; watchlist.push(movie); updateWatchlist(); currentMovieIndex++; showMovie(); };

const dislikeMovie = () => { currentMovieIndex++; showMovie(); };

const updateWatchlist = () => { watchlistItems.innerHTML = ''; watchlist.forEach(movie => { const li = document.createElement('li'); li.textContent = movie.title; watchlistItems.appendChild(li); }); };

signInBtn.addEventListener('click', () => { const email = emailInput.value; const password = passwordInput.value; signInWithEmailAndPassword(auth, email, password) .catch(error => alert(error.message)); });

signUpBtn.addEventListener('click', () => { const email = emailInput.value; const password = passwordInput.value; createUserWithEmailAndPassword(auth, email, password) .catch(error => alert(error.message)); });

signOutBtn.addEventListener('click', () => { signOut(auth); });

onAuthStateChanged(auth, user => { if (user) { authContainer.classList.add('hidden'); mainApp.classList.remove('hidden'); fetchMovies(); } else { authContainer.classList.remove('hidden'); mainApp.classList.add('hidden'); } });

likeBtn.addEventListener('click', likeMovie); dislikeBtn.addEventListener('click', dislikeMovie);

