// backend/server.js
const express = require('express');
const stripe = require('stripe')('sk_test_51RYeoOF2hr3cz9z0rix70CqZF9t4KwWsdiodkWUYfdKgNiueCfmxJ43vaKAPsmkUxp8VPGzRbEz64AKHIv38pyml001rHZnJid'); 
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.json()); // Para manejar los datos JSON

// Ruta para crear un PaymentIntent
app.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount } = req.body;  // El monto enviado desde el frontend

    // Crea un PaymentIntent con el monto y la moneda
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount, // Monto en centavos, por ejemplo: 50000 = 500.00 MXN
      currency: 'mxn',
    });

    // Enviar el clientSecret al frontend
    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al crear PaymentIntent');
  }
});

// Iniciar el servidor en el puerto 4000
app.listen(4000, () => {
  console.log('Servidor backend corriendo en http://localhost:4000');
});
