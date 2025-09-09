import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Keyboard,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { KeyboardAvoidingView } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { Picker } from "@react-native-picker/picker";

export default function RegisterScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [cedulaUri, setCedulaUri] = useState(null);
  const [selfieUri, setSelfieUri] = useState(null);
  //formulario
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    password: "",
    passwordConfirm: "",
    direccion: "",
    perfil: "dueño",
  });
  const {
    nombre,
    apellido,
    email,
    password,
    passwordConfirm,
    direccion,
    perfil,
  } = formData;

  useEffect(() => {
    if (params?.cedula) setCedulaUri(params.cedula);
    if (params?.selfie) setSelfieUri(params.selfie);
  }, [params]);

  const goToCamera = (origen) => {
    router.push({
      pathname: "camera",
      params: { ...params, origen },
    });
  };

  const handleChangeForm = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleGoBack = () => {
    router.replace("/");
  };

  const handleCreateAccount = () => {
    // Lógica para crear cuenta
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          {/* Botón regresar */}
          <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
            <Ionicons name="arrow-back" size={28} color="#333" />
          </TouchableOpacity>
          {/* Título */}
          <Text style={styles.title}>Nueva Cuenta</Text>
          <View style={styles.row}>
            <Text style={{ textAlign: "center" }}>
              Toma una foto a la parte posterior de tu Cédula de Identidad luego
              tómate una selfie y completa tus datos del formulario para
              registrarte.
            </Text>
          </View>
          {/* Fila de botones de cámara */}
          <View style={styles.row}>
            <TouchableOpacity
              style={styles.cameraButton}
              onPress={() => goToCamera("cedula")}
            >
              <Text>Cédula</Text>
              {cedulaUri && (
                <Image source={{ uri: cedulaUri }} style={styles.image} />
              )}
              <Ionicons name="camera" size={28} color="#4f8cff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cameraButton}
              onPress={() => goToCamera("selfie")}
            >
              <Text>Selfie</Text>
              {selfieUri && (
                <Image source={{ uri: selfieUri }} style={styles.image} />
              )}
              <Ionicons name="camera" size={28} color="#4f8cff" />
            </TouchableOpacity>
          </View>
          {/* Nombre */}
          <View style={styles.row}>
            <TextInput
              style={styles.input}
              placeholder="Nombres"
              value={nombre}
              onChangeText={(text) => handleChangeForm("nombre", text)}
            />
          </View>
          {/* Apellido */}
          <View style={styles.row}>
            <TextInput
              style={styles.input}
              placeholder="Apellidos"
              value={apellido}
              onChangeText={(text) => handleChangeForm("apellido", text)}
            />
          </View>
          <View style={styles.row}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={(text) => handleChangeForm("email", text)}
            />
          </View>
          <View style={styles.row}>
            <TextInput
              style={styles.input}
              textContentType="password"
              placeholder="Password"
              secureTextEntry
              value={password}
              onChangeText={(text) => handleChangeForm("password", text)}
            />
          </View>
          <View style={styles.row}>
            <TextInput
              style={styles.input}
              placeholder="Reingrese Password"
              textContentType="password"
              secureTextEntry
              value={passwordConfirm}
              onChangeText={(text) => handleChangeForm("passwordConfirm", text)}
            />
          </View>
          <View style={styles.row}>
            <TextInput
              style={styles.input}
              placeholder="Dirección"
              textContentType="direccion"
              secureTextEntry
              value={direccion}
              onChangeText={(text) => handleChangeForm("direccion", text)}
            />
          </View>
          <View style={styles.row}>
            <Text>Selecciona tu perfil:</Text>
            <Picker
              selectedValue={formData.perfil}
              onValueChange={(itemValue) =>
                handleChangeForm("perfil", itemValue)
              }
              style={styles.picker}
            >
              <Picker.Item label="Dueño" value="dueño" />
              <Picker.Item label="Paseador" value="paseador" />
            </Picker>

            <Text>Perfil seleccionado: {formData.perfil}</Text>
          </View>

          <View style={styles.row}>
            <TouchableOpacity
              style={styles.createButton}
              onPress={handleCreateAccount}
            >
              <Text style={styles.createButtonText}>Crear Cuenta</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 32,
    paddingTop: 48,
  },
  backButton: {
    position: "absolute",
    top: 48,
    left: 24,
    zIndex: 10,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 4,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    alignSelf: "center",
    marginBottom: 36,
    marginTop: 0,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    justifyContent: "center",
  },
  cameraButton: {
    backgroundColor: "#eaf1ff",
    borderRadius: 12,
    padding: 18,
    marginHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fafafa",
    minWidth: 180,
  },
  createButton: {
    backgroundColor: "#4f8cff",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: "center",
    flex: 1,
  },
  createButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  image: { width: 120, height: 120, marginBottom: 20, borderRadius: 12 },
  pickerContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "#fafafa",
    minWidth: 180,
    justifyContent: "center",
  },
  picker: {
    width: "100%",
    height: 44,
  },
});
