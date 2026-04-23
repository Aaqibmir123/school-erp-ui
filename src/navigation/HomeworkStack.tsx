import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";

import CreateHomeworkScreen from "../screens/homework/CreateHomeworkScreen";
import HomeworkDetailsScreen from "../screens/homework/HomeworkDetailsScreen";
import HomeworkListScreen from "../screens/homework/HomeworkListScreen";
import HomeworkCheckScreen from "../screens/teacher/HomeworkCheckScreen";

const Stack = createNativeStackNavigator();

const HomeworkStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="HomeworkList"
        component={HomeworkListScreen}
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="CreateHomework"
        component={CreateHomeworkScreen}
        options={{
          title: "Create / Edit Homework",
          presentation: "modal",
        }}
      />

      <Stack.Screen
        name="HomeworkCheck"
        component={HomeworkCheckScreen}
        options={{ title: "Check Homework" }}
      />

      <Stack.Screen
        name="HomeworkDetails"
        component={HomeworkDetailsScreen}
        options={{ title: "Homework Details" }}
      />
    </Stack.Navigator>
  );
};

export default HomeworkStack;
