// api key = https://www.omdbapi.com/?i=tt3896198&apikey=eb967a67
const searchBtn = document.getElementById("searchBtn");
const searchInput = document.getElementById("searchInput");
const movieResults = document.getElementById("movieResults");
const apiKey = "eb967a67"; // your OMDB key
const favoriteResults = document.getElementById("favoriteResults");
const clearFavoritesBtn = document.getElementById("clearFavorites");
const favCountEl = document.getElementById("favCount");
const toastArea = document.getElementById("toastArea");
const paginationEl = document.getElementById("pagination");
const themeToggleBtn = document.getElementById("themeToggle");
const topPicksResults = document.getElementById("topPicksResults");

// Theme handling
const THEME_KEY = "theme"; // 'dark' | 'light'
function applyTheme(theme) {
  const isLight = theme === "light";
  document.body.classList.toggle("theme-light", isLight);
  // Navbar scheme
  const nav = document.querySelector("nav.navbar");
  if (nav) {
    nav.classList.toggle("navbar-dark", !isLight);
    nav.classList.toggle("bg-dark", !isLight);
    nav.classList.toggle("navbar-light", isLight);
    nav.classList.toggle("bg-light", isLight);
  }
  if (themeToggleBtn) {
    themeToggleBtn.classList.toggle("btn-outline-light", !isLight);
    themeToggleBtn.classList.toggle("btn-outline-dark", isLight);
    themeToggleBtn.textContent = isLight ? "🌞" : "🌙";
    themeToggleBtn.setAttribute("aria-label", isLight ? "Switch to dark theme" : "Switch to light theme");
  }
  localStorage.setItem(THEME_KEY, theme);
}
function initTheme() {
  const saved = localStorage.getItem(THEME_KEY) || "dark";
  applyTheme(saved);
}
if (themeToggleBtn) {
  themeToggleBtn.addEventListener("click", () => {
    const current = localStorage.getItem(THEME_KEY) || "dark";
    applyTheme(current === "dark" ? "light" : "dark");
  });
}

// Simple app state for pagination
let state = {
  query: "",
  page: 1,
  totalPages: 1,
};

