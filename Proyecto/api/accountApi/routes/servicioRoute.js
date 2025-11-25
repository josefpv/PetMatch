const express = require("express");
const servicioController = require("../controllers/servicioController");

const router = express.Router();

router.post("/create", servicioController.createServicio);
router.get("/", servicioController.getServicios);
router.get("/mapa", servicioController.getServiciosMapa);
router.get("/user/:userId", servicioController.getServiciosEstadoByUser); //para paseador
router.get("/historico/:userId", servicioController.getServiciosByUser); //para cliente
router.get("/paseador/:userId", servicioController.getServiciosByPaseadorUser); //para paseador
router.put("/:id", servicioController.updateServicio);

module.exports = router;
