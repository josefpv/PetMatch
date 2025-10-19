import React, { use, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import MapComponent from "../../../components/map";
import { useUserStore } from "../../../stores/useUserStore";

export default function HomeScreen() {
  const { user, isLoggedIn, isLoading, login, logout } = useUserStore();

  useEffect(() => {
    console.log(user);
  }, [user]);

  return (
    <View style={{ flex: 1 }}>
      <MapComponent />
      <View style={styles.overlay}>
        <Text style={styles.welcomeText}>
          {user ? `😊 Bienvenido ${user.nombres}` : "Bienvenido"}
        </Text>
        <Text style={styles.subtitleText}>¿Qué deseas hacer hoy?</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 40,
    alignSelf: "center",
    backgroundColor: "#007bff9a",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    // Sombra para iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    // Sombra para Android
    elevation: 5,
    textAlign: "center",
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  subtitleText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
});
