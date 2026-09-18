const KEYS = {
  favorites: "cinevault_favorites",
  watchlist: "cinevault_watchlist",
  watched: "cinevault_watched",
  ratings: "cinevault_ratings",
};
const state = {
  currentView: "home",
  previousView: "home",
  search: { query: "", page: 1 },
  discover: { page: 1 },
  collection: "favorites",
};
const $ = (selector) => document.querySelector(selector);
const esc = (value) =>
  String(value ?? "").replace(
    /[&<>'"]/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[
        c
      ],
  );
const list = (name) => {
  try {
    return JSON.parse(localStorage.getItem(KEYS[name])) || [];
  } catch {
    return [];
  }
};
const ratings = () => {
  try {
    return JSON.parse(localStorage.getItem(KEYS.ratings)) || {};
  } catch {
    return {};
  }
};
function saveList(name, values) {
  localStorage.setItem(KEYS[name], JSON.stringify(values));
}
function has(name, id) {
  return list(name).includes(Number(id));
}
function toggle(name, id) {
  const values = list(name),
    num = Number(id);
  saveList(
    name,
    values.includes(num) ? values.filter((x) => x !== num) : [...values, num],
  );
  return has(name, id);
}
function toast(message) {
  const el = $("#toast");
  el.textContent = message;
  el.classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => el.classList.remove("show"), 2200);
}
async function api(url) {
  const response = await fetch(url);
  const json = await response.json();
  if (!response.ok || !json.success)
    throw new Error(json.error || "Richiesta non riuscita");
  return json.data;
}
function empty(message) {
  return `<p class="empty">${esc(message)}</p>`;
}
function poster(movie) {
  return movie.poster
    ? `<img class="poster" src="https://image.tmdb.org/t/p/w500${esc(movie.poster)}" alt="Poster di ${esc(movie.title)}">`
    : `<div class="poster empty">Poster non disponibile</div>`;
}
function card(movie) {
  const fav = has("favorites", movie.id),
    watch = has("watchlist", movie.id);
  return `<article class="movie-card">${poster(movie)}<div class="card-content"><h2 title="${esc(movie.title)}">${esc(movie.title)}</h2><p class="meta">${movie.releaseDate ? esc(movie.releaseDate.slice(0, 4)) : "Data non disponibile"} · <span class="rating">★ ${Number(movie.rating).toFixed(1)}</span></p><div class="card-actions"><button data-detail="${movie.id}">Dettagli</button><button class="${fav ? "active" : ""}" data-toggle="favorites" data-id="${movie.id}" title="Preferiti">♥</button><button class="${watch ? "active" : ""}" data-toggle="watchlist" data-id="${movie.id}" title="Watchlist">＋</button></div></div></article>`;
}
function bindCards(container) {
  container
    .querySelectorAll("[data-detail]")
    .forEach((b) => (b.onclick = () => showDetail(b.dataset.detail)));
  container.querySelectorAll("[data-toggle]").forEach(
    (b) =>
    (b.onclick = () => {
      const active = toggle(b.dataset.toggle, b.dataset.id);
      b.classList.toggle("active", active);
      toast(active ? "Aggiunto alla collezione" : "Rimosso dalla collezione");
      if (state.currentView === "collection") renderCollection();
    }),
  );
}
function renderGrid(selector, movies, message = "Nessun film trovato.") {
  const el = $(selector);
  el.innerHTML = movies.length ? movies.map(card).join("") : empty(message);
  bindCards(el);
}
function pagination(selector, data, change) {
  const el = $(selector);
  if (data.totalPages <= 1) return (el.innerHTML = "");
  el.innerHTML = `<button ${data.page <= 1 ? "disabled" : ""} data-page="prev">← Precedente</button><span>Pagina ${data.page} di ${data.totalPages}</span><button ${data.page >= data.totalPages ? "disabled" : ""} data-page="next">Successiva →</button>`;
  el.querySelectorAll("[data-page]").forEach(
    (b) =>
    (b.onclick = () =>
      change(b.dataset.page === "next" ? data.page + 1 : data.page - 1)),
  );
}
function showView(name) {
  document.querySelectorAll(".view").forEach((v) => v.classList.add("hidden"));
  $(`#${name}-view`).classList.remove("hidden");
  state.currentView = name;
}
async function loadHome() {
  showView("home");
  $("#home-grid").innerHTML = empty("Caricamento dei film popolari…");
  try {
    const data = await api("/api/movies/popular");
    renderGrid("#home-grid", data.results);
  } catch (e) {
    $("#home-grid").innerHTML = empty(e.message);
  }
}
async function loadSearch(page = 1) {
  state.search.page = page;
  showView("search");
  const { query } = state.search;
  $("#search-title").textContent = `Risultati per “${query}”`;
  $("#search-grid").innerHTML = empty("Ricerca in corso…");
  try {
    const data = await api(
      `/api/movies/search?${new URLSearchParams({ query, page })}`,
    );
    renderGrid("#search-grid", data.results);
    pagination("#search-pagination", data, loadSearch);
  } catch (e) {
    $("#search-grid").innerHTML = empty(e.message);
  }
}
async function loadDiscover(page = 1) {
  state.discover.page = page;
  showView("discover");
  const values = new FormData($("#filters"));
  state.discover.params = Object.fromEntries(values.entries());
  state.discover.hideWatched = values.get("hideWatched") === "on";
  $("#discover-grid").innerHTML = empty("Ricerca nel catalogo…");
  try {
    const params = new URLSearchParams({ ...state.discover.params, page });
    params.delete("hideWatched");
    const data = await api(`/api/movies/discover?${params}`);
    const movies = state.discover.hideWatched
      ? data.results.filter((m) => !has("watched", m.id))
      : data.results;
    renderGrid("#discover-grid", movies, "Nessun film corrisponde ai filtri.");
    pagination("#discover-pagination", data, loadDiscover);
  } catch (e) {
    $("#discover-grid").innerHTML = empty(e.message);
  }
}
function goBack() {
  (
    ({
      home: loadHome,
      search: () => loadSearch(state.search.page),
      discover: () => loadDiscover(state.discover.page),
      collection: renderCollection,
    })[state.previousView] || loadHome
  )();
}
async function showDetail(id) {
  state.previousView = state.currentView;
  showView("detail");
  $("#detail-view").innerHTML = empty("Caricamento dettaglio…");
  try {
    const m = await api(`/api/movies/${id}`);
    const rate = ratings()[m.id] || "";
    $("#detail-view").innerHTML =
      `<div class="detail">${poster(m)}<div><button class="back" id="back-button">← Torna indietro</button><p class="eyebrow">DETTAGLIO FILM</p><h1>${esc(m.title)}</h1><p class="original">Titolo originale: ${esc(m.originalTitle)}</p><p class="overview">${esc(m.overview || "Descrizione non disponibile.")}</p><div class="detail-actions"><button class="${has("favorites", m.id) ? "active" : ""}" data-detail-toggle="favorites">♥ Preferito</button><button class="${has("watchlist", m.id) ? "active" : ""}" data-detail-toggle="watchlist">＋ Watchlist</button><button class="${has("watched", m.id) ? "active" : ""}" data-detail-toggle="watched">${has("watched", m.id) ? "✓ Visto" : "Segna come visto"}</button></div><form class="rating-form" id="rating-form"><label for="personal-rating">Il tuo voto</label><input id="personal-rating" type="number" min="1" max="10" step="1" value="${rate}" placeholder="1–10"><button>Salva</button></form><div class="facts"><div><strong>Uscita</strong>${esc(m.releaseDate || "—")}</div><div><strong>Voto TMDB</strong>★ ${Number(m.rating).toFixed(1)} (${m.voteCount} voti)</div><div><strong>Generi</strong>${esc(m.genres.join(", ") || "—")}</div><div><strong>Lingua originale</strong>${esc(m.originalLanguage || "—")}</div><div><strong>Popolarità</strong>${Number(m.popularity).toFixed(1)}</div><div><strong>Durata</strong>${m.runtime ? `${m.runtime} min` : "—"}</div></div></div></div>`;
    const backButton = $("#back-button");


    $(".detail").insertBefore(backButton, $(".detail").firstChild);
    backButton.textContent = "← Indietro";
    backButton.onclick = goBack;
    document.querySelectorAll("[data-detail-toggle]").forEach((b) =>
    (b.onclick = () => {
      const active = toggle(b.dataset.detailToggle, m.id);


      if (b.dataset.detailToggle === "watched")
        b.textContent = active ? "✓ Visto" : "Segna come visto";
      b.classList.toggle("active", active);
      toast(
        active ? "Aggiunto alla collezione" : "Rimosso dalla collezione",
      );
    }),
    );

    $("#rating-form").onsubmit = (e) => {
      e.preventDefault();
      const value = Number($("#personal-rating").value);

      if (!Number.isInteger(value) || value < 1 || value > 10) {
        return toast("Inserisci un voto intero da 1 a 10");
      }

      const all = ratings();

      all[m.id] = value;
      localStorage.setItem(KEYS.ratings, JSON.stringify(all));
      toast("Valutazione personale salvata");
    };
  } catch (e) {
    $("#detail-view").innerHTML = empty(e.message);
  }
}
async function renderCollection() {
  showView("collection");
  const r = ratings(),
    values = Object.values(r);
  $("#stats").innerHTML = [
    ["Preferiti", list("favorites").length],

    ["Watchlist", list("watchlist").length],

    ["Film visti", list("watched").length],
    [
      "Media voti",
      values.length ? (values.reduce((a, b) => a + Number(b), 0) / values.length).toFixed(1)
        : "—",
    ],
  ]
    .map(([l, v]) => `<div class="stat"><b>${v}</b><span>${l}</span></div>`)
    .join("");

  document.querySelectorAll("[data-collection]").forEach((b) => {
    b.style.background =
      b.dataset.collection === state.collection ? "var(--red)" : "";

    b.style.color = b.dataset.collection === state.collection ? "#fff" : "";
    b.onclick = () => {
      state.collection = b.dataset.collection;
      renderCollection();
    };
  });


  const ids = list(state.collection);

  if (!ids.length) {
    return renderGrid("#collection-grid", [], "La sezione è ancora vuota.");
  }

  $("#collection-grid").innerHTML = empty("Caricamento collezione…");
  const results = await Promise.all(
    ids.map((id) => api(`/api/movies/${id}`).catch(() => null)),
  );
  renderGrid("#collection-grid", results.filter(Boolean));


}


$("#search-form").onsubmit = (e) => {
  e.preventDefault();
  state.search.query = $("#search-input").value.trim();
  if (state.search.query) loadSearch(1);
};

$("#filters").onsubmit = (e) => {
  e.preventDefault();
  loadDiscover(1);
};


$(".brand").onclick = (e) => {
  e.preventDefault();
  loadHome();
};
document.querySelectorAll("nav [data-view]").forEach(
  (b) =>
  (b.onclick = () =>
    ({
      home: loadHome,
      discover: () => loadDiscover(1),
      collection: renderCollection,
    })[b.dataset.view]()),
);


loadHome();
