const apiKey = '406d510b8114c3a454abf556a384a949'; // Your TMDB API key
const region = 'GB'; // United Kingdom
const providerId = 8; // Netflix

const surpriseBtn = document.getElementById('surpriseBtn');
const resultCard = document.getElementById('result');
const title = document.getElementById('title');
const overview = document.getElementById('overview');
const poster = document.getElementById('poster');

const getRandomMedia = async () => {
  const mediaType = Math.random() > 0.5 ? 'movie' : 'tv';
  const randomPage = Math.floor(Math.random() * 10) + 1;

  const url = `https://api.themoviedb.org/3/discover/${mediaType}?api_key=${apiKey}&watch_region=${region}&with_watch_providers=${providerId}&sort_by=popularity.desc&page=${randomPage}`;

  const response = await fetch(url);
  const data = await response.json();
  const results = data.results;

  if (!results || results.length === 0) {
    alert('Nothing found! Try again.');
    return;
  }

  const randomPick = results[Math.floor(Math.random() * results.length)];

  title.textContent = mediaType === 'movie' ? randomPick.title : randomPick.name;
  overview.textContent = randomPick.overview || 'No overview available.';
  poster.src = `https://image.tmdb.org/t/p/w500${randomPick.poster_path || randomPick.backdrop_path}`;
  resultCard.classList.remove('hidden');
  resultCard.style.display = 'block';
};

surpriseBtn.addEventListener('click', getRandomMedia);
// Utility to get watchlist from localStorage
function getWatchlist() {
  return JSON.parse(localStorage.getItem("watchlist")) || [];
}
