const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(bodyParser.json());
app.use(cors());

const s3Routes = require("./routes/s3Route");
const accountRoutes = require("./routes/accountRoutes");
const mascotaRoutes = require("./routes/mascotaRoutes");
const servicioRoutes = require("./routes/servicioRoute");

app.use("/api/v1/account/s3", s3Routes);
app.use("/api/v1/account", accountRoutes);
app.use("/api/v1/mascotas", mascotaRoutes);
app.use("/api/v1/servicios", servicioRoutes);

// app.post(
//   "/base64",
//   upload.fields([{ name: "carnet" }, { name: "selfie" }]),
//   (req, res) => {
//     try {
//       const files = req.files;
//       if (!files || !files.carnet || !files.selfie) {
//         return res
//           .status(400)
//           .json({ error: "Ambas imagenes son requeridas." });
//       }

//       const carnetBase64 = files.carnet[0].buffer.toString("base64");
//       const selfieBase64 = files.selfie[0].buffer.toString("base64");

//       res.json({
//         carnetBase64,
//         selfieBase64,
//       });
//     } catch (err) {
//       res.status(500).json({ error: "Error processing images." });
//     }
//   }
// );

app.listen(PORT, () => {
  console.log(`API Account listening on port ${PORT}`);
});
