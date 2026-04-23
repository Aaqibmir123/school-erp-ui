import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AttendanceHistoryScreen from "../screens/student/attendance/AttendanceHistoryScreen";
import AttendanceScreen from "../screens/student/attendance/AttendanceScreen";

const Stack = createNativeStackNavigator();

export default function AttendanceStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false, // 💣 FIX HERE
      }}
    >
      <Stack.Screen
        name="AttendanceMain"
        component={AttendanceScreen}
        options={{ title: "Attendance" }}
      />

      <Stack.Screen
        name="AttendanceHistory"
        component={AttendanceHistoryScreen}
        options={{ title: "Attendance History" }}
      />
    </Stack.Navigator>
  );
}
