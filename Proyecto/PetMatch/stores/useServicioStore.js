import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import httpService from "../services/httpService";
import { useUserStore } from "./useUserStore";

const SERVICIO_API_URL = Constants.expoConfig.extra.SERVICIO_API_URL;

export const useServicioStore = create(
  persist(
    (set, get) => ({
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
      getServicios: async (userId) => {
        set({ isLoading: true, error: false });
        //const { user } = useUserStore.getState();

        const url = `${SERVICIO_API_URL}/mapa`;
        console.log("url: ", url);
        const response = await httpService.get(url);

        if (response.status === 200) {
          //console.log(respoonse.data);
          const servicios = response.data;
          console.log("servicios:", servicios);

          set({ servicios, isLoading: false, error: false });
        } else {
          set({ error: true, isLoading: false });
        }
      },
      getHistorico: async (userId) => {
        set({ isLoading: true, error: false });
        const { user } = useUserStore.getState();

        let url = `${SERVICIO_API_URL}/historico/${userId}`;

        if (user?.esPaseador) {
          url = `${SERVICIO_API_URL}/paseador/${userId}`;
        }

        const response = await httpService.get(url);

        if (response.status === 200) {
          const servicios = response.data;
          console.log("servicios:", servicios);

          set({ servicios, isLoading: false, error: false });
        } else {
          set({ error: true, isLoading: false });
        }
      },
      getServicioById: async (id) => {
        const servicio = get().servicios?.find((s) => s.id === id);
        console.log("servicio retornado: ", servicio);
        return servicio;
      },
      updateServicio: async (servicioId, updatedData) => {
        set({ isLoading: true, error: false });
        //const { user } = useUserStore.getState();

        const url = `${SERVICIO_API_URL}/${servicioId}`;
        const response = await httpService.put(url, updatedData);

        if (response.status === 200) {
          const updatedServicio = response.data.servicio;
          const updatedServicios = get().servicios.map((servicio) =>
            servicio.id === servicioId ? updatedServicio : servicio
          );

          set({ servicios: updatedServicios, isLoading: false, error: false });
        } else {
          set({ error: true, isLoading: false });
        }
      },
    }),
    {
      name: "servicio-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
