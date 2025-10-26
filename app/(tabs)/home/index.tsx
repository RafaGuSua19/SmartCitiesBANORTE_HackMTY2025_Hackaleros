import { Picker } from "@react-native-picker/picker";
import { useState } from "react";
import { Alert, Button, Text, TextInput, View } from "react-native";
import { addExpense, updateMySummary, updateProfileIncomeGoal } from "../../../scripts/finance";

export default function HomeScreen() {
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [savingGoal, setSavingGoal] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("agua");
  const [note, setNote] = useState("");

  return (
    <View style={{ flex: 1, gap: 14, padding: 20 }}>
      <Text style={{ fontSize: 20, fontWeight: "bold" }}>Mi presupuesto mensual</Text>
      <TextInput placeholder="Ingresos $" value={monthlyIncome} onChangeText={setMonthlyIncome} keyboardType="numeric"
        style={{ borderWidth: 1, borderRadius: 8, padding: 8 }} />
      <TextInput placeholder="Meta de ahorro $" value={savingGoal} onChangeText={setSavingGoal} keyboardType="numeric"
        style={{ borderWidth: 1, borderRadius: 8, padding: 8 }} />
      <Button title="Guardar presupuesto/meta" color="#EB0029"
        onPress={async () => {
          try {
            await updateProfileIncomeGoal({
              monthlyIncome: parseFloat(monthlyIncome),
              savingGoal: parseFloat(savingGoal)
            });
            Alert.alert("Listo", "Presupuesto guardado.");
          } catch (e) { Alert.alert("Error", "No se pudo guardar"); }
        }} />

      <Text style={{ fontSize: 20, fontWeight: "bold", marginTop: 24 }}>Registrar egreso</Text>
      <TextInput placeholder="Monto $" value={amount} onChangeText={setAmount} keyboardType="numeric"
        style={{ borderWidth: 1, borderRadius: 8, padding: 8 }} />
       <Text style={{ marginTop: 18, marginBottom: 6 }}>Tipo de gasto:</Text>
      <View style={{ borderWidth: 1, borderRadius: 8, overflow: "hidden", marginBottom: 12 }}>
        <Picker
          selectedValue={type}
          onValueChange={setType}
          style={{ height: 70, width: "100%" }}
        >
          <Picker.Item label="Agua" value="agua" />
          <Picker.Item label="Luz" value="luz" />
          <Picker.Item label="Gasolina" value="gasolina" />
        </Picker>
      </View>
      <TextInput placeholder="Nota (opcional)" value={note} onChangeText={setNote}
        style={{ borderWidth: 1, borderRadius: 8, padding: 8 }} />
      <Button title="Registrar egreso" color="#EB0029"
        onPress={async () => {
          try {
            await addExpense({ amount: parseFloat(amount), type, note });
            await updateMySummary();
            Alert.alert("¡Listo!", "Egreso registrado y resumen actualizado.");
          } catch (e) { Alert.alert("Error", "No se pudo guardar el egreso"); }
        }} />
    </View>
  );
}
