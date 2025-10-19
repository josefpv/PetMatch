import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import httpService from "../services/httpService";
import { useUserStore } from "./useUserStore";

const SERVICIO_API_URL = Constants.expoConfig.extra.SERVICIO_API_URL;

export const useServicioStore = create(
  persist((set, get) => ({
    servicios: [],
    isLoading: false,
    error: false,
    createServicio: async (servicioData) => {
      set({ isLoading: true, error: false });
      //const { user } = useUserStore.getState();

      const url = `${SERVICIO_API_URL}/create`;

      const response = await httpService.post(url, servicioData);

      if (response.status === 201) {
        const newServicio = response.data.servicio;
        const updatedServicios = [...get().servicios, newServicio];

        console.log(updatedServicios);

        set({ servicios: updatedServicios, isLoading: false, error: false });
      } else {
        set({ error: true, isLoading: false });
      }
    },
    getServicios: async (uid) => {
      set({ isLoading: true, error: false });
      //const { user } = useUserStore.getState();

      const url = `${SERVICIO_API_URL}/user/${uid}`;
      const response = await httpService.get(url);

      if (response.status === 200) {
        //console.log(respoonse.data);
        const { mascotas } = response.data;

        set({ mascotas, isLoading: false, error: false });
      } else {
        set({ error: true, isLoading: false });
      }
    },
  }))
);
