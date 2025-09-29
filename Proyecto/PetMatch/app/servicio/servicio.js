import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import DetalleServicio from "./detalle_servicio";
import TomaServicio from "./toma_servicios";
import { ScrollView } from "react-native-gesture-handler";

const TIPO_PERFIL = 1; // 1: Dueño, 2: Cuidador

export default function Servicio() {
  if (TIPO_PERFIL === 2) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.text}>Detalle Servicio - Vista Cuidador</Text>
        </View>
      </SafeAreaView>
    );
  }

  const [accepted, setAccepted] = useState(false);

  const handleAccept = () => {
    setAccepted(true);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.container}>
            <View style={styles.columnRow}>
              <Text style={styles.textTitle}>Detalles del Servicio</Text>
              <View style={styles.avatar}>
                <Text style={{ fontSize: 50 }}>🐶</Text>
              </View>
              <Text style={{ fontSize: 18 }}>Diego Sepulveda</Text>
            </View>
            <View style={styles.infoRow}>
              <View style={styles.infoBox}>
                <Text style={styles.subTitle}>Mascota 🦮</Text>
                <Text style={{ fontSize: 18 }}>Canelita</Text>
              </View>
              <View style={styles.infoBox}>
                <Text style={styles.subTitle}>Raza 🧬</Text>
                <Text style={{ fontSize: 18 }}>Pug</Text>
              </View>
              <View style={styles.infoBox}>
                <Text style={styles.subTitle}>Tipo Solicitud 📄</Text>
                <Text style={{ fontSize: 18 }}>Recurrente</Text>
              </View>
              <View style={styles.infoBox}>
                <Text style={styles.subTitle}>¿Cúando? 🕐</Text>
                <Text style={{ fontSize: 18 }}>09-09-2025</Text>
              </View>
            </View>
            {/* Línea divisora */}
            <View style={styles.divider} />
            <View style={styles.columnRow}>
              <Text style={styles.subTitle}>¿Donde? 📍</Text>
              <Text>Av. Vicuña Mackenna 444, San Joaquín</Text>
            </View>
            {accepted ? (
              <TomaServicio />
            ) : (
              <DetalleServicio onAccept={handleAccept} />
            )}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  columnRow: {
    flexDirection: "column",
    alignItems: "center",
    marginBottom: 20,
    justifyContent: "right",
  },
  infoRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    width: "100%",
    marginTop: 10,
    marginBottom: 10,
  },
  infoBox: {
    backgroundColor: "#eaf1ff",
    borderRadius: 12,
    padding: 16,
    margin: 8,
    minWidth: 120,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  },
  row: {
    flexDirection: "row",
    alignItems: "space-between",
    marginBottom: 20,
    justifyContent: "center",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#3f99ffff",
  },
  textTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
  },
  subTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  divider: {
    width: "80%",
    height: 1,
    backgroundColor: "#b1caf7",
    alignSelf: "center",
    marginVertical: 16,
    borderRadius: 1,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 24,
  },
  walkButton: {
    backgroundColor: "#4f8cff",
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 24,
    alignItems: "center",
    elevation: 2,
  },
  walkButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
});
