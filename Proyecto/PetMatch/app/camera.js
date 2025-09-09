import React, { useRef } from "react";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function CameraScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const cameraRef = useRef(null);
  const [permission, requestPermission] = useCameraPermissions();

  if (!permission) {
    // Aún cargando estado de permisos
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text>Se requiere acceso a la cámara</Text>
        <TouchableOpacity style={styles.customBtn} onPress={requestPermission}>
          <Text style={styles.customBtnText}>Permitir cámara</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const takePhoto = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();

      const newParams = {
        cedula: params.cedula || null,
        selfie: params.selfie || null,
        [params.origen]: photo.uri,
      };

      router.replace({
        pathname: "/registro",
        params: newParams,
      });
    }
  };

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={params.origen === "cedula" ? "back" : "front"}
      />
      {/* Overlay guía */}
      {params.origen === "cedula" ? (
        <View style={styles.overlayRect} />
      ) : (
        <View style={styles.overlayCircle} />
      )}
      <View style={styles.row}>
        <TouchableOpacity style={styles.customBtn} onPress={takePhoto}>
          <Text style={styles.customBtnText}>Tomar Foto</Text>
        </TouchableOpacity>
        <View style={{ width: 16 }} />
        <TouchableOpacity
          style={styles.customCancelaBtn}
          onPress={() => router.replace("/registro")}
        >
          <Text style={styles.customBtnText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  camera: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    justifyContent: "center",
    paddingVertical: 10,
    backgroundColor: "rgba(255, 255, 255, 0.6)",
  },
  customBtn: {
    backgroundColor: "#007AFF",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  customCancelaBtn: {
    backgroundColor: "#f72323ff",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  customBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  overlayRect: {
    position: "absolute",
    top: "25%",
    left: "10%",
    right: "10%",
    height: "30%",
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.9)",
    borderRadius: 12,
  },
  overlayCircle: {
    position: "absolute",
    top: "20%",
    left: "15%",
    right: "15%",
    height: "50%",
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.9)",
    borderRadius: 200, // círculo
  },
});
