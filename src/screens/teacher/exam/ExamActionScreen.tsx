import { Ionicons } from "@expo/vector-icons";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

/* 💣 TYPE DEFINE YAHI KAR (NO EXTRA FILE) */
type RootStackParamList = {
  ExamAction: {
    examId: string;
    subjectId: string;
    classId: string;
    totalMarks?: number;
  };
  ExamAttendance: { examId: string; subjectId: string; classId: string };
  ExamMarks: {
    examId: string;
    subjectId: string;
    classId: string;
    totalMarks?: number;
    sectionId?: string | null;
    examName?: string;
    className?: string;
    sectionName?: string;
  };
};

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "ExamAction"
>;

type RouteProps = RouteProp<RootStackParamList, "ExamAction">;

/* 🎨 COLORS */
const COLORS = {
  primary: "#4F46E5",
  success: "#22C55E",
  background: "#F9FAFB",
  textPrimary: "#111827",
  textSecondary: "#6B7280",
};

const ExamActionScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();

  const { examId, subjectId, classId } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Exam Options</Text>

      {/* 🔥 ATTENDANCE */}
      <TouchableOpacity
        style={[styles.card, { backgroundColor: "#EEF2FF" }]}
        onPress={() =>
          navigation.navigate("ExamAttendance", {
            examId,
            subjectId,
            classId,
          })
        }
      >
        <View style={styles.row}>
          <View style={[styles.iconBox, { backgroundColor: "#4F46E520" }]}>
            <Ionicons
              name="clipboard-outline"
              size={20}
              color={COLORS.primary}
            />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>Mark Exam Attendance</Text>
            <Text style={styles.cardDesc}>Track student presence</Text>
          </View>

          <Ionicons name="chevron-forward" size={18} color="#999" />
        </View>
      </TouchableOpacity>

      {/* 🔥 MARKS */}
      <TouchableOpacity
        style={[styles.card, { backgroundColor: "#ECFDF5" }]}
        onPress={() =>
          navigation.navigate("ExamMarks", {
            examId,
            subjectId,
            classId,
          })
        }
      >
        <View style={styles.row}>
          <View style={[styles.iconBox, { backgroundColor: "#22C55E20" }]}>
            <Ionicons name="create-outline" size={20} color={COLORS.success} />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>Enter Exam Marks</Text>
            <Text style={styles.cardDesc}>Add or update marks</Text>
          </View>

          <Ionicons name="chevron-forward" size={18} color="#999" />
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default ExamActionScreen;

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    padding: 16,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 20,
  },

  card: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  cardTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },

  cardDesc: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
});
