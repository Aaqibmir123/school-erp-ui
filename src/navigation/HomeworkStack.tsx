import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";

import HomeworkDetailsScreen from "../screens/homework/HomeworkDetailsScreen";
import HomeworkListScreen from "../screens/homework/HomeworkListScreen";
import HomeworkCheckScreen from "../screens/teacher/HomeworkCheckScreen";

const Stack = createNativeStackNavigator();

const HomeworkStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="HomeworkList"
        component={HomeworkListScreen}
      />

      <Stack.Screen name="HomeworkCheck" component={HomeworkCheckScreen} />

      <Stack.Screen name="HomeworkDetails" component={HomeworkDetailsScreen} />
    </Stack.Navigator>
  );
};

export default HomeworkStack;
