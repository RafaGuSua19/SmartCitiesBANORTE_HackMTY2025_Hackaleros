import Slider from "@react-native-community/slider";
import React, { useState } from "react";
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { BarChart } from "react-native-chart-kit";

const { width } = Dimensions.get("window");

// Datos simulados para el usuario
const USER_DATA = {
  nombre: "Usuario 1",
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

export default function AhorroSimulador() {
  const [ahorroGas, setAhorroGas] = useState(0);
  const [ahorroAgua, setAhorroAgua] = useState(0);
  const [ahorroLuz, setAhorroLuz] = useState(0);

  // Funciones para calcular los impactos físicos
  const co2FromGas = (mxn: number, co2_km: number) =>
    (mxn / PRECIO_LITRO_GASOLINA) * KGCO2_POR_LITRO * (co2_km / 0.2);
  const kwhFromMxn = (mxn: number) => mxn / COSTO_KWH;
  const m3FromMxn = (mxn: number) => mxn / COSTO_M3_AGUA;

  // Calcular los ahorros y sus impactos
  const ahorroLuzCalc = Math.max(
    0,
    USER_DATA.PromedioAcumuladoLuz -
      ((ahorroGas / USER_DATA.PromedioAcumuladoGasolina +
        ahorroAgua / USER_DATA.PromedioAcumuladoAgua) /
        2) *
        USER_DATA.PromedioAcumuladoLuz
  );

  const co2 = co2FromGas(ahorroGas, USER_DATA.CO2porKm);
  const kwh = kwhFromMxn(ahorroLuzCalc);
  const aguaL = m3FromMxn(ahorroAgua) * 1000;

  // Actualizamos el gráfico con los valores de ahorro
  const chartData = {
    labels: ["Gasolina", "Luz", "Agua"],
    datasets: [
      {
        data: [ahorroGas, ahorroLuzCalc, ahorroAgua], // Asegúrate de que esto sea un arreglo de números
      },
    ],
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Simulador de Ahorro Sustentable</Text>
      <Text style={styles.subtitle}>👤 {USER_DATA.nombre}</Text>

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
        <Text style={styles.info}>
          💨 CO₂ evitado: {co2.toFixed(2)} kg
        </Text>
        <Text style={styles.info}>
          ⚡ Energía evitada: {kwh.toFixed(1)} kWh
        </Text>
        <Text style={styles.info}>
          💧 Agua evitada: {aguaL.toFixed(0)} L
        </Text>
      </View>

      <Text style={styles.footer}>
        Los cálculos se actualizan en tiempo real conforme ajustas los sliders.
      </Text>

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Ver incentivos</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F6F6",
    padding: 20,
  },
  title: {
    fontSize: 22,
    color: "#EB0029",
    fontFamily: "Gotham-Medium",
    marginBottom: 10,
    textAlign: "center",
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
  footer: {
    fontSize: 12,
    color: "#A2A9AD",
    textAlign: "center",
    marginTop: 20,
  },
  button: {
    backgroundColor: "#EB0029",
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
  },
});
