import React from "react";
import { View, Text, StyleSheet } from "react-native";
import MapComponent from "../../../components/map";

export default function HomeScreen() {
  return (
    <View style={{ flex: 1 }}>
      <MapComponent />
      <View style={styles.overlay}>
        <Text style={styles.welcomeText}>Bienvenido</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 40,
    alignSelf: "center",
    backgroundColor: "#fff",
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
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: "bold",
  },
});
