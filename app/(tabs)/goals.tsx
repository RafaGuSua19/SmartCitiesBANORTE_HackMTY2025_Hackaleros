import { Fontisto, Octicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Path } from "react-native-svg";

const { width } = Dimensions.get("window");
const CircleSize = 80;
const StepMargin = 30; // espacio vertical entre pasos

// información de cada logro
interface Goal {
  id: number;
  title: string;
  objetivo: string;
  condicion: string;
  recompensa: string;
}

interface GoalStepProps {
  goal: Goal;
  index: number;
  progress: number;
  handleLockedPress: (goal: Goal) => void;
  isLeft: boolean;
  isLast: boolean;
}

const GoalStep: React.FC<GoalStepProps> = ({
  goal,
  index,
  progress,
  handleLockedPress,
  isLeft,
  isLast,
}) => {
  const unlocked = index < progress;
  const isNextStep = index === progress;
  const scaleAnim = useRef(new Animated.Value(unlocked ? 1.1 : 1)).current;

  useEffect(() => {
    Animated.timing(scaleAnim, {
      toValue: unlocked ? 1.1 : isNextStep ? 1.05 : 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [unlocked, isNextStep, scaleAnim]);

  // Altura del trazo (para que no se corte)
  const svgHeight = StepMargin * 5.3 + CircleSize;
  const svgWidth = width;

  const strokeColor = unlocked ? "#eb0029" : "#f5decf";
  const pathLength = 350;
  const strokeDashoffset = unlocked ? 0 : pathLength;

  let pathData = "";

  if (!isLast) {
    const offsetX = 40;
    const startX = isLeft
      ? CircleSize / 2 + offsetX
      : width - CircleSize / 2 - offsetX;
    const endX = isLeft
      ? width - CircleSize / 2 - offsetX
      : CircleSize / 2 + offsetX;

    const startY = StepMargin + CircleSize / 2;
    const endY = svgHeight + StepMargin;

    const midY = (startY + endY) / 2;
    const controlPoint1X = startX;
    const controlPoint1Y = midY;
    const controlPoint2X = endX;
    const controlPoint2Y = midY;

    pathData = `M${startX},${startY} C${controlPoint1X},${controlPoint1Y} ${controlPoint2X},${controlPoint2Y} ${endX},${endY}`;
  }

  return (
    <View style={styles.stepWrapper}>
      {!isLast && (
        <Svg height={svgHeight} width={svgWidth} style={styles.pathSvg}>
          {/* Fondo claro */}
          <Path
            d={pathData}
            stroke="#f5decf"
            strokeWidth="40"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Línea principal */}
          <Path
            d={pathData}
            stroke={strokeColor}
            strokeWidth="24"
            fill="none"
            strokeDasharray={pathLength}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      )}

      <View
        style={[
          styles.stepContainer,
          { alignSelf: isLeft ? "flex-start" : "flex-end" },
        ]}
      >
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              if (!unlocked) handleLockedPress(goal);
            }}
            disabled={unlocked} // 🔒 Los desbloqueados no hacen nada al presionar
            style={[
              styles.circle,
              {
                backgroundColor: unlocked ? "#eb0029" : "#f5decf",
                shadowOpacity: unlocked ? 0.4 : 0.05,
                borderColor: isNextStep ? "#f5decf" : "transparent",
                borderWidth: isNextStep ? 3 : 0,
              },
            ]}
          >
            {unlocked ? (
              <Octicons name="trophy" size={30} color="#f5decf" />
            ) : (
              <Fontisto name="locked" size={28} color="#eb0029" />
            )}
          </TouchableOpacity>
        </Animated.View>
        <Text style={styles.title}>{goal.title}</Text>
      </View>
    </View>
  );
};

const Header: React.FC<{ current: number; total: number }> = ({
  current,
  total,
}) => (
  <View style={headerStyles.container}>
    <Text style={headerStyles.title}>Tu Ruta de Metas</Text>
    <View style={headerStyles.progressContainer}>
      <Text style={headerStyles.progressText}>
        Progreso:
        <Text style={headerStyles.currentProgress}> {current}</Text>/{total} pasos
      </Text>
    </View>
  </View>
);

