const { db } = require("../common/firebase/authSettings");

const getMascotasByUserId = async (userId) => {
  try {
    const snapshot = await db
      .collection("mascotas")
      .where("userId", "==", userId)
      .get();

    const mascotas = [];
    snapshot.forEach((doc) => {
      mascotas.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return mascotas;
  } catch (error) {
    console.error("Error al obtener las mascotas del usuario:", error);
    return [];
  }
};

module.exports = {
  getMascotasByUserId,
};
