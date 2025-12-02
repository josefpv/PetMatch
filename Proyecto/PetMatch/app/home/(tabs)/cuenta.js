import { View, Text } from "react-native";
import { useUserStore } from "../../../stores/useUserStore";
import { useEffect, useState } from "react";

export default function CuentaScreen() {
  const { user, logout, getUserById } = useUserStore();
  const [userInfo, setUserInfo] = useState(null);
  useEffect(() => {
    async function fetchData() {
      const fetchedUser = await getUserById(user?.uid);
      console.log(fetchedUser);
      setUserInfo(fetchedUser);
    }
    fetchData();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Pantalla</Text>
    </View>
  );
}
