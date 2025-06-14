const email = signInForm["signin-email"].value;

const password = signInForm["signin-password"].value;

signInWithEmailAndPassword(auth, email, password)

.catch(err => alert(err.message));

});

signOutBtn.addEventListener("click", () => {

signOut(auth);

});

onAuthStateChanged(auth, user => {

currentUser = user;

authSection.style.display = user ? "none" : "block";

appSection.style.display = user ? "block" : "none";

if (user) {

fetchRandomMovie();

loadWatchlist();

}

});

