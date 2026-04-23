import React from "react";
import { ActivityIndicator, View } from "react-native";

import { useAuth } from "../context/AuthContext";

import LoginScreen from "../screens/LoginScreen";
import ChildSelectorScreen from "../screens/student/ChildSelectorScreen";
import StudentDrawer from "./StudentDrawer";
import TeacherDrawer from "./TeacherDrawer";

const Loader = () => (
  <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
    <ActivityIndicator size="large" />
  </View>
);

const AppNavigator = () => {
  const { token, role, loading, students, selectedStudent } = useAuth();

  if (loading) return <Loader />;

  if (!token) return <LoginScreen />;

  /* 🔥 TEACHER */
  if (role === "TEACHER") return <TeacherDrawer />;

  /* 🔥 PARENT */
  if (role === "PARENT") {
    if (!students) return <Loader />;

    if (students.length > 1 && !selectedStudent) {
      return <ChildSelectorScreen />;
    }

    return <StudentDrawer />;
  }

  /* 🔥 STUDENT */
  if (role === "STUDENT") return <StudentDrawer />;

  return <Loader />;
};

export default AppNavigator;
