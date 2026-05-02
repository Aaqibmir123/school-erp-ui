import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/src/context/AuthContext";
import { useGetClassTestRecordsQuery } from "@/src/api/student/student.api";
import { COLORS, RADIUS, SHADOWS, SPACING } from "@/src/theme";
import { RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";

type ClassTestRecord = {
  createdAt?: string;
  examName?: string;
  examType?: string;
  feedback?: string;
  marks?: number;
  subject?: string;
  teacherName?: string;
  totalMarks?: number;
  updatedAt?: string;
};

const formatDate = (value?: string) => {
  if (!value) return "Recently";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

export default function StudentTestRecordsScreen() {
  const { selectedStudent } = useAuth();

  const {
    data: classTestRecords = [],
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetClassTestRecordsQuery(
    { studentId: selectedStudent?._id! },
    { skip: !selectedStudent?._id },
  );

  if (!selectedStudent?._id) {
    return (
      <View style={styles.emptyWrap}>
        <Text style={styles.empty}>Student not selected.</Text>
      </View>
    );
  }

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={isFetching || isLoading}
          onRefresh={refetch}
          tintColor={COLORS.primary}
        />
      }
    >
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>Records</Text>
        <Text style={styles.title}>Test Records</Text>
        <Text style={styles.heroNote}>Simple class test and unit test entries only.</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Teacher records only</Text>
        </View>

        {isError ? (
          <View style={styles.emptyState}>
            <Ionicons name="alert-circle-outline" size={28} color={COLORS.primary} />
            <Text style={styles.emptyTitle}>Unable to load records</Text>
            <Text style={styles.emptyText}>Please try refreshing in a moment.</Text>
          </View>
        ) : !classTestRecords.length ? (
          <View style={styles.emptyState}>
            <Ionicons name="reader-outline" size={28} color={COLORS.primary} />
            <Text style={styles.emptyTitle}>No test records yet</Text>
            <Text style={styles.emptyText}>
              When class test or unit test marks are saved, they will appear here.
            </Text>
          </View>
        ) : (
          classTestRecords.map((item: ClassTestRecord, index: number) => {
            const examLabel = item.examType?.replace(/_/g, " ") || "Class test";
            const marksText = `${item.marks ?? 0}/${item.totalMarks || 0}`;

            return (
              <View key={`${item.examName || "record"}-${index}`} style={styles.recordCard}>
                <View style={styles.recordHead}>
                  <View style={styles.recordHeadText}>
                    <Text style={styles.recordName}>{item.examName || "Test"}</Text>
                    <Text style={styles.teacherText}>
                      Teacher: {item.teacherName || "N/A"}
                    </Text>
                  </View>

                  <View style={styles.scorePill}>
                    <Text style={styles.scoreText}>{marksText}</Text>
                  </View>
                </View>

                <View style={styles.chipRow}>
                  <View style={styles.chipSoft}>
                    <Text style={styles.chipSoftText}>Created: {formatDate(item.createdAt)}</Text>
                  </View>
                  <View style={styles.chipSoft}>
                    <Text style={styles.chipSoftText}>Updated: {formatDate(item.updatedAt)}</Text>
                  </View>
                  <View style={styles.chip}>
                    <Text style={styles.chipText}>{examLabel}</Text>
                  </View>
                </View>

                {item.feedback ? <Text style={styles.feedback}>{item.feedback}</Text> : null}
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  card: {
    ...SHADOWS.card,
    backgroundColor: "#fff",
    borderColor: "#e5eefc",
    borderRadius: RADIUS.xl,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    padding: SPACING.md,
  },
  chip: {
    backgroundColor: "rgba(79,70,229,0.10)",
    borderRadius: RADIUS.full,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 10,
  },
  chipSoft: {
    backgroundColor: "#F3F4F6",
    borderRadius: RADIUS.full,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  chipSoftText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: "700",
  },
  chipText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: "800",
  },
  container: {
    backgroundColor: "#F4F8FF",
    paddingBottom: SPACING.xxl,
  },
  empty: {
    color: COLORS.textSecondary,
    fontSize: 14,
    textAlign: "center",
  },
  emptyState: {
    alignItems: "center",
    backgroundColor: "#F8FBFF",
    borderColor: "#E5EEFC",
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    gap: 8,
    padding: 18,
  },
  emptyText: {
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  emptyTitle: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: "800",
  },
  emptyWrap: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  eyebrow: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  feedback: {
    color: COLORS.textSecondary,
    marginTop: 10,
  },
  hero: {
    backgroundColor: COLORS.primary,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingBottom: 22,
    paddingHorizontal: 16,
    paddingTop: 28,
  },
  heroNote: {
    color: "rgba(255,255,255,0.78)",
    fontSize: 13,
    marginTop: 6,
  },
  recordCard: {
    ...SHADOWS.soft,
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    marginTop: 12,
    padding: 14,
  },
  recordHead: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  recordHeadText: {
    flex: 1,
    paddingRight: 10,
  },
  recordName: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: "900",
  },
  teacherText: {
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  scorePill: {
    backgroundColor: COLORS.primarySoft,
    borderRadius: RADIUS.full,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  scoreText: {
    color: COLORS.primary,
    fontWeight: "900",
  },
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitle: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: "900",
  },
  title: {
    color: "#fff",
    fontSize: 25,
    fontWeight: "900",
    marginTop: 2,
  },
});
