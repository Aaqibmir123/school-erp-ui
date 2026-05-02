import React, { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRoute } from "@react-navigation/native";

import BrandLoader from "@/src/components/BrandLoader";
import FallbackBanner from "@/src/components/FallbackBanner";
import AppInput from "@/src/theme/Input";
import { COLORS, RADIUS, SHADOWS, SPACING } from "@/src/theme";
import {
  useGetAttendanceHistoryQuery,
  useGetResultHistoryQuery,
  useGetMyClassesQuery,
} from "../../api/teacher/teacherApi";

type TabKey = "attendance" | "marks";

type RecordsRouteParams = {
  tab?: TabKey;
  classId?: string;
  sectionId?: string;
  search?: string;
};

const RecordsScreen = () => {
  const route = useRoute<any>();
  const [tab, setTab] = useState<TabKey>("attendance");
  const [search, setSearch] = useState("");
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [selectedSectionId, setSelectedSectionId] = useState<string>("");

  const { data: classes = [] } = useGetMyClassesQuery();

  const classOptions = useMemo(() => {
    const map = new Map<string, any>();

    classes.forEach((item: any) => {
      if (!item?.classId) return;
      if (!map.has(item.classId)) {
        map.set(item.classId, item);
      }
    });

    return Array.from(map.values());
  }, [classes]);

  const selectedClass = useMemo(
    () => classOptions.find((item: any) => item.classId === selectedClassId),
    [classOptions, selectedClassId],
  );

  useEffect(() => {
    const params = (route?.params || {}) as RecordsRouteParams;

    if (params.tab === "attendance" || params.tab === "marks") {
      setTab(params.tab);
    }
    if (typeof params.search === "string") {
      setSearch(params.search);
    }
    if (typeof params.classId === "string") {
      setSelectedClassId(params.classId);
    }
    if (typeof params.sectionId === "string") {
      setSelectedSectionId(params.sectionId);
    }
  }, [route?.params]);

  const attendanceQuery = useGetAttendanceHistoryQuery(
    {
      classId: selectedClassId || undefined,
      sectionId: selectedSectionId || undefined,
      search: search.trim() || undefined,
      page: 1,
      limit: 20,
    },
    { skip: tab !== "attendance" },
  );

  const marksQuery = useGetResultHistoryQuery(
    {
      classId: selectedClassId || undefined,
      sectionId: selectedSectionId || undefined,
      search: search.trim() || undefined,
      page: 1,
      limit: 20,
    },
    { skip: tab !== "marks" },
  );

  const activeQuery = tab === "attendance" ? attendanceQuery : marksQuery;
  const items = activeQuery.data?.data || [];
  const isLoading = activeQuery.isLoading;
  const isError = activeQuery.isError;
  const refetch = activeQuery.refetch;
  const sections = selectedClass?.sections || [];

  if (isLoading) {
    return (
      <View style={styles.center}>
        <BrandLoader />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppInput
        compact
        label="Search"
        placeholder="Name or roll number"
        value={search}
        onChangeText={setSearch}
      />

      <View style={styles.tabRow}>
        {(["attendance", "marks"] as TabKey[]).map((item) => {
          const active = tab === item;

          return (
            <Pressable
              key={item}
              onPress={() => setTab(item)}
              style={[styles.tabChip, active && styles.tabChipActive]}
            >
              <Text style={[styles.tabText, active && styles.tabTextActive]}>
                {item === "attendance" ? "Attendance" : "Marks"}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.filterCard}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          <FilterChip
            label="All classes"
            active={!selectedClassId}
            onPress={() => {
              setSelectedClassId("");
              setSelectedSectionId("");
            }}
          />
          {classOptions.map((item: any) => (
            <FilterChip
              key={item.classId}
              label={item.className}
              active={selectedClassId === item.classId}
              onPress={() => {
                setSelectedClassId(item.classId);
                setSelectedSectionId("");
              }}
            />
          ))}
        </ScrollView>

        {selectedClassId && sections.length ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[styles.filterRow, styles.sectionRow]}
          >
            <FilterChip
              label="All sections"
              active={!selectedSectionId}
              onPress={() => setSelectedSectionId("")}
            />
            {sections.map((section: any) => (
              <FilterChip
                key={section._id}
                label={section.name}
                active={selectedSectionId === section._id}
                onPress={() => setSelectedSectionId(section._id)}
              />
            ))}
          </ScrollView>
        ) : null}
      </View>

      {isError ? (
        <FallbackBanner
          title="Unable to load records"
          subtitle="Try again in a moment."
          actionLabel="Retry"
          onRetry={refetch}
        />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item: any) => item._id}
          renderItem={({ item }) =>
            tab === "attendance" ? (
              <AttendanceRow item={item} />
            ) : (
              <MarkRow item={item} />
            )
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <FallbackBanner
              title="No records found"
              subtitle="Use filters or search to narrow down history."
            />
          }
        />
      )}
    </View>
  );
};

