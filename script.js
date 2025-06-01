const movies = [
  "Inception",
  "The Matrix",
  "Dune",
  "The Dark Knight",
  "Interstellar",
  "Oppenheimer",
  "Barbie",
  "Everything Everywhere All At Once"
];

function getRandomMovie() {
  const index = Math.floor(Math.random() * movies.length);
  const resultDiv = document.getElementById("movie-result");
  resultDiv.textContent = `🎥 ${movies[index]}`;
}