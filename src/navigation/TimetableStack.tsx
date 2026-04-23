import { createNativeStackNavigator } from "@react-navigation/native-stack";

import CreateHomeworkScreen from "../screens/homework/CreateHomeworkScreen";
import ActionScreen from "../screens/teacher/ActionScreen";
import StudentProgressScreen from "../screens/teacher/StudentProgressScreen";
import StudentsScreen from "../screens/teacher/StudentsScreen";
import TimetableScreen from "../screens/teacher/TimetableScreen";

const Stack = createNativeStackNavigator();

export default function TimetableStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Timetable" component={TimetableScreen} />
      <Stack.Screen name="ActionScreen" component={ActionScreen} />
      <Stack.Screen name="Students" component={StudentsScreen} />
      <Stack.Screen name="StudentProgress" component={StudentProgressScreen} />
      <Stack.Screen name="CreateHomework" component={CreateHomeworkScreen} />
    </Stack.Navigator>
  );
}
