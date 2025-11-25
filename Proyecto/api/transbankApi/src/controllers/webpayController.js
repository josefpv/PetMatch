import { createTransaction } from '../services/webpayService.js';

export async function createPayment(req, res) {
  try {
    const { buyOrder, sessionId, amount, returnUrl } = req.body;
    // ✅ Usamos directamente la función importada
    const result = await createTransaction(buyOrder, sessionId, amount, returnUrl);
    res.json(result);
  } catch (error) {
    console.error('Error en createPayment:', error);
    res.status(500).json({ error: 'Error creando transacción' });
  }
}

export async function commitPayment(req, res) {
  try {
    const { token } = req.body;
    // Aún no tienes commitTransaction, así que por ahora puedes dejar un placeholder
    res.json({ message: `Commit recibido con token: ${token}` });
  } catch (error) {
    console.error('Error en commitPayment:', error);
    res.status(500).json({ error: 'Error confirmando transacción' });
  }
}

export async function refundPayment(req, res) {
  try {
    const { token, amount } = req.body;
    // Placeholder por ahora
    res.json({ message: `Refund recibido con token: ${token}, monto: ${amount}` });
  } catch (error) {
    console.error('Error en refundPayment:', error);
    res.status(500).json({ error: 'Error procesando reembolso' });
  }
}