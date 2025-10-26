import { MaterialIcons } from "@expo/vector-icons";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { auth, db } from "../../../scripts/firebase";
import { getMyFriends } from "../../../scripts/friends";

const friendColor = "#EB0029";
const youColor = "#047857";

async function getSummary(uid: string) {
  const snap = await getDoc(doc(db, "summaries", uid));
  return snap.exists() ? { uid, ...snap.data() } : null;
}
async function getProfile(uid: string) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? snap.data() : {};
}

export default function FriendsDashboard() {
  const [loading, setLoading] = useState(true);
  const [mySummary, setMySummary] = useState<any>(null);
  const [myProfile, setMyProfile] = useState<any>(null);
  const [friends, setFriends] = useState<any[]>([]);
  const [friendsProfiles, setFriendsProfiles] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const me = auth.currentUser?.uid!;
      const [mine, profile] = await Promise.all([getSummary(me), getProfile(me)]);
      setMySummary(mine);
      setMyProfile(profile);

      const friendUids = await getMyFriends();
      let arr: any[] = [];
      let arrProf: any[] = [];
      for (let uid of friendUids) {
        const sum = await getSummary(uid);
        if (sum) arr.push(sum);
        arrProf.push(await getProfile(uid));
      }
      setFriends(arr);
      setFriendsProfiles(arrProf);
      setLoading(false);
    })();
  }, []);

  // Comparativa textual
  function renderComparatives() {
    if (!mySummary)
      return (
        <Text style={styles.info}>Aún no registras tus ingresos/egresos del mes.</Text>
      );
    if (friends.length === 0)
      return (
        <Text style={styles.info}>Aún no tienes amigos con quienes comparar tu ahorro.</Text>
      );

    // Ranking
    const everyone = [
      { ...mySummary, displayName: myProfile.displayName || "Tú", color: youColor },
      ...friends.map((f, idx) => ({
        ...f,
        displayName: friendsProfiles[idx]?.displayName || "Amigo",
        color: friendColor,
      })),
    ].sort((a, b) => b.savingPercent - a.savingPercent);

    return (
      <View style={{ width: "100%" }}>
        <Text style={styles.subtitle}>Ranking mensual de ahorro (%)</Text>
        {everyone.map((p, i) => (
          <View key={p.uid} style={[styles.barRow, { backgroundColor: p.color + "11" }]}>
            <MaterialIcons
              name={i === 0 ? "emoji-events" : "person"}
              size={22}
              color={p.color}
              style={{ marginRight: 6 }}
            />
            <Text style={[styles.barLabel, { color: p.color }]}>
              {i === 0 ? "🥇 " : ""}
              {p.displayName}
            </Text>
            <View style={{ flex: 1, marginLeft: 8, marginRight: 8 }}>
              <View
                style={{
                  height: 8,
                  backgroundColor: p.color,
                  width: `${Math.min(100, Math.round(p.savingPercent))}%`,
                  borderRadius: 4,
                }}
              />
            </View>
            <Text style={{ fontWeight: "bold", color: p.color }}>{Math.round(p.savingPercent)}%</Text>
          </View>
        ))}
        <Text style={styles.info}>
          {
            everyone[0].uid === auth.currentUser?.uid
              ? "¡Felicidades, vas a la cabeza este mes!"
              : `Estás por debajo de ${everyone[0].displayName}.`
          }
        </Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ alignItems: "center", padding: 16 }}>
      <Text style={styles.title}>Dashboard de amigos</Text>
      {loading ? (
        <ActivityIndicator size="large" color={friendColor} />
      ) : (
        renderComparatives()
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 16 },
  info: { color: "#555", fontSize: 16, marginTop: 22, textAlign: "center" },
  subtitle: { fontWeight: "bold", fontSize: 17, marginBottom: 6, marginTop: 10 },
  barRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 14,
    marginVertical: 4,
    minWidth: "90%",
  },
  barLabel: { fontWeight: "bold", minWidth: 80 },
});
