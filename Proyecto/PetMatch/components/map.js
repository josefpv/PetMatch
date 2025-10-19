import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Alert,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import MapView, { Marker, Callout } from "react-native-maps";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { useUserStore } from "../stores/useUserStore";
import { useMascotaStore } from "../stores/useMascotaStore";
import { useServicioStore } from "../stores/useServicioStore";

const getRandomAmount = () => {
  return `$${(Math.random() * 90 + 10).toFixed(2)}`;
};

const markersData = [
  {
    id: 1,
    latitude: -33.482677,
    longitude: -70.600792,
    emoji: "🐶",
    price: getRandomAmount(),
  },
  {
    id: 2,
    latitude: -33.484144,
    longitude: -70.598862,
    emoji: "🐾",
    price: getRandomAmount(),
  },
];

const MapComponent = ({ markers = markersData }) => {
  const router = useRouter();
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCard, setShowCard] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);
  const [dateTime, setDateTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [address, setAddress] = useState("");
  const [price, setPrice] = useState("");

  const { user, isLoggedIn, isLoading, login, logout } = useUserStore();
  const { mascotas, isLoading: isLoadingMascotas } = useMascotaStore();
  const {
    servicios,
    isLoading: isLoadingServicios,
    createServicio,
    getServicios,
  } = useServicioStore();

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permiso denegado", "No se pudo acceder a la ubicación.");
        setLoading(false);
        return;
      }
      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);
      setLoading(false);
    })();
  }, []);

  const formatDateTime = (date) => {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDateTime(selectedDate);
      setShowTimePicker(true);
    }
  };

  const onTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const newDateTime = new Date(dateTime);
      newDateTime.setHours(selectedTime.getHours());
      newDateTime.setMinutes(selectedTime.getMinutes());
      setDateTime(newDateTime);
    }
  };

  const handleCreateService = async () => {
    const servicioData = {
      userId: user.uid,
      mascota: selectedPet,
      fechaServicio: dateTime.toISOString(),
      fechaCreacion: new Date().toISOString(),
      direccion: address,
      location,
      precio: parseInt(price),
      estado: "pendiente",
    };

    await createServicio(servicioData);
    Alert.alert("¡Éxito!", "Servicio publicado exitosamente 🥳", [
      { text: "OK" },
    ]);
    setShowCard(false);
    setSelectedPet(null);
    setDateTime(new Date());
    setAddress("");
    setPrice("");
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <MapView
        style={{ flex: 1 }}
        initialRegion={{
          latitude: location?.latitude || markers[0]?.latitude || 10.48801,
          longitude: location?.longitude || markers[0]?.longitude || -66.87919,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        showsUserLocation={true}
      >
        {user &&
          user.esPaseador &&
          markers.map((marker) => (
            <Marker
              key={marker.id}
              coordinate={{
                latitude: marker.latitude,
                longitude: marker.longitude,
              }}
              onPress={() => router.push("/servicio/servicio")}
            >
              <Text style={{ fontSize: 40 }}>{marker.emoji}</Text>

              {/* Tooltip con precio */}
              <View style={styles.tooltip}>
                <Text style={styles.tooltipText}>{marker.price}</Text>
              </View>
            </Marker>
          ))}
      </MapView>

      {user && !user.esPaseador && (
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setShowCard(true)}
        >
          <Text style={styles.createButtonText}>Nuevo Servicio</Text>
        </TouchableOpacity>
      )}

      <Modal
        visible={showCard}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCard(false)}
      >
        <View style={styles.overlay}>
          <ScrollView style={styles.card}>
            <Text style={{ fontSize: 40, textAlign: "center" }}>🤔</Text>
            <Text style={styles.cardTitle}>¿A quién deseas que paseen?</Text>
            <Text style={styles.cardDescription}>
              Completa el formulario a continuación
            </Text>

            <Text style={styles.sectionTitle}>Selecciona tu mascota:</Text>
            <ScrollView
              style={styles.petList}
              showsVerticalScrollIndicator={false}
            >
              {mascotas.map((mascota, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.petItem,
                    selectedPet?.nombre === mascota.nombre &&
                      styles.petItemSelected,
                  ]}
                  onPress={() => setSelectedPet(mascota)}
                >
                  <Text style={styles.petName}>{mascota.nombre}</Text>
                  <Text style={styles.petDetails}>
                    {mascota.raza} • {mascota.tamano}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.sectionTitle}>Fecha y hora:</Text>
            <TouchableOpacity
              style={styles.dateTimeButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateTimeText}>
                {formatDateTime(dateTime)}
              </Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={dateTime}
                mode="date"
                display="default"
                onChange={onDateChange}
              />
            )}

            {showTimePicker && (
              <DateTimePicker
                value={dateTime}
                mode="time"
                display="default"
                onChange={onTimeChange}
              />
            )}

            <Text style={styles.sectionTitle}>Dirección:</Text>
            <TextInput
              style={styles.input}
              placeholder="Ingresa la dirección del paseo"
              value={address}
              onChangeText={setAddress}
              multiline={true}
            />

            <Text style={styles.sectionTitle}>Precio ($):</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: 15000"
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
            />

            <TouchableOpacity
              style={[
                styles.cardButton,
                (!selectedPet || !address || !price) &&
                  styles.cardButtonDisabled,
              ]}
              onPress={() => {
                if (selectedPet && address && price) {
                  handleCreateService();
                }
              }}
              disabled={!selectedPet || !address || !price}
            >
              <Text style={styles.cardButtonText}>Publicar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cardCloseButton}
              onPress={() => {
                setShowCard(false);
                setSelectedPet(null);
                setDateTime(new Date());
                setAddress("");
                setPrice("");
              }}
            >
              <Text style={styles.cardCloseText}>Cancelar</Text>
            </TouchableOpacity>
            <Text
              style={{
                fontSize: 10,
                color: "#9a9999ff",
                textAlign: "center",
                marginTop: 8,
                marginBottom: 4,
              }}
            >
              La identidad de todos los usuarios de PetMarch ha sido verificada
              previo a su registro. No entregues tu mascota si sospechas de
              inconsistencia en la información.
            </Text>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  tooltip: {
    position: "absolute",
    bottom: 50,
    backgroundColor: "white",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  tooltipText: {
    fontSize: 14,
    fontWeight: "bold",
    width: 60,
  },
  createButton: {
    position: "absolute",
    bottom: 30,
    right: 20,
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  createButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: "white",
    margin: 20,
    padding: 24,
    borderRadius: 16,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    minWidth: 300,
    maxHeight: "80%",
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
    color: "#333",
  },
  cardDescription: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  petList: {
    maxHeight: 180,
    marginBottom: 20,
  },
  petItem: {
    padding: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: "#f9f9f9",
  },
  petItemSelected: {
    borderColor: "#007AFF",
    backgroundColor: "#e7f3ff",
  },
  petName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  petDetails: {
    fontSize: 14,
    color: "#666",
  },
  cardButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 12,
  },
  cardButtonDisabled: {
    backgroundColor: "#ccc",
  },
  cardButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  cardCloseButton: {
    paddingVertical: 8,
  },
  cardCloseText: {
    color: "#666",
    fontSize: 16,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
    marginBottom: 16,
    minHeight: 44,
  },
  dateTimeButton: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: "#f9f9f9",
    marginBottom: 16,
    minHeight: 44,
    justifyContent: "center",
  },
  dateTimeText: {
    fontSize: 16,
    color: "#333",
  },
});

export default MapComponent;
