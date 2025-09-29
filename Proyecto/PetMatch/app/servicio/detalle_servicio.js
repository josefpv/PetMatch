import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

export default function DetalleServicio({ onAccept }) {
  return (
    <View>
      <View style={styles.columnRow}>
        <Text style={styles.subTitle}>Ofrece: 💰</Text>
        <Text style={{ fontSize: 40, fontWeight: "bold" }}>$6.000</Text>
      </View>
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.walkButton} onPress={onAccept}>
          <Text style={styles.walkButtonText}>¡A pasear!</Text>
        </TouchableOpacity>
      </View>
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
});
