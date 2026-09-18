function badRequest(message) {
  const error = new Error(message);
  error.status = 400;
  return error;
}
function positiveInteger(value, label) {
  if (!/^\d+$/.test(String(value)) || Number(value) < 1)
    throw badRequest(`${label} deve essere un numero maggiore di zero`);
  return Number(value);
}
function validateSearch(req, res, next) {
  try {
    if (!req.query.query || !req.query.query.trim())
      throw badRequest("Query is required");
    req.query.page = req.query.page
      ? positiveInteger(req.query.page, "page")
      : 1;
    next();
  } catch (e) {
    next(e);
  }
}
function validateId(req, res, next) {
  try {
    req.params.id = positiveInteger(req.params.id, "id");
    next();
  } catch (e) {
    next(e);
  }
}
function validateDiscover(req, res, next) {
  try {
    const { year, minRating, page, sort } = req.query;
    if (year && (!/^\d{4}$/.test(year) || Number(year) < 1888))
      throw badRequest("year non valido");
    if (
      minRating !== undefined &&
      (Number.isNaN(Number(minRating)) ||
        Number(minRating) < 0 ||
        Number(minRating) > 10)
    )
      throw badRequest("minRating deve essere tra 0 e 10");
    const allowed = [
      "popularity.desc",
      "popularity.asc",
      "vote_average.desc",
      "vote_average.asc",
      "primary_release_date.desc",
      "primary_release_date.asc",
    ];
    if (sort && !allowed.includes(sort)) throw badRequest("sort non valido");
    req.filters = {
      year: year ? Number(year) : undefined,
      minRating: minRating !== undefined ? Number(minRating) : undefined,
      page: page ? positiveInteger(page, "page") : 1,
      sort: sort || "popularity.desc",
    };
    next();
  } catch (e) {
    next(e);
  }
}
module.exports = { validateSearch, validateId, validateDiscover };
