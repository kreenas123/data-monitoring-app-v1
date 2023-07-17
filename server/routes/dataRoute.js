const express = require("express");
const router = express.Router();
const { getData } = require("../controllers/dataController");

// GET route to retrieve CSV data
router.get("/data", getData);

router.get("/", (req, res) => {
  res.json("Yay!");
});

module.exports = router;
