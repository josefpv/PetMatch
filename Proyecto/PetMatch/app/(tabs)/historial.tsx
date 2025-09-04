import { FlatList, StyleSheet, Text, View } from "react-native";

const items = [
  { id: "1", name: "Perfil" },
  { id: "2", name: "Mis Mascotas" },
  { id: "3", name: "Configuración" },
  { id: "4", name: "Cerrar Sesión" },
];

export default function MiCuenta() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mi Cuenta</Text>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.itemText}>{item.name}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  item: { padding: 16, borderBottomWidth: 1, borderBottomColor: "#eee" },
  itemText: { fontSize: 18 },
});
