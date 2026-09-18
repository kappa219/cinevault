const { request } = require("../utils/tmdb");

function movieSummary(movie) {
  return {
    id: movie.id,
    title: movie.title,
    overview: movie.overview || "",
    releaseDate: movie.release_date || null,
    rating: movie.vote_average ?? 0,
    popularity: movie.popularity ?? 0,
    poster: movie.poster_path || null,
  };
}
function pageResult(data) {
  return {
    page: data.page,
    totalPages: data.total_pages,
    totalResults: data.total_results,
    results: data.results.map(movieSummary),
  };
}
async function getPopularMovies(page = 1) {
  return pageResult(await request("/movie/popular", { page }));
}
async function searchMovies(query, page = 1) {
  return pageResult(
    await request("/search/movie", { query, page, include_adult: "false" }),
  );
}
async function getMovieDetails(id) {
  const movie = await request(`/movie/${id}`);
  return {
    ...movieSummary(movie),
    originalTitle: movie.original_title,
    voteCount: movie.vote_count,
    genres: movie.genres.map((g) => g.name),
    originalLanguage: movie.original_language,
    runtime: movie.runtime,
    backdrop: movie.backdrop_path || null,
    status: movie.status,
  };
}
async function discoverMovies(filters) {
  const params = {
    page: filters.page,
    sort_by: filters.sort,
    include_adult: "false",
    include_video: "false",
  };
  if (filters.year) params.primary_release_year = filters.year;
  if (filters.minRating !== undefined)
    params["vote_average.gte"] = filters.minRating;
  return pageResult(await request("/discover/movie", params));
}
module.exports = {
  getPopularMovies,
  searchMovies,
  getMovieDetails,
  discoverMovies,
};
