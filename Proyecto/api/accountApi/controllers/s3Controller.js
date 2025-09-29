const axios = require("axios");
const { createPresignUrl } = require("../common/aws/s3/generatePresignURL");
require("dotenv").config();
const multer = require("multer");

const upload = multer();

const getPresignURL = async (req, res) => {
  try {
    const { fileName } = req.body;

    if (!fileName) {
      return res.status(400).json({ error: "Nombre el archivo es requerido." });
    }

    const apiGatewayUrl = process.env.AWS_S3_PRESIGNURL_APIGETWAY;
    axios
      .post(apiGatewayUrl, {
        key: fileName,
      })
      .then((response) => {
        res.json({ url: response.data?.url });
      })
      .catch((error) => {
        console.error(
          "Error al intentar solicitar la URL al API Gateway:",
          error
        );
        res.status(500).json({
          error: "Error al intentar solicitar la URL al API Gateway.",
        });
      });
  } catch (error) {
    console.error("Error al intentar solicitar la URL al API Gateway:", error);
    res
      .status(500)
      .json({ error: "Error al intentar solicitar la URL al API Gateway" });
  }
};

const getFacesMatch = async (req, res) => {
  try {
    const { cedulaS3URL, selfieS3URL } = req.body;
    if (!cedulaS3URL || !selfieS3URL) {
      return res.status(400).send({
        error:
          "No se ha recibido cedulaS3URL, selfieS3URL  para la verificacion.",
      });
    }

    const faceRecoknitionApiUrl = process.env.AWS_FACEREKOGNITION_APIGATEWAY;

    axios
      .post(faceRecoknitionApiUrl, {
        carnetS3Url: cedulaS3URL,
        selfieS3Url: selfieS3URL,
      })
      .then((response) => {
        console.log("response rekognition:", response.data);
        res.status(200).send({
          similarity: response.data?.similarity,
          match: response.data?.match,
        });
      })
      .catch((error) => {
        console.error(
          "Error al intentar solicitar la verificacion de rostro al API Gateway:",
          error
        );
        res.status(500).json({
          error:
            "Error al intentar solicitar la verificacion de rostro al API Gateway.",
        });
      });
  } catch (error) {
    console.error(
      "Error al intentar solicitar la verificacion de rostro al API Gateway:",
      error
    );
    res.status(500).json({
      error:
        "Error al intentar solicitar la verificacion de rostro al API Gateway",
    });
  }
};

module.exports = {
  getPresignURL,
  getFacesMatch,
};
