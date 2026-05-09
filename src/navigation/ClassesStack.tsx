import { createNativeStackNavigator } from "@react-navigation/native-stack";
import StudentsScreen from "../screens/teacher/StudentsScreen";

import MyClassesScreen from "../screens/teacher/MyClassesScreen";
const Stack = createNativeStackNavigator();

export default function ClassesStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true, // 💣 yaha ON rakho
      }}
    >
      <Stack.Screen
        name="MyClasses"
        component={MyClassesScreen}
        options={{
          headerShown: false, // 💣 THIS IS THE FIX
        }}
      />

      {/* <Stack.Screen
        name="SubjectScreen"
        component={SubjectScreen}
        options={{
          title: "Subjects",
        }}
      /> */}

      <Stack.Screen
        name="Students"
        component={StudentsScreen}
        options={{
          title: "Students",
        }}
      />
    </Stack.Navigator>
  );
}
