import { Fontisto, Octicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
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

interface GoalStepProps {
  goal: { id: number; title: string; icon: string };
  index: number;
  progress: number;
  handlePress: (index: number) => void;
  isLeft: boolean;
  isLast: boolean;
}

const GoalStep: React.FC<GoalStepProps> = ({
  goal,
  index,
  progress,
  handlePress,
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

  const strokeColor = unlocked ? "#ec0201" : "#f5decf";
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
            onPress={() => handlePress(index)}
            disabled={!isNextStep}
            style={[
              styles.circle,
              {
                backgroundColor: unlocked ? "#ec0201" : "#f5decf",
                shadowOpacity: unlocked ? 0.4 : 0.05,
                borderColor: isNextStep ? "#f5decf" : "transparent",
                borderWidth: isNextStep ? 3 : 0,
              },
            ]}
          >
            {unlocked ? (
              <Octicons name="trophy" size={30} color="#f5decf" />
            ) : (
              <Fontisto name="locked" size={28} color="#ec0201" />
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
  const [progress, setProgress] = useState(0);

  const goals = [
    { id: 1, title: "Evalúa tu consumo", icon: "tint" },
    { id: 2, title: "Ahorra energía", icon: "bolt" },
    { id: 3, title: "Reduce gasolina", icon: "car" },
    { id: 4, title: "Fugas cero", icon: "shower" },
    { id: 5, title: "Meta de ahorro", icon: "piggy-bank" },
  ];

  const currentProgress = progress > goals.length ? goals.length : progress ;
  const totalGoals = goals.length;

  const handlePress = (index: number) => {
    if (index === progress && progress <= totalGoals) {
      setProgress(progress + 1);
    }
  };

  return (
    <View style={styles.fullScreenContainer}>
      <Header current={currentProgress} total={totalGoals} />

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
            handlePress={handlePress}
            isLeft={index % 2 === 0}
            isLast={index === goals.length -1}
          />
        ))}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const headerStyles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f5decf",
    borderBottomWidth: 2,
    borderBottomColor: "#ec0201",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#ec0201",
    marginBottom: 8,
  },
  progressContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#ec0201",
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
});
