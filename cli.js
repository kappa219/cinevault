require("./src/config/config");
const readline = require("readline");
const movies = require("./src/services/movieService");
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
const ask = (text) => new Promise((resolve) => rl.question(text, resolve));
const printMovies = (data) =>
  console.table(
    data.results.map((m) => ({
      id: m.id,
      titolo: m.title,
      uscita: m.releaseDate,
      voto: m.rating,
    })),
  );
async function menu() {
  console.log(
    "\nCineVault CLI\n1. Popolari\n2. Cerca\n3. Dettaglio\n4. Scopri con filtri\n5. Sistema\n0. Esci",
  );
  const choice = await ask("Scelta: ");
  try {
    if (choice === "1") printMovies(await movies.getPopularMovies());
    else if (choice === "2")
      printMovies(await movies.searchMovies(await ask("Titolo: ")));
    else if (choice === "3")
      console.dir(await movies.getMovieDetails(await ask("ID TMDB: ")), {
        depth: null,
      });
    else if (choice === "4") {
      const year = await ask("Anno (vuoto per ignorare): ");
      const minRating = await ask("Voto minimo (vuoto per ignorare): ");
      printMovies(
        await movies.discoverMovies({
          year: year || undefined,
          minRating: minRating || undefined,
          page: 1,
          sort: "popularity.desc",
        }),
      );
    } else if (choice === "5")
      console.table({
        piattaforma: process.platform,
        architettura: process.arch,
        node: process.version,
        cpu: require("os").cpus().length,
      });
    else if (choice === "0") {
      rl.close();
      return;
    } else console.log("Scelta non valida.");
  } catch (error) {
    console.error(`Errore: ${error.message}`);
  }
  menu();
}
menu();
