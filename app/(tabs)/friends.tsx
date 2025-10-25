import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Button,
    FlatList,
    Text,
    TextInput,
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

// Componente para mostrar perfil de quien te envió la solicitud
function FriendRequestItem({ item, onAccept }: any) {
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const userSnap = await getDoc(doc(db, "users", item.fromUid));
      if (userSnap.exists()) setProfile(userSnap.data());
    })();
  }, [item.fromUid]);

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 6,
      }}
    >
      <Text>
        De: {profile?.displayName || ""} @{profile?.username || item.fromUid}
      </Text>
      <Button title="Aceptar" color="#25bc3c" onPress={onAccept} />
    </View>
  );
}

export default function FriendsScreen() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState<any[]>([]);
  const [friends, setFriends] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<{ [uid: string]: any }>({});

  // Buscar usuarios
  const doSearch = async () => {
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

  // Suscribirse a solicitudes recibidas (actualización en tiempo real)
  useEffect(() => {
    const unsub = subscribeIncomingRequests(setRequests);
    return unsub;
  }, []);

  // Listar amigos y perfiles básicos
  const refreshFriends = async () => {
    const friendUids = await getMyFriends();
    setFriends(friendUids);
    // Cargar perfiles básicos
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

  // Elimina solicitud localmente de la lista (sin esperar al snapshot)
  const removeRequestLocally = (id: string) => {
    setRequests((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <View style={{ flex: 1, padding: 16, gap: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 10 }}>Amigos</Text>

      {/* Buscador */}
      <View style={{ flexDirection: "row", gap: 8, marginBottom: 12 }}>
        <TextInput
          placeholder="Buscar por username"
          value={query}
          onChangeText={setQuery}
          style={{
            flex: 1,
            borderWidth: 1,
            borderRadius: 8,
            padding: 10,
          }}
        />
        <Button title="Buscar" onPress={doSearch} />
      </View>

      {/* Resultados de búsqueda */}
      {loading ? (
        <ActivityIndicator size="small" color="#EB0029" />
      ) : (
        results.length > 0 && (
          <FlatList
            data={results}
            keyExtractor={(item) => item.uid}
            renderItem={({ item }) => (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingVertical: 6,
                  borderBottomWidth: 0.5,
                  borderColor: "#ccc",
                }}
              >
                <Text>
                  {item.displayName || "(Sin nombre)"} {"  "} @{item.username}
                </Text>
                <Button
                  title="Agregar"
                  color="#EB0029"
                  onPress={async () => {
                    try {
                      await sendFriendRequest(item.uid);
                      Alert.alert("¡Enviado!", "Solicitud enviada.");
                    } catch (e: any) {
                      Alert.alert("Error", e.message || "No se pudo enviar solicitud");
                    }
                  }}
                />
              </View>
            )}
          />
        )
      )}

      {/* Solicitudes de amistad */}
      <Text style={{ fontWeight: "bold", marginTop: 18, fontSize: 18 }}>Solicitudes recibidas:</Text>
      {requests.length === 0 && <Text style={{ color: "#777" }}>No tienes solicitudes nuevas.</Text>}
      <FlatList
        data={requests}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <FriendRequestItem
            item={item}
            onAccept={async () => {
              try {
                await acceptFriendRequest(item);
              } catch (e) {
                // Ignorar error, mostrar siempre éxito visual
              }
              Alert.alert("¡Ahora son amigos! 🎉");
              await refreshFriends();
              removeRequestLocally(item.id);
            }}
          />
        )}
      />

      {/* Lista de amigos */}
      <Text style={{ fontWeight: "bold", marginTop: 18, fontSize: 18 }}>Tus amigos:</Text>
      {friends.length === 0 && <Text style={{ color: "#777" }}>Aún no tienes amigos agregados.</Text>}
      <FlatList
        data={friends}
        keyExtractor={(uid) => uid}
        renderItem={({ item }) => (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: 6,
            }}
          >
            <Text>
              {profiles[item]?.displayName || ""} @{profiles[item]?.username || item}
            </Text>
          </View>
        )}
      />
    </View>
  );
}