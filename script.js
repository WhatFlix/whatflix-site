// Replace with your TMDb API key
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

// Save to localStorage
function saveUsers() {
  localStorage.set
