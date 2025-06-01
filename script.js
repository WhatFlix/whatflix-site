// DOM Elements
const signInForm = document.getElementById("signInForm");
const signUpForm = document.getElementById("signUpForm");
const signOutBtn = document.getElementById("signOutBtn");

const signInBox = document.getElementById("signInBox");
const signUpBox = document.getElementById("signUpBox");
const authSection = document.querySelector(".auth-section");
const mainContent = document.getElementById("main");

const surpriseBtn = document.getElementById("surpriseMeBtn");
const swipeZone = document.getElementById("swipeZone");
const watchlistContainer = document.getElementById("watchlistContainer");

const showSignUpBtn = document.getElementById("showSignUp");
const showSignInBtn = document.getElementById("showSignIn");

const TMDB_API_KEY = "406d510b8114c3a454abf556a384a949"; // <-- Replace with your TMDb API key

// Load users and check current user
const users = JSON.parse(localStorage.getItem("whatflix_users") || "{}");
let currentUser = localStorage.getItem("whatflix_user");

if (currentUser) {
  showMainContent();
} else {
  signInBox.classList.remove("hidden");
  signUpBox.classList.add("hidden");
}

// Toggle Auth Views
showSignUpBtn?.addEventListener("click", () => {
  signInBox.classList.add("hidden");
  signUpBox.classList.remove("hidden");
});

showSignInBtn?.addEventListener("click", () => {
  signUpBox.classList.add("hidden");
  signInBox.classList.remove("hidden");
});

// Sign Up Logic
signUpForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = signUpForm.querySelector("input[type='email']").value.trim().toLowerCase();
  const password = signUpForm.querySelector("input[type='password']").value.trim();

  if (!users[email]) {
    users[email] = { password, watchlist: [] };
    localStorage.setItem("whatflix_users", JSON.stringify(users));
    localStorage.setItem("whatflix_user", email);
    currentUser = email;
    showMainContent();
    loadWatchlist();
  } else {
    alert("User already exists!");
  }
});

// Sign In Logic
signInForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = signInForm.querySelector("input[type='email']").value.trim().toLowerCase();
  const password = signInForm.querySelector("input[type='password']").value.trim();

  if (users[email] && users[email].password === password) {
    localStorage.setItem("whatflix_user", email);
    currentUser = email;
    showMainContent();
    loadWatchlist();
  } else {
    alert("Incorrect email or password.");
  }
});

// Sign Out
signOutBtn?.addEventListener("click", () => {
  localStorage.removeItem("whatflix_user");
  currentUser = null;
  mainContent.classList.add("hidden");
  authSection.classList.remove("hidden");
  signInBox.classList.remove("hidden");
  signUpBox.classList.add("hidden");
  swipeZone.innerHTML = "";
  watchlistContainer.innerHTML = "";
});

// Show Main Content After Login
function showMainContent() {
  authSection.classList.add("hidden");
  mainContent.classList.remove("hidden");
  loadWatchlist();
  swipeZone.innerHTML = ""; // clear any previous cards
}

// Fetch trending shows from TMDb
async function fetchTrending() {
  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/trending/all/day
