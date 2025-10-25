import { doc, setDoc } from "firebase/firestore";
import { useState } from "react";
import { Alert, Button, Switch, Text, TextInput, View } from "react-native";
import { auth, db } from "../.././scripts/firebase";

export default function ProfileScreen() {
  const [energyScore, setEnergyScore] = useState("");
  const [waterScore, setWaterScore] = useState("");
  const [savingsScore, setSavingsScore] = useState("");
  const [shareStats, setShareStats] = useState(false);

  const saveSummary = async () => {
    try {
      const uid = auth.currentUser?.uid!;
      await setDoc(doc(db, "public_summaries", uid), {
        energyScore: parseFloat(energyScore) || 0,
        waterScore: parseFloat(waterScore) || 0,
        savingsScore: parseFloat(savingsScore) || 0,
        updatedAt: new Date(),
      });
      await setDoc(
        doc(db, "users", uid),
        { shareStats },
        { merge: true }
      );
      Alert.alert("¡Listo!", "Tu resumen de ahorro fue guardado");
    } catch (e) {
      Alert.alert("Error", "No se pudo guardar");
    }
  };

  return (
    <View style={{ flex: 1, padding: 18, gap: 12 }}>
      <Text style={{ fontSize: 20, fontWeight: "bold" }}>
        Registrar mi resumen de ahorro
      </Text>
      <TextInput
        placeholder="Score energía"
        keyboardType="numeric"
        value={energyScore}
        onChangeText={setEnergyScore}
        style={{ borderWidth: 1, padding: 8, borderRadius: 8 }}
      />
      <TextInput
        placeholder="Score agua"
        keyboardType="numeric"
        value={waterScore}
        onChangeText={setWaterScore}
        style={{ borderWidth: 1, padding: 8, borderRadius: 8 }}
      />
      <TextInput
        placeholder="Score ahorro $"
        keyboardType="numeric"
        value={savingsScore}
        onChangeText={setSavingsScore}
        style={{ borderWidth: 1, padding: 8, borderRadius: 8 }}
      />

      <View style={{ flexDirection: "row", alignItems: "center", marginVertical: 10 }}>
        <Switch
          value={shareStats}
          onValueChange={setShareStats}
          trackColor={{ false: "#ccc", true: "#EB0029" }}
        />
        <Text style={{ marginLeft: 8 }}>
          Quiero compartir mis avances con mis amigos
        </Text>
      </View>

      <Button title="Guardar" color="#EB0029" onPress={saveSummary} />
    </View>
  );
}
