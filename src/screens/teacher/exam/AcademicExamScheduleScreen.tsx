import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import EmptyState from "@/src/components/EmptyState";
import { COLORS } from "@/src/theme/colors";
import { RADIUS } from "@/src/theme/radius";
import { SPACING } from "@/src/theme/spacing";
import { useGetTeacherAcademicExamsQuery } from "../../../api/teacher/teacherApi";

const AcademicExamScheduleScreen = () => {
  const { data = [], isLoading } = useGetTeacherAcademicExamsQuery();
  const navigation = useNavigation<any>();

  /* 🔥 FORMAT */
  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });

  const formatTime = (time: string) => {
    if (!time) return "";
    const [h, m] = time.split(":");
    const hour = parseInt(h);
    const ampm = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${m} ${ampm}`;
  };

  const capitalize = (text: string) =>
    text.charAt(0).toUpperCase() + text.slice(1);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!data.length) {
    return (
      <EmptyState
        title="No Academic Exams"
        description="No schedules available 📭"
      />
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        keyExtractor={(item: any) => item.examName}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }: any) => (
          <View style={styles.examBlock}>
            {/* 🔥 HEADER */}
            <Text style={styles.examTitle}>{capitalize(item.examName)}</Text>

            <Text style={styles.date}>
              📅 {formatDate(item.startDate)} → {formatDate(item.endDate)}
            </Text>

            {/* 🔥 SUBJECTS */}
            {item.subjects.map((sub: any, index: number) => {
              const bgColors = ["#EEF2FF", "#ECFDF5", "#FEF3C7"];
              const bg = bgColors[index % bgColors.length];

              return (
                <TouchableOpacity
                  key={sub.subjectId}
                  activeOpacity={0.85}
                  style={[styles.card, { backgroundColor: bg }]}
                  onPress={() =>
                    navigation.navigate("ExamAction", {
                      examId: sub.examId,
                      subjectId: sub.subjectId,
                      classId: sub.classId,
                    })
                  }
                >
                  {/* TOP ROW */}
                  <View style={styles.rowBetween}>
                    <Text style={styles.subject}>
                      {capitalize(sub.subject)} ({sub.class})
                    </Text>

                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color={COLORS.textSecondary}
                    />
                  </View>

                  {/* TIME */}
                  <Text style={styles.time}>
                    ⏰ {formatTime(sub.startTime)} - {formatTime(sub.endTime)}
                  </Text>

                  {/* CTA */}
                  <View style={styles.cta}>
                    <Text style={styles.ctaText}>View Details</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      />
    </View>
  );
};

export default React.memo(AcademicExamScheduleScreen);

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.lg,
  },

  examBlock: {
    marginBottom: SPACING.xl,
  },

  examTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },

  date: {
    marginTop: 4,
    marginBottom: SPACING.md,
    color: COLORS.textSecondary,
  },

  card: {
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.sm,
  },

  subject: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },

  time: {
    marginTop: 6,
    color: COLORS.textSecondary,
  },

  cta: {
    marginTop: 10,
    alignSelf: "flex-start",
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },

  ctaText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
