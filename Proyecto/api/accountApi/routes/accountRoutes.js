const express = require("express");
const accoutController = require("../controllers/accountController");

const router = express.Router();

router.post("/createAccount", accoutController.createUser);

module.exports = router;
