import { Ionicons } from "@expo/vector-icons";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import { Pressable, StyleSheet } from "react-native";

import ExamScreen from "../screens/student/ExamScreen/ExamScreen";
import AdmitCardsScreen from "../screens/student/AdmitCardsScreen/AdmitCardsScreen";
import FeesScreen from "../screens/student/Fee/FeesScreen";
import NoticeFeedScreen from "../screens/notices/NoticeFeedScreen";
import ProfileScreen from "../screens/student/profile/ProfileScreen";
import StudentResultScreen from "../screens/student/ResultScreen/ResultScreen";
import StudentTestRecordsScreen from "../screens/student/TestRecordsScreen/TestRecordsScreen";
import StudentTabNavigator from "./StudentTabNavigator";
import NoticesHeaderButton from "../components/ui/NoticesHeaderButton";
import { COLORS, RADIUS, SHADOWS } from "@/src/theme";

const Stack = createNativeStackNavigator();

export default function StudentStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: styles.header,
        headerTintColor: COLORS.textPrimary,
        headerTitleAlign: "center",
        headerTitleStyle: styles.title,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="Tabs"
        component={StudentTabNavigator}
        options={({ navigation }) => ({
          headerTitle: "Home",
          headerRight: () => (
            <NoticesHeaderButton
              compact
              onPress={() => navigation.navigate("Notices")}
            />
          ),
          headerLeft: () => (
            <Pressable
              onPress={() =>
                (navigation.getParent() as { openDrawer?: () => void } | undefined)?.openDrawer?.()
              }
              style={styles.headerIconBtn}
            >
              <Ionicons name="menu" size={24} color={COLORS.textPrimary} />
            </Pressable>
          ),
          headerLeftContainerStyle: styles.headerLeftContainer,
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
        name="AdmitCardsScreen"
        component={AdmitCardsScreen}
        options={{
          headerTitle: "Admit Cards",
        }}
      />

      <Stack.Screen
        name="ResultScreen"
        component={StudentResultScreen}
        options={{
          headerTitle: "Marks Card",
        }}
      />

      <Stack.Screen
        name="TestRecordsScreen"
        component={StudentTestRecordsScreen}
        options={{
          headerTitle: "Test Records",
        }}
      />

      <Stack.Screen
        name="FeesScreen"
        component={FeesScreen}
        options={{
          headerTitle: "My Fees",
        }}
      />

      <Stack.Screen
        name="Notices"
        component={NoticeFeedScreen}
        options={{
          headerTitle: "Notices",
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  header: {
    ...SHADOWS.soft,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderBottomColor: COLORS.border,
    borderBottomWidth: 1,
    height: 68,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: "800",
  },
  headerIconBtn: {
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    height: 46,
    width: 46,
  },
  headerLeftContainer: {
    paddingLeft: 12,
  },
});
