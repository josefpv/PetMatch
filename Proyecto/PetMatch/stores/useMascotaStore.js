import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import httpService from "../services/httpService";
import { useUserStore } from "./useUserStore";

const MASCOTA_API_URL = Constants.expoConfig.extra.MASCOTA_API_URL;

export const useMascotaStore = create(
  persist((set, get) => ({
    mascotas: [],
    isLoading: false,
    error: false,
    getMascotas: async (uid) => {
      set({ isLoading: true, error: false });
      //const { user } = useUserStore.getState();

      const url = `${MASCOTA_API_URL}/user/${uid}`;
      const response = await httpService.get(url);

      if (response.status === 200) {
        //console.log(response.data);
        const { mascotas } = response.data;

        set({ mascotas, isLoading: false, error: false });
      } else {
        set({ error: true, isLoading: false });
      }
    },
  }))
);
