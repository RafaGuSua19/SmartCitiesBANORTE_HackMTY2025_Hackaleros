import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Keyboard, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';

const PayReceiptScreen = () => {
  const [receiptNumber, setReceiptNumber] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvc, setCvc] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [receiptFound, setReceiptFound] = useState(false);

  // Datos simulados de recibos
  const mockData = {
    "123456": {
      name: "Juan Pérez",
      serviceType: "Luz",
      amount: 1200
    },
    "654321": {
      name: "Ana Gómez",
      serviceType: "Agua",
      amount: 500
    },
    "789012": {
      name: "Carlos Ruiz",
      serviceType: "Gas",
      amount: 800
    },
    // Agrega más recibos simulados si lo necesitas
  };

  // Función para obtener detalles del recibo (simulado)
  const getReceiptDetails = async () => {
    if (receiptNumber.length !== 6) return; // Verifica que el número de recibo tenga 6 dígitos

    setLoading(true);
    setError(null);
    setReceiptFound(false); // Reiniciar estado de encontrado antes de buscar

    try {
      // Simula la búsqueda del recibo en los datos mock
      const receipt = mockData[receiptNumber];

      if (!receipt) {
        throw new Error('Recibo no encontrado');
      }

      // Si el recibo es encontrado, establece los valores
      setName(receipt.name);
      setServiceType(receipt.serviceType);
      setAmount(receipt.amount);
      setReceiptFound(true); // Recibo encontrado

    } catch (error: any) {
      setError(error.message || 'Hubo un problema al obtener el recibo');
    } finally {
      setLoading(false);
    }
  };

  // Llamar a getReceiptDetails cuando el número de recibo cambia
  useEffect(() => {
    if (receiptNumber.length === 6) {
      getReceiptDetails();
    }
  }, [receiptNumber]);

  // Simulación de pago (sin validación real)
  const handleSubmit = () => {
    if (!cardNumber || !expiryDate || !cvc) {
      Alert.alert('Error', 'Por favor ingresa los datos de la tarjeta');
      return;
    }

    Alert.alert('Éxito', `Pago realizado con éxito\nRecibo: ${receiptNumber}`);
  };

  // Formatear número de tarjeta en bloques de 4 dígitos
  const formatCardNumber = (text: string) => {
    const formatted = text.replace(/\D/g, '').match(/.{1,4}/g)?.join(' ') || '';
    setCardNumber(formatted);
  };

  // Formatear fecha de vencimiento en MM/AA
  const formatExpiryDate = (text: string) => {
    const formatted = text.replace(/\D/g, '').slice(0, 4);
    setExpiryDate(formatted.length > 2 ? `${formatted.slice(0, 2)}/${formatted.slice(2)}` : formatted);
  };

  // Función para cerrar el teclado cuando el usuario hace clic fuera de los campos de texto
  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        {/* Logo de Banorte */}
        <Image source={require('../../assets/images/banorte-logo.png')} style={styles.logo} />

        {/* Fondo degradado */}
        <View style={styles.gradientBackground}>
          <Text style={styles.title}>Pago de Recibo</Text>

          {/* Número de recibo */}
          <TextInput
            style={styles.input}
            placeholder="Número de recibo"
            value={receiptNumber}
            onChangeText={setReceiptNumber}
            keyboardType="numeric"
            maxLength={6} // Limitar a 6 dígitos
          />

          {loading && <ActivityIndicator size="large" color="#fff" />}
          
          {/* Mostrar detalles del recibo si se encontró */}
          {receiptFound && (
            <View style={styles.details}>
              <Text style={styles.text}>Nombre: {name}</Text>
              <Text style={styles.text}>Tipo de Servicio: {serviceType}</Text>
              <Text style={styles.text}>Monto a Pagar: ${amount}</Text>
            </View>
          )}

          {/* Si no se encontró el recibo, mostrar mensaje de error */}
          {error && <Text style={styles.errorText}>{error}</Text>}

          {/* Datos de la tarjeta */}
          <TextInput
            style={styles.input}
            placeholder="Número de tarjeta (16 dígitos)"
            value={cardNumber}
            onChangeText={formatCardNumber}
            keyboardType="numeric"
            maxLength={19} // Permitir 16 dígitos con espacios
          />

          {/* Fecha de vencimiento */}
          <TextInput
            style={styles.input}
            placeholder="Fecha de vencimiento (MM/AA)"
            value={expiryDate}
            onChangeText={formatExpiryDate}
            keyboardType="numeric"
            maxLength={5} // Formato MM/AA
          />

          <TextInput
            style={styles.input}
            placeholder="CVC"
            value={cvc}
            onChangeText={setCvc}
            keyboardType="numeric"
            maxLength={3}
          />

          {/* Botón de pago */}
          {loading ? (
            <ActivityIndicator size="large" color="#fff" />
          ) : (
            <TouchableOpacity style={styles.button} onPress={handleSubmit}>
              <Text style={styles.buttonText}>Pagar Recibo</Text>
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  logo: {
    width: 250,
    height: 66,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  gradientBackground: {
    width: '100%',
    backgroundColor: 'linear-gradient(45deg, #D92D2B, #A71D1D)', // Fondo degradado rojo de Banorte
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  input: {
    width: '80%',
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderRadius: 5,
    borderColor: '#ddd',
    fontSize: 16,
    backgroundColor: '#fff',
  },
  details: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f7f7f7',
    borderRadius: 5,
    width: '80%',
  },
  text: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    marginBottom: 15,
  },
  button: {
    width: '80%',
    padding: 15,
    backgroundColor: '#D92D2B', // Rojo de Banorte
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default PayReceiptScreen;
