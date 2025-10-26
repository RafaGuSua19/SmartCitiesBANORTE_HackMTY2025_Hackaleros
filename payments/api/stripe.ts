// src/api/stripe.ts
import { useStripe } from '@stripe/stripe-react-native';

interface PaymentData {
  amount: number;
}

export const handlePayment = async (paymentData: PaymentData) => {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  try {
    // Hacer una llamada a tu backend para obtener el clientSecret
    const response = await fetch('http://localhost:4000/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: paymentData.amount, // Monto del pago
      }),
    });

    const { clientSecret } = await response.json(); // Obtener el clientSecret desde el backend

    
    const { error } = await initPaymentSheet({
      merchantDisplayName: 'Banorte',
      paymentIntentClientSecret: clientSecret, // Solo pasamos el clientSecret
    });

    if (error) {
      console.log(error);
      return;
    }

    // Mostrar el panel de pago
    const { error: paymentError } = await presentPaymentSheet();
    if (paymentError) {
      console.log(paymentError);
    } else {
      console.log("Pago exitoso");
    }
  } catch (error) {
    console.log(error);
  }
};
