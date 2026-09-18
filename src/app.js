const path = require("path");
const os = require("os");
const express = require("express");
const config = require("./config/config");
const logger = require("./middleware/logger");
const errorHandler = require("./middleware/errorHandler");
const movieRoutes = require("./routes/movieRoutes");

const app = express();
app.use(logger);
app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public")));
app.use("/api/movies", movieRoutes);
app.get("/api/system", (req, res) =>
  res.json({
    success: true,
    data: {
      platform: os.platform(),
      architecture: os.arch(),
      cpus: os.cpus().length,
      totalMemory: os.totalmem(),
      freeMemory: os.freemem(),
      nodeVersion: process.version,
    },
  }),
);
app.use("/api", (req, res) =>
  res.status(404).json({ success: false, error: "Endpoint non trovato" }),
);
app.use(errorHandler);
if (require.main === module)
  app.listen(config.port, () =>
    console.info(`CineVault disponibile su http://localhost:${config.port}`),
  );
module.exports = app;