// Favorites helpers
const FAV_KEY = "favorites";
function getFavorites() {
  try {
    const raw = localStorage.getItem(FAV_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (_) {
    return {};
  }
}
function saveFavorites(favs) {
  localStorage.setItem(FAV_KEY, JSON.stringify(favs));
}
function isFavorite(id) {
  const favs = getFavorites();
  return Boolean(favs[id]);
}
function updateFavCount() {
  if (!favCountEl) return;
  const count = Object.keys(getFavorites()).length;
  favCountEl.textContent = String(count);
  // pulse animation for feedback
  favCountEl.classList.remove("pulse");
  // force reflow to restart animation
  // eslint-disable-next-line no-unused-expressions
  void favCountEl.offsetWidth;
  favCountEl.classList.add("pulse");
}
function showToast(message) {
  if (!toastArea) return;
  const id = `t${Date.now()}`;
  toastArea.insertAdjacentHTML(
    "beforeend",
    `<div id="${id}" class="toast align-items-center text-bg-dark border-0 mb-2" role="alert" aria-live="assertive" aria-atomic="true">
       <div class="d-flex">
         <div class="toast-body">${message}</div>
         <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
       </div>
     </div>`
  );
  const toastEl = document.getElementById(id);
  // Bootstrap toast init
  // eslint-disable-next-line no-undef
  const t = new bootstrap.Toast(toastEl, { delay: 1600 });
  t.show();
  toastEl.addEventListener("hidden.bs.toast", () => toastEl.remove());
}
function updateFavBtnVisual(btn, active) {
  btn.classList.toggle("favorited", active);
  btn.setAttribute("aria-pressed", active ? "true" : "false");
  btn.textContent = active ? "★" : "☆"; // filled vs outline
}
function toggleFavorite(movie) {
  const favs = getFavorites();
  if (favs[movie.imdbID]) {
    delete favs[movie.imdbID];
    saveFavorites(favs);
    updateFavCount();
    showToast(`Removed from favorites: ${movie.Title}`);
    return false;
  } else {
    favs[movie.imdbID] = {
      imdbID: movie.imdbID,
      Title: movie.Title,
      Year: movie.Year,
      Poster: posterUrl(movie.Poster),
    };
    saveFavorites(favs);
    updateFavCount();
    showToast(`Added to favorites: ${movie.Title}`);
    return true;
  }
}
function renderFavorites() {
  if (!favoriteResults) return; // not on this page
  const favs = Object.values(getFavorites());
  if (favs.length === 0) {
    favoriteResults.innerHTML = '<p class="text-center text-muted">No favorites yet.</p>';
    return;
  }
  favoriteResults.innerHTML = "";
  favs.forEach((movie) => {
    const poster = posterUrl(movie.Poster);
    favoriteResults.innerHTML += `
      <div class="col-md-3 mb-4">
        <div class="movie-card" data-id="${movie.imdbID}" role="button" tabindex="0" aria-label="View details for ${movie.Title}">
          <div class="card themed-card h-100 shadow">
            <div class="position-relative">
              <img src="${poster}" class="card-img-top" alt="${movie.Title}" loading="lazy" onerror="this.onerror=null;this.src='${placeholderPoster}';">
              <button class="btn btn-sm favorite-btn fav-overlay position-absolute top-0 end-0 m-2"
                data-id="${movie.imdbID}" data-title="${movie.Title}" data-year="${movie.Year}" data-poster="${poster}" aria-label="Remove from favorites" aria-pressed="true">★</button>
            </div>
            <div class="card-body d-flex flex-column">
              <h5 class="card-title">${movie.Title}</h5>
              <p class="card-text">Year: ${movie.Year}</p>
            </div>
          </div>
        </div>
      </div>`;
  });

  // Attach navigation and favorite handlers for favorites grid
  document.querySelectorAll("#favoriteResults .movie-card").forEach((card) => {
    const movieId = card.getAttribute("data-id");
    const go = () => (window.location.href = `details.html?id=${movieId}`);
    card.addEventListener("click", go);
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); }
    });
  });
  document.querySelectorAll("#favoriteResults .favorite-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const movie = {
        imdbID: btn.getAttribute("data-id"),
        Title: btn.getAttribute("data-title"),
        Year: btn.getAttribute("data-year"),
        Poster: btn.getAttribute("data-poster"),
      };
      const active = toggleFavorite(movie);
      updateFavBtnVisual(btn, active);
      renderFavorites();
    });
  });
}


const placeholderPoster = "https://via.placeholder.com/300x445?text=No+Image";
function posterUrl(src) {
  return src && src != "N/A" ? src : placeholderPoster;

}

function setLoadingAnimation(isLoading) {
  if (isLoading) {
    movieResults.innerHTML = `
    <div class="d-flex justify-content-center py-5">
        <div class="spinner-border text-primary" role="status" aria-label="Loading"></div>
      </div>`;
  }
  searchBtn.disabled = isLoading;
  searchInput.disabled = isLoading;
}

function renderError(message) {
  movieResults.innerHTML = `<div class="alert alert-danger text-center" role="alert">
  ${message}
  </div>`;

}


searchBtn.addEventListener("click", () => {
  const query = searchInput.value.trim();
  if (!query) {
    alert("Please enter a movie name!");
    return;
  }
  state.query = query;
  state.page = 1;
  fetchMovies(state.query, state.page);
  // clear the input after successful trigger; we'll keep lastQuery in storage
  searchInput.value = "";
});

