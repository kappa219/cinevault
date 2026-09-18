# CineVault

Applicazione Node.js/Express per esplorare il catalogo TMDB e creare una collezione personale. I dati cinematografici sono richiesti dal backend a TMDB; preferiti, watchlist, film visti e valutazioni restano solo nel `localStorage` del browser.

## Installazione e avvio

```bash
cd cinevault
npm install
cp .env.example .env
```

Inserire nel file `.env` il proprio **TMDB API Read Access Token**, quindi:

```bash
npm start
```

Aprire [http://localhost:3000](http://localhost:3000). La CLI riusa lo stesso service TMDB:

```bash
npm run cli
# oppure: node cli.js
```

## Endpoint

| Metodo | Endpoint | Descrizione |
|---|---|---|
| GET | `/api/movies/popular` | Film popolari |
| GET | `/api/movies/search?query=batman&page=1` | Ricerca per titolo |
| GET | `/api/movies/:id` | Dettaglio da ID TMDB |
| GET | `/api/movies/discover?year=2025&minRating=7.5&page=1&sort=popularity.desc` | Catalogo filtrato |
| GET | `/api/system` | Informazioni del sistema Node.js |

Le risposte sono normalizzate e hanno la forma `{ success, data }`; gli errori `{ success: false, error }`.

## Struttura

- `src/utils/tmdb.js`: chiamate sicure a TMDB e header Authorization.
- `src/services`: logica e normalizzazione dei film.
- `src/controllers`, `src/routes`, `src/middleware`: API, validazione, logging ed error handler centralizzato.
- `src/events`: EventEmitter per `movieSearched` e `movieViewed`.
- `public`: interfaccia HTML/CSS/JavaScript vanilla; usa `fetch` verso l'API interna.
- `cli.js`: menu terminale con `readline`.

Il frontend è servito dallo stesso processo Express e dalla stessa origine dell'API, pertanto non occorre configurare CORS. Il token TMDB non viene mai inviato al browser ed `.env` è ignorato da Git.

## Verifica manuale prima della consegna

Dopo aver configurato un token TMDB valido, aprire `http://localhost:3000` e verificare:

- Home: i film popolari vengono caricati.
- Ricerca: un titolo esistente produce risultati, uno inesistente mostra una lista vuota e una richiesta senza `query` restituisce errore `400`.
- Dettaglio: aprire un film esistente e provare un ID inesistente, che deve restituire un errore gestito senza stack trace.
- Collezione: aggiungere e rimuovere un film da preferiti e watchlist, segnalarlo come visto e poi annullare la scelta.
- Valutazione: salvare un voto da 1 a 10, modificarlo e ricaricare la pagina; i dati devono restare presenti perché sono nel `localStorage`.
- Scopri: applicare filtri, abilitare “Nascondi già visti” e usare i pulsanti di paginazione.
- Errori esterni: con un token non valido o rete assente, l'interfaccia deve mostrare solo il messaggio d'errore restituito dall'API.
- Diagnostica: aprire `http://localhost:3000/api/system` e controllare `platform`, `architecture`, `cpus`, `totalMemory`, `freeMemory` e `nodeVersion`.