const FilterChip = ({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) => (
  <Pressable
    onPress={onPress}
    style={[styles.filterChip, active && styles.filterChipActive]}
  >
    <Text style={[styles.filterText, active && styles.filterTextActive]}>
      {label}
    </Text>
  </Pressable>
);

const AttendanceRow = ({ item }: any) => {
  const student = item.studentId || {};
  const subject = item.subjectId || {};
  const period = item.periodId || {};
  const mode = String(item.mode || "AUTO").toUpperCase();

  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.cardMain}>
          <Text style={styles.cardTitle}>
            {student.firstName || "Student"} {student.lastName || ""}
          </Text>
          <Text style={styles.cardSub}>
            Roll #{student.rollNumber || "N/A"}
          </Text>
        </View>

        <View
          style={[
            styles.badge,
            item.status === "PRESENT" ? styles.presentBadge : styles.absentBadge,
          ]}
        >
          <Text style={styles.badgeText}>{item.status}</Text>
        </View>
      </View>

      <Text style={styles.meta}>
        {subject.name || "Subject"} • {period.startTime || "--:--"} -{" "}
        {period.endTime || "--:--"}
      </Text>
      <Text style={styles.meta}>
        {item.date} • {mode}
        {item.reason ? ` • ${item.reason}` : ""}
      </Text>
    </View>
  );
};

const MarkRow = ({ item }: any) => {
  const student = item.studentId || {};
  const subject = item.subjectId || {};
  const exam = item.examId || {};

  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.cardMain}>
          <Text style={styles.cardTitle}>
            {student.firstName || "Student"} {student.lastName || ""}
          </Text>
          <Text style={styles.cardSub}>
            Roll #{item.rollNumberSnapshot || student.rollNumber || "N/A"}
          </Text>
        </View>

        <View style={styles.marksBadge}>
          <Text style={styles.marksBadgeText}>
            {item.marksObtained ?? "-"} / {exam.totalMarks ?? "-"}
          </Text>
        </View>
      </View>

      <Text style={styles.meta}>
        {subject.name || "Subject"} • {exam.name || "Exam"}
      </Text>
      <Text style={styles.meta}>
        {(exam.examType || "Test").toUpperCase()} •{" "}
        {item.createdAt?.slice(0, 10) || ""}
      </Text>
    </View>
  );
};

export default RecordsScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },
  tabRow: {
    flexDirection: "row",
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
    marginTop: SPACING.sm,
  },
  tabChip: {
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  tabChipActive: {
    backgroundColor: COLORS.primarySoft,
    borderColor: COLORS.primary,
  },
  tabText: {
    color: COLORS.textSecondary,
    fontWeight: "700",
  },
  tabTextActive: {
    color: COLORS.primary,
  },
  filterCard: {
    ...SHADOWS.soft,
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    marginBottom: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  filterRow: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  sectionRow: {
    paddingTop: 0,
  },
  filterChip: {
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
  },
  filterChipActive: {
    backgroundColor: COLORS.primarySoft,
    borderColor: COLORS.primary,
  },
  filterText: {
    color: COLORS.textSecondary,
    fontWeight: "700",
  },
  filterTextActive: {
    color: COLORS.primary,
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
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cardMain: {
    flex: 1,
    paddingRight: SPACING.sm,
  },
  cardTitle: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: "800",
  },
  cardSub: {
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  meta: {
    color: COLORS.textTertiary,
    marginTop: SPACING.xs,
  },
  badge: {
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
  },
  presentBadge: {
    backgroundColor: COLORS.success,
  },
  absentBadge: {
    backgroundColor: COLORS.danger,
  },
  badgeText: {
    color: COLORS.textInverse,
    fontSize: 12,
    fontWeight: "800",
  },
  marksBadge: {
    backgroundColor: COLORS.primarySoft,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
  },
  marksBadgeText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "800",
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: SPACING.xxl,
    paddingTop: SPACING.sm,
  },
  center: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
});
