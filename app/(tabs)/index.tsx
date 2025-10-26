import { LinearGradient } from 'expo-linear-gradient';
import { doc, onSnapshot } from 'firebase/firestore';
import LottieView from 'lottie-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Progress from 'react-native-progress';
import { db } from '../../scripts/firebase'; // Ajusta la ruta

// Importar las animaciones Lottie como módulos
import happyLottie from '../../assets/lottie/happy.json';
import neutralLottie from '../../assets/lottie/neutral.json';
import sadLottie from '../../assets/lottie/sad.json';

const banorteRed = '#EB0029';
const banorteGray = '#323E48';
const banorteBg = '#F6F6F6';

// Función para determinar qué animación mostrar según el avance
const getMoodLottie = (avance: number) => {
  if (avance >= 0.95) return { lottie: happyLottie, msg: "¡Estás por lograr tu meta de ahorro!" };
  if (avance >= 0.75) return { lottie: happyLottie, msg: "Vas muy bien, sigue así." };
  if (avance >= 0.5)  return { lottie: neutralLottie, msg: "Buen avance, puedes ahorrar un poco más." };
  if (avance >= 0.25) return { lottie: neutralLottie, msg: "Puedes mejorar, intenta optimizar tus gastos." };
  return { lottie: sadLottie, msg: "¡Ánimo! Revisa tus gastos para alcanzar tu meta." };
};

export default function HomeScreen() {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);

  const uid = "4abjjb7S0mcwHX3pV1K3HFwSFSA3"; // Pon aquí el UID real

  useEffect(() => {
    // Listener a Firestore para el usuario autenticado
    const unsubscribe = onSnapshot(doc(db, "users", uid), (docSnap) => {
      setUserData(docSnap.data());
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading || !userData) {
    return (
      <LinearGradient colors={['#f6f6f6', '#ffe8ea', '#f6f6f6']} style={{flex: 1}}>
        <SafeAreaView style={styles.container}>
          <ActivityIndicator color={banorteRed} size="large" />
        </SafeAreaView>
      </LinearGradient>
    );
  }

  const { name, presupuestoMensual, metaAhorro, gastos, progresoAhorro, estadisticas } = userData;
  const avance = Math.min(progresoAhorro / metaAhorro, 1.0);
  const { lottie, msg } = getMoodLottie(avance);

  let extraMsg = "";
  if (estadisticas && estadisticas.co2Reducido && estadisticas.co2Reducido > 0) {
    extraMsg = `Has reducido ${estadisticas.co2Reducido} kg de CO₂ este mes 🚗🌱`;
  } else if (progresoAhorro >= metaAhorro * 0.9) {
    extraMsg = "¡Estás a punto de conseguir un incentivo Banorte!";
  } else if (gastos.luz > 1000) {
    extraMsg = "Has aumentado tu pago de luz este mes, ¡sigue esforzándote!";
  } else {
    extraMsg = "Recuerda optimizar tus gastos de agua, luz y gasolina 💡💧⛽";
  }

  return (
    <LinearGradient colors={['#f6f6f6', '#ffe8ea', '#f6f6f6']} style={{flex: 1}}>
      <SafeAreaView style={styles.container}>
        {/* Logo Banorte centrado */}
        <View style={styles.logoContainer}>
          <Image source={require('../../assets/images/banorte-logo.png')} style={styles.logo} />
        </View>

        {/* Bienvenida */}
        <Text style={styles.welcome}>
          Bienvenido{ name ? `, ${name.split(' ')[0]}` : "" }
        </Text>
    
        {/* Tarjeta con carita animada y progreso */}
        <View style={styles.card}>
          {/* Animación Lottie */}
          <LottieView
            source={happyLottie} // Cargando la animación importada
            autoPlay
            loop
            style={styles.lottie}
          />

          <Text style={styles.scoreLabel}>Tu progreso de ahorro</Text>

          {/* Barra de progreso */}
          <Progress.Bar 
            progress={avance}
            width={230}
            height={14}
            borderRadius={12}
            color={banorteRed}
            unfilledColor="#FDEEEF"
            borderColor={banorteGray}
            style={{ marginVertical: 14 }}
            animated
          />

          <Text style={styles.statusMsg}>{msg}</Text>
          <Text style={styles.extraMsg}>{extraMsg}</Text>
        </View>

        {/* Resumen de gastos y meta */}
        <View style={styles.summary}>
          <Text style={styles.summaryText}>Presupuesto mensual: <Text style={{fontWeight:'bold'}}>${presupuestoMensual}</Text></Text>
          <Text style={styles.summaryText}>Meta de ahorro: <Text style={{fontWeight:'bold'}}>${metaAhorro}</Text></Text>
          <Text style={styles.summaryText}>Gastado en agua: <Text style={{color:'#0099D9'}}>${gastos.agua}</Text></Text>
          <Text style={styles.summaryText}>Gastado en luz: <Text style={{color:'#F9CA24'}}>${gastos.luz}</Text></Text>
          <Text style={styles.summaryText}>Gastado en gasolina: <Text style={{color:'#A93226'}}>${gastos.gasolina}</Text></Text>
          <Text style={styles.summaryText}>Ahorro este mes: <Text style={{color:banorteRed, fontWeight:'bold'}}>${progresoAhorro}</Text></Text>
        </View>

        {/* Botón para incentivos (opcional) */}
        <TouchableOpacity style={styles.incentivesBtn} activeOpacity={0.8}>
          <Text style={styles.incentivesText}>Ver incentivos</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 32,
  },
  logoContainer: {
    alignItems: 'center',
    width: '100%',
    marginTop: 12,
    marginBottom: 6,
  },
  logo: {
    width: 150,
    height: 36,
    resizeMode: 'contain',
    alignSelf: 'center'
  },
  welcome: {
    fontSize: 22,
    fontWeight: '700',
    color: banorteGray,
    marginVertical: 8,
    textAlign: 'center'
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 30,
    padding: 26,
    marginTop: 18,
    marginBottom: 22,
    alignItems: 'center',
    width: 340,
    shadowColor: '#EB0029',
    shadowOffset: {width:0, height:6},
    shadowOpacity: 0.09,
    shadowRadius: 18,
    elevation: 7,
  },
  lottie: {
    width: 85,
    height: 85,
    marginBottom: 5,
    backgroundColor: "transparent"
  },
  scoreLabel: {
    color: banorteGray,
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 3,
    letterSpacing: 0.1,
  },
  statusMsg: {
    color: banorteGray,
    fontSize: 15.5,
    marginTop: 4,
    textAlign: 'center',
    fontWeight: '500'
  },
  extraMsg: {
    color: '#5B6670',
    fontSize: 14.2,
    marginTop: 7,
    textAlign: 'center',
  },
  summary: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 18,
    marginTop: 8,
    width: 340,
    shadowColor: '#000',
    shadowOffset: {width:0, height:2},
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 18
  },
  summaryText: {
    color: banorteGray,
    fontSize: 15.3,
    marginBottom: 5,
    fontWeight: '400'
  },
  incentivesBtn: {
    marginTop: 8,
    paddingVertical: 12,
    paddingHorizontal: 28,
    backgroundColor: banorteRed,
    borderRadius: 18,
    alignSelf: 'center',
    shadowColor: banorteRed,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.12,
    shadowRadius: 7,
    elevation: 3
  },
  incentivesText: {
    color: "#fff",
    fontWeight: '600',
    fontSize: 16,
    letterSpacing: 0.5
  }
});
