import { NavigationContainer } from "@react-navigation/native";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { Provider } from "react-redux";

import BrandLoader from "./src/components/BrandLoader";
import { AppErrorBoundary } from "./src/components/AppErrorBoundary";
import { toastConfig } from "./src/components/AppToast";
import { OfflineBanner } from "./src/components/OfflineBanner";
import { AuthProvider, useAuth } from "./src/context/AuthContext";
import { useNetwork } from "./src/hooks/useNetwork";
import AppNavigator from "./src/navigation/AppNavigator";
import { store } from "./src/store/store";

SplashScreen.preventAutoHideAsync().catch(() => {});

const Loader = () => (
  <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
    <BrandLoader />
  </View>
);

function AppBootstrap() {
  const isConnected = useNetwork();
  const { loading } = useAuth();

  useEffect(() => {
    console.log("[startup] App mounted");
  }, []);

  useEffect(() => {
    if (!loading) {
      console.log("[startup] Splash hide requested");
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [loading]);

  useEffect(() => {
    if (!loading) {
      console.log("[startup] Navigation ready gate open");
    }
  }, [loading]);

  if (loading) return <Loader />;

  return (
    <>
      <OfflineBanner visible={!isConnected} />

      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>

      <Toast config={toastConfig} />
    </>
  );
}

export default function App() {
  return (
    <AppErrorBoundary>
      <Provider store={store}>
        <AuthProvider>
          <SafeAreaProvider>
            <AppBootstrap />
          </SafeAreaProvider>
        </AuthProvider>
      </Provider>
    </AppErrorBoundary>
  );
}
