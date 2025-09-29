import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Keyboard,
  Switch,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { KeyboardAvoidingView } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import Constants from "expo-constants";
import axios from "axios";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../services/firebase/firebaseSettings";
import Loading from "../components/loading";

const ACCOUNT_API_URL = Constants.expoConfig.extra.ACCOUNT_API_URL;
const PERFILES = ["Dueño", "Cuidador"];

export default function RegisterScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [cedulaUri, setCedulaUri] = useState(null);
  const [selfieUri, setSelfieUri] = useState(null);
  const [loading, setLoading] = useState(false);
  //formulario
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    password: "",
    passwordConfirm: "",
    direccion: "",
    esPaseador: true,
    emoji: "", // nuevo campo para emoji
  });
  const {
    nombre,
    apellido,
    email,
    password,
    passwordConfirm,
    direccion,
    esPaseador,
    emoji,
  } = formData;

  // Lista de emojis sugeridos
  const EMOJIS = ["🐶", "🐱", "🐾", "🦴", "🐕", "🐈", "🦮", "🐕‍🦺", "😺", "😻"];

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

  const handleCreateAccount = async () => {
    setLoading(true);
    try {
      const camposVacios = Object.keys(formData).some((key) => !formData[key]);
      if (camposVacios) {
        alert("Por favor, completa todos los campos del formulario.");
        setLoading(false);
        return;
      }

      if (password !== passwordConfirm) {
        alert("Las contraseñas no coinciden. Por favor, verifica.");
        setLoading(false);
        return;
      }

      if (selfieUri && cedulaUri) {
        try {
          //rGenerar nombre único para la cédula
          const uniqueCedulaName = `cedula_${Date.now()}_${Math.random()
            .toString(36)
            .substring(2, 10)}`;
          const uniqueSelfieName = `selfie_${Date.now()}_${Math.random()
            .toString(36)
            .substring(2, 10)}`;

          const urls = await Promise.all([
            handleGetPresignURL(uniqueCedulaName),
            handleGetPresignURL(uniqueSelfieName),
          ]);

          let subidaExitosa = true;
          const uris = [cedulaUri, selfieUri];

          for (let i = 0; i < uris.length; i++) {
            subidaExitosa = await uploadToS3(urls[i], uris[i]);
          }

          if (!subidaExitosa) {
            alert("Error subiendo imágenes. Por favor, intenta nuevamente.");
            setLoading(false);
            return;
          }

          //Compara caras
          const match = await handleCompareFaces(
            urls[0].split("?")[0],
            urls[1].split("?")[0]
          );

          if (!match) {
            alert(
              "La selfie no coincide con la foto de la cédula. Por favor, intenta nuevamente."
            );
            setLoading(false);
            return;
          }

          // Crear el usuario en el backend
          const { uid, email } = await handleCreateUser();
          console.log("uid: ", uid);
          if (uid) {
            Keyboard.dismiss();
            alert("Cuenta creada exitosamente");
            setLoading(false);
            router.replace("/");
          } else {
            setLoading(false);
          }
        } catch (err) {
          console.error("Error subiendo imágenes:", err);
          setLoading(false);
        }
      } else {
        alert("Por favor, sube ambas imágenes: cédula y selfie.");
        setLoading(false);
      }
    } catch (err) {
      setLoading(false);
    }
  };

  const handleGetPresignURL = async (fileName) => {
    try {
      const response = await axios.post(`${ACCOUNT_API_URL}/s3/getUrl`, {
        fileName,
      });
      return response.data?.url;
    } catch (error) {
      console.error("Error obteniendo presign URLs:", error);
      return;
    }
  };

  const uploadToS3 = async (presignUrl, uri) => {
    try {
      const blob = await convertUriToBlob(uri);
      const response = await fetch(presignUrl, {
        method: "PUT",
        body: blob,
        headers: {
          "Content-Type": "image/jpeg",
        },
      });

      if (response.ok) {
        return true;
      } else {
        console.error("Error subiendo imagen a S3:", response.statusText);
        return false;
      }
    } catch (error) {
      console.error("Error subiendo a S3:", error);
      throw error;
    }
  };

  const convertUriToBlob = async (uri) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    return blob;
  };

  const handleCompareFaces = (cedulaS3URL, selfieS3URL) => {
    return axios
      .post(`${ACCOUNT_API_URL}/s3/validateFaces`, { cedulaS3URL, selfieS3URL })
      .then((response) => response.data?.match ?? false)
      .catch((error) => {
        console.error("Error comparando caras a la API Account:", error);
        return false;
      });
  };

  const handleCreateUser = async () => {
    try {
      const url = `${ACCOUNT_API_URL}/createAccount`;
      const {
        nombre: nombres,
        apellido: apellidos,
        email,
        password,
        direccion,
        emoji,
        esPaseador,
      } = formData;
      const data = {
        nombres,
        apellidos,
        email,
        password,
        direccion,
        emoji,
        esPaseador,
      };

      const response = await axios.post(url, data);
      return response?.data;
    } catch (err) {
      console.log(`Error al intentar crear al usuario en API. `, err);
      if (err.response) {
        console.error("Error HTTP:", err.response.status, err.response.data);

        if (err.response.status === 409) {
          alert(
            "El usuario ya se encuentra registrado, por favor intente con otro email."
          );
          console.log("El usuario ya existe.");
        }
      } else {
        console.error("Error de red o Axios:", err.message);
      }
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Overlay de carga */}
      {loading && <Loading />}
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
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
            <Text>Selecciona un emoji para tu perfil</Text>
          </View>
          {/* Fila de selección de emoji */}
          <View style={styles.emojiRow}>
            {EMOJIS.map((e) => (
              <TouchableOpacity
                key={e}
                style={[
                  styles.emojiButton,
                  emoji === e && styles.emojiButtonSelected,
                ]}
                onPress={() => setFormData({ ...formData, emoji: e })}
              >
                <Text style={styles.emoji}>{e}</Text>
              </TouchableOpacity>
            ))}
          </View>
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
              value={direccion}
              onChangeText={(text) => handleChangeForm("direccion", text)}
            />
          </View>
          <View style={[styles.row, { justifyContent: "space-between" }]}>
            <Text>¿Quieres ser paseador?</Text>
            <Switch
              trackColor={{ false: "#767577", true: "#b1caf7ff" }}
              thumbColor={esPaseador ? "#0068d8ff" : "#f4f3f4"}
              ios_backgroundColor="#3e3e3e"
              onValueChange={() => handleChangeForm("esPaseador", !esPaseador)}
              value={esPaseador}
            />
          </View>

          <View style={styles.row}>
            <TouchableOpacity
              style={[
                styles.createButton,
                !nombre &&
                  !apellido &&
                  !email &&
                  !password &&
                  !passwordConfirm &&
                  !direccion &&
                  !selfieUri &&
                  !cedulaUri &&
                  styles.createButtonDisabled,
              ]}
              onPress={handleCreateAccount}
              disabled={
                !nombre &&
                !apellido &&
                !email &&
                !password &&
                !passwordConfirm &&
                !direccion &&
                !selfieUri &&
                !cedulaUri
              }
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
  createButtonDisabled: {
    backgroundColor: "#cccccc",
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
  emojiRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
    flexWrap: "wrap",
  },
  emojiButton: {
    padding: 8,
    marginHorizontal: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "transparent",
    backgroundColor: "#fff",
  },
  emojiButtonSelected: {
    borderColor: "#4f8cff",
    backgroundColor: "#eaf1ff",
  },
  emoji: {
    fontSize: 28,
  },
});
