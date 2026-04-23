import { Ionicons } from "@expo/vector-icons";
import { createDrawerNavigator } from "@react-navigation/drawer";
import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import CustomTeacherDrawer from "./CustomTeacherDrawer";
import TeacherStack from "./TeacherStack";

const Drawer = createDrawerNavigator();

const TeacherDrawer = () => {
  const insets = useSafeAreaInsets();

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomTeacherDrawer {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          width: "86%",
          backgroundColor: "#F4F7FB",
        },
        drawerType: "front",
        sceneContainerStyle: {
          backgroundColor: "#F4F7FB",
        },
        drawerActiveTintColor: "#6366F1",
        drawerInactiveTintColor: "#6B7280",
        drawerLabelStyle: {
          fontSize: 14,
          fontWeight: "600",
        },
        drawerItemStyle: {
          borderRadius: 14,
          marginHorizontal: 8,
          marginVertical: 4,
          paddingHorizontal: 4,
        },
        drawerContentStyle: {
          paddingTop: insets.top,
        },
      }}
    >
      <Drawer.Screen
        name="Home"
        component={TeacherStack}
        options={{
          drawerIcon: ({ color }) => (
            <Ionicons name="home-outline" size={22} color={color} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
};

export default TeacherDrawer;
