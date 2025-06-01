const swipeCardContainer = document.getElementById("swipeCardContainer");
const skipBtn = document.getElementById("skipBtn");
const likeBtn = document.getElementById("likeBtn");

let titles = [];
let currentIndex = 0;
const currentUser = localStorage.getItem("whatflix_user");
let users = JSON.parse(localStorage.getItem("whatflix_users") || "{}");

async function fetchTitles() {
  const res = await fetch("https://api.themoviedb.org/3/discover/movie?api_key=93c61062367dd5e7df5fe73dd9d72236&with_watch_providers=8&watch_region=GB&sort_by=popularity.desc");
  const data = await res.json();
  titles = data.results;
  displayCurrentCard();
}

function displayCurrentCard() {
  if (currentIndex >= titles.length) {
    swipeCardContainer.innerHTML = "<p>No more suggestions!</p>";
    return;
  }

  const title = titles[currentIndex];
  swipeCardContainer.innerHTML = `
    <div class="swipe-card">
      <img src="https://image.tmdb.org/t/p/w500${title.poster_path}" alt="${title.title}" />
      <h3>${title.title}</h3>
    </div>
  `;
}

function likeTitle() {
  const userData = users[currentUser];
  const likedTitle = titles[currentIndex];
  if (!userData.watchlist.find(item => item.id === likedTitle.id)) {
    userData.watchlist.push(likedTitle);
    users[currentUser] = userData;
    localStorage.setItem("whatflix_users", JSON.stringify(users));
  }
  currentIndex++;
  displayCurrentCard();
}

function skipTitle() {
  currentIndex++;
  displayCurrentCard();
}

skipBtn.addEventListener("click", skipTitle);
likeBtn.addEventListener("click", likeTitle);

fetchTitles();
