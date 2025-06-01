document.addEventListener('DOMContentLoaded', () => {
  const surpriseBtn = document.getElementById('surpriseBtn');
  surpriseBtn.addEventListener('click', handleSurpriseMe);
});

async function handleSurpriseMe() {
  const movieContainer = document.getElementById('movieDisplay');
  movieContainer.innerHTML = '🔄 Fetching something awesome...';

  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/discover/movie?api_key=406d510b8114c3a454abf556a384a949&sort_by=popularity.desc`
    );
    const data = await response.json();
    const movies = data.results;

    if (movies.length > 0) {
      const randomMovie = movies[Math.floor(Math.random() * movies.length)];
      movieContainer.innerHTML = `
        <h2>${randomMovie.title}</h2>
        <img src="https://image.tmdb.org/t/p/w500${randomMovie.poster_path}" alt="${randomMovie.title}" />
        <p>${randomMovie.overview}</p>
      `;
    } else {
      movieContainer.innerHTML = '🤷 No movies found!';
    }
  } catch (err) {
    movieContainer.innerHTML = '🚨 Something went wrong!';
    console.error(err);
  }
}
