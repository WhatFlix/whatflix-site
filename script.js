import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";

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

// DOM elements
const signInBox = document.getElementById('signInBox');
const signUpBox = document.getElementById('signUpBox');
const mainContent = document.getElementById('mainContent');
const signInForm = document.getElementById('signInForm');
const signUpForm = document.getElementById('signUpForm');
const signOutBtn = document.getElementById('signOutBtn');
const goSignUp = document.getElementById('goSignUp');
const goSignIn = document.getElementById('goSignIn');
const surpriseMeBtn = document.getElementById('surpriseMeBtn');
const swipeZone = document.getElementById('swipeZone');
const watchlistItems = document.getElementById('watchlistItems');

let watchlist = [];

function showAuth() {
  signInBox.classList.remove('hidden');
  signUpBox.classList.add('hidden');
  mainContent.classList.add('hidden');
}

function showSignUp() {
  signInBox.classList.add('hidden');
  signUpBox.classList.remove('hidden');
  mainContent.classList.add('hidden');
}

function showMain() {
  signInBox.classList.add('hidden');
  signUpBox.classList.add('hidden');
  mainContent.classList.remove('hidden');
}

// Auth listeners
signUpForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('signUpEmail').value;
  const password = document.getElementById('signUpPassword').value;
  try {
    await createUserWithEmailAndPassword(auth, email, password);
  } catch (error) {
    alert(error.message);
  }
});

signInForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('signInEmail').value;
  const password = document.getElementById('signInPassword').value;
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    alert(error.message);
  }
});

signOutBtn.addEventListener('click', () => {
  signOut(auth);
});

// Firebase state listener
onAuthStateChanged(auth, (user) => {
  if (user) {
    showMain();
    loadWatchlist();
  } else {
    showAuth();
  }
});

// Watchlist Functions
function renderWatchlist() {
  watchlistItems.innerHTML = '';
  if (watchlist.length === 0) {
    watchlistItems.innerHTML = '<li>Your watchlist is empty.</li>';
    return;
  }
  watchlist.forEach(movie => {
    const li = document.createElement('li');
    li.textContent = movie.title;
    const btn = document.createElement('button');
    btn.textContent = 'Remove';
    btn.onclick = () => {
      watchlist = watchlist.filter(item => item.id !== movie.id);
      saveWatchlist();
      renderWatchlist();
    };
    li.appendChild(btn);
    watchlistItems.appendChild(li);
  });
}

function saveWatchlist() {
  const user = auth.currentUser;
  if (!user) return;
  localStorage.setItem(`watchlist_${user.uid}`, JSON.stringify(watchlist));
}

function loadWatchlist() {
  const user = auth.currentUser;
  if (!user) return;
  const saved = localStorage.getItem(`watchlist_${user.uid}`);
  watchlist = saved ? JSON.parse(saved) : [];
  renderWatchlist();
}

// Surprise Me
surpriseMeBtn.addEventListener('click', async () => {
  swipeZone.innerHTML = 'Loading...';
  try {
    const res = await fetch(`https://api.themoviedb.org/3/discover/movie?api_key=406d510b8114c3a454abf556a384a949&with_watch_providers=8&watch_region=GB&sort_by=popularity.desc`);
    const data = await res.json();
    const movie = data.results[Math.floor(Math.random() * data.results.length)];

    swipeZone.innerHTML = '';
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}" />
      <h3>${movie.title}</h3>
      <button>Add to Watchlist</button>
    `;

    card.querySelector('button').addEventListener('click', () => {
      if (!watchlist.some(item => item.id === movie.id)) {
        watchlist.push({ id: movie.id, title: movie.title });
        saveWatchlist();
        renderWatchlist();
      }
    });

    swipeZone.appendChild(card);
  } catch (err) {
    swipeZone.innerHTML = 'Something went wrong.';
  }
});

// Toggle links
goSignUp.addEventListener('click', () => showSignUp());
goSignIn.addEventListener('click', () => showAuth());
