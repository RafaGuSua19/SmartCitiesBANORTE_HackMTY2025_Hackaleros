import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { auth, db } from "../../scripts/firebase";
import {
  acceptFriendRequest,
  getMyFriends,
  getUserProfile,
  searchUsersByUsernamePrefix,
  sendFriendRequest,
  subscribeIncomingRequests,
} from "../../scripts/friends";

// 🧩 Item de solicitud de amistad
function FriendRequestItem({ item, onAccept }: any) {
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const userSnap = await getDoc(doc(db, "users", item.fromUid));
      if (userSnap.exists()) setProfile(userSnap.data());
    })();
  }, [item.fromUid]);

  return (
    <View style={styles.requestCard}>
      <Text style={styles.friendText}>
        <Text style={{ fontWeight: "700" }}>
          {profile?.displayName || "Usuario"}{" "}
        </Text>
        @{profile?.username || item.fromUid}
      </Text>

      <TouchableOpacity style={styles.acceptButton} onPress={onAccept}>
        <Text style={styles.acceptButtonText}>Aceptar</Text>
      </TouchableOpacity>
    </View>
  );
}

// 🧩 Pantalla principal
export default function FriendsScreen() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState<any[]>([]);
  const [friends, setFriends] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<{ [uid: string]: any }>({});

  const doSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const found = await searchUsersByUsernamePrefix(query);
      setResults(found.filter((u) => u.uid !== auth.currentUser?.uid));
    } catch (e) {
      Alert.alert("Error", "No se pudo buscar usuarios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsub = subscribeIncomingRequests(setRequests);
    return unsub;
  }, []);

  const refreshFriends = async () => {
    const friendUids = await getMyFriends();
    setFriends(friendUids);
    let profs: any = {};
    for (let uid of friendUids) {
      const prof = await getUserProfile(uid);
      if (prof) profs[uid] = prof;
    }
    setProfiles(profs);
  };

  useEffect(() => {
    refreshFriends();
  }, []);

  const removeRequestLocally = (id: string) => {
    setRequests((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Amigos</Text>

      {/* 🔎 Buscador */}
      <View style={styles.searchRow}>
        <TextInput
          placeholder="Buscar por username"
          placeholderTextColor="#5B6670"
          value={query}
          onChangeText={setQuery}
          style={styles.input}
        />
        <TouchableOpacity style={styles.searchButton} onPress={doSearch}>
          <Text style={styles.searchButtonText}>Buscar</Text>
        </TouchableOpacity>
      </View>

      {loading && <ActivityIndicator color="#EB0029" />}

      {/* 🔍 Resultados de búsqueda */}
      {results.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resultados</Text>
          <FlatList
            data={results}
            keyExtractor={(item) => item.uid}
            renderItem={({ item }) => (
              <View style={styles.userCard}>
                <Text style={styles.friendText}>
                  {item.displayName || "(Sin nombre)"} {"  "} @{item.username}
                </Text>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={async () => {
                    try {
                      await sendFriendRequest(item.uid);
                      Alert.alert("¡Enviado!", "Solicitud enviada.");
                    } catch (e: any) {
                      Alert.alert("Error", e.message || "No se pudo enviar solicitud");
                    }
                  }}
                >
                  <Text style={styles.addButtonText}>Agregar</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        </View>
      )}

      {/* 📥 Solicitudes recibidas */}
      <Text style={styles.sectionTitle}>Solicitudes recibidas</Text>
      {requests.length === 0 ? (
        <Text style={styles.emptyText}>No tienes solicitudes nuevas.</Text>
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <FriendRequestItem
              item={item}
              onAccept={async () => {
                try {
                  await acceptFriendRequest(item);
                } catch {}
                Alert.alert("¡Ahora son amigos! 🎉");
                await refreshFriends();
                removeRequestLocally(item.id);
              }}
            />
          )}
        />
      )}

      {/* 👥 Lista de amigos */}
      <Text style={styles.sectionTitle}>Tus amigos</Text>
      {friends.length === 0 ? (
        <Text style={styles.emptyText}>Aún no tienes amigos agregados.</Text>
      ) : (
        <FlatList
          data={friends}
          keyExtractor={(uid) => uid}
          renderItem={({ item }) => (
            <View style={styles.userCard}>
              <Text style={styles.friendText}>
                <Text style={{ fontWeight: "700" }}>
                  {profiles[item]?.displayName || ""}
                </Text>{" "}
                @{profiles[item]?.username || item}
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#323E48",
    marginBottom: 20,
  },
  searchRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
  },
  input: {
    flex: 1,
    backgroundColor: "#F6F6F6",
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: "#323E48",
  },
  searchButton: {
    backgroundColor: "#EB0029",
    paddingHorizontal: 16,
    borderRadius: 10,
    justifyContent: "center",
  },
  searchButtonText: {
    color: "white",
    fontWeight: "600",
  },
  section: {
    marginTop: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#323E48",
    marginVertical: 8,
  },
  requestCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#F6F6F6",
    borderRadius: 10,
    padding: 12,
    marginVertical: 5,
    alignItems: "center",
  },
  userCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#F6F6F6",
    borderRadius: 10,
    padding: 12,
    marginVertical: 5,
    alignItems: "center",
  },
  friendText: {
    color: "#323E48",
    fontSize: 15,
  },
  addButton: {
    backgroundColor: "#EB0029",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  addButtonText: {
    color: "white",
    fontWeight: "600",
  },
  acceptButton: {
    backgroundColor: "#25bc3c",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  acceptButtonText: {
    color: "white",
    fontWeight: "600",
  },
  emptyText: {
    color: "#777",
    fontSize: 14,
    marginBottom: 10,
  },
});
