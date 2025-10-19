const express = require("express");
const accoutController = require("../controllers/accountController");

const router = express.Router();

router.post("/createAccount", accoutController.createUser);
router.get("/user/:userId", accoutController.getUserInfoByUserId);

module.exports = router;
