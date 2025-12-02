const { auth } = require("../common/firebase/authSettings");
const transbankModel = require("../models/transbankModel");

const createTransaction = async (req, res) => {
  try {
    const { servicioId, userId, amount } = req.body;

    if (!servicioId || !userId || !amount) {
      return res.status(400).json({ error: "Faltan datos requeridos" });
    }
    const { url, token, error } = await transbankModel.createTransaccion(
      servicioId,
      userId,
      amount
    );
    if (error) {
      return res.status(400).json({ error });
    }
    console.log(url, token);
    res.status(200).json({ url, token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const callbackTransaccion = async (req, res) => {
  try {
    const token_ws =
      req.body.token_ws || req.query.token_ws || req.query.TBK_TOKEN;
    if (!token_ws) {
      return res.status(400).send("Token no proporcionado");
    }

    console.log("🔔 Callback recibido con token:", token_ws);

    if (await transbankModel.callbackTransbank(token_ws)) {
      return res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Pago Exitoso</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }
            .container {
              background: white;
              padding: 40px;
              border-radius: 20px;
              text-align: center;
              box-shadow: 0 10px 40px rgba(0,0,0,0.2);
              max-width: 400px;
            }
            .success-icon {
              font-size: 80px;
              margin-bottom: 20px;
            }
            h1 {
              color: #10b981;
              margin-bottom: 10px;
            }
            p {
              color: #666;
              margin-bottom: 30px;
            }
            .btn {
              background: #10b981;
              color: white;
              border: none;
              padding: 15px 30px;
              border-radius: 10px;
              font-size: 16px;
              font-weight: bold;
              cursor: pointer;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="success-icon">✅</div>
            <h1>¡Pago Exitoso!</h1>
            <p>Tu pago ha sido procesado correctamente.</p>
            <button class="btn" onclick="window.close()">Cerrar</button>
          </div>
          <script>
            // Auto-cerrar después de 5 segundos
            setTimeout(() => window.close(), 5000);
          </script>
        </body>
        </html>
      `);
    } else {
      return res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Pago Rechazado</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            }
            .container {
              background: white;
              padding: 40px;
              border-radius: 20px;
              text-align: center;
              box-shadow: 0 10px 40px rgba(0,0,0,0.2);
              max-width: 400px;
            }
            .error-icon {
              font-size: 80px;
              margin-bottom: 20px;
            }
            h1 {
              color: #ef4444;
              margin-bottom: 10px;
            }
            p {
              color: #666;
              margin-bottom: 30px;
            }
            .btn {
              background: #ef4444;
              color: white;
              border: none;
              padding: 15px 30px;
              border-radius: 10px;
              font-size: 16px;
              font-weight: bold;
              cursor: pointer;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="error-icon">❌</div>
            <h1>Pago Rechazado</h1>
            <p>Tu pago no pudo ser procesado.</p>
            <button class="btn" onclick="window.close()">Cerrar</button>
          </div>
          <script>
            setTimeout(() => window.close(), 5000);
          </script>
        </body>
        </html>
      `);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getTransactionStatus = async (req, res) => {
  try {
    const { servicioId } = req.params;
    if (!servicioId) {
      return res.status(400).json({ error: "Falta el ID del servicio" });
    }
    const { estado, transaccion, error } = await transbankModel.getStatus(
      servicioId
    );
    if (error) {
      return res.status(400).json({ error });
    }
    res.status(200).json({ estado, transaccion });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
module.exports = {
  createTransaction,
  getTransactionStatus,
  callbackTransaccion,
};
