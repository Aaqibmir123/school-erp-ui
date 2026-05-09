import { createNativeStackNavigator } from "@react-navigation/native-stack";

import HomeworkDetailsScreen from "../screens/student/studenthomework/HomeworkDetailsScreen";
import HomeworkListScreen from "../screens/student/studenthomework/HomeworkListScreen";

const Stack = createNativeStackNavigator();

export default function StudentHomeworkStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false, // 💣 FIX HERE
      }}
    >
      <Stack.Screen
        name="StudentHomeworkList"
        component={HomeworkListScreen}
        options={{ title: "Homework" }}
      />

      <Stack.Screen
        name="StudentHomeworkDetails"
        component={HomeworkDetailsScreen}
        options={{ title: "Homework Details" }}
      />
    </Stack.Navigator>
  );
}
