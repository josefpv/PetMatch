import pkg from 'transbank-sdk';
const { WebpayPlus, Options, IntegrationApiKeys, IntegrationCommerceCodes, Environment } = pkg;

// Crear transacción
export const createTransaction = async (buyOrder, sessionId, amount, returnUrl) => {
  try {
    // Configurar el ambiente de integración (sandbox)
    const tx = new WebpayPlus.Transaction(
      new Options(
        IntegrationCommerceCodes.WEBPAY_PLUS, // código comercio de integración
        IntegrationApiKeys.WEBPAY,            // API Key de integración
        Environment.Integration               // ambiente integración
      )
    );

    // Crear transacción
    const response = await tx.create(buyOrder, sessionId, amount, returnUrl);
    console.log('Transacción creada correctamente:', response);
    return response;

  } catch (error) {
    console.error('Error creando transacción:', error);
    throw error;
  }
};