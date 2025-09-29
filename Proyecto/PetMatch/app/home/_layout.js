import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function Layout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Tabs>
          <Tabs.Screen
            name="(tabs)/index"
            options={{
              title: "Inicio",
              headerShown: false,
              tabBarLabel: "Inicio",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="map" color={color} size={size} />
              ),
            }}
          />
          <Tabs.Screen
            name="(tabs)/actividad"
            options={{
              title: "Actividad",
              tabBarLabel: "Actividad",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="time" color={color} size={size} />
              ),
            }}
          />
          <Tabs.Screen
            name="(tabs)/cuenta"
            options={{
              title: "Mi Cuenta",
              tabBarLabel: "Mi Cuenta",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="person" color={color} size={size} />
              ),
            }}
          />
        </Tabs>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
