import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import httpService from "../services/httpService";

const ACCOUNT_API_URL = Constants.expoConfig.extra.ACCOUNT_API_URL;

export const useUserStore = create(
  persist(
    (set, get) => ({
      user: null,
      isLoggedIn: false,
      isLoading: false,
      error: false,
      login: async (userId) => {
        set({ isLoading: true, error: false });

        const url = `${ACCOUNT_API_URL}/user/${userId}`;
        const respoonse = await httpService.get(url);

        if (respoonse.status === 200) {
          //console.log(respoonse.data);
          const { user } = respoonse.data;

          set({ user, isLoggedIn: true, isLoading: false });
        } else {
          set({ error: true, isLoading: false });
        }
      },
      logout: () => set({ user: null, isLoggedIn: false }),
    }),
    {
      //REVISAR!!!
      //[Error: Uncaught (in promise, id: 0) Error: Failed to create storage directory.Error Domain=NSCocoaErrorDomain Code=512 "The file “@anonymous” couldn’t be saved in the folder “ExponentExperienceData”." UserInfo={NSFilePath=/Users/josevivas/Library/Developer/CoreSimulator/Devices/8ACA21E3-3C41-4CF5-BB8B-CC9105846426/data/Containers/Data/Application/A9B66837-90DA-4E68-96DD-A49536FB4871/Documents/ExponentExperienceData/@anonymous, NSUnderlyingError=0x600000f233c0 {Error Domain=NSPOSIXErrorDomain Code=20 "Not a directory"}}]
      name: "user-storage", // <----- clave en AsyncStorage
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
