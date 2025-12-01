import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useServicioStore } from "./../../../stores/useServicioStore";
import { useUserStore } from "./../../../stores/useUserStore";
import { useCallback, useEffect, useState } from "react";
import MapView, { Marker } from "react-native-maps";
import { useFocusEffect } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";

const TBK_API_KEY_ID = "597055555532";
const TBK_API_KEY_SECRET =
  "579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C";
const TBK_URL_BASE = "https://webpay3gint.transbank.cl";

export default function ActividadScreen() {
  const { getHistorico, servicios, updateServicio } = useServicioStore();
  const usuarioActual = useUserStore((state) => state.user);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [selectedServicioId, setSelectedServicioId] = useState(null);

  // useEffect(() => {
  //   getHistorico(userId);
  // }, []);
  const [isPaying, setIsPaying] = useState(false);

  const handleRealizarPago = async (servicio) => {
    if (isPaying) return;
    setIsPaying(true);

    try {
      // 1. PREPARAR DATOS
      const shortId = servicio.id.slice(0, 15);
      const randomSuffix = Math.floor(Math.random() * 9000) + 1000;
      const buyOrder = `O-${shortId}-${randomSuffix}`;
      const sessionId = `S-${usuarioActual.uid.slice(0, 40)}`;
      const amount = Math.floor(
        Number(servicio.nuevoPrecio || servicio.precio)
      );

      // TRUCO PARA DEMO: Usamos Google para pasar la validación de Transbank
      // Transbank no acepta 'exp://', así que usamos una https válida.
      const returnUrl = "https://www.google.com";

      console.log("🚀 Enviando a Transbank:", { buyOrder, amount, returnUrl });

      // 2. PETICIÓN A TRANSBANK (CREATE)
      const createResponse = await fetch(
        `${TBK_URL_BASE}/rswebpaytransaction/api/webpay/v1.2/transactions`,
        {
          method: "POST",
          headers: {
            "Tbk-Api-Key-Id": TBK_API_KEY_ID,
            "Tbk-Api-Key-Secret": TBK_API_KEY_SECRET,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            buy_order: buyOrder,
            session_id: sessionId,
            amount: amount,
            return_url: returnUrl,
          }),
        }
      );

      const createData = await createResponse.json();

      if (!createResponse.ok) {
        console.error("❌ ERROR TRANSBANK:", createData);
        Alert.alert("Error Transbank", createData.error_message);
        setIsPaying(false);
        return;
      }

      console.log("✅ Token Recibido. Abriendo navegador...");

      // 3. ABRIR NAVEGADOR
      // Usamos openBrowserAsync porque no habrá redirección automática a la App
      await WebBrowser.openBrowserAsync(
        `${createData.url}?token_ws=${createData.token}`
      );

      // 4. SIMULACIÓN DE CONFIRMACIÓN (Al cerrar el navegador)
      // Como usamos Google, no recibimos el token de vuelta en la App automáticamente.
      // Para la demo, asumimos que si el usuario cerró el navegador, completó el flujo.

      Alert.alert(
        "Confirmación de Pago",
        "¿Finalizaste el pago en el portal de Transbank?",
        [
          {
            text: "No, cancelé",
            style: "cancel",
            onPress: () => console.log("Pago cancelado por usuario"),
          },
          {
            text: "Sí, pagué exitosamente",
            onPress: async () => {
              // AQUÍ SIMULAMOS EL COMMIT Y ACTUALIZAMOS LA BASE DE DATOS
              // En producción real, aquí consultaríamos a Transbank con el token.
              // Para la demo, confiamos en el usuario.

              try {
                await updateServicio(servicio.id, { estado: "pagado" });
                await getHistorico(usuarioActual.uid);
                Alert.alert(
                  "¡Éxito!",
                  "El servicio ha sido marcado como pagado."
                );
              } catch (e) {
                console.error(e);
                Alert.alert("Error", "No se pudo actualizar el servicio.");
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error("🔥 Error General:", error);
      Alert.alert("Error", "Ocurrió un error inesperado.");
    } finally {
      setIsPaying(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      const loadServices = async () => {
        await getHistorico(usuarioActual.uid);
      };
      loadServices();
    }, [usuarioActual.uid])
  );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case "pendiente":
        return "#f59e0b";
      case "contraofertado":
        return "#3b82f6";
      case "aceptado":
        return "#10b981";
      case "rechazado":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const handleVerUbicacion = (location) => {
    setSelectedLocation(location);
    setModalVisible(true);
  };

  const handleAceptarContraoferta = async (servicioId) => {
    await updateServicio(servicioId, { estado: "aceptado" });
  };

  const handleRechazarContraoferta = async (servicioId) => {
    await updateServicio(servicioId, { estado: "rechazado" });
  };

  const handleConfirmaFinalizacion = (servicioId) => {
    setSelectedServicioId(servicioId);
    setConfirmModalVisible(true);
  };

  const handleFinalizarServicio = async () => {
    if (selectedServicioId) {
      await updateServicio(selectedServicioId, { estado: "por pagar" });
      setConfirmModalVisible(false);
      setSelectedServicioId(null);
    }
  };

  /*   const handleRealizarPago = async () => {
    await WebBrowser.openBrowserAsync("https://google.com");
  }; */

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

  const renderServicio = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.userName}>
          {item.user.emoji} {item.user.nombres} {item.user.apellidos}
        </Text>
        <View
          style={[
            styles.estadoBadge,
            { backgroundColor: getEstadoColor(item.estado) },
          ]}
        >
          <Text style={styles.estadoText}>{item.estado}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Mascota:</Text>
        <Text style={styles.value}>
          {item.mascota.nombre} - {item.mascota.raza}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Dirección:</Text>
        <Text style={styles.value}>{item.direccion}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Fecha del servicio:</Text>
        <Text style={styles.value}>{formatDate(item.fechaServicio)}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Fecha de creación:</Text>
        <Text style={styles.value}>{formatDate(item.fechaCreacion)}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Precio:</Text>
        <Text style={styles.value}>${item.precio}</Text>
        {item.nuevoPrecio && (
          <Text style={styles.contraofertaValue}>
            Contraoferta: ${item.nuevoPrecio}
          </Text>
        )}
      </View>

      {item.paseador && (
        <View style={styles.section}>
          <Text style={styles.label}>Paseador:</Text>
          <View style={styles.paseadorContainer}>
            <Text style={styles.value}>
              {item.paseador.nombres} {item.paseador.apellidos}
            </Text>
            <View style={styles.ratingContainer}>
              {renderStars(item.paseador.calificacion || 0)}
            </View>
          </View>
        </View>
      )}

      <TouchableOpacity
        style={styles.locationButton}
        onPress={() => handleVerUbicacion(item.location)}
      >
        <Text style={styles.locationButtonText}>📍 Ver ubicación</Text>
      </TouchableOpacity>

      {!usuarioActual.esPaseador && item.estado === "contraofertado" && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.acceptButton]}
            onPress={() => handleAceptarContraoferta(item.id)}
          >
            <Text style={styles.actionButtonText}>✓ Aceptar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.rejectButton]}
            onPress={() => handleRechazarContraoferta(item.id)}
          >
            <Text style={styles.actionButtonText}>✗ Rechazar</Text>
          </TouchableOpacity>
        </View>
      )}
      {usuarioActual.esPaseador && item.estado === "aceptado" && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.acceptButton]}
            onPress={() => handleConfirmaFinalizacion(item.id)}
          >
            <Text style={styles.actionButtonText}>✓ Finalizar Servicio</Text>
          </TouchableOpacity>
        </View>
      )}
      {/* {!usuarioActual.esPaseador && item.estado === "por pagar" && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.acceptButton]}
            onPress={handleRealizarPago}
          >
            <Text style={styles.actionButtonText}>✓ Realizar Pago</Text>
          </TouchableOpacity>
        </View>
      )} */}
      {/* BOTÓN REALIZAR PAGO */}
      {!usuarioActual.esPaseador && item.estado === "por pagar" && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.acceptButton,
              isPaying && { opacity: 0.7 },
            ]}
            // IMPORTANTE: Pasamos el 'item' completo para tener datos
            onPress={() => handleRealizarPago(item)}
            disabled={isPaying}
          >
            {isPaying ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.actionButtonText}>✓ Realizar Pago</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Ubicación del Servicio</Text>
            {selectedLocation && (
              <>
                <MapView
                  style={styles.map}
                  initialRegion={{
                    latitude: selectedLocation.latitude,
                    longitude: selectedLocation.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  }}
                >
                  <Marker
                    coordinate={{
                      latitude: selectedLocation.latitude,
                      longitude: selectedLocation.longitude,
                    }}
                  />
                </MapView>
                <View style={styles.coordsContainer}>
                  <Text style={styles.coordsText}>
                    Lat: {selectedLocation.latitude.toFixed(6)}
                  </Text>
                  <Text style={styles.coordsText}>
                    Lng: {selectedLocation.longitude.toFixed(6)}
                  </Text>
                </View>
              </>
            )}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="fade"
        transparent={true}
        visible={confirmModalVisible}
        onRequestClose={() => setConfirmModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmModalContent}>
            <Text style={styles.confirmTitle}>
              ¿Está seguro que desea finalizar el servicio?
            </Text>

            <View style={styles.noteContainer}>
              <Text style={styles.noteText}>
                Al finalizar el servicio se habilitará el pago para que el dueño
                de la mascota lo realice, asegúrate de entregar todas las
                pertenencias de la mascota y de informarle al dueño que ya haz
                finalizado el servicio para que el/ella realice el pago por el
                monto acordado.
              </Text>
            </View>

            <View style={styles.confirmButtons}>
              <TouchableOpacity
                style={[styles.confirmButton, styles.confirmYesButton]}
                onPress={handleFinalizarServicio}
              >
                <Text style={styles.confirmButtonText}>Sí</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmButton, styles.confirmNoButton]}
                onPress={() => setConfirmModalVisible(false)}
              >
                <Text style={styles.confirmButtonText}>No</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {servicios.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No hay servicios en tu historial</Text>
        </View>
      ) : (
        <FlatList
          data={servicios}
          renderItem={renderServicio}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  listContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  estadoBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  estadoText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
    textTransform: "capitalize",
  },
  section: {
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  value: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  contraofertaValue: {
    fontSize: 14,
    color: "#3b82f6",
    fontWeight: "600",
    marginTop: 2,
  },
  locationButton: {
    backgroundColor: "#4f8cff",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 12,
  },
  locationButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    width: "90%",
    maxHeight: "80%",
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#333",
    textAlign: "center",
  },
  map: {
    width: "100%",
    height: 300,
    borderRadius: 12,
    marginBottom: 12,
  },
  coordsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
  },
  coordsText: {
    fontSize: 14,
    color: "#666",
  },
  closeButton: {
    backgroundColor: "#4f8cff",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  acceptButton: {
    backgroundColor: "#10b981",
  },
  rejectButton: {
    backgroundColor: "#ef4444",
  },
  actionButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  paseadorContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  ratingContainer: {
    flexDirection: "row",
    marginLeft: 8,
  },
  star: {
    fontSize: 16,
    marginHorizontal: 1,
  },
  confirmModalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    width: "85%",
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  confirmTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 20,
  },
  noteContainer: {
    backgroundColor: "#f5f5f5",
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  noteText: {
    fontSize: 13,
    color: "#9ca3af",
    lineHeight: 20,
    textAlign: "justify",
  },
  confirmButtons: {
    flexDirection: "row",
    gap: 12,
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  confirmYesButton: {
    backgroundColor: "#10b981",
  },
  confirmNoButton: {
    backgroundColor: "#ef4444",
  },
  confirmButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
