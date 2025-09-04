import MapaView from "@/components/mapa/MapaView";
import { Colors } from "@/constants/Colors";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";

export default function Index() {
  const [date, setDate] = useState<Date>(new Date());
  const [show, setShow] = useState<Boolean>(false);

  const onChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (event.type === "dismissed") {
      setShow(false); // usuario canceló
      return;
    }

    const currentDate = selectedDate || date;
    setShow(Platform.OS === "ios"); // en iOS se mantiene abierto
    setDate(currentDate);
  };

  return (
    <View style={styles.container}>
      <View style={styles.mapa}>
        <MapaView />
      </View>
      <View style={styles.header}>
        <Text style={styles.titleFont}>Bienvenido José</Text>
        <Text style={styles.subTitleFont}>¿Cuándo deseas el servicio 🤔?</Text>
        <View style={{ flexDirection: "row", justifyContent: "flex-start" }}>
          <DateTimePicker
            value={date}
            mode={"date"} // "date" o "time"
            display="default" // "default", "spinner", "calendar", "clock"
            onChange={onChange}
          />
          <DateTimePicker
            value={date}
            mode={"time"} // "date" o "time"
            display="default" // "default", "spinner", "calendar", "clock"
            onChange={onChange}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    position: "absolute",
    top: 60,
    left: 20,
    right: 20,
    //backgroundColor: "rgba(4, 134, 220, 0.93)",
    backgroundColor: "#ffffffff",
    borderRadius: 12,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    borderLeftColor: Colors.light.tint,
    borderLeftWidth: 5,
    borderStyle: "solid",
    borderRightColor: Colors.light.tint,
    borderRightWidth: 5,
  },
  titleFont: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.light.tint,
    marginBottom: 8,
  },
  subTitleFont: {
    fontSize: 14,
    color: "#000000ff",
    marginBottom: 8,
  },
  mapa: {
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
});
