import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import DetalleServicio from "./detalle_servicio";
import TomaServicio from "./toma_servicios";
import { ScrollView } from "react-native-gesture-handler";
import { useServicioStore } from "../../stores/useServicioStore";
import { useUserStore } from "../../stores/useUserStore";

const TIPO_PERFIL = 1; // 1: Dueño, 2: Cuidador

// Función para formatear la fecha
const formatearFecha = (fechaISO) => {
  if (!fechaISO) return "No especificada";
  const fecha = new Date(fechaISO);
  const opciones = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return fecha.toLocaleDateString("es-ES", opciones);
};

export default function Servicio() {
  const { id } = useLocalSearchParams();
  const { updateServicio } = useServicioStore();

  const [accepted, setAccepted] = useState(false);
  const [servicio, setServicio] = useState(null);

  // Obtén directamente el array de servicios
  const servicios = useServicioStore((state) => state.servicios);
  const usuario = useUserStore((state) => state.user);

  if (TIPO_PERFIL === 2) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.text}>Detalle Servicio - Vista Cuidador</Text>
        </View>
      </SafeAreaView>
    );
  }

  useEffect(() => {
    const s = servicios.find((servicio) => servicio.id === id);
    console.log("Servicio cargado:", s);
    setServicio(s);
  }, [id, servicios]);

  const handleAccept = async () => {
    await updateServicio(servicio.id, {
      estado: "aceptado",
      paseador: usuario,
    });
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
              {/* Puedes mostrar el ID si lo necesitas */}
              <View style={styles.avatar}>
                <Text style={{ fontSize: 50 }}>{servicio?.user.emoji}</Text>
              </View>
              <Text style={{ fontSize: 18 }}>
                {servicio?.user.nombres} {servicio?.user.apellidos}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <View style={styles.infoBox}>
                <Text style={styles.subTitle}>Mascota 🦮</Text>
                <Text style={{ fontSize: 18 }}>{servicio?.mascota.nombre}</Text>
              </View>
              <View style={styles.infoBox}>
                <Text style={styles.subTitle}>Raza 🧬</Text>
                <Text style={{ fontSize: 18 }}>{servicio?.mascota.raza}</Text>
              </View>
              <View style={styles.infoBox}>
                <Text style={styles.subTitle}>Tipo Solicitud 📄</Text>
                <Text style={{ fontSize: 18 }}>Recurrente</Text>
              </View>
              <View style={styles.infoBox}>
                <Text style={styles.subTitle}>¿Cúando? 🕐</Text>
                <Text style={{ fontSize: 18 }}>
                  {formatearFecha(servicio?.fechaServicio)}
                </Text>
              </View>
            </View>
            {/* Línea divisora */}
            <View style={styles.divider} />
            <View style={styles.columnRow}>
              <Text style={styles.subTitle}>¿Donde? 📍</Text>
              <Text>{servicio?.direccion}</Text>
            </View>
            {accepted ? (
              <TomaServicio />
            ) : (
              <DetalleServicio
                onAccept={handleAccept}
                servicio={servicio}
                user={usuario}
              />
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
