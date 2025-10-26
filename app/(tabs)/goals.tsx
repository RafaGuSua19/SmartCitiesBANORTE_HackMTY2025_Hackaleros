import { FontAwesome5 } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Path } from "react-native-svg";

export default function GoalPath() {
  const [progress, setProgress] = useState(1); // pasos desbloqueados

  const goals = [
    { id: 1, title: "Evalúa tu consumo", icon: "tint" }, // agua
    { id: 2, title: "Ahorra energía", icon: "bolt" }, // luz
    { id: 3, title: "Reduce gasolina", icon: "car" }, // gasolina
    { id: 4, title: "Fugas cero", icon: "shower" },
    { id: 5, title: "Meta de ahorro", icon: "piggy-bank" },
  ];

  const handlePress = (index: number) => {
    if (index === progress) {
      setProgress(progress + 1);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {goals.map((goal, index) => {
        const unlocked = index < progress;
        const isLeft = index % 2 === 0;

        // animación de escala al desbloquear
        const scale = new Animated.Value(unlocked ? 1 : 0.9);
        Animated.spring(scale, {
          toValue: unlocked ? 1.1 : 0.9,
          useNativeDriver: true,
        }).start();

        return (
          <View
            key={goal.id}
            style={[
              styles.stepContainer,
              { alignSelf: isLeft ? "flex-start" : "flex-end" },
            ]}
          >
            {/* línea curva que conecta con el siguiente círculo */}
            {index < goals.length - 1 && (
              <Svg
                height="90"
                width="150"
                style={{
                  position: "absolute",
                  top: 70,
                  left: isLeft ? 60 : -60,
                  transform: [{ scaleX: isLeft ? 1 : -1 }],
                }}
              >
                <Path
                  d="M0,0 Q75,90 150,0"
                  stroke="#A5D6A7"
                  strokeWidth="3"
                  fill="none"
                />
              </Svg>
            )}

            <Animated.View style={{ transform: [{ scale }] }}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => handlePress(index)}
                style={[
                  styles.circle,
                  {
                    backgroundColor: unlocked ? "#4CAF50" : "#C8E6C9",
                    shadowOpacity: unlocked ? 0.3 : 0.05,
                  },
                ]}
              >
                <FontAwesome5
                  name={goal.icon as any}
                  size={24}
                  color={unlocked ? "white" : "#388E3C"}
                />
              </TouchableOpacity>
            </Animated.View>

            <Text style={styles.title}>{goal.title}</Text>
          </View>
        );
      })}
      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 40,
    alignItems: "center",
  },
  stepContainer: {
    alignItems: "center",
    marginVertical: 40,
    width: "60%",
  },
  circle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    marginTop: 10,
    fontSize: 14,
    textAlign: "center",
    fontWeight: "600",
    color: "#2E7D32",
  },
});
