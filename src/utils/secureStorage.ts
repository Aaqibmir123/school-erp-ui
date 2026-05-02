import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const canUseSecureStore = Platform.OS !== "web";

export const storage = {
  async getItem(key: string) {
    if (canUseSecureStore) {
      try {
        const value = await SecureStore.getItemAsync(key);
        if (value !== null) return value;
      } catch {
        // Fall back to AsyncStorage below.
      }
    }

    return AsyncStorage.getItem(key);
  },

  async setItem(key: string, value: string) {
    if (canUseSecureStore) {
      try {
        await SecureStore.setItemAsync(key, value);
      } catch {
        await AsyncStorage.setItem(key, value);
        return;
      }
    }

    await AsyncStorage.setItem(key, value);
  },

  async removeItem(key: string) {
    if (canUseSecureStore) {
      try {
        await SecureStore.deleteItemAsync(key);
      } catch {
        // Fall back to AsyncStorage below.
      }
    }

    await AsyncStorage.removeItem(key);
  },

  async multiRemove(keys: string[]) {
    await Promise.all(keys.map((key) => storage.removeItem(key)));
  },
};
