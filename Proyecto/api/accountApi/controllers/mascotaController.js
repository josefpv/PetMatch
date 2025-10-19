const { auth } = require("../common/firebase/authSettings");
const mascotaModel = require("../models/mascotaModel");

const getMascotasByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res
        .status(400)
        .send({ error: "No se ha proporcionado el ID del usuario." });
    }

    const mascotas = await mascotaModel.getMascotasByUserId(userId);
    return res.status(200).send({ mascotas });
  } catch (error) {
    console.error("Error al obtener las mascotas del usuario:", error);
    return res
      .status(500)
      .send({ error: "Error al obtener las mascotas del usuario." });
  }
};

module.exports = {
  getMascotasByUserId,
};
