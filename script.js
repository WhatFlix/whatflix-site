const apiKey = "93c61062367dd5e7df5fe73dd9d72236";
const movieCard = document.getElementById("movie-card");
const refreshBtn = document.getElementById("refresh-btn");

async function getTonightPick() {
  movieCard.classList.add("loading");
  movieCard.innerHTML = "<p>Loading...</p>";

  const res = await fetch(`https://api.themoviedb.org/3/trending/all/day?api_key=${apiKey}`);
  const data = await res.json();
  const picks = data.results;
  const randomPick = picks[Math.floor(Math.random() * picks.length)];

  const title = randomPick.title || randomPick.name;
  const overview = randomPick.overview || "No overview available.";
  const poster = randomPick.poster_path
    ? `https://image.tmdb.org/t/p/w500${randomPick.poster_path}`
    : "";
  const releaseDate = randomPick.release_date || randomPick.first_air_date || "N/A";
  const rating = randomPick.vote_average?.toFixed(1) || "N/A";

  movieCard.classList.remove("loading");
  movieCard.innerHTML = `
    <img src="${poster}" alt="${title}" />
    <h2>${title}</h2>
    <p><strong>Release:</strong> ${releaseDate}</p>
    <p><strong>Rating:</strong> ⭐ ${rating}</p>
    <p>${overview}</p>
  `;
}

refreshBtn.addEventListener("click", getTonightPick);
getTonightPick();
