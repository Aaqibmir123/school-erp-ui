import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import { StyleSheet } from "react-native";

import AppHeader from "../components/ui/AppHeader";
import TeacherTabNavigator from "./TeacherTabNavigator";
import { COLORS } from "../theme";

// Screens
import ActionScreen from "../screens/teacher/ActionScreen";
import AttendanceScreen from "../screens/teacher/AttendanceScreen";
import AttendanceHistoryScreen from "../screens/teacher/AttendanceHistoryScreen";
import ProfileScreen from "../screens/teacher/ProfileScreen";
import StudentProgressScreen from "../screens/teacher/StudentProgressScreen";
import StudentsScreen from "../screens/teacher/StudentsScreen";
import SubjectScreen from "../screens/teacher/SubjectScreen";
import TimelineScreen from "../screens/TimelineScreen";
import RecordsScreen from "../screens/teacher/RecordsScreen";
import NoticeFeedScreen from "../screens/notices/NoticeFeedScreen";
import NoticesHeaderButton from "../components/ui/NoticesHeaderButton";

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

const formatTitle = (name?: string) => {
  if (!name) return "Teacher Home";

  const titles: Record<string, string> = {
    Main: "Teacher Home",
    Dashboard: "Home",
    Homework: "Homework",
    HomeworkList: "Homework",
    CreateHomework: "Create Homework",
    HomeworkCheck: "Check Homework",
    HomeworkDetails: "Homework Details",
      Attendance: "Attendance",
      AttendanceHistory: "Attendance History",
      Profile: "My Profile",
      Records: "Records",
    CreateExam: "Exams",
    AcademicExams: "Academic Exams",
    ExamAction: "Exam Options",
    ExamAttendance: "Exam Attendance",
    ExamMarks: "Enter Marks",
    ResultHome: "Results",
    ResultList: "Results",
    ResultPreview: "Result Preview",
    EditResult: "Edit Result",
    Notices: "Notices",
  };

  return titles[name] || name;
};

const TeacherStack = () => {
  return (
    <Stack.Navigator
      screenOptions={({ navigation, route }) => ({
        header: ({ back, options }) => (
          <AppHeader
            title={
              typeof options.title === "string"
                ? options.title
                : formatTitle(route.name)
            }
            rightElement={
              typeof options.headerRight === "function"
                ? (options.headerRight as any)({ tintColor: COLORS.textPrimary })
                : undefined
            }
            onBack={navigation.canGoBack() ? () => navigation.goBack() : undefined}
            onMenu={
              route.name === "Main"
                ? () =>
                    (
                      navigation.getParent() as
                        | { toggleDrawer?: () => void }
                        | undefined
                    )?.toggleDrawer?.()
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
        options={({ navigation }) => ({
          title: "Teacher Home",
          headerRight: () => (
            <NoticesHeaderButton
              onPress={() => navigation.navigate("Notices")}
            />
          ),
        })}
      />

      {/* CORE */}
      <Stack.Screen name="Timeline" component={TimelineScreen} />
      <Stack.Screen
        name="Notices"
        component={NoticeFeedScreen}
        options={{ title: "Notices", headerShown: false }}
      />
      <Stack.Screen name="SubjectScreen" component={SubjectScreen} />
      <Stack.Screen name="ActionScreen" component={ActionScreen} />
      <Stack.Screen name="Students" component={StudentsScreen} />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: "My Profile" }}
      />
      <Stack.Screen name="Attendance" component={AttendanceScreen} />
      <Stack.Screen
        name="AttendanceHistory"
        component={AttendanceHistoryScreen}
        options={{ title: "Attendance History" }}
      />
      <Stack.Screen
        name="Records"
        component={RecordsScreen}
        options={{ title: "Records" }}
      />
      <Stack.Screen name="StudentProgress" component={StudentProgressScreen} />

      {/* HOMEWORK */}
      <Stack.Screen
        name="CreateHomework"
        component={CreateHomeworkScreen}
        options={{
          headerShown: false,
          presentation: "modal",
        }}
      />

      {/* EXAMS */}
      <Stack.Screen
        name="CreateExam"
        component={CreateExamScreen}
        options={{ title: "Exams" }}
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
    backgroundColor: "#EAF1FF",
  },
});
