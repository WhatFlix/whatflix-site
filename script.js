// DOM Elements
const signInForm = document.getElementById("signInForm");
const signUpForm = document.getElementById("signUpForm");
const signOutBtn = document.getElementById("signOutBtn");
const showSignInBtn = document.getElementById("showSignIn");
const showSignUpBtn = document.getElementById("showSignUp");

const signInBox = document.getElementById("signInBox");
const signUpBox = document.getElementById("signUpBox");
const authSection = document.querySelector(".auth-section");
const mainContent = document.getElementById("main");

const surpriseBtn = document.getElementById("surpriseMeBtn");
const surpriseDisplay = document.getElementById("surpriseDisplay");

// Load users and check current user
const users = JSON.parse(localStorage.getItem("whatflix_users") || "{}");
let currentUser = localStorage.getItem("whatflix_user");

if (currentUser) showMainContent();

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
  const email = signUpForm.querySelector("input[type='email']").value;
  const password = signUpForm.querySelector("input[type='password']").value;

  if (!users[email]) {
    users[email] = { password, watchlist: [] };
    localStorage.setItem("whatflix_users", JSON.stringify(users));
    localStorage.setItem("whatflix_user", email);
    currentUser = email;
    showMainContent();
  } else {
    alert("User already exists!");
  }
});

// Sign In Logic
signInForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = signInForm.querySelector("input[type='email']").value;
  const password = signInForm.querySelector("input[type='password']").value;

  if (users[email] && users[email].password === password) {
    localStorage.setItem("whatflix_user", email);
    currentUser = email;
    showMainContent();
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
});

// Show Main Content After Login
function showMainContent() {
  authSection.classList.add("hidden");
  mainContent.classList.remove("hidden");
}

// Surprise Me Feature
const sampleTitles = [
  {
    title: "Breaking Bad",
    image: "https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg",
  },
  {
    title: "Stranger Things",
    image: "https://image.tmdb.org/t/p/w500/x2LSRK2Cm7MZhjluni1msVJ3wDF.jpg",
  },
  {
    title: "The Crown",
    image: "https://image.tmdb.org/t/p/w500/el3zBQk1eYJDAi6JpsnCyhVG0Vv.jpg",
  },
];

surpriseBtn?.addEventListener("click", () => {
  const pick = sampleTitles[Math.floor(Math.random() * sampleTitles.length)];
  surpriseDisplay.innerHTML = `
    <div class="surprise-card">
      <img src="${pick.image}" alt="${pick.title}" />
      <h3>${pick.title}</h3>
    </div>
  `;
});
