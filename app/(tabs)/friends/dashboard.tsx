import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Button, ScrollView, Text, View } from "react-native";
import {
    getBasicProfile,
    getMyFriends,
    getMySummary,
    getPublicSummaryIfShared,
} from "../../.././scripts/friendsDashboard";

export default function FriendsDashboard() {
  const [loading, setLoading] = useState(true);
  const [mySummary, setMySummary] = useState<any>(null);
  const [friendsSummaries, setFriendsSummaries] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<{ [uid: string]: any }>({});
  const [noSummary, setNoSummary] = useState(false);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      setLoading(true);
      // 1. Mi score
      const mine = await getMySummary();
      if (!mine) setNoSummary(true);
      setMySummary(mine);

      // 2. Lista de amigos
      const friendUids = await getMyFriends();
      // 3. Cargar summaries de amigos que comparten
      let summaries: any[] = [];
      let profilesTemp: any = {};
      for (let uid of friendUids) {
        const sum = await getPublicSummaryIfShared(uid);
        if (sum) {
          summaries.push(sum);
          // Pre-cargar nombre y username para mostrar en mensajes
          profilesTemp[uid] = await getBasicProfile(uid);
        }
      }
      setProfiles(profilesTemp);
      setFriendsSummaries(summaries);
      setLoading(false);
    })();
  }, []);

  // Mensajes personalizados de comparativa
  function renderComparatives() {
    if (!mySummary) return null;
    if (friendsSummaries.length === 0)
      return (
        <Text style={{ marginTop: 20, color: "#888", fontSize: 16 }}>
          Aún no tienes amigos con quienes comparar tus logros.
        </Text>
      );

    let messages: string[] = [];

    for (let f of friendsSummaries) {
      const friendName =
        profiles[f.uid]?.displayName || "Amigo";
      const friendUser =
        profiles[f.uid]?.username ? "@" + profiles[f.uid]?.username : "";

      // Energía
      if (mySummary.energyScore != null && f.energyScore != null) {
        if (mySummary.energyScore > f.energyScore) {
          messages.push(
            `¡Has reducido más tu consumo de energía que ${friendName} ${friendUser}!`
          );
        } else if (mySummary.energyScore < f.energyScore) {
          messages.push(
            `Estás por debajo del ahorro de energía de ${friendName} ${friendUser}.`
          );
        }
      }

      // Agua
      if (mySummary.waterScore != null && f.waterScore != null) {
        if (mySummary.waterScore > f.waterScore) {
          messages.push(
            `¡Superas a ${friendName} ${friendUser} en ahorro de agua!`
          );
        } else if (mySummary.waterScore < f.waterScore) {
          messages.push(
            `${friendName} ${friendUser} ha ahorrado más agua que tú.`
          );
        }
      }

      // Ahorro económico
      if (mySummary.savingsScore != null && f.savingsScore != null) {
        if (mySummary.savingsScore > f.savingsScore) {
          messages.push(
            `¡Lideras el ahorro económico sobre ${friendName} ${friendUser}!`
          );
        } else if (mySummary.savingsScore < f.savingsScore) {
          messages.push(
            `Te falta para alcanzar el ahorro de ${friendName} ${friendUser}.`
          );
        }
      }
    }

    // Si no hay ningún mensaje (por falta de datos)
    if (messages.length === 0)
      return (
        <Text style={{ marginTop: 20, color: "#888", fontSize: 16 }}>
          Tus amigos aún no han registrado su resumen de ahorro.
        </Text>
      );

    return messages.map((msg, idx) => (
      <Text key={idx} style={{ marginVertical: 8, fontSize: 16 }}>
        {msg}
      </Text>
    ));
  }

  return (
    <ScrollView
      style={{
        flex: 1,
        padding: 18,
        backgroundColor: "#fff",
      }}
      contentContainerStyle={{ alignItems: "center" }}
    >
      <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 14 }}>
        Dashboard de comparativas
      </Text>
      {loading ? (
        <ActivityIndicator size="large" color="#EB0029" />
      ) : noSummary ? (
        <View style={{ alignItems: "center", marginTop: 24 }}>
          <Text style={{ color: "#888", fontSize: 16 }}>
            No has registrado tu resumen de ahorro aún.
          </Text>
          <Button
            title="Ir a registrar mi ahorro"
            color="#EB0029"
            onPress={() => router.push("./firebase")}
          />
        </View>
      ) : (
        renderComparatives()
      )}
    </ScrollView>
  );
}
