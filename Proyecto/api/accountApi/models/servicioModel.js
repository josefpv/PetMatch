const { db } = require("../common/firebase/authSettings");

const createServicio = async (servicioData) => {
  try {
    const servicioRef = await db.collection("servicios").add(servicioData);
    return { id: servicioRef.id, ...servicioData };
  } catch (error) {
    console.error("Error al crear el servicio:", error);
    throw error;
  }
};

module.exports = {
  createServicio,
};
