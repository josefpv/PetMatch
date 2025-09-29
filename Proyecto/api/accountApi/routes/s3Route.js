const express = require("express");
//controllador
const s3Controller = require("../controllers/s3Controller");

const router = express.Router();

router.post("/getUrl", s3Controller.getPresignURL);
router.post("/validateFaces", s3Controller.getFacesMatch);

module.exports = router;
