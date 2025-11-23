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

const getServicios = async () => {
  try {
    const snapshot = await db.collection("servicios").get();
    const servicios = [];
    snapshot.forEach((doc) => {
      servicios.push({ id: doc.id, ...doc.data() });
    });
    return servicios;
  } catch (error) {
    console.error("Error al obtener los servicios:", error);
    throw error;
  }
};

const getServiciosMapa = async () => {
  try {
    // Primera consulta: estado == "creado"
    const snapshot1 = await db
      .collection("servicios")
      .where("estado", "==", "pendiente")
      .get();

    // Combinar resultados eliminando duplicados
    const serviciosMap = new Map();
    snapshot1.forEach((doc) => {
      serviciosMap.set(doc.id, { id: doc.id, ...doc.data() });
    });

    return Array.from(serviciosMap.values());
  } catch (error) {
    console.error("Error al obtener los servicios por usuario:", error);
    throw error;
  }
};

const getServiciosEstadoByUser = async (userId) => {
  try {
    // Primera consulta: estado == "creado"
    const snapshot1 = await db
      .collection("servicios")
      .where("estado", "==", "creado")
      .get();

    // Segunda consulta: paseador.uid == userId
    // const snapshot2 = await db
    //   .collection("servicios")
    //   .where("paseador.uid", "==", userId)
    //   .get();

    // Combinar resultados eliminando duplicados
    const serviciosMap = new Map();
    snapshot1.forEach((doc) => {
      serviciosMap.set(doc.id, { id: doc.id, ...doc.data() });
    });
    // snapshot2.forEach((doc) => {
    //   serviciosMap.set(doc.id, { id: doc.id, ...doc.data() });
    // });

    return Array.from(serviciosMap.values());
  } catch (error) {
    console.error("Error al obtener los servicios por usuario:", error);
    throw error;
  }
};

const getServiciosByUser = async (userId) => {
  try {
    const snapshot2 = await db
      .collection("servicios")
      .where("user.uid", "==", userId)
      .orderBy("fechaCreacion", "desc")
      .get();

    // Combinar resultados eliminando duplicados
    const serviciosMap = new Map();

    snapshot2.forEach((doc) => {
      serviciosMap.set(doc.id, { id: doc.id, ...doc.data() });
    });

    return Array.from(serviciosMap.values());
  } catch (error) {
    console.error("Error al obtener los servicios por usuario:", error);
    throw error;
  }
};

const getServiciosByPaseadorUser = async (userId) => {
  try {
    const snapshot2 = await db
      .collection("servicios")
      .where("paseador.uid", "==", userId)
      .orderBy("fechaCreacion", "desc")
      .get();

    // Combinar resultados eliminando duplicados
    const serviciosMap = new Map();

    snapshot2.forEach((doc) => {
      serviciosMap.set(doc.id, { id: doc.id, ...doc.data() });
    });

    return Array.from(serviciosMap.values());
  } catch (error) {
    console.error("Error al obtener los servicios por usuario:", error);
    throw error;
  }
};

const updateServicio = async (servicioId, updatedData) => {
  try {
    const servicioRef = db.collection("servicios").doc(servicioId);
    await servicioRef.update(updatedData);
    const updatedServicio = await servicioRef.get();
    return { id: updatedServicio.id, ...updatedServicio.data() };
  } catch (error) {
    console.error("Error al actualizar el servicio:", error);
    throw error;
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
