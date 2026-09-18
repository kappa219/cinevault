const movies = require("../services/movieService");
const events = require("../events/movieEvents");

const respond = (res, data) => res.json({ success: true, data });
async function popular(req, res, next) {
  try {
    respond(res, await movies.getPopularMovies(Number(req.query.page) || 1));
  } catch (e) {
    next(e);
  }
}


async function search(req, res, next) {
  try {
    events.emit("movieSearched", { query: req.query.query });
    respond(
      res,
      await movies.searchMovies(req.query.query.trim(), req.query.page),
    );
  } catch (e) {
    next(e);
  }
}


async function details(req, res, next) {
  try {
    events.emit("movieViewed", { id: req.params.id });
    respond(res, await movies.getMovieDetails(req.params.id));
  } catch (e) {
    next(e);
  }
}
async function discover(req, res, next) {
  try {
    respond(res, await movies.discoverMovies(req.filters));
  } catch (e) {
    next(e);
  }
}




module.exports = { popular, search, details, discover };
