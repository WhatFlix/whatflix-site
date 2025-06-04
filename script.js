// Firebase setup
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import {
  getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";
import {
  getFirestore, doc, getDoc, setDoc, updateDoc, arrayUnion, collection, query, where, getDocs
} from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCBAgNEOcl7QCmHQy2mJBQbwKSfmRNbRl0",
  authDomain: "whatflix-a17fb.firebaseapp.com",
  projectId: "whatflix-a17fb",
  storageBucket: "whatflix-a17fb.appspot.com",
  messagingSenderId: "369819362727",
  appId: "1:369819362727:web:b55af0726c7b29b8e9c282"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// TMDB API setup
const TMDB_API_KEY = "406d510b8114c3a454abf556a384a949";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

// DOM elements
const movieCard = document.getElementById("movie-card");
const poster = document.getElementById("poster");
const title = document.getElementById("title");
const overview = document.getElementById("overview");
const likeBtn = document.getElementById("like");
const dislikeBtn = document.getElementById("dislike");
const watchlistContainer = document.getElementById("watchlist");
const friendFeed = document.getElementById("friend-feed");
const authSection = document.getElementById("auth-section");
const appSection = document.getElementById("app-section");
const signUpForm = document.getElementById("signup-form");
const signInForm = document.getElementById("signin-form");
const signOutBtn = document.getElementById("signout-btn");
const addFriendForm = document.getElementById("add-friend-form");
const friendEmailInput = document.getElementById("friend-email");
const welcomeMsg = document.getElementById("welcome-message");

let currentUser = null;
let movieQueue = [];

function fetchRandomMovie() {
  fetch(`${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&region=GB`)
    .then(res => res.json())
    .then(data => {
      movieQueue = data.results;
      showNextMovie();
    });
}

function showNextMovie() {
  if (movieQueue.length === 0) {
    title.innerText = "No more movies!";
    poster.src = "";
    overview.innerText = "";
    return;
  }
  const movie = movieQueue.shift();
  title.innerText = movie.title;
  poster.src = movie.poster_path ? `${TMDB_IMAGE_BASE}${movie.poster_path}` : "fallback.jpg";
  overview.innerText = movie.overview;

  likeBtn.onclick = () => saveToWatchlist(movie);
  dislikeBtn.onclick = showNextMovie;
}

async function saveToWatchlist(movie) {
  if (!currentUser) return;
  const userDocRef = doc(db, "watchlists", currentUser.uid);
  await setDoc(userDocRef, { movies: arrayUnion(movie) }, { merge: true });
  showNextMovie();
  loadWatchlist();
}

async function loadWatchlist() {
  if (!currentUser) return;
  const docRef = doc(db, "watchlists", currentUser.uid);
  const docSnap = await getDoc(docRef);
  const movies = docSnap.exists() ? docSnap.data().movies || [] : [];
  watchlistContainer.innerHTML = movies.map(m => `<li>${m.title}</li>`).join("");
}

async function loadFriendFeed() {
  const friendsRef = doc(db, "friends", currentUser.uid);
  const friendsSnap = await getDoc(friendsRef);
  if (!friendsSnap.exists()) return;

  const friends = friendsSnap.data().emails || [];
  friendFeed.innerHTML = "";

  for (let email of friends) {
    const userQuery = query(collection(db, "watchlists"), where("email", "==", email));
    const snapshot = await getDocs(userQuery);
    snapshot.forEach(docSnap => {
      const movies = docSnap.data().movies || [];
      movies.forEach(movie => {
        const li = document.createElement("li");
        li.innerText = `${email.split("@")[0]}: ${movie.title}`;
        friendFeed.appendChild(li);
      });
    });
  }
}

signUpForm.addEventListener("submit", async e => {
  e.preventDefault();
  const email = signUpForm["signup-email"].value;
  const password = signUpForm["signup-password"].value;
  const userCred = await createUserWithEmailAndPassword(auth, email, password);
  await setDoc(doc(db, "watchlists", userCred.user.uid), { movies: [], email });
});

signInForm.addEventListener("submit", e => {
  e.preventDefault();
  const email = signInForm["signin-email"].value;
  const password = signInForm["signin-password"].value;
  signInWithEmailAndPassword(auth, email, password);
});

signOutBtn.addEventListener("click", () => {
  signOut(auth);
});

addFriendForm.addEventListener("submit", async e => {
  e.preventDefault();
  const friendEmail = friendEmailInput.value;
  if (!currentUser) return;
  const friendDocRef = doc(db, "friends", currentUser.uid);
  await setDoc(friendDocRef, { emails: arrayUnion(friendEmail) }, { merge: true });
  friendEmailInput.value = "";
  loadFriendFeed();
});

onAuthStateChanged(auth, user => {
  currentUser = user;
  authSection.classList.toggle("hidden", !!user);
  appSection.classList.toggle("hidden", !user);
  if (user) {
    welcomeMsg.innerText = `Welcome ${user.email.split("@")[0]}`;
    fetchRandomMovie();
    loadWatchlist();
    loadFriendFeed();
  }
});
