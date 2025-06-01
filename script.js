const surpriseBtn = document.getElementById('surprise-me');
const resultSection = document.getElementById('result');
const leaderboard = document.getElementById('leaderboard');

const userNameElem = document.getElementById('user-name');
const userMoviesWatchedElem = document.getElementById('user-movies-watched');
const resetProfileBtn = document.getElementById('reset-profile');

const tmdbApiKey = 'YOUR_TMDB_API_KEY_HERE'; // <- Replace this with your TMDb API key

// Dummy leaderboard data (can be replaced by real DB/API later)
const leaderboardData = [
  { name: "Alice", watched: 124 },
  { name: "Sebastian", watched: 102 },
  { name: "Lottie", watched: 98 },
  { name: "Molly", watched: 75 },
  { name: "Rivka", watched: 67 },
];

// Load leaderboard entries into DOM
function loadLeaderboard() {
  leaderboard.innerHTML = '';
  leaderboardData.forEach(user => {
    const li = document.createElement('li');
    li.textContent = `${user.name}`;
    const span = document.createElement('span');
    span.textContent = `${user.watched} movies`;
    li.appendChild(span);
    leaderboard.appendChild(li);
  });
