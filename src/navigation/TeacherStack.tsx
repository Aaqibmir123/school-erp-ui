import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import { StyleSheet } from "react-native";

import AppHeader from "../components/ui/AppHeader";
import TeacherTabNavigator from "./TeacherTabNavigator";

// Screens
import ActionScreen from "../screens/teacher/ActionScreen";
import AttendanceScreen from "../screens/teacher/AttendanceScreen";
import StudentProgressScreen from "../screens/teacher/StudentProgressScreen";
import StudentsScreen from "../screens/teacher/StudentsScreen";
import SubjectScreen from "../screens/teacher/SubjectScreen";
import TimelineScreen from "../screens/TimelineScreen";

import CreateHomeworkScreen from "../screens/homework/CreateHomeworkScreen";

// Exams
import AcademicExamScheduleScreen from "../screens/teacher/exam/AcademicExamScheduleScreen";
import CreateExamScreen from "../screens/teacher/exam/CreateExamScreen";
import ExamActionScreen from "../screens/teacher/exam/ExamActionScreen";
import ExamMarksScreen from "../screens/teacher/exam/ExamMarksScreen";

// Results
import ExamAttendanceScreen from "../screens/teacher/exam/ExamAttendanceScreen";
import EditResultScreen from "../screens/teacher/results/EditResultScreen";
import EnterMarksScreen from "../screens/teacher/results/EnterMarksScreen";
import ResultHomeScreen from "../screens/teacher/results/ResultHomeScreen";
import ResultListScreen from "../screens/teacher/results/ResultListScreen";
import ResultPreviewScreen from "../screens/teacher/results/ResultPreviewScreen";
import SelectExamScreen from "../screens/teacher/results/SelectExamScreen";
const Stack = createNativeStackNavigator();

const TeacherStack = () => {
  return (
    <Stack.Navigator
      screenOptions={({ navigation, route }) => ({
        header: ({ back, options }) => (
          <AppHeader
            title={
              typeof options.title === "string"
                ? options.title
                : route.name === "Main"
                  ? "Teacher Dashboard"
                  : route.name
            }
            onBack={back ? () => navigation.goBack() : undefined}
            onMenu={
              route.name === "Main"
                ? () => navigation.toggleDrawer()
                : undefined
            }
          />
        ),
        headerShown: true,
        contentStyle: styles.content,
      })}
    >
      {/* MAIN */}
      <Stack.Screen
        name="Main"
        component={TeacherTabNavigator}
        options={{
          headerTitle: "",
        }}
      />

      {/* CORE */}
      <Stack.Screen name="Timeline" component={TimelineScreen} />
      <Stack.Screen name="SubjectScreen" component={SubjectScreen} />
      <Stack.Screen name="ActionScreen" component={ActionScreen} />
      <Stack.Screen name="Students" component={StudentsScreen} />
      <Stack.Screen name="Attendance" component={AttendanceScreen} />
      <Stack.Screen name="StudentProgress" component={StudentProgressScreen} />

      {/* HOMEWORK */}
      <Stack.Screen
        name="CreateHomework"
        component={CreateHomeworkScreen}
        options={{ title: "Create Homework" }}
      />

      {/* EXAMS */}
      <Stack.Screen
        name="CreateExam"
        component={CreateExamScreen}
        options={{ title: "Create Exam" }}
      />

      <Stack.Screen
        name="AcademicExams"
        component={AcademicExamScheduleScreen}
        options={{ title: "Academic Exams" }}
      />

      <Stack.Screen
        name="ExamAction"
        component={ExamActionScreen}
        options={{ title: "Exam Options" }}
      />

      <Stack.Screen
        name="ExamAttendance"
        component={ExamAttendanceScreen}
        options={{ title: "Exam Attendance" }}
      />

      <Stack.Screen
        name="ExamMarks"
        component={ExamMarksScreen}
        options={{ title: "Enter Marks" }}
      />

      {/* RESULTS */}
      <Stack.Screen
        name="ResultHome"
        component={ResultHomeScreen}
        options={{ title: "Results" }}
      />

      <Stack.Screen name="SelectExam" component={SelectExamScreen} />
      <Stack.Screen name="EnterMarks" component={EnterMarksScreen} />
      <Stack.Screen name="ResultList" component={ResultListScreen} />
      <Stack.Screen name="ResultPreview" component={ResultPreviewScreen} />
      <Stack.Screen name="EditResult" component={EditResultScreen} />
    </Stack.Navigator>
  );
};

export default TeacherStack;

const styles = StyleSheet.create({
  content: {
    backgroundColor: "#F4F7FB",
  },
});
