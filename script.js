// DOM Elements
const signInForm = document.getElementById("signInForm");
const signUpForm = document.getElementById("signUpForm");
const signInBtn = document.getElementById("signInBtn");
const signUpBtn = document.getElementById("signUpBtn");
const authSection = document.querySelector(".auth-section");
const mainContent = document.getElementById("main");
const surpriseBtn = document.getElementById("surpriseMeBtn");
const surpriseDisplay = document.getElementById("surpriseDisplay");
const swipeZone = document.getElementById("swipeZone");

const users = JSON.parse(localStorage.getItem("whatflix_users") || "{}");
let currentUser = localStorage.getItem("whatflix_user");

// Show main content if already logged in
if (currentUser) showMainContent();

// Auth Logic
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

function showMainContent() {
  authSection.classList.add("hidden");
  mainContent.classList.remove("hidden");
  loadSwipeCards();
}

// Surprise Me Feature
const sampleTitles = [
  { title: "Breaking Bad", image: "https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg" },
  { title: "Stranger Things", image: "https://image.tmdb.org/t/p/w500/x2LSRK2Cm7MZhjluni1msVJ3wDF.jpg" },
  { title: "The Crown", image: "https://image.tmdb.org/t/p/w500/el3zBQk1eYJDAi6JpsnCyhVG0Vv.jpg" },
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

// Swipe Feature
function loadSwipeCards() {
  swipeZone.innerHTML = "";
  sampleTitles.forEach((item, index) => {
    const card = document.createElement("div");
    card.className = "swipe-card";
    card.style.zIndex = sampleTitles.length - index;
    card.innerHTML = `<img src="${item.image}" alt="${item.title}"><h3>${item.title}</h3>`;
    swipeZone.appendChild(card);

    let offset = 0;
    let isDragging = false;

    card.addEventListener("mousedown", () => (isDragging = true));
    document.addEventListener("mouseup", () => {
      if (isDragging && Math.abs(offset) > 100) {
        card.style.transform = `translateX(${offset > 0 ? 1000 : -1000}px)`;
        card.style.opacity = "0";
        setTimeout(() => card.remove(), 300);
      } else {
        card.style.transform = "translateX(0)";
      }
      isDragging = false;
      offset = 0;
    });

    document.addEventListener("mousemove", (e) => {
      if (!isDragging) return;
      offset = e.movementX + offset;
      card.style.transform = `translateX(${offset}px) rotate(${offset / 20}deg)`;
    });
  });
}