async function fetchMovies(query, page = 1) {
  try {
    setLoadingAnimation(true);
    const url = `https://www.omdbapi.com/?s=${encodeURIComponent(query)}&page=${page}&apikey=${apiKey}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.Response === "True") {
      renderMovies(data.Search);
      const total = Number(data.totalResults || 0);
      state.totalPages = Math.max(1, Math.ceil(total / 10));
      state.page = page;
      state.query = query;
      renderPagination();

      // persist state
      localStorage.setItem("lastMovies", JSON.stringify(data.Search));
      localStorage.setItem("lastQuery", query);
      localStorage.setItem("lastPage", String(page));
      localStorage.setItem("lastTotalResults", String(total));
    } else {
      renderError(`No results for "${query}".`);
      state.totalPages = 1;
      state.page = 1;
      renderPagination(true);
    }
  } catch (err) {
    console.error(err);
    renderError("Something went wrong. Please try again later.");
    renderPagination(true);
  } finally {
    setLoadingAnimation(false);
  }
}

function renderPagination(disable = false) {
  if (!paginationEl) return;
  if (disable || state.totalPages <= 1) {
    paginationEl.innerHTML = "";
    return;
  }
  const prevDisabled = state.page <= 1 ? "disabled" : "";
  const nextDisabled = state.page >= state.totalPages ? "disabled" : "";
  paginationEl.innerHTML = `
    <button id="prevPage" class="btn btn-outline-light" ${prevDisabled}>Prev</button>
    <span class="text-muted">Page ${state.page} of ${state.totalPages}</span>
    <button id="nextPage" class="btn btn-outline-light" ${nextDisabled}>Next</button>
  `;
  const prev = document.getElementById("prevPage");
  const next = document.getElementById("nextPage");
  if (prev) prev.onclick = () => {
    if (state.page > 1) fetchMovies(state.query, state.page - 1);
  };
  if (next) next.onclick = () => {
    if (state.page < state.totalPages) fetchMovies(state.query, state.page + 1);
  };
}

function renderMovies(movies) {
  movieResults.innerHTML = "";
  movies.forEach(movie => {
    const poster = posterUrl(movie.Poster);
    movieResults.innerHTML += `
      <div class="col-md-3 mb-4">
        <div class="movie-card" data-id="${movie.imdbID}" role="button" tabindex="0" aria-label="View details for ${movie.Title}">
          <div class="card themed-card h-100 shadow">
            <div class="position-relative">
              <img src="${poster}" class="card-img-top" alt="${movie.Title}" loading="lazy" onerror="this.onerror=null;this.src='${placeholderPoster}';">
              <button class="btn btn-sm favorite-btn fav-overlay position-absolute top-0 end-0 m-2"
                data-id="${movie.imdbID}" data-title="${movie.Title}" data-year="${movie.Year}" data-poster="${poster}"
                aria-label="Toggle favorite" aria-pressed="${isFavorite(movie.imdbID) ? "true" : "false"}">${isFavorite(movie.imdbID) ? "★" : "☆"}</button>
            </div>
            <div class="card-body d-flex flex-column">
              <h5 class="card-title">${movie.Title}</h5>
              <p class="card-text">Year: ${movie.Year}</p>
              <!-- additional actions could go here -->
            </div>
          </div>
        </div>
      </div>
    `;
  });

  // attach click events to each card to open details
  document.querySelectorAll(".movie-card").forEach(card => {
    const movieId = card.getAttribute("data-id");
    const go = () => (window.location.href = `details.html?id=${movieId}`);
    card.addEventListener("click", go);
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        go();
      }
    });
  });

  // favorite toggle without navigating
  document.querySelectorAll("#movieResults .favorite-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const movie = {
        imdbID: btn.getAttribute("data-id"),
        Title: btn.getAttribute("data-title"),
        Year: btn.getAttribute("data-year"),
        Poster: btn.getAttribute("data-poster"),
      };
      const active = toggleFavorite(movie);
      updateFavBtnVisual(btn, active);
      renderFavorites();
    });
  });

}

// ----- Top Picks -----
const TOP_PICKS = [
  { title: "The Shawshank Redemption", year: "1994" },
  { title: "The Godfather", year: "1972" },
  { title: "The Dark Knight", year: "2008" },
  { title: "Schindler's List", year: "1993" },
  { title: "Inception", year: "2010" },
  { title: "Fight Club", year: "1999" },
  { title: "Pulp Fiction", year: "1994" },
  { title: "Forrest Gump", year: "1994" },
  { title: "Parasite", year: "2019" },
  { title: "Interstellar", year: "2014" },
];

async function fetchByTitleAndYear(title, year) {
  try {
    const url = `https://www.omdbapi.com/?t=${encodeURIComponent(title)}&y=${year}&apikey=${apiKey}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.Response === "True" && data.Year === year) return data;
  } catch (_) { }
  return null;
}

