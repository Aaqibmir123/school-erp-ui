import { Ionicons } from "@expo/vector-icons";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import { Pressable, StyleSheet } from "react-native";

import ExamScreen from "../screens/student/ExamScreen/ExamScreen";
import FeesScreen from "../screens/student/Fee/FeesScreen";
import ProfileScreen from "../screens/student/profile/ProfileScreen";
import StudentResultScreen from "../screens/student/ResultScreen/ResultScreen";
import StudentTabNavigator from "./StudentTabNavigator";

const Stack = createNativeStackNavigator();

export default function StudentStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: styles.header,
        headerTintColor: "#fff",
        headerTitleAlign: "center",
        headerTitleStyle: styles.title,
        headerShadowVisible: false,
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen
        name="Tabs"
        component={StudentTabNavigator}
        options={({ navigation }) => ({
          headerTitle: "Dashboard",
          headerLeft: () => (
            <Pressable
              onPress={() => navigation.getParent()?.openDrawer()}
              style={styles.headerIconBtn}
            >
              <Ionicons name="menu" size={24} color="#fff" />
            </Pressable>
          ),
          headerLeftContainerStyle: styles.headerLeftContainer,
          headerRight: () => (
            <Pressable
              onPress={() => navigation.navigate("Profile")}
              style={styles.headerIconBtn}
            >
              <Ionicons name="person-circle" size={28} color="#fff" />
            </Pressable>
          ),
          headerRightContainerStyle: styles.headerRightContainer,
        })}
      />

      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          headerTitle: "My Profile",
        }}
      />

      <Stack.Screen
        name="ExamScreen"
        component={ExamScreen}
        options={{
          headerTitle: "Exams",
        }}
      />

      <Stack.Screen
        name="ResultScreen"
        component={StudentResultScreen}
        options={{
          headerTitle: "Results",
        }}
      />

      <Stack.Screen
        name="FeesScreen"
        component={FeesScreen}
        options={{
          headerTitle: "My Fees",
        }}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#1677ff",
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
  },
  headerIconBtn: {
    alignItems: "center",
    justifyContent: "center",
    height: 44,
    width: 44,
  },
  headerLeftContainer: {
    paddingLeft: 6,
  },
  headerRightContainer: {
    paddingRight: 6,
  },
});
