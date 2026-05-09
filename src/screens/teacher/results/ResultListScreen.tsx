import { useRoute } from "@react-navigation/native";
import React, { useMemo } from "react";
import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";

import BrandLoader from "@/src/components/BrandLoader";
import FallbackBanner from "@/src/components/FallbackBanner";
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from "@/src/theme";
import { useGetResultsByExamQuery } from "../../../api/teacher/teacherApi";

const ResultListScreen = () => {
  const route = useRoute<any>();
  const exam = route.params?.exam;
  const examId = exam?._id;

  const { data: results = [], isLoading, isFetching, isError, refetch } =
    useGetResultsByExamQuery(
      { examId },
      {
        skip: !examId,
      },
    );

  const title = useMemo(() => exam?.name || "Results", [exam]);
  const className = useMemo(() => {
    return (
      exam?.classIds?.map((item: any) => item?.name).filter(Boolean).join(", ") ||
      "All classes"
    );
  }, [exam]);

  const sectionName = useMemo(
    () => exam?.sectionId?.name || "All sections",
    [exam],
  );

  const subjectName = useMemo(
    () => exam?.subjectId?.name || "General",
    [exam],
  );

  if (isLoading) {
    return (
      <View style={styles.center}>
        <BrandLoader />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.kicker}>Results</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>
        {className} • {sectionName} • {subjectName}
      </Text>

      {isError ? (
        <FallbackBanner
          title="Unable to load results"
          subtitle="Try again in a moment."
          actionLabel="Retry"
          onRetry={refetch}
        />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item: any) => item._id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={isFetching} onRefresh={refetch} />
          }
          ListEmptyComponent={
            <FallbackBanner
              title="No results yet"
              subtitle="Enter marks first to see students here."
            />
          }
          renderItem={({ item }: any) => {
            const student = item.studentId || {};

            return (
              <View style={styles.card}>
                <View style={styles.cardTop}>
                  <View style={styles.rollBadge}>
                    <Text style={styles.rollText}>
                      #{item.rollNumberSnapshot || student.rollNumber || "N/A"}
                    </Text>
                  </View>

                  <View style={styles.marksBadge}>
                    <Text style={styles.marksText}>
                      {item.marksObtained ?? "-"} / {item.totalMarks ?? "-"}
                    </Text>
                  </View>
                </View>

                <Text style={styles.studentName}>
                  {student.firstName || "Student"} {student.lastName || ""}
                </Text>

                <View style={styles.metaRow}>
                  <Meta label="Class" value={student.classId?.name || className} />
                  <Meta
                    label="Section"
                    value={student.sectionId?.name || sectionName}
                  />
                  <Meta label="Subject" value={item.subjectId?.name || subjectName} />
                  <Meta label="Type" value={exam?.examType || "Exam"} />
                </View>
              </View>
            );
          }}
        />
      )}
    </View>
  );
};

const Meta = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.metaChip}>
    <Text style={styles.metaLabel}>{label}</Text>
    <Text style={styles.metaValue} numberOfLines={1}>
      {value}
    </Text>
  </View>
);

export default ResultListScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  center: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  kicker: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  title: {
    ...TYPOGRAPHY.sectionTitle,
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  subtitle: {
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  listContent: {
    paddingBottom: SPACING.xxl,
    paddingTop: SPACING.md,
  },
  card: {
    ...SHADOWS.soft,
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    marginBottom: SPACING.md,
    padding: SPACING.lg,
  },
  cardTop: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  rollBadge: {
    backgroundColor: COLORS.primarySoft,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
  },
  rollText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "800",
  },
  marksBadge: {
    backgroundColor: COLORS.successSoft,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
  },
  marksText: {
    color: COLORS.success,
    fontSize: 12,
    fontWeight: "800",
  },
  studentName: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: "800",
    marginTop: SPACING.sm,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  metaChip: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    flexBasis: "48%",
    padding: SPACING.sm,
  },
  metaLabel: {
    color: COLORS.textTertiary,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  metaValue: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: "700",
    marginTop: 2,
  },
});
