const servicioModel = require("../models/servicioModel");

const createServicio = async (req, res) => {
  try {
    const {
      userId,
      mascota,
      fechaServicio,
      fechaCreacion,
      direccion,
      location,
      precio,
      estado,
    } = req.body;

    if (
      !userId ||
      !mascota ||
      !fechaServicio ||
      !fechaCreacion ||
      !direccion ||
      !location ||
      !precio ||
      !estado
    ) {
      return res.status(400).json({ message: "Faltan datos obligatorios" });
    }

    const newServicio = {
      userId,
      mascota,
      fechaServicio,
      fechaCreacion,
      direccion,
      location,
      precio,
      estado,
    };

    const servicioCreado = await servicioModel.createServicio(newServicio);

    res.status(201).json({
      message: "Servicio creado exitosamente",
      servicio: servicioCreado,
    });
  } catch (error) {
    console.error("Error al crear el servicio:", error);
    res.status(500).json({ message: "Error al crear el servicio" });
  }
};

module.exports = {
  createServicio,
};
