const { db } = require("../common/firebase/authSettings");

const TBK_API_KEY_ID = "597055555532";
const TBK_API_KEY_SECRET =
  "579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C";
const TBK_URL_BASE = "https://webpay3gint.transbank.cl";

const createTransaccion = async (servicioId, userId, amount) => {
  try {
    // Generar IDs únicos
    const randomSuffix = Math.floor(Math.random() * 9000) + 1000;
    const buyOrder = `O-${servicioId.slice(0, 15)}-${randomSuffix}`;
    const sessionId = `S-${userId.slice(0, 40)}`;

    // URL de retorno a tu servidor
    const returnUrl =
      "https://5f78f12d7d3e.ngrok-free.app/api/v1/transbank/callback";

    console.log("📤 Creando transacción:", { buyOrder, sessionId, amount });

    // Crear transacción en Transbank
    const response = await fetch(
      `${TBK_URL_BASE}/rswebpaytransaction/api/webpay/v1.2/transactions`,
      {
        method: "POST",
        headers: {
          "Tbk-Api-Key-Id": TBK_API_KEY_ID,
          "Tbk-Api-Key-Secret": TBK_API_KEY_SECRET,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          buy_order: buyOrder,
          session_id: sessionId,
          amount: parseInt(amount),
          return_url: returnUrl,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ Error Transbank:", data);
      return res.status(400).json({
        error: "Error al crear transacción",
        details: data,
      });
    }

    // Guardar transacción pendiente en Firebase
    await db.collection("transacciones").doc(data.token).set({
      servicioId,
      userId,
      buyOrder,
      token: data.token,
      amount,
      estado: "pendiente",
      createdAt: Date.now(),
    });

    console.log("✅ Transacción creada:", data.token);

    return {
      url: data.url,
      token: data.token,
      error: null,
    };
  } catch (error) {
    console.error("🔥 Error:", error);
    return { error: "Error interno del servidor" };
  }
};

// Endpoint callback que recibe la respuesta de Transbank
const callbackTransbank = async (token_ws) => {
  try {
    console.log("🔔 Callback recibido con token:", token_ws);

    // Confirmar transacción con Transbank
    const commitResponse = await fetch(
      `${TBK_URL_BASE}/rswebpaytransaction/api/webpay/v1.2/transactions/${token_ws}`,
      {
        method: "PUT",
        headers: {
          "Tbk-Api-Key-Id": TBK_API_KEY_ID,
          "Tbk-Api-Key-Secret": TBK_API_KEY_SECRET,
          "Content-Type": "application/json",
        },
      }
    );

    const commitData = await commitResponse.json();
    console.log("📦 Respuesta commit:", commitData);

    // Obtener datos de la transacción guardada
    const transaccionDoc = await db
      .collection("transacciones")
      .doc(token_ws)
      .get();

    if (!transaccionDoc.exists) {
      console.error("❌ Transacción no encontrada");
      return res.status(404).send("Transacción no encontrada");
    }

    const transaccion = transaccionDoc.data();
    // Actualizar estado según resultado
    if (!Object.keys(commitData).includes("error_message")) {
      // PAGO EXITOSO
      console.log("✅ Pago exitoso");
      // Actualizar transacción
      await db.collection("transacciones").doc(token_ws).update({
        estado: "aprobado",
        authorizationCode: commitData.authorization_code,
        responseCode: commitData.response_code,
        paymentTypeCode: commitData.payment_type_code,
        completedAt: Date.now(),
      });

      // Actualizar servicio en Firebase
      await db
        .collection("servicios")
        .doc(transaccion.servicioId)
        .update({
          estado: "pagado",
          transaccion: {
            token: token_ws,
            buyOrder: commitData.buy_order,
            authorizationCode: commitData.authorization_code,
            amount: commitData.amount,
            fecha: new Date().toISOString(),
          },
        });

      // Redirigir a página de éxito
      console.log("✅ Pago exitoso");
      return true;
    } else {
      // PAGO RECHAZADO
      console.log("❌ Pago rechazado");

      await db.collection("transacciones").doc(token_ws).update({
        estado: "rechazado",
        responseCode: 401,
        completedAt: Date.now(),
      });

      return false;
    }
  } catch (error) {
    console.error("🔥 Error en callback:", error);
    return false;
  }
};

// Endpoint para verificar estado de pago
const getStatus = async (servicioId) => {
  try {
    // Buscar el servicio en Firebase
    const servicioDoc = await db.collection("servicios").doc(servicioId).get();

    if (!servicioDoc.exists) {
      return res.status(404).json({ error: "Servicio no encontrado" });
    }

    const servicio = servicioDoc.data();

    return {
      estado: servicio.estado,
      transaccion: servicio.transaccion || null,
    };
  } catch (error) {
    console.error("Error verificando estado:", error);
    return { error: "Error interno del servidor" };
  }
};

module.exports = {
  createTransaccion,
  callbackTransbank,
  getStatus,
};
