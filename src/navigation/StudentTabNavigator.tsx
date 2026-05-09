import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import DashboardScreen from "../screens/student/dashboard/DashboardScreen";
import TimetableScreen from "../screens/student/timetable/TimetableScreen";
import AttendanceStack from "./AttendanceStack"; 
import StudentHomeworkStack from "./StudentHomeworkStack";
import { COLORS, RADIUS, SHADOWS } from "@/src/theme";

const Tab = createBottomTabNavigator();

export default function StudentTabNavigator() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      detachInactiveScreens
      lazy
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarHideOnKeyboard: true,
        freezeOnBlur: true,
        tabBarItemStyle: {
          alignItems: "center",
          justifyContent: "center",
          paddingVertical: 4,
        },
        tabBarIconStyle: {
          marginTop: 2,
        },
        tabBarLabelPosition: "below-icon",
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "700",
          marginBottom: 0,
        },

        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any;

          switch (route.name) {
            case "Dashboard":
              iconName = focused ? "home" : "home-outline";
              break;

            case "Homework":
              iconName = focused ? "book" : "book-outline";
              break;

            case "Timetable":
              iconName = focused ? "time" : "time-outline";
              break;

            case "Attendance":
              iconName = focused ? "calendar" : "calendar-outline";
              break;

            case "Profile":
              iconName = focused ? "person" : "person-outline";
              break;
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },

        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textTertiary,

        tabBarStyle: {
          ...SHADOWS.card,
          backgroundColor: "rgba(255, 255, 255, 0.94)",
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          height: 68 + insets.bottom,
          paddingBottom: Math.max(insets.bottom, 10),
          paddingTop: 8,
          borderTopLeftRadius: RADIUS.xl,
          borderTopRightRadius: RADIUS.xl,
          overflow: "hidden",
        },
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ title: "Home" }}
      />

      <Tab.Screen name="Homework" component={StudentHomeworkStack} />
      <Tab.Screen name="Timetable" component={TimetableScreen} />

      <Tab.Screen name="Attendance" component={AttendanceStack} />
    </Tab.Navigator>
  );
}
