const router = require("express").Router();
const controller = require("../controllers/movieController");
const {
  validateSearch,
  validateId,
  validateDiscover,
} = require("../middleware/validation");
router.get("/popular", controller.popular);
router.get("/search", validateSearch, controller.search);
router.get("/discover", validateDiscover, controller.discover);
router.get("/:id", validateId, controller.details);
module.exports = router;