async function renderTopPicks() {
  if (!topPicksResults) return;
  topPicksResults.innerHTML = `
    <div class="d-flex justify-content-center py-4 w-100">
      <div class="spinner-border text-primary" role="status" aria-label="Loading top picks"></div>
    </div>`;
  const movies = await Promise.all(
    TOP_PICKS.map(it => fetchByTitleAndYear(it.title, it.year))
  );
  const filtered = movies.filter(m => m && m.Poster && m.Poster !== 'N/A');
  if (filtered.length === 0) {
    topPicksResults.innerHTML = '<p class="text-muted">Unable to load Top Picks right now.</p>';
    return;
  }
  // reuse card layout
  topPicksResults.innerHTML = "";
  filtered.forEach(movie => {
    const poster = movie.Poster;
    topPicksResults.innerHTML += `
      <div class="col-md-3 mb-4">
        <div class="movie-card" data-id="${movie.imdbID}" role="button" tabindex="0" aria-label="View details for ${movie.Title}">
          <div class="card themed-card h-100 shadow">
            <div class="position-relative">
              <img src="${poster}" class="card-img-top" alt="${movie.Title}" loading="lazy" onerror="this.onerror=null;this.closest('.col-md-3').remove()">
              <button class="btn btn-sm favorite-btn fav-overlay position-absolute top-0 end-0 m-2"
                data-id="${movie.imdbID}" data-title="${movie.Title}" data-year="${movie.Year}" data-poster="${poster}"
                aria-label="Toggle favorite" aria-pressed="${isFavorite(movie.imdbID) ? "true" : "false"}">${isFavorite(movie.imdbID) ? "★" : "☆"}</button>
            </div>
            <div class="card-body d-flex flex-column">
              <h5 class="card-title">${movie.Title}</h5>
              <p class="card-text">Year: ${movie.Year}</p>
            </div>
          </div>
        </div>
      </div>`;
  });

  // attach behaviors
  document.querySelectorAll("#topPicksResults .movie-card").forEach(card => {
    const movieId = card.getAttribute("data-id");
    const go = () => (window.location.href = `details.html?id=${movieId}`);
    card.addEventListener("click", go);
    card.addEventListener("keydown", (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
  });
  document.querySelectorAll("#topPicksResults .favorite-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const movie = {
        imdbID: btn.getAttribute("data-id"),
        Title: btn.getAttribute("data-title"),
        Year: btn.getAttribute("data-year"),
        Poster: btn.getAttribute("data-poster"),
      };
      const active = toggleFavorite(movie);
      updateFavBtnVisual(btn, active);
      renderFavorites();
    });
  });
}



searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    searchBtn.click();
  }
});

window.addEventListener("DOMContentLoaded", () => {
  initTheme();
  const savedMovies = localStorage.getItem("lastMovies");
  const lastQuery = localStorage.getItem("lastQuery") || "";
  const lastPage = Number(localStorage.getItem("lastPage") || 1);
  const lastTotal = Number(localStorage.getItem("lastTotalResults") || 0);
  if (lastQuery) searchInput.value = lastQuery; // prefill for convenience
  if (savedMovies) {
    state.query = lastQuery || state.query;
    state.page = lastPage || 1;
    state.totalPages = Math.max(1, Math.ceil(lastTotal / 10));
    renderMovies(JSON.parse(savedMovies));
    renderPagination();
  }
  // load Top Picks after initial render
  renderTopPicks();
  renderFavorites();
  if (clearFavoritesBtn) {
    clearFavoritesBtn.addEventListener("click", () => {
      localStorage.removeItem(FAV_KEY);
      renderFavorites();
      updateFavCount();
      showToast("Cleared all favorites");
    });
  }
  updateFavCount();
});
