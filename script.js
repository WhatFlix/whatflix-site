const surpriseBtn = document.getElementById('surprise-me');
const resultSection = document.getElementById('result');
const leaderboard = document.getElementById('leaderboard');

const userNameElem = document.getElementById('user-name');
const userMoviesWatchedElem = document.getElementById('user-movies-watched');
const resetProfileBtn = document.getElementById('reset-profile');

const tmdbApiKey = '93c61062367dd5e7df5fe73dd9d72236'; // <- Replace this with your TMDb API key

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
const countrySelect = document.getElementById('country-select');
const platformSelect = document.getElementById('platform-select');

let userProfile = {
  name: 'Guest',
  moviesWatched: 0,
};

// Save/load profile to/from localStorage
function saveUserProfile() {
  localStorage.setItem('whatflixUserProfile', JSON.stringify(userProfile));
}

function loadUserProfile() {
  const stored = localStorage.getItem('whatflixUserProfile');
  if (stored) {
    userProfile = JSON.parse(stored);
  }
  updateUserProfileUI();
}

function updateUserProfileUI() {
  userNameElem.textContent = userProfile.name;
  userMoviesWatchedElem.textContent = userProfile.moviesWatched;
}

// Fetch movies from TMDb discover endpoint with filters
async function fetchMovies(countryCode, providerId) {
  try {
    // Base discover endpoint: filter by streaming provider and country where available
    let url = `https://api.themoviedb.org/3/discover/movie?api_key=${tmdbApiKey}&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&with_watch_providers=${providerId}&watch_region=${countryCode}`;

    // If no provider selected, remove provider filter
    if (!providerId) {
      url = `https://api.themoviedb.org/3/discover/movie?api_key=${tmdbApiKey}&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&watch_region=${countryCode}`;
    }

    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch movies from TMDb');
    const data = await response.json();

    return data.results;
  } catch (err) {
    console.error(err);
    alert('Error fetching movies. Try again later.');
    return [];
  }
}

function createMovieCard(movie) {
  const container = document.createElement('div');
  container.className = 'movie-card';

  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : 'https://via.placeholder.com/180x270?text=No+Image';

  const img = document.createElement('img');
  img.src = posterUrl;
  img.alt = `${movie.title} poster`;

  const details = document.createElement('div');
  details.className = 'movie-details';

  const title = document.createElement('h2');
  title.textContent = movie.title;

  const overview = document.createElement('p');
  overview.textContent = movie.overview || 'No description available.';

  const link = document.createElement('a');
  link.href = `https://www.themoviedb.org/movie/${movie.id}`;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.textContent = 'View on TMDb';

  details.appendChild(title);
  details.appendChild(overview);
  details.appendChild(link);

  container.appendChild(img);
  container.appendChild(details);

  return container;
}

async function surpriseMe() {
  resultSection.textContent = 'Loading...';

  const countryCode = countrySelect.value;
  const platformId = platformSelect.value;

  const movies = await fetchMovies(countryCode, platformId);

  if (movies.length === 0) {
    resultSection.textContent = 'No movies found for these filters. Try changing country or platform.';
    return;
  }

  // Pick random movie
  const randomIndex = Math.floor(Math.random() * movies.length);
  const selectedMovie = movies[randomIndex];

  resultSection.innerHTML = '';
  resultSection.appendChild(createMovieCard(selectedMovie));

  // Update user profile watch count
  userProfile.moviesWatched += 1;
  saveUserProfile();
  updateUserProfile
