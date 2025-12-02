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
const API_URL = "https://5f78f12d7d3e.ngrok-free.app/api/v1/transbank";

export default function ActividadScreen() {
  const { getHistorico, servicios, updateServicio } = useServicioStore();
  const usuarioActual = useUserStore((state) => state.user);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [selectedServicioId, setSelectedServicioId] = useState(null);
  const [isPaying, setIsPaying] = useState(false);

  useEffect(() => {
    const subscription = Linking.addEventListener("url", handleDeepLink);

    return () => {
      subscription?.remove();
    };
  }, []);

  const handleDeepLink = async ({ url }) => {
    console.log("🔗 Deep Link recibido:", url);

    // Parsear el token de la URL: petmatch://payment-return?token_ws=XXX
    const { queryParams } = Linking.parse(url);
    const token = queryParams?.token_ws;

    if (token) {
      await confirmarPagoConTransbank(token);
    }
  };

  const confirmarPagoConTransbank = async (token) => {
    try {
      console.log("✅ Confirmando pago con token:", token);

      // COMMIT de la transacción con Transbank
      const commitResponse = await fetch(
        `${TBK_URL_BASE}/rswebpaytransaction/api/webpay/v1.2/transactions/${token}`,
        {
          method: "PUT",
          headers: {
            "Tbk-Api-Key-Id": TBK_API_KEY_ID,
            "Tbk-Api-Key-Secret": TBK_API_KEY_SECRET,
            "Content-Type": "application/json",
          },
        }
      );

      const commitData = await commitResponse.json();
      console.log("📦 Respuesta Commit:", commitData);

      if (commitData.response_code === 0) {
        // Pago exitoso
        const servicioId = commitData.buy_order.split("-")[1]; // Extraer ID del servicio

        await updateServicio(servicioId, {
          estado: "pagado",
          transaccion: {
            token: token,
            buyOrder: commitData.buy_order,
            authorizationCode: commitData.authorization_code,
            amount: commitData.amount,
            fecha: new Date().toISOString(),
          },
        });

        await getHistorico(usuarioActual.uid);

        Alert.alert(
          "¡Pago Exitoso!",
          `Tu pago de $${commitData.amount} ha sido procesado correctamente.`
        );
      } else {
        // Pago rechazado
        Alert.alert(
          "Pago Rechazado",
          `El pago fue rechazado. Código: ${commitData.response_code}`
        );
      }
    } catch (error) {
      console.error("❌ Error confirmando pago:", error);
      Alert.alert("Error", "No se pudo confirmar el pago con Transbank");
    } finally {
      setIsPaying(false);
    }
  };

  const handleRealizarPago = async (servicio) => {
    if (isPaying) return;
    setIsPaying(true);

    try {
      const amount = Math.floor(
        Number(servicio.nuevoPrecio || servicio.precio)
      );

      console.log("🚀 Iniciando pago:", { servicioId: servicio.id, amount });

      // 1. LLAMAR A TU API PARA CREAR LA TRANSACCIÓN
      const response = await fetch(`${API_URL}/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          servicioId: servicio.id,
          userId: usuarioActual.uid,
          amount: amount,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("❌ Error:", data);
        Alert.alert("Error", data.error || "No se pudo crear la transacción");
        setIsPaying(false);
        return;
      }

      console.log("✅ Token recibido. Abriendo navegador...");

      // 2. ABRIR NAVEGADOR CON LA URL DE WEBPAY
      const result = await WebBrowser.openBrowserAsync(
        `${data.url}?token_ws=${data.token}`
      );

      console.log("📱 Navegador cerrado:", result);

      // 3. VERIFICAR ESTADO DEL PAGO
      await verificarEstadoPago(servicio.id);
    } catch (error) {
      console.error("🔥 Error:", error);
      Alert.alert("Error", "Ocurrió un error inesperado.");
      setIsPaying(false);
    }
  };

  const verificarEstadoPago = async (servicioId) => {
    console.log("🔍 Verificando estado del pago...");

    let attempts = 0;
    const maxAttempts = 15; // 30 segundos máximo

    const checkInterval = setInterval(async () => {
      attempts++;

      try {
        const response = await fetch(`${API_URL}/status/${servicioId}`);
        const { estado, transaccion } = await response.json();

        console.log(`📊 Intento ${attempts}: Estado = ${estado}`);

        if (estado === "pagado") {
          clearInterval(checkInterval);
          await getHistorico(usuarioActual.uid);
          Alert.alert(
            "¡Pago Exitoso! ✅",
            `Tu pago de $${transaccion.amount} ha sido procesado correctamente.`
          );
          setIsPaying(false);
        } else if (estado === "rechazado") {
          clearInterval(checkInterval);
          Alert.alert("Pago Rechazado ❌", "El pago fue rechazado.");
          setIsPaying(false);
        } else if (attempts >= maxAttempts) {
          clearInterval(checkInterval);
          Alert.alert(
            "Tiempo agotado ⏰",
            "No se pudo verificar el estado del pago. Por favor revisa tu historial en unos momentos."
          );
          setIsPaying(false);
        }
      } catch (error) {
        console.error("Error verificando pago:", error);
        if (attempts >= maxAttempts) {
          clearInterval(checkInterval);
          setIsPaying(false);
        }
      }
    }, 2000); // Verificar cada 2 segundos
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
