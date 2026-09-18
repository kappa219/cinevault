require("dotenv").config();

module.exports = {
  port: Number(process.env.PORT) || 3000,
  tmdbToken: process.env.TMDB_TOKEN || "",
  language: process.env.TMDB_LANGUAGE || "it-IT",
  tmdbBaseUrl: "https://api.themoviedb.org/3",
};
