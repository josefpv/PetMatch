import { ScrollView, StyleSheet, Text, TextInput } from "react-native";

const UserProfileForm = () => {
  // Estos valores pueden venir de props, contexto, o estado
  const user = {
    nombre: "Juan",
    apellido: "Pérez",
    email: "juan.perez@email.com",
    direccion: "Calle Falsa 123",
    tipoCuenta: "Premium",
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>Nombre</Text>
      <TextInput style={styles.input} value={user.nombre} editable={false} />

      <Text style={styles.label}>Apellido</Text>
      <TextInput style={styles.input} value={user.apellido} editable={false} />

      <Text style={styles.label}>Email</Text>
      <TextInput style={styles.input} value={user.email} editable={false} />

      <Text style={styles.label}>Dirección</Text>
      <TextInput style={styles.input} value={user.direccion} editable={false} />

      <Text style={styles.label}>Tipo de Cuenta</Text>
      <TextInput
        style={styles.input}
        value={user.tipoCuenta}
        editable={false}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: "#fff",
  },
  label: {
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 4,
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    backgroundColor: "#f5f5f5",
    fontSize: 16,
  },
});

export default UserProfileForm;
