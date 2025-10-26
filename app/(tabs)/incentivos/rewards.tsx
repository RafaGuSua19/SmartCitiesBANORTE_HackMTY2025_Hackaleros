import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Simulación de datos
const random = {
  points: Math.floor(Math.random() * 1000),
  savedMoney: 3424,
};

const rewards = [
  { title: 'Fondo de Ahorro', description: 'Invierte tu dinero de manera segura con un 5% de rendimiento anual.' },
  { title: 'Reducción de Enganche en Créditos', description: 'Obtén un 10% de descuento en tu enganche para créditos personales.' },
  { title: 'Bonificación por Consumo', description: 'Recibe puntos adicionales por tus compras con la tarjeta Banorte.' },
  { title: 'Tarjeta de Regalo Banorte', description: 'Recibe tarjetas de regalo Banorte por tu ahorro acumulado.' },
];

export default function IncentivosScreen({ navigation }: any) {
  return (
    <ScrollView style={styles.container}>
      {/* Título */}
      <Text style={styles.title}>¡Bienvenido a tus incentivos Banorte!</Text>

      {/* Mensajes personalizados */}
      <Text style={styles.welcomeMessage}>Hola, bienvenido a tu sección de incentivos</Text>
      <Text style={styles.pointsMessage}>Tus puntos Banorte son: {random.points}</Text>
      <Text style={styles.savedMoney}>Gracias por tu colaboración para la comunidad Banorte</Text>
      <Text style={styles.savedMoney}>Tu dinero ahorrado hasta ahora es: ${random.savedMoney.toLocaleString()}</Text>

      {/* Recompensas */}
      <Text style={styles.rewardsTitle}>Estas son las posibles recompensas</Text>

      {/* Recompensas listadas */}
      {rewards.map((reward, index) => (
        <View key={index} style={styles.rewardCard}>
          <Text style={styles.rewardTitle}>{reward.title}</Text>
          <Text style={styles.rewardDescription}>{reward.description}</Text>
        </View>
      ))}

      {/* Botón para volver */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>Volver a Home</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    backgroundColor: '#F6F6F6', // Fondo similar a HomeScreen
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    color: '#EB0029',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
  },
  welcomeMessage: {
    fontSize: 18,
    color: '#323E48',
    textAlign: 'center',
    marginVertical: 10,
  },
  pointsMessage: {
    fontSize: 16,
    color: '#323E48',
    textAlign: 'center',
    marginVertical: 10,
  },
  savedMoney: {
    fontSize: 16,
    color: '#323E48',
    textAlign: 'center',
    marginVertical: 10,
  },
  rewardsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#323E48',
    textAlign: 'center',
    marginTop: 20,
  },
  rewardCard: {
    backgroundColor: '#fff',
    padding: 15,
    marginVertical: 10,
    borderRadius: 10,
    shadowColor: '#323E48',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  rewardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#323E48',
  },
  rewardDescription: {
    fontSize: 14,
    color: '#5B6670',
    marginTop: 8,
  },
  backButton: {
    backgroundColor: '#EB0029',
    paddingVertical: 12,
    borderRadius: 18,
    alignItems: 'center',
    marginTop: 30,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
