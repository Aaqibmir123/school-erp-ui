import { Ionicons } from "@expo/vector-icons";
import { memo, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useAuth } from "@/src/context/AuthContext";
import { useGetStudentExamsQuery } from "../../../api/student/student.api";
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from "@/src/theme";
import { STUDENT_GLAS_CARD } from "../studentTheme";

type ExamItem = {
  className?: string;
  category?: "class" | "school";
  date?: string;
  endDate?: string;
  endTime?: string;
  examType?: string;
  id: string;
  sectionName?: string;
  startDate?: string;
  startTime?: string;
  status?: string;
  subject?: string;
  title?: string;
  totalMarks?: number;
};

const formatDate = (value?: string | Date) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatType = (type?: string) =>
  String(type || "exam")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

const formatWindow = (
  startDate?: string | Date,
  endDate?: string | Date,
) => {
  const startLabel = formatDate(startDate);
  const endLabel = formatDate(endDate);

  if (!startLabel && !endLabel) return "N/A";
  if (!endLabel || startLabel === endLabel) return startLabel || endLabel;

  return `${startLabel} → ${endLabel}`;
};

function ExamScreen() {
  const { selectedStudent } = useAuth();
  const { data = [], isLoading, isError, refetch } = useGetStudentExamsQuery(
    { studentId: selectedStudent?._id! },
    { skip: !selectedStudent?._id },
  );
  const [selectedTab, setSelectedTab] = useState<"school" | "class">("school");
  const filteredExams = useMemo(
    () =>
      data.filter((item: ExamItem) =>
        selectedTab === "class" ? item.category === "class" : item.category !== "class",
      ),
    [data, selectedTab],
  );

  const renderItem = ({ item }: { item: ExamItem }) => {
    const isPublished = item.status === "published";
    const dateLabel = formatWindow(item.startDate || item.date, item.endDate || item.date);
    const isClassExam = item.category === "class";

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.titleWrap}>
            <Text style={styles.title}>{item.title || "Exam"}</Text>
            <Text style={styles.meta}>
              {item.className || "N/A"}
              {item.sectionName && item.sectionName !== "All"
                ? ` - ${item.sectionName}`
                : ""}
            </Text>
          </View>

          <View style={[styles.statusPill, isPublished ? styles.published : styles.upcoming]}>
            <Text style={styles.statusText}>
              {isPublished ? "Published" : "Upcoming"}
            </Text>
          </View>
        </View>

        <View style={styles.chipRow}>
          <View style={styles.examTypeChip}>
            <Ionicons name="calendar-outline" size={14} color={COLORS.primary} />
            <Text style={styles.examTypeText}>{formatType(item.examType)}</Text>
          </View>
          {isClassExam ? (
            <View style={styles.examTypeChip}>
              <Ionicons name="book-outline" size={14} color={COLORS.primary} />
              <Text style={styles.examTypeText}>{item.subject || "Subject"}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.infoGrid}>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Date</Text>
            <Text style={styles.infoValue}>{dateLabel}</Text>
          </View>
        </View>

        <View style={styles.statusRow}>
          <View style={[styles.statusPill, isPublished ? styles.published : styles.upcoming]}>
            <Text style={styles.statusText}>
              {isPublished ? "Published" : "Upcoming"}
            </Text>
          </View>
            <Text style={styles.statusHint}>
              {isClassExam
                ? item.totalMarks
                  ? `${item.totalMarks} marks`
                  : "Class exam"
                : item.totalMarks
                  ? `${item.totalMarks} marks`
                  : "School exam"}
            </Text>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;
  }

  if (isError) {
    return (
      <Text style={styles.empty} onPress={refetch}>
        Tap to retry
      </Text>
    );
  }

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.list}
    >
      <View style={styles.tabRow}>
        <Pressable
          onPress={() => setSelectedTab("school")}
          style={({ pressed }) => [
            styles.tabButton,
            selectedTab === "school" && styles.tabButtonActive,
            pressed && styles.tabButtonPressed,
          ]}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === "school" && styles.tabTextActive,
            ]}
          >
            School Exams
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setSelectedTab("class")}
          style={({ pressed }) => [
            styles.tabButton,
            selectedTab === "class" && styles.tabButtonActive,
            pressed && styles.tabButtonPressed,
          ]}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === "class" && styles.tabTextActive,
            ]}
          >
            Class Exams
          </Text>
        </Pressable>
      </View>

      <View style={styles.sectionBlock}>
        {filteredExams.length ? (
          filteredExams.map((item: ExamItem) => (
            <View key={`${selectedTab}-${item.id}`}>{renderItem({ item })}</View>
          ))
        ) : (
          <Text style={styles.emptySection}>
            {selectedTab === "class"
              ? "No class exams yet."
              : "No school exams yet."}
          </Text>
        )}
      </View>
    </ScrollView>
  );
}

export default memo(ExamScreen);

const styles = StyleSheet.create({
  list: {
    paddingBottom: 40,
    paddingTop: 8,
  },
  tabRow: {
    flexDirection: "row",
    gap: 10,
    marginHorizontal: 14,
    marginBottom: 14,
  },
  sectionBlock: {
    marginBottom: 18,
  },
  tabButton: {
    alignItems: "center",
    backgroundColor: "#fff",
    borderColor: "#dbeafe",
    borderRadius: RADIUS.full,
    borderWidth: 1,
    flex: 1,
    justifyContent: "center",
    minHeight: 42,
  },
  tabButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  tabButtonPressed: {
    opacity: 0.92,
  },
  tabText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: "800",
  },
  tabTextActive: {
    color: "#fff",
  },
  card: {
    ...STUDENT_GLAS_CARD,
    ...SHADOWS.card,
    backgroundColor: "#fbfdff",
    borderColor: "#e5eefc",
    borderRadius: RADIUS.xl,
    marginHorizontal: 14,
    marginBottom: 12,
    padding: 16,
  },
  cardHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  titleWrap: {
    flex: 1,
  },
  title: {
    ...TYPOGRAPHY.title,
    color: COLORS.textPrimary,
    fontSize: 18,
  },
  meta: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 4,
  },
  statusPill: {
    borderRadius: RADIUS.full,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  published: {
    backgroundColor: "rgba(34, 197, 94, 0.12)",
  },
  upcoming: {
    backgroundColor: "rgba(245, 158, 11, 0.12)",
  },
  statusText: {
    color: COLORS.textPrimary,
    fontSize: 11,
    fontWeight: "800",
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 14,
  },
  examTypeChip: {
    alignItems: "center",
    backgroundColor: COLORS.primarySoft,
    borderRadius: RADIUS.full,
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  examTypeText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "800",
  },
  infoGrid: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  infoBox: {
    backgroundColor: COLORS.cardMuted,
    borderRadius: RADIUS.lg,
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  infoLabel: {
    color: COLORS.textTertiary,
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  infoValue: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: "800",
    marginTop: 4,
  },
  statusRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginTop: 14,
  },
  statusHint: {
    color: COLORS.textSecondary,
    flex: 1,
    fontSize: 12,
    fontWeight: "700",
    textAlign: "right",
  },
  empty: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginTop: 60,
    textAlign: "center",
  },
  emptySection: {
    color: COLORS.textTertiary,
    fontSize: 12,
    marginHorizontal: 14,
    marginBottom: 10,
    marginTop: 4,
  },
});
