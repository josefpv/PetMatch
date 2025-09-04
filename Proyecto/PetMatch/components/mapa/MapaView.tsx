import * as Location from "expo-location";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import MapView, { MapMarker, Marker } from "react-native-maps";

interface MarkerData {
  id: string;
  latitude: number;
  longitude: number;
  emoji: string;
  title: string;
  price: string;
}

const markers: MarkerData[] = [
  {
    id: "1",
    latitude: -33.482617,
    longitude: -70.600362,
    emoji: "🐶",
    title: "Canelita",
    price: "$6.000",
  },
  {
    id: "2",
    latitude: -33.485599,
    longitude: -70.59874,
    emoji: "🐶",
    title: "Zorro",
    price: "$5.000",
  },
];

export default function MapaView() {
  const markerRefs = useRef<Record<string, MapMarker | null>>({});
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;

    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permisos de ubicación denegados.");
        return;
      }

      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 2000,
          distanceInterval: 5,
        },
        (loc) => {
          setLocation(loc);
        }
      );
    })();

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);

  if (!location && !errorMsg) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4287f5" />
        <Text>Obteniendo ubicación...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {location ? (
        <MapView
          style={styles.map}
          region={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
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
              ref={(ref: MapMarker | null) => {
                markerRefs.current[marker.id] = ref;
              }}
            >
              <Text style={{ fontSize: 40 }}>{marker.emoji}</Text>

              {/* Tooltip con precio */}
              <View style={styles.tooltip}>
                <Text style={styles.tooltipText}>{marker.price}</Text>
              </View>
            </Marker>
          ))}
        </MapView>
      ) : (
        <View style={styles.centered}>
          <Text>{errorMsg ?? "Error obteniendo ubicación"}</Text>
        </View>
      )}
    </View>
  );
}

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
