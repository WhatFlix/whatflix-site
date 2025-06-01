// Firebase + TMDB Movie Swipe + Auth Logic

// Firebase imports import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js"; import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js"; import { getFirestore, doc, setDoc, getDoc, updateDoc, arrayUnion } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";

// Firebase config const firebaseConfig = { apiKey: "AIzaSyCBAgNEOcl7QCmHQy2mJBQbwKSfmRNbRl0", authDomain: "whatflix-a17fb.firebaseapp.com", projectId: "whatflix-a17fb", storageBucket: "whatflix-a17fb.appspot.com", messagingSenderId: "369819362727", appId: "1:369819362727:web:b55af0726c7b29b8e9c282", measurementId: "G-Z6RX0KXLKY" };

const app = initializeApp(firebaseConfig); const auth = getAuth(app); const db = getFirestore(app);

// TMDB API Key const TMDB_API_KEY = "406d510b8114c3a454abf556a384a949";

// DOM Elements const loginForm = document.getElementById("login-form"); const emailInput = document.getElementById("email"); const passwordInput = document.getElementById("password"); const signUpBtn = document.getElementById("signup-btn"); const signInBtn = document.getElementById("signin-btn"); const signOutBtn = document.getElementById("signout-btn"); const swipeZone = document.getElementById("swipe-zone"); const watchlist = document.getElementById("watchlist"); const surpriseBtn = document.getElementById("surprise-me");

// Auth state change onAuthStateChanged(auth, (user) => { if (user) { document.getElementById("auth-section").style.display = "none"; document.getElementById("app-section").style.display = "block"; loadMovies(); loadWatchlist(); } else { document.getElementById("auth-section").style.display = "block"; document.getElementById("app-section").style.display = "none"; } });

// Sign up signUpBtn?.addEventListener("click", async (e) => { e.preventDefault(); const email = emailInput.value; const password = passwordInput.value; try { const userCredential = await createUserWithEmailAndPassword(auth, email, password); await setDoc(doc(db, "users", userCredential.user.uid), { watchlist: [] }); } catch (error) { alert(error.message); } });

// Sign in signInBtn?.addEventListener("click", async (e) => { e.preventDefault(); const email = emailInput.value; const password = passwordInput.value; try { await signInWithEmailAndPassword(auth, email, password); } catch (error) { alert(error.message); } });

// Sign out signOutBtn?.addEventListener("click", () => { signOut(auth); });

// Load Movies async function loadMovies() { const res = await fetch(https://api.themoviedb.org/3/trending/movie/day?api_key=${TMDB_API_KEY}); const data = await res.json(); swipeZone.innerHTML = ""; data.results.forEach(movie => { const card = document.createElement("div"); card.className = "movie-card"; card.innerHTML = <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}"> <h3>${movie.title}</h3> <button onclick="likeMovie(${encodeURIComponent(JSON.stringify(movie))})">Like</button>; swipeZone.appendChild(card); }); }

// Like Movie window.likeMovie = async function (movie) { const user = auth.currentUser; if (!user) return; const userRef = doc(db, "users", user.uid); await updateDoc(userRef, { watchlist: arrayUnion(movie) }); loadWatchlist(); }

// Load Watchlist async function loadWatchlist() { const user = auth.currentUser; if (!user) return; const userRef = doc(db, "users", user.uid); const docSnap = await getDoc(userRef); const data = docSnap.data(); watchlist.innerHTML = "<h2>Your Watchlist</h2>"; data.watchlist?.forEach(movie => { const item = document.createElement("div"); item.className = "watchlist-item"; item.innerHTML = <p>${movie.title}</p>; watchlist.appendChild(item); }); }

// Surprise Me surpriseBtn?.addEventListener("click", async () => { const res = await fetch(https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_API_KEY}); const data = await res.json(); const randomMovie = data.results[Math.floor(Math.random() * data.results.length)]; alert(Try watching: ${randomMovie.title}); });

