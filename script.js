// Replace with your own TMDb API key here
const TMDB_API_KEY = '406d510b8114c3a454abf556a384a949';

// DOM Elements
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

let users = JSON.parse(localStorage.getItem('whatflix_users') || '{}');
let currentUser = localStorage.getItem('whatflix_user') || null;
let watchlist = [];

function saveUsers() {
  localStorage.setItem('whatflix_users', JSON.stringify(users));
}

function saveCurrentUser(user) {
  localStorage.setItem('whatflix_user', user);
}

function saveWatchlist() {
  if (!currentUser) return;
  users[currentUser].watchlist = watchlist;
  saveUsers();
}

// Show / Hide Auth and Main sections
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

// Update watchlist UI
function renderWatchlist() {
  watchlistItems.innerHTML = '';
  if (!watchlist.length) {
    watchlistItems.innerHTML = '<li>Your watchlist is empty.</li>';
    return;
  }
  watchlist.forEach(item => {
    const li = document.createElement('li');
    li.textContent = item.title;
    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'Remove';
    removeBtn.addEventListener('click', () => {
      watchlist = watchlist.filter(w => w.id !== item.id);
      renderWatchlist();
      saveWatchlist();
    });
    li.appendChild(removeBtn);
    watchlistItems.appendChild(li);
  });
}

// Authentication Handlers

signInForm.addEventListener('submit', e => {
  e.preventDefault();
  const email = document.getElementById('signInEmail').value.toLowerCase();
  const password = document.getElementById('signInPassword').value;

  if (users[email] && users[email].password === password) {
    currentUser = email;
    watchlist = users[email].watchlist || [];
    saveCurrentUser(email);
    showMain();
    renderWatchlist();
  } else {
    alert('Incorrect email or password.');
  }
});

signUpForm.addEventListener('submit', e => {
  e.preventDefault();
  const email = document.getElementById('signUpEmail').value.toLowerCase();
  const password = document.getElementById('signUpPassword').value;

  if (users[email]) {
    alert('User already exists!');
    return;
  }

  users[email] = { password, watchlist: [] };
  saveUsers();

  currentUser = email;
  watchlist = [];
  saveCurrentUser(email);
  showMain();
  renderWatchlist();
});

signOutBtn.addEventListener('click', () => {
  currentUser = null;
  watchlist = [];
  localStorage.removeItem('whatflix_user');
  showAuth();
  swipeZone.innerHTML = '';
});

goSignUp
