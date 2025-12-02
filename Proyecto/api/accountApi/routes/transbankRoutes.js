const express = require("express");
const transbankController = require("../controllers/transbankController");

const router = express.Router();

router.post("/create", transbankController.createTransaction);
router.post("/callback", transbankController.callbackTransaccion);
router.get("/callback", transbankController.callbackTransaccion);
router.get("/status/:servicioId", transbankController.getTransactionStatus);

module.exports = router;
