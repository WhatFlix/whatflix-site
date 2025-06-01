const surpriseBtn = document.getElementById('surprise-btn');
const movieContainer = document.getElementById('movie-info');
const moviePoster = document.getElementById('movie-poster');
const movieTitle = document.getElementById('movie-title');
const movieOverview = document.getElementById('movie-overview');

const TMDB_API_KEY = '93c61062367dd5e7df5fe73dd9d72236';

async function fetchRandomMovie() {
  try {
    // Get a random page to fetch diverse movies
    const randomPage = Math.floor(Math.random() * 500) + 1;
    const url = `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&language=en-US&sort_by=popularity.desc&page=${randomPage}`;

    const res = await fetch(url);
    const data = await res.json();

    if (!data.results || data.results.length === 0) {
      throw new Error('No movies found');
    }

    // Pick a random movie from results
    const randomMovie = data.results[Math.floor(Math.random() * data.results.length)];

    displayMovie(randomMovie);
  } catch (error) {
    console.error('Error fetching movie:', error);
    alert('Oops, something went wrong while fetching a movie. Try again!');
  }
}

function displayMovie(movie) {
  if (!movie.poster_path) {
    // If no poster, hide the poster element
    moviePoster.style.display = 'none';
  } else {
    moviePoster.style.display = 'block';
    moviePoster.src = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
    moviePoster.alt = movie.title + ' Poster';
  }
  movieTitle.textContent = movie.title || 'Unknown Title';
  movieOverview.textContent = movie.overview || 'No description available.';

  movieContainer.classList.remove('hidden');
}

surpriseBtn.addEventListener('click', () => {
  movieContainer.classList.add('hidden');
  fetchRandomMovie();
});
