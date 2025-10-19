const express = require("express");
const servicioController = require("../controllers/servicioController");

const router = express.Router();

router.post("/create", servicioController.createServicio);

module.exports = router;
