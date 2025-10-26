import Slider from "@react-native-community/slider";
import { LinearGradient } from 'expo-linear-gradient';
import { doc, onSnapshot } from 'firebase/firestore';
import LottieView from 'lottie-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BarChart } from "react-native-chart-kit";
import MapView, { Marker } from 'react-native-maps';
import * as Progress from 'react-native-progress';
import { db } from '../../scripts/firebase'; // Ajusta la ruta

import happyLottie from '../../assets/lottie/happy.json';
import neutralLottie from '../../assets/lottie/neutral.json';
import sadLottie from '../../assets/lottie/sad.json';

const banorteRed = '#EB0029';
const banorteGray = '#323E48';
const banorteBg = '#F6F6F6';

const { width } = Dimensions.get("window");

const USER_DATA = {
  nombre: "",
  PromedioAcumuladoGasolina: 507.22,
  PromedioAcumuladoLuz: 305.02,
  PromedioAcumuladoAgua: 20.49,
  CO2porKm: 0.18,
  RendimientoKmL: 15.5,
  GastoRealGasolina: 500,
  GastoRealLuz: 200,
  GastoRealAgua: 300,
};

const PRECIO_LITRO_GASOLINA = 24;
const COSTO_KWH = 2.8;
const COSTO_M3_AGUA = 20;
const KGCO2_POR_LITRO = 2.31;

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
  const [ahorroGas, setAhorroGas] = useState(0);
  const [ahorroAgua, setAhorroAgua] = useState(0);
  const [ahorroLuz, setAhorroLuz] = useState(0);

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
    extraMsg = `Has reducido ${estadisticas.co2Reducido} kg de CO₂ este mes respecto al promedio en tu zona`;
  } else if (progresoAhorro >= metaAhorro * 0.9) {
    extraMsg = "¡Estás a punto de conseguir un incentivo Banorte!";
  } else if (gastos.luz > 1000) {
    extraMsg = "Has aumentado tu pago de luz este mes, ¡sigue esforzándote!";
  } else {
    extraMsg = "Recuerda optimizar tus gastos de agua, luz y gasolina 💡💧⛽";
  }

  const co2FromGas = (mxn: number, co2_km: number) =>
    (mxn / PRECIO_LITRO_GASOLINA) * KGCO2_POR_LITRO * (co2_km / 0.2);
  const kwhFromMxn = (mxn: number) => mxn / COSTO_KWH;
  const m3FromMxn = (mxn: number) => mxn / COSTO_M3_AGUA;

  const ahorroLuzCalc = Math.max(
    0,
    USER_DATA.PromedioAcumuladoLuz - 
      ((ahorroGas / USER_DATA.PromedioAcumuladoGasolina + ahorroAgua / USER_DATA.PromedioAcumuladoAgua) / 2) *
      USER_DATA.PromedioAcumuladoLuz
  );

  const co2 = co2FromGas(ahorroGas, USER_DATA.CO2porKm);
  const kwh = kwhFromMxn(ahorroLuzCalc);
  const aguaL = m3FromMxn(ahorroAgua) * 1000;

  const chartData = {
    labels: ["Gasolina", "Luz", "Agua"],
    datasets: [
      {
        data: [ahorroGas, ahorroLuzCalc, ahorroAgua],
      },
    ],
  };

  return (
    <LinearGradient colors={['#f6f6f6', '#ffe8ea', '#f6f6f6']} style={{flex: 1}}>
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, alignItems: 'center', justifyContent: 'flex-start' }}>
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
            <LottieView
              source={happyLottie}
              autoPlay
              loop
              style={styles.lottie}
            />

            <Text style={styles.scoreLabel}>Tu progreso de ahorro</Text>

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

          {/* Simulador */}
          <View style={styles.card}>
            <Text style={styles.title}>Simulador de Ahorro de Recursos</Text>
            <Text style={styles.subtitle}> Con este simulador puedes medir tu ahorro con datos reales {USER_DATA.nombre}</Text>

            <Text style={styles.label}>
              Gasolina (máx {USER_DATA.PromedioAcumuladoGasolina.toFixed(0)} MXN)
            </Text>
            <Slider
              minimumValue={0}
              maximumValue={USER_DATA.PromedioAcumuladoGasolina}
              value={ahorroGas}
              onValueChange={setAhorroGas}
              minimumTrackTintColor="#EB0029"
              maximumTrackTintColor="#CFD2D3"
              thumbTintColor="#EB0029"
              style={styles.slider} // Estilo para asegurar que la barra se vea correctamente
            />
            <Text style={styles.value}>{ahorroGas.toFixed(0)} MXN</Text>

            <Text style={styles.label}>
              Agua (máx {USER_DATA.PromedioAcumuladoAgua.toFixed(1)} m³)
            </Text>
            <Slider
              minimumValue={0}
              maximumValue={USER_DATA.PromedioAcumuladoAgua}
              value={ahorroAgua}
              onValueChange={setAhorroAgua}
              minimumTrackTintColor="#00BCD4"
              maximumTrackTintColor="#CFD2D3"
              thumbTintColor="#00BCD4"
              style={styles.slider} // Estilo para asegurar que la barra se vea correctamente
            />
            <Text style={styles.value}>{ahorroAgua.toFixed(1)} m³</Text>

            <Text style={styles.label}>
              Luz (máx {USER_DATA.PromedioAcumuladoLuz.toFixed(1)} kWh)
            </Text>
            <Slider
              minimumValue={0}
              maximumValue={USER_DATA.PromedioAcumuladoLuz}
              value={ahorroLuz}
              onValueChange={setAhorroLuz}
              minimumTrackTintColor="#f3db21ff"
              maximumTrackTintColor="#d2d3cfff"
              thumbTintColor="#f3de21ff"
              style={styles.slider} // Estilo para asegurar que la barra se vea correctamente
            />
            <Text style={styles.value}>{ahorroLuz.toFixed(1)} kWh</Text>

            <View style={{ marginVertical: 20 }}>
              <BarChart
                data={chartData}
                width={width - 40}
                height={220}
                yAxisLabel=""
                yAxisSuffix=""
                chartConfig={{
                  backgroundGradientFrom: "#fff",
                  backgroundGradientTo: "#fff",
                  decimalPlaces: 0,
                  color: () => "#EB0029",
                  labelColor: () => "#323E48",
                }}
                style={{
                  borderRadius: 10,
                  alignSelf: "center",
                }}
              />
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.info}>💨 CO₂ evitado: {co2.toFixed(2)} kg</Text>
              <Text style={styles.info}>⚡ Energía evitada: {kwh.toFixed(1)} kWh</Text>
              <Text style={styles.info}>💧 Agua evitada: {aguaL.toFixed(0)} L</Text>
            </View>
          </View>

          {/* Mapa de Google con la ubicación */}
          <View style={{ flex: 1, width: '100%', height: 400 }}>
            <MapView
              style={{ width: '100%', height: '100%' }}
              region={{
                latitude: 25.6768, // Coordenada de Monterrey
                longitude: -100.3105, // Coordenada de Monterrey
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              }}
            >
              {/* Colorear zonas aleatorias */}
              <Marker coordinate={{ latitude: 25.6740, longitude: -100.3120 }} pinColor="green" />
              <Marker coordinate={{ latitude: 25.6720, longitude: -100.3080 }} pinColor="yellow" />
              <Marker coordinate={{ latitude: 25.6700, longitude: -100.3050 }} pinColor="red" />
            </MapView>
          </View>

          {/* Mensaje con estadísticas de emisiones */}
          <View style={styles.messageBox}>
            <Text style={styles.message}>
              {extraMsg}
            </Text>
          </View>

          {/* Botón para incentivos */}
          <TouchableOpacity style={styles.incentivesBtn} activeOpacity={0.8}>
            <Text style={styles.incentivesText}>Ver incentivos</Text>
          </TouchableOpacity>
        </ScrollView>
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
    marginTop: 15,  // Aumentamos el margen superior para dar espacio
    paddingVertical: 12,
    paddingHorizontal: 28,
    backgroundColor: banorteRed,
    borderRadius: 18,
    alignSelf: 'center',
    shadowColor: banorteRed,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.12,
    shadowRadius: 7,
    elevation: 3,
  },
  incentivesText: {
    color: "#fff",
    fontWeight: '600',
    fontSize: 16,
    letterSpacing: 0.5
  },
  title: {
    fontSize: 22,
    color: "#EB0029",
    fontFamily: "Gotham-Medium",
    marginBottom: 10,
    textAlign: "center",
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 16,
    color: "#5B6670",
    textAlign: "center",
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    color: "#323E48",
    fontFamily: "Gotham-Medium",
    marginTop: 10,
  },
  value: {
    fontSize: 14,
    color: "#5B6670",
    marginBottom: 10,
  },
  slider: {
    width: '100%',
    height: 40,
    marginBottom: 10,
    justifyContent: 'center',
  },
  infoBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 15,
    elevation: 2,
  },
  info: {
    fontSize: 14,
    color: "#323E48",
    marginVertical: 2,
  },
  messageBox: {
    position: 'absolute',
    bottom: 100,  // Ajuste el valor para darle más espacio al mensaje y evitar que se superponga
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 25,
    borderRadius: 10,
    zIndex: 10,  // Para asegurar que el mensaje esté por encima de otros componentes
  },
  message: {
    fontSize: 14,
    color: '#323E48',
    textAlign: 'center',
  },
});
