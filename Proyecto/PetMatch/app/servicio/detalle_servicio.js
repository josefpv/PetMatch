import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
} from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { useServicioStore } from "../../stores/useServicioStore";

export default function DetalleServicio({ onAccept, servicio, user }) {
  const { updateServicio } = useServicioStore();

  const [modalVisible, setModalVisible] = useState(false);
  const [contraoferta, setContraoferta] = useState("");
  const router = useRouter();

  const handleContraofertar = async () => {
    await updateServicio(servicio.id, {
      nuevoPrecio: parseFloat(contraoferta),
      estado: "contraofertado",
      paseador: user,
    });
    setModalVisible(false);
    setContraoferta("");
    router.push("/home");
  };

  return (
    <View>
      {/* Modal para contraoferta */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Contraoferta</Text>
            <Text style={styles.modalSubtitle}>Ingresa tu oferta:</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.currencySymbol}>$</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                keyboardType="numeric"
                value={contraoferta}
                onChangeText={setContraoferta}
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.acceptButton]}
                onPress={handleContraofertar}
              >
                <Text style={styles.acceptButtonText}>Aceptar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <View style={styles.columnRow}>
        <Text style={styles.subTitle}>
          {servicio?.nuevoPrecio ? "Contraoferta: 💰" : "Ofrece: 💰"}
        </Text>
        <Text style={{ fontSize: 40, fontWeight: "bold" }}>
          ${servicio?.nuevoPrecio || servicio?.precio}
        </Text>
        {servicio?.nuevoPrecio && (
          <Text style={{ fontSize: 16, color: "#666", marginTop: 4 }}>
            Precio Inicial: ${servicio?.precio}
          </Text>
        )}
      </View>

      {servicio?.estado === "pendiente" && (
        <>
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.walkButton} onPress={onAccept}>
              <Text style={styles.walkButtonText}>¡A pasear!</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.counterOfferButton}
              onPress={() => setModalVisible(true)}
            >
              <Text style={styles.counterOfferButtonText}>Contraofertar</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {servicio?.estado === "contraofertado" && (
        <View
          style={[
            styles.columnRow,
            { paddingHorizontal: 20, marginBottom: 20 },
          ]}
        >
          <Text
            style={[styles.subTitle, { color: "#f59e0b", textAlign: "center" }]}
          >
            Este servicio ya ha sido contraofertado y está a la espera de
            aprobación o rechazo.
          </Text>
        </View>
      )}

      <View style={[styles.columnRow, { paddingHorizontal: 20 }]}>
        <Text style={{ textAlign: "center" }}>
          La identidades de todos los usuarios de PetMatch han sido verificados
          previo a su registro. No aceptes mascotas que no sean las
          especificadas en su cuenta o que el usuario sea distinto al que acá se
          muestra.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
  subTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
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
  counterOfferButton: {
    backgroundColor: "#fff",
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 24,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#4f8cff",
  },
  counterOfferButtonText: {
    color: "#4f8cff",
    fontWeight: "bold",
    fontSize: 18,
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
    padding: 24,
    width: "80%",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  modalSubtitle: {
    fontSize: 16,
    marginBottom: 20,
    color: "#666",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: 24,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: "bold",
    marginRight: 8,
    color: "#333",
  },
  input: {
    flex: 1,
    borderWidth: 2,
    borderColor: "#4f8cff",
    borderRadius: 12,
    padding: 12,
    fontSize: 18,
    backgroundColor: "#f9f9f9",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#f0f0f0",
  },
  cancelButtonText: {
    color: "#666",
    fontWeight: "bold",
    fontSize: 16,
  },
  acceptButton: {
    backgroundColor: "#4f8cff",
  },
  acceptButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
