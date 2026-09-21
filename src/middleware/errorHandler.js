const { ExternalApiError } = require("../utils/tmdb");
module.exports = (err, req, res, next) => {
  const status =
    err.status || (err instanceof ExternalApiError ? err.status : 500);

  if (status >= 500) console.error(err.message);
  res.status(status)
    .json({
      success: false,
      error: status === 500 ? "Errore interno dell server" : err.message,
    });
};
