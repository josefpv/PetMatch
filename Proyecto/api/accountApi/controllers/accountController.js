const { auth } = require("../common/firebase/authSettings");
const accountModel = require("../models/accountModel");

const createUser = async (req, res) => {
  try {
    if (!req.body) {
      return res
        .status(400)
        .send({ error: "No se ha recibido datos del usuario." });
    }
    const {
      nombres,
      apellidos,
      email,
      password,
      direccion,
      emoji,
      esPaseador,
    } = req.body;
    if (
      !nombres ||
      !apellidos ||
      !email ||
      !password ||
      !direccion ||
      !emoji ||
      !esPaseador
    ) {
      return res
        .status(400)
        .send({ error: "Faltan datos obligatorios del usuario." });
    }

    //verifico que usuario no se encuentre registrado en firestore
    const userSnapshot = await accountModel.getUserByEmail(email);
    if (!userSnapshot.empty) {
      return res
        .status(409)
        .send({ error: "Usuario ya se encuentra registrado." });
    }

    // Ejecuta createUser y espera la respuesta
    let user;
    try {
      const UserRecord = await auth.createUser({ email, password });
      user = UserRecord;
    } catch (error) {
      console.error("Error al crear el usuario:", error);
      return res.status(500).send({ error: "Error al crear el usuario." });
    }

    // Solo si createUser fue exitoso, ejecuta createAccountInFirestore
    try {
      const { success, error } = await accountModel.createAccountInFirestore(
        user.uid,
        nombres,
        apellidos,
        email,
        direccion,
        emoji,
        esPaseador
      );

      if (error) {
        return res
          .status(500)
          .send({ error: "Error al crear la cuenta en de usuario." });
      }

      return res.status(201).send({
        uid: user.uid,
        email: user.email,
      });
    } catch (error) {
      return res
        .status(500)
        .send({ error: "Error al crear la cuenta en Firestore." });
    }
  } catch (error) {}
};

const getUserInfoByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).send({ error: "Falta el ID de usuario." });
    }

    const userData = await accountModel.getUserInfoByUserId(userId);
    if (!userData) {
      return res.status(404).send({ error: "Usuario no encontrado." });
    }

    return res.status(200).send({ user: userData });
  } catch (error) {
    console.error("Error al obtener la información del usuario:", error);
    return res
      .status(500)
      .send({ error: "Error al obtener la información del usuario." });
  }
};

module.exports = {
  createUser,
  getUserInfoByUserId,
};
