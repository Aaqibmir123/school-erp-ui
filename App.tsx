import { NavigationContainer } from "@react-navigation/native";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context"; // ✅ ADD THIS
import Toast from "react-native-toast-message";
import { Provider } from "react-redux";

import { OfflineBanner } from "./src/components/OfflineBanner";
import { AuthProvider, useAuth } from "./src/context/AuthContext";
import { useNetwork } from "./src/hooks/useNetwork";
import AppNavigator from "./src/navigation/AppNavigator";
import { store } from "./src/store/store";

SplashScreen.preventAutoHideAsync().catch(() => {});

function AppBootstrap() {
  const isConnected = useNetwork();
  const { loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [loading]);

  if (loading) return null;

  return (
    <>
      {!isConnected && <OfflineBanner />}

      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>

      <Toast />
    </>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <SafeAreaProvider>
          {" "}
          {/* ✅ FIX HERE */}
          <AppBootstrap />
        </SafeAreaProvider>
      </AuthProvider>
    </Provider>
  );
}
