const API_KEY = '406d510b8114c3a454abf556a384a949';
const BASE_URL = 'https://api.themoviedb.org/3';

document.getElementById('signInBtn').addEventListener('click', () => {
  document.getElementById('signInForm').classList.remove('hidden');
  document.getElementById('signUpForm').classList.add('hidden');
});

document.getElementById('signUpBtn').addEventListener('click', () => {
  document.getElementById('signUpForm').classList.remove('hidden');
  document.getElementById('signInForm').classList.add('hidden');
});

document.getElementById('surpriseBtn').addEventListener('click', async () => {
  const res = await fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_watch_providers=8&watch_region=GB&sort_by=popularity.desc`);
  const data = await res.json();
  const movies = data.results;

  if (movies.length > 0) {
    const randomMovie = movies[Math.floor(Math.random() * movies.length)];
    displayMovie(randomMovie);
  }
});

function displayMovie(movie) {
  const movieDiv = document.getElementById('movieDisplay');
  movieDiv.innerHTML = `
    <h2>${movie.title}</h2>
    <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}" />
    <p>${movie.overview}</p>
  `;
  movieDiv.classList.remove('hidden');
}
