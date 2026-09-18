const { tmdbBaseUrl, tmdbToken, language } = require("../config/config");

class ExternalApiError extends Error {
  constructor(message, status = 502) {
    super(message);
    this.status = status;
    this.name = "ExternalApiError";
  }
}

async function request(path, params = {}) {
  if (!tmdbToken) throw new ExternalApiError("TMDB_ token non è presente ", 503);
  const url = new URL(`${tmdbBaseUrl}${path}`);

  url.search = new URLSearchParams({ language, ...params }).toString();
  let response;


  try {
    response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${tmdbToken}`,
        accept: "application/json",
      },
    });
  }
   catch {
    throw new ExternalApiError("Impossibile contattare TMDB");
  }


  if (response.status === 404){
    throw new ExternalApiError("Film non trovato", 404);
  }
  if (!response.ok)
    throw new ExternalApiError("TMDB errore", 502);
  return response.json();
}

module.exports = { request, ExternalApiError };