export default function GoalPath() {
  const [progress] = useState(1);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

  const goals: Goal[] = [
    {
      id: 1,
      title: "Primer paso verde",
      objetivo: "Crear tu perfil y registrar tus primeros gastos.",
      condicion: "Al completar el registro inicial.",
      recompensa: "+50 puntos",
    },
    {
      id: 2,
      title: "Mi primera meta",
      objetivo: "Crear tu primera meta de ahorro mensual.",
      condicion: "Crear una meta mensual.",
      recompensa: "+100 puntos",
    },
    {
      id: 3,
      title: "Eco-ahorrador",
      objetivo: "Alcanzar la meta de ahorro establecida.",
      condicion: "Meta mensual cumplida.",
      recompensa: "+200 puntos",
    },
    {
      id: 4,
      title: "Consumo inteligente",
      objetivo: "Bajar 10% tu gasto de luz o agua frente al mes anterior.",
      condicion: "Recibo validado.",
      recompensa: "+350 puntos",
    },
    {
      id: 5,
      title: "Transporte consciente",
      objetivo:
        "Reducir gasto en gasolina o km en coche 10% frente al mes anterior.",
      condicion: "Recibo validado.",
      recompensa: "+450 puntos",
    },
    {
      id: 6,
      title: "Héroe sostenible",
      objetivo: "Reducir tus emisiones estimadas de CO₂ en un 15%.",
      condicion: "Basado en cálculo de CO₂ por km y consumo.",
      recompensa: "+600 puntos",
    },
    {
      id: 7,
      title: "Campeón verde",
      objetivo: "Cumplir con metas 6 meses seguidos.",
      condicion: "Racha de 6 meses en la app.",
      recompensa: "+800 puntos",
    },
    {
      id: 8,
      title: "Meta combinada sostenible",
      objetivo: "Cumplir ahorro + energía + agua el mismo mes.",
      condicion: "Cruce de datos.",
      recompensa: "+950 puntos",
    },
    {
      id: 9,
      title: "Luz responsable",
      objetivo: "Reducir consumo eléctrico durante diciembre.",
      condicion: "Recibo CFE.",
      recompensa: "+400 puntos",
    },
  ];

  const handleLockedPress = (goal: Goal) => {
    setSelectedGoal(goal);
    setModalVisible(true);
  };

  const totalGoals = goals.length;

  return (
    <View style={styles.fullScreenContainer}>
      <Header current={progress} total={totalGoals} />

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {goals.map((goal, index) => (
          <GoalStep
            key={goal.id}
            goal={goal}
            index={index}
            progress={progress}
            handleLockedPress={handleLockedPress}
            isLeft={index % 2 === 0}
            isLast={index === goals.length - 1}
          />
        ))}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Modal informativo */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{selectedGoal?.title}</Text>
            <Text style={styles.modalText}>
              <Text style={styles.modalLabel}>Objetivo: </Text>
              {selectedGoal?.objetivo}
            </Text>
            <Text style={styles.modalText}>
              <Text style={styles.modalLabel}>Condición: </Text>
              {selectedGoal?.condicion}
            </Text>
            <Text style={styles.modalText}>
              <Text style={styles.modalLabel}>Recompensa: </Text>
              {selectedGoal?.recompensa}
            </Text>
            <Pressable
              style={styles.modalButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Cerrar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const headerStyles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 50,
    backgroundColor: "#f5decf",
    borderBottomWidth: 2,
    borderBottomColor: "#eb0029",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#eb0029",
    marginBottom: 8,
  },
  progressContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#eb0029",
  },
  progressText: {
    fontSize: 16,
    color: "#f5decf",
    fontWeight: "600",
  },
  currentProgress: {
    fontWeight: "900",
    fontSize: 18,
  },
});

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    backgroundColor: "white",
  },
  container: {
    paddingVertical: 20,
    alignItems: "center",
  },
  stepWrapper: {
    width: "100%",
    minHeight: StepMargin * 2 + CircleSize,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  stepContainer: {
    alignItems: "center",
    width: 150,
    position: "absolute",
    zIndex: 10,
    top: StepMargin,
  },
  circle: {
    width: CircleSize,
    height: CircleSize,
    borderRadius: CircleSize / 2,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 8,
    borderStyle: "solid",
  },
  title: {
    marginTop: 10,
    fontSize: 14,
    textAlign: "center",
    fontWeight: "700",
    color: "black",
  },
  pathSvg: {
    position: "absolute",
    zIndex: 1,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    width: "85%",
    borderRadius: 15,
    padding: 20,
    borderWidth: 3,
    borderColor: "#eb0029",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#eb0029",
    textAlign: "center",
    marginBottom: 12,
  },
  modalText: { fontSize: 16, marginBottom: 6, color: "black" },
  modalLabel: { fontWeight: "700", color: "#eb0029" },
  modalButton: {
    marginTop: 20,
    backgroundColor: "#eb0029",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  modalButtonText: {
    color: "#f5decf",
    fontWeight: "700",
    fontSize: 16,
  },
});
