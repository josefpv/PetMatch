import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";

const CONFETTI_COUNT = 12;
const CONFETTI_EMOJIS = ["🎉", "✨", "🥳"];

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export default function TomaServicio() {
  const router = useRouter();
  const confetti = useRef(
    Array.from({ length: CONFETTI_COUNT }).map(() => ({
      top: new Animated.Value(getRandomInt(-100, -40)),
      left: getRandomInt(10, Dimensions.get("window").width - 40),
      emoji: CONFETTI_EMOJIS[getRandomInt(0, CONFETTI_EMOJIS.length - 1)],
      rotate: new Animated.Value(getRandomInt(-30, 30)),
    }))
  ).current;

  useEffect(() => {
    confetti.forEach((item, idx) => {
      Animated.timing(item.top, {
        toValue: Dimensions.get("window").height + 40,
        duration: getRandomInt(2000, 3200), // duración aumentada
        delay: idx * 80,
        useNativeDriver: true,
      }).start();
      Animated.timing(item.rotate, {
        toValue: getRandomInt(-90, 90),
        duration: getRandomInt(2000, 3200), // duración aumentada
        delay: idx * 80,
        useNativeDriver: true,
      }).start();
    });
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* Confetti Layer */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {confetti.map((item, idx) => (
          <Animated.Text
            key={idx}
            style={{
              position: "absolute",
              left: item.left,
              transform: [
                { translateY: item.top },
                {
                  rotate: item.rotate.interpolate({
                    inputRange: [-90, 90],
                    outputRange: ["-90deg", "90deg"],
                  }),
                },
              ],
              fontSize: 36,
              opacity: 0.85,
            }}
          >
            {item.emoji}
          </Animated.Text>
        ))}
      </View>
      <View>
        <View style={styles.columnRow}>
          <Text style={styles.subTitle}>Ofrece: 💰</Text>
          <Text style={{ fontSize: 40, fontWeight: "bold" }}>$6.000</Text>
        </View>
        <View style={styles.columnRow}>
          <Text style={{ fontSize: 60 }}>🤝</Text>
          <Text style={{ fontSize: 40 }}>¡Has tomado el servicio!</Text>
        </View>
        <View style={[styles.columnRow, { paddingHorizontal: 20 }]}>
          <Text style={{ textAlign: "center" }}>
            Puedes dirigirte a la ubicación del usuario para iniciar el
            servicio. Recuerda comunicarte con él para coordinar los detalles.
          </Text>
        </View>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.walkButton}
            onPress={() => router.back()}
          >
            <Text style={styles.walkButtonText}>Aceptar</Text>
          </TouchableOpacity>
        </View>
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
