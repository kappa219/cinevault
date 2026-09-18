const { EventEmitter } = require("events");
const movieEvents = new EventEmitter();

movieEvents.on("movieSearched", ({ query }) =>
  console.info(`[event] Ricerca film: ${query}`),
);
movieEvents.on("movieViewed", ({ id }) =>
  console.info(`[event] Dettaglio film visualizzato: ${id}`),
);

module.exports = movieEvents;
