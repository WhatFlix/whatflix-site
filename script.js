// script.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js"; import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js"; import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";

const firebaseConfig = { apiKey: "AIzaSyCBAgNEOcl7QCmHQy2mJBQbwKSfmRNbRl0", authDomain: "whatflix-a17fb.firebaseapp.com", projectId: "whatflix-a17fb", storageBucket: "whatflix-a17fb.appspot.com", messagingSenderId: "369819362727", appId: "1:369819362727:web:b55af0726c7b29b8e9c282", measurementId: "G-Z6RX0KXLKY" };

const app = initializeApp(firebaseConfig); const auth = getAuth(app); const db = getFirestore(app);

const signUpForm = document.getElementById('sign-up-form'); const signInForm = document.getElementById('sign-in-form');

if (signUpForm) { signUpForm.addEventListener('submit', async (e) => { e.preventDefault(); const email = document.getElementById('sign-up-email').value; const password = document.getElementById('sign-up-password').value;

try {
  await createUserWithEmailAndPassword(auth, email, password);
  window.location.href = "home.html";
} catch (error) {
  alert("Error signing up: " + error.message);
}

}); }

if (signInForm) { signInForm.addEventListener('submit', async (e) => { e.preventDefault(); const email = document.getElementById('sign-in-email').value; const password = document.getElementById('sign-in-password').value;

try {
  await signInWithEmailAndPassword(auth, email, password);
  window.location.href = "home.html";
} catch (error) {
  alert("Error signing in: " + error.message);
}

}); }

onAuthStateChanged(auth, (user) => { if (user) { if (window.location.pathname.endsWith('index.html')) { window.location.href = "home.html"; } } else { if (window.location.pathname.endsWith('home.html')) { window.location.href = "index.html"; } } });

// Surprise Me Feature const surpriseButton = document.getElementById("surprise-button");

if (surpriseButton) { surpriseButton.addEventListener("click", async () => { try { const res = await fetch("https://api.themoviedb.org/3/discover/movie?api_key=406d510b8114c3a454abf556a384a949&sort_by=popularity.desc"); const data = await res.json(); const randomMovie = data.results[Math.floor(Math.random() * data.results.length)]; alert("🎬 Surprise Movie: " + randomMovie.title); } catch (err) { alert("Failed to fetch movie: " + err.message); } }); }

// Sign Out button logic (optional) const signOutBtn = document.getElementById("sign-out-button"); if (signOutBtn) { signOutBtn.addEventListener("click", async () => { try { await signOut(auth); window.location.href = "index.html"; } catch (error) { alert("Error signing out: " + error.message); } }); }

