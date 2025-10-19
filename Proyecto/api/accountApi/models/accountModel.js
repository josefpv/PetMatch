const { db } = require("../common/firebase/authSettings");

const createAccountInFirestore = async (
  uid,
  nombres,
  apellidos,
  email,
  direccion,
  emoji,
  esPaseador
) => {
  try {
    await db.collection("users").doc(uid).set({
      uid,
      nombres,
      apellidos,
      email,
      direccion,
      emoji,
      esPaseador,
      activo: true,
      fechaCreacion: new Date(),
    });
    return { success: true };
  } catch (error) {
    console.error("Error al crear el usuario en Firestore:", error);
    return { success: false, error: "Error al crear el usuario en Firestore." };
  }
};

const getUserInfoByUserId = async (userId) => {
  try {
    const snapShot = await db.collection("users").doc(userId).get();
    if (!snapShot.exists) {
      return null;
    }
    return snapShot.data();
  } catch (error) {
    console.error("Error al obtener la información del usuario:", error);
    return null;
  }
};

const getUserByEmail = async (email) => {
  try {
    const snapShot = await db
      .collection("users")
      .where("email", "==", email)
      .get();

    return snapShot;
  } catch (error) {
    console.log("Error al intentar buscar al usuario por email en Firestore.");
    return null;
  }
};

module.exports = {
  createAccountInFirestore,
  getUserByEmail,
  getUserInfoByUserId,
};
