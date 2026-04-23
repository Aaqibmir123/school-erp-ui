import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import CurrentClassCard from "../components/CurrentClassCard";
import TimetableScreen from "../screens/teacher/TimetableScreen";
import ClassesStack from "./ClassesStack";
import HomeworkStack from "./HomeworkStack";
const Tab = createBottomTabNavigator();

const TeacherTabNavigator = () => {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarHideOnKeyboard: true,
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
        tabBarStyle: {
          borderTopColor: "#E2E8F0",
          borderTopWidth: 1,
          height: 60 + insets.bottom,
          paddingBottom: Math.max(insets.bottom, 8),
          paddingTop: 6,
        },

        tabBarIcon: ({ color, size, focused }) => {
          let iconName: any;

          switch (route.name) {
            case "Dashboard":
              iconName = focused ? "home" : "home-outline";
              break;

            case "Classes":
              iconName = focused ? "book" : "book-outline";
              break;

            case "Homework":
              iconName = focused ? "document-text" : "document-text-outline";
              break;

            case "Timetable":
              iconName = focused ? "calendar" : "calendar-outline";
              break;

            default:
              iconName = "ellipse";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },

        tabBarActiveTintColor: "#1677ff",
        tabBarInactiveTintColor: "#94A3B8",
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={CurrentClassCard}
        options={{
          title: "Dashboard",
        }}
      />
      <Tab.Screen
        name="Classes"
        component={ClassesStack}
        options={{
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Homework"
        component={HomeworkStack}
        options={{
          title: "Homework",
        }}
      />
      <Tab.Screen
        name="Timetable"
        component={TimetableScreen}
        options={{
          title: "Timetable",
        }}
      />
    </Tab.Navigator>
  );
};

export default TeacherTabNavigator;
