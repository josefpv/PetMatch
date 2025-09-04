const express = require("express");
const multer = require("multer");

const app = express();
const upload = multer();

app.post(
  "/base64",
  upload.fields([{ name: "carnet" }, { name: "selfie" }]),
  (req, res) => {
    try {
      const files = req.files;
      if (!files || !files.carnet || !files.selfie) {
        return res
          .status(400)
          .json({ error: "Ambas imagenes son requeridas." });
      }

      const carnetBase64 = files.carnet[0].buffer.toString("base64");
      const selfieBase64 = files.selfie[0].buffer.toString("base64");

      res.json({
        carnetBase64,
        selfieBase64,
      });
    } catch (err) {
      res.status(500).json({ error: "Error processing images." });
    }
  }
);

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
