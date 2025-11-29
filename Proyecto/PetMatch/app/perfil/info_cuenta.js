import React, { useEffect, useState, useCallback } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useUserStore } from "../../stores/useUserStore";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";

const InfoCuenta = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { getUserById } = useUserStore();

  const [accountInfo, setAccountInfo] = useState(null);

  const fetchAccountInfo = useCallback(async () => {
    try {
      if (id) {
        const fetchedUser = await getUserById(id);
        console.log("fetchedUser:", fetchedUser);
        setAccountInfo(fetchedUser);
      }
    } catch (error) {
      console.error("Error fetching account info:", error);
    }
  }, [id, getUserById]);

  useEffect(() => {
    fetchAccountInfo();
  }, [fetchAccountInfo]);

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Text key={i} style={styles.star}>
          {i <= rating ? "⭐" : "☆"}
        </Text>
      );
    }
    return stars;
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {accountInfo ? (
        <>
          <View style={styles.emojiContainer}>
            <Text style={styles.emoji}>{accountInfo.emoji}</Text>
          </View>

          <View style={styles.ratingContainer}>
            {renderStars(accountInfo.calificación)}
          </View>

          <View style={styles.infoSection}>
            <InfoRow label="Nombres:" value={accountInfo.nombres} />
            <InfoRow label="Apellidos:" value={accountInfo.apellidos} />
            <InfoRow label="Email:" value={accountInfo.email} />
            <InfoRow label="Dirección:" value={accountInfo.direccion} />
            <InfoRow
              label="Es Paseador:"
              value={accountInfo.esPaseador ? "Sí" : "No"}
            />
            <InfoRow
              label="Estado:"
              value={accountInfo.activo ? "Activo" : "Inactivo"}
            />
          </View>

          <TouchableOpacity style={styles.button} onPress={() => router.back()}>
            <Text style={styles.buttonText}>Regresar</Text>
          </TouchableOpacity>
        </>
      ) : (
        <Text>Cargando información de la cuenta...</Text>
      )}
    </ScrollView>
  );
};

const InfoRow = ({ label, value }) => (
  <View style={styles.infoRow}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
    paddingTop: 60,
  },
  emojiContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#2196F3",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20,
  },
  emoji: {
    fontSize: 60,
  },
  ratingContainer: {
    flexDirection: "row",
    marginBottom: 30,
  },
  star: {
    fontSize: 30,
    marginHorizontal: 2,
  },
  infoSection: {
    width: "100%",
    marginBottom: 30,
  },
  infoRow: {
    flexDirection: "row",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    width: 120,
  },
  value: {
    fontSize: 16,
    color: "#666",
    flex: 1,
  },
  button: {
    backgroundColor: "#2196F3",
    paddingVertical: 15,
    paddingHorizontal: 50,
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default InfoCuenta;
