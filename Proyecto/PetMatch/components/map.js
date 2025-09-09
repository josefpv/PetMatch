import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, Alert, StyleSheet } from "react-native";
import MapView, { Marker, Callout } from "react-native-maps";
import { useNavigation } from "@react-navigation/native";
import * as Location from "expo-location";

const getRandomAmount = () => {
  return `$${(Math.random() * 90 + 10).toFixed(2)}`;
};

const markersData = [
  {
    id: 1,
    latitude: -33.482677,
    longitude: -70.600792,
    emoji: "🐶",
    price: getRandomAmount(),
  },
  {
    id: 2,
    latitude: -33.484144,
    longitude: -70.598862,
    emoji: "🐾",
    price: getRandomAmount(),
  },
];

export default MapComponent = ({ markers = markersData }) => {
  const navigation = useNavigation();
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permiso denegado", "No se pudo acceder a la ubicación.");
        setLoading(false);
        return;
      }
      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <MapView
        style={{ flex: 1 }}
        initialRegion={{
          latitude: location?.latitude || markers[0]?.latitude || 10.48801,
          longitude: location?.longitude || markers[0]?.longitude || -66.87919,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        showsUserLocation={true}
      >
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            coordinate={{
              latitude: marker.latitude,
              longitude: marker.longitude,
            }}
            onPress={() => console.log(`Marker ${marker.id} pressed`)}
          >
            <Text style={{ fontSize: 40 }}>{marker.emoji}</Text>

            {/* Tooltip con precio */}
            <View style={styles.tooltip}>
              <Text style={styles.tooltipText}>{marker.price}</Text>
            </View>
          </Marker>
        ))}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  tooltip: {
    position: "absolute",
    bottom: 50,
    backgroundColor: "white",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  tooltipText: {
    fontSize: 14,
    fontWeight: "bold",
    width: 60,
  },
});
