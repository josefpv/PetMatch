const { app } = require("firebase-admin");
const servicioModel = require("../models/servicioModel");

const createServicio = async (req, res) => {
  try {
    const {
      user,
      mascota,
      fechaServicio,
      fechaCreacion,
      direccion,
      location,
      precio,
      estado,
    } = req.body;

    if (
      !user ||
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
      user,
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

const getServicios = async (req, res) => {
  try {
    const servicios = await servicioModel.getServicios();
    res.status(200).json(servicios);
  } catch (error) {
    console.error("Error al obtener los servicios:", error);
    res.status(500).json({ message: "Error al obtener los servicios" });
  }
};

const getServiciosMapa = async (req, res) => {
  try {
    const servicios = await servicioModel.getServiciosMapa();
    res.status(200).json(servicios);
  } catch (error) {
    console.error("Error al obtener los servicios para el mapa:", error);
    res
      .status(500)
      .json({ message: "Error al obtener los servicios para el mapa" });
  }
};

const getServiciosEstadoByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const servicios = await servicioModel.getServiciosEstadoByUser(userId);
    res.status(200).json(servicios);
  } catch (error) {
    console.error("Error al obtener los servicios por usuario:", error);
    res
      .status(500)
      .json({ message: "Error al obtener los servicios por usuario" });
  }
};

const getServiciosByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const servicios = await servicioModel.getServiciosByUser(userId);
    res.status(200).json(servicios);
  } catch (error) {
    console.error("Error al obtener los servicios por usuario:", error);
    res
      .status(500)
      .json({ message: "Error al obtener los servicios por usuario" });
  }
};

const getServiciosByPaseadorUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const servicios = await servicioModel.getServiciosByPaseadorUser(userId);
    res.status(200).json(servicios);
  } catch (error) {
    console.error("Error al obtener los servicios por paseador:", error);
    res
      .status(500)
      .json({ message: "Error al obtener los servicios por paseador" });
  }
};

const updateServicio = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const servicioActualizado = await servicioModel.updateServicio(id, updates);

    if (!servicioActualizado) {
      return res.status(404).json({ message: "Servicio no encontrado" });
    }

    res.status(200).json({
      message: "Servicio actualizado exitosamente",
      servicio: servicioActualizado,
    });
  } catch (error) {
    console.error("Error al actualizar el servicio:", error);
    res.status(500).json({ message: "Error al actualizar el servicio" });
  }
};

module.exports = {
  createServicio,
  getServicios,
  getServiciosMapa,
  updateServicio,
  getServiciosEstadoByUser,
  getServiciosByUser,
  getServiciosByPaseadorUser,
};
