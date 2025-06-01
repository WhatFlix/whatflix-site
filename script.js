// DOM Elements
const signInForm = document.getElementById("signInForm");
const signUpForm = document.getElementById("signUpForm");
const signInBtn = document.getElementById("signInBtn");
const signUpBtn = document.getElementById("signUpBtn");
const authSection = document.querySelector(".auth-section");
const mainContent = document.getElementById("main");
const surpriseBtn = document.getElementById("surpriseMeBtn");
const surpriseDisplay = document.getElementById("surpriseDisplay");

const users = JSON.parse(localStorage.getItem("whatflix_users") || "{}");
let currentUser = localStorage.getItem("whatflix_user");

// Show main content if already logged in
if (currentUser) {
  showMainContent();
}

// Event Listeners
signInBtn?.addEventListener("click", () => {
  signUpForm.classList.add("hidden");
  signInForm.classList.remove("hidden");
  authSection.classList.remove("hidden");
  mainContent.classList.add("hidden");
});

signUpBtn?.addEventListener("click", () => {
  signInForm.classList.add("hidden");
  signUpForm.classList.remove("hidden");
  authSection.classList.remove("hidden");
  mainContent.classList.add("hidden");
});

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

// Show/hide content
function showMainContent() {
  authSection.classList.add("hidden");
  mainContent.classList.remove("hidden");
}

// Surprise Me feature (placeholder content)
const sampleTitles = [
  { title: "Breaking Bad", image: "https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg" },
  { title: "Stranger Things", image: "https://image.tmdb.org/t/p/w500/x2LSRK2Cm7MZhjluni1msVJ3wDF.jpg" },
  { title: "The Crown", image: "https://image.tmdb.org/t/p/w500/el3zBQk1eYJDAi6JpsnCyhVG0Vv.jpg" },
];

const apiKey = "406d510b8114c3a454abf556a384a949";
const apiUrl = `https://api.themoviedb.org/3/discover/tv?api_key=${apiKey}&with_watch_providers=8&watch_region=GB&sort_by=popularity.desc`;

surpriseBtn?.addEventListener("click", async () => {
  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    const shows = data.results;

    if (shows.length > 0) {
      const pick = shows[Math.floor(Math.random() * shows.length)];
      surpriseDisplay.innerHTML = `
        <div class="surprise-card">
          <img src="https://image.tmdb.org/t/p/w500${pick.poster_path}" alt="${pick.name}" />
          <h3>${pick.name}</h3>
        </div>
      `;
    } else {
      surpriseDisplay.innerHTML = "<p>No shows found. Try again later.</p>";
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    surpriseDisplay.innerHTML = "<p>Oops! Something went wrong.</p>";
  }
});
