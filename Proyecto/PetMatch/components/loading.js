import React from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";

const Loading = () => (
  <View
    style={{
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(100,100,100,0.4)",
      zIndex: 9999,
      justifyContent: "center",
      alignItems: "center",
    }}
    pointerEvents="auto"
  >
    <ActivityIndicator size="large" color="#4f8cff" />
  </View>
);

const styles = StyleSheet.create({
  container: {
    position: "fixed",
    top: 0,
    left: 0,
    height: "100vh",
    width: "100vw",
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 9999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default Loading;
