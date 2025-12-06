import { View, Text } from "react-native";
import { useUserStore } from "../../../stores/useUserStore";
import { useEffect, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Linking,
} from "react-native";
//Para quitar mensajes en el celular de advetencias y errores, debe ir en app.js
//import {LogBox } from "react-native";
//LogBox.ignoreAllLogs(true);

export default function CuentaScreen() {
  const { user, logout, getUserById } = useUserStore();
  const [userInfo, setUserInfo] = useState(null);
  useEffect(() => {
    async function fetchData() {
      const fetchedUser = await getUserById(user?.uid);
      console.log(fetchedUser);
      setUserInfo(fetchedUser);
    }
    fetchData();
  }, []);

  const formatFecha = (timestamp) => {
    if (!timestamp || !timestamp._seconds) return "Fecha desconocida";
    return new Date(timestamp._seconds * 1000).toLocaleDateString("es-ES");
  };

  const handleLogout = () => {
    Alert.alert("Cerrar Sesión", "¿Estás seguro que quieres salir?", [
      {
        text: "Cancelar",
        style: "cancel",
      },
      {
        text: "Salir",
        style: "destructive",
        onPress: () => {
          logout();
        },
      },
    ]);
  };

  const handleSendRequest = () => {
    const emailDestino = "soporte@petmatch.cl";

    const asunto = `Solicitud de soporte - ${userInfo?.nombres} ${userInfo?.apellidos}`;
    const url = `mailto:${emailDestino}?subject=${encodeURIComponent(
      asunto
    )}&body=${encodeURIComponent(cuerpo)}`;
    Linking.openURL(url).catch((err) => {
      console.error("No se pudo abrir el correo", err);
      Alert.alert("Error", "No pudimos abrir tu aplicación de correo.");
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* --- Header (Lo que ya tenías) --- */}
        <View style={styles.headerContainer}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarEmoji}>{userInfo?.emoji || "👤"}</Text>
          </View>
          <Text style={styles.nameText}>
            {userInfo?.nombres} {userInfo?.apellidos}
          </Text>

          <View
            style={[
              styles.badge,
              userInfo?.esPaseador ? styles.badgePaseador : styles.badgeNormal,
            ]}
          >
            <Text style={styles.badgeText}>
              {userInfo?.esPaseador
                ? "🐾 Paseador Validado"
                : "🏠 Dueño de mascota"}
            </Text>
          </View>
        </View>

        {/* --- NUEVO: Sección de Información Detallada --- */}
        <View style={styles.infoCard}>
          {/* Dirección */}
          <View style={styles.infoRow}>
            <Text style={styles.icon}>📍</Text>
            <View>
              <Text style={styles.label}>Dirección</Text>
              <Text style={styles.value}>
                {userInfo?.direccion || "Sin dirección"}
              </Text>
            </View>
          </View>

          {/* Separador visual */}
          <View style={styles.separator} />

          {/* Email */}
          <View style={styles.infoRow}>
            <Text style={styles.icon}>📧</Text>
            <View>
              <Text style={styles.label}>Email</Text>
              <Text style={styles.value}>{userInfo?.email || "Sin email"}</Text>
            </View>
          </View>

          {/* Separador visual */}
          <View style={styles.separator} />

          {/* Fecha de Creación */}
          <View style={styles.infoRow}>
            <Text style={styles.icon}>📅</Text>
            <View>
              <Text style={styles.label}>Miembro desde</Text>
              <Text style={styles.value}>
                {formatFecha(userInfo?.fechaCreacion)}
              </Text>
            </View>
          </View>
        </View>

        {/* --- NUEVO: Botones de Acción --- */}
        <View style={styles.buttonsContainer}>
          {/* Botón Azul: Enviar Solicitud */}
          <TouchableOpacity
            style={styles.btnBlue}
            onPress={() => {
              handleSendRequest;
            }}
          >
            <Text style={styles.btnText}>Enviar Solicitud</Text>
          </TouchableOpacity>

          {/* Botón Rojo: Cerrar Sesión */}
          <TouchableOpacity style={styles.btnRed} onPress={handleLogout}>
            <Text style={styles.btnText}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  scrollContent: {
    paddingBottom: 40,
    paddingHorizontal: 20,
  },

  headerContainer: {
    alignItems: "center",
    marginTop: 40,
    marginBottom: 30,
  },
  avatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
    marginBottom: 15,
  },
  avatarEmoji: {
    fontSize: 50,
    textAlign: "center",
  },
  nameText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1C1C1E",
    marginBottom: 6,
    textAlign: "center",
  },
  badge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 5,
    alignSelf: "center",
  },
  badgePaseador: { backgroundColor: "#D1F7C4" },
  badgeNormal: { backgroundColor: "#E5E5EA" },
  badgeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },

  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 25,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  icon: {
    fontSize: 24,
    marginRight: 15,
  },
  label: {
    fontSize: 12,
    color: "#8E8E93",
    fontWeight: "600",
    textTransform: "uppercase",
    marginBottom: 2,
  },
  value: {
    fontSize: 16,
    color: "#1C1C1E",
    fontWeight: "500",
  },
  separator: {
    height: 1,
    backgroundColor: "#F2F2F7",
    marginVertical: 10,
    marginLeft: 40,
  },

  buttonsContainer: {
    gap: 15,
  },
  btnBlue: {
    backgroundColor: "#007AFF",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  btnRed: {
    backgroundColor: "#FF3B30",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    shadowColor: "#FF3B30",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  btnText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },
});
