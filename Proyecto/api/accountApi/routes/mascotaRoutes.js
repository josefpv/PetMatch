const express = require("express");
const mascotaController = require("../controllers/mascotaController");

const router = express.Router();

router.get("/user/:userId", mascotaController.getMascotasByUserId);

module.exports = router;
