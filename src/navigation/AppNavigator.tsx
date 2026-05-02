import React from "react";
import { View } from "react-native";

import BrandLoader from "../components/BrandLoader";
import { useAuth } from "../context/AuthContext";

import LoginScreen from "../screens/LoginScreen";
import ChildSelectorScreen from "../screens/student/ChildSelectorScreen";
import StudentDrawer from "./StudentDrawer";
import TeacherDrawer from "./TeacherDrawer";

const Loader = () => (
  <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
    <BrandLoader />
  </View>
);

const AppNavigator = () => {
  const { token, role, user, loading, students, selectedStudent } = useAuth();
  const normalizedRole = (role || user?.role || "").toUpperCase();

  if (loading) return <Loader />;

  if (!token) return <LoginScreen />;

  if (normalizedRole === "TEACHER") return <TeacherDrawer />;

  if (normalizedRole === "PARENT") {
    if (!students) return <Loader />;

    if (students.length > 1 && !selectedStudent) {
      return <ChildSelectorScreen />;
    }

    return <StudentDrawer />;
  }

  return <LoginScreen />;
};

export default AppNavigator;
