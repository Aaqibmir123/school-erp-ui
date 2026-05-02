import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useGetStudentHomeworkListQuery } from "../../../api/student/student.api";
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from "@/src/theme";
import { STUDENT_GLAS_CARD, STUDENT_THEME } from "../studentTheme";

const formatDate = (date: string) => {
  if (!date) return "-";
  const d = new Date(date);
  return `${d.getDate()} ${d.toLocaleString("default", {
    month: "short",
  })}`;
};

const HomeworkListScreen = () => {
  const navigation = useNavigation<any>();
  const [filter, setFilter] = useState<"homework" | "reviewed">("homework");

  const {
    data = [],
    isLoading,
    isError,
    refetch,
  } = useGetStudentHomeworkListQuery({});

  const homeworkList = useMemo(() => data || [], [data]);

  const filteredHomeworkList = useMemo(
    () =>
      filter === "reviewed"
        ? homeworkList.filter((item: any) => item.reviewStatus === "REVIEWED")
        : homeworkList,
    [filter, homeworkList],
  );

  const renderItem = useCallback(({ item }: any) => {
    const label =
      item.sectionName === "All"
        ? item.className
        : `${item.className} - ${item.sectionName}`;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate("StudentHomeworkDetails", { item })}
        activeOpacity={0.85}
      >
        <View style={styles.header}>
          <View style={styles.titleWrap}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subject}>{item.subject}</Text>
          </View>
        </View>

        <Text style={styles.meta}>{label}</Text>
        <Text style={styles.teacher}>Teacher: {item.teacher}</Text>

        <View style={styles.footer}>
          <Text style={styles.meta}>Created: {formatDate(item.createdAt)}</Text>
          <Text style={styles.meta}>Due: {formatDate(item.dueDate)}</Text>
        </View>

        {item.maxMarks > 0 && (
          <View style={styles.marksPill}>
            <Text style={styles.marksText}>Max {item.maxMarks}</Text>
          </View>
        )}

      </TouchableOpacity>
    );
  }, [navigation]);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (isError) {
    return (
      <TouchableOpacity style={styles.center} onPress={refetch} activeOpacity={0.8}>
        <Ionicons name="refresh" size={24} color={COLORS.primary} />
        <Text style={styles.empty}>Tap to retry</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={STUDENT_THEME.heroGradient} style={styles.headerBg}>
        <Text style={styles.headerEyebrow}>Homework</Text>
        <Text style={styles.headerText}>Homework</Text>
        <Text style={styles.headerSub}>All homework is here.</Text>
      </LinearGradient>

      <View style={styles.filterRow}>
        <Pressable
          onPress={() => setFilter("homework")}
          style={({ pressed }) => [
            styles.filterChip,
            filter === "homework" && styles.filterChipActive,
            pressed && styles.filterChipPressed,
          ]}
        >
          <Text
            style={[
              styles.filterText,
              filter === "homework" && styles.filterTextActive,
            ]}
          >
            Homework
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setFilter("reviewed")}
          style={({ pressed }) => [
            styles.filterChip,
            filter === "reviewed" && styles.filterChipActive,
            pressed && styles.filterChipPressed,
          ]}
        >
          <Text
            style={[
              styles.filterText,
              filter === "reviewed" && styles.filterTextActive,
            ]}
          >
            Reviewed
          </Text>
        </Pressable>
      </View>

      <FlatList
        data={filteredHomeworkList}
        keyExtractor={(item, index) => String(item.id || item._id || index)}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        initialNumToRender={6}
        maxToRenderPerBatch={8}
        windowSize={5}
        removeClippedSubviews
        updateCellsBatchingPeriod={50}
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <Ionicons name="book-outline" size={30} color={COLORS.primary} />
            <Text style={styles.empty}>No homework found</Text>
          </View>
        }
      />
    </View>
  );
};

export default HomeworkListScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: STUDENT_THEME.background,
    flex: 1,
  },
  headerBg: {
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingBottom: 24,
    paddingHorizontal: 16,
    paddingTop: 30,
  },
  headerEyebrow: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  headerText: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "900",
    marginTop: 2,
  },
  headerSub: {
    color: "rgba(255,255,255,0.84)",
    marginTop: 4,
  },
  filterChip: {
    alignItems: "center",
    backgroundColor: "#fff",
    borderColor: "#D6E4FF",
    borderRadius: RADIUS.full,
    borderWidth: 1,
    flex: 1,
    justifyContent: "center",
    minHeight: 42,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterChipPressed: {
    opacity: 0.95,
  },
  filterRow: {
    flexDirection: "row",
    gap: 10,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
  },
  filterText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: "800",
  },
  filterTextActive: {
    color: "#fff",
  },
  listContent: {
    paddingBottom: SPACING.xxl,
    paddingHorizontal: SPACING.lg,
    paddingTop: 14,
  },
  card: {
    ...STUDENT_GLAS_CARD,
    ...SHADOWS.card,
    borderRadius: RADIUS.xl,
    marginBottom: SPACING.md,
    padding: SPACING.lg,
  },
  header: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: SPACING.md,
  },
  titleWrap: {
    flex: 1,
    paddingRight: SPACING.sm,
  },
  title: {
    ...TYPOGRAPHY.title,
    color: COLORS.textPrimary,
    fontSize: 17,
  },
  subject: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  meta: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textTertiary,
    marginTop: SPACING.sm,
  },
  teacher: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  badge: {
    borderRadius: RADIUS.full,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  active: {
    backgroundColor: COLORS.successSoft,
  },
  expired: {
    backgroundColor: COLORS.dangerSoft,
  },
  pending: {
    backgroundColor: COLORS.warningSoft,
  },
  reviewed: {
    backgroundColor: COLORS.successSoft,
  },
  badgeText: {
    color: COLORS.textPrimary,
    fontSize: 11,
    fontWeight: "800",
  },
  marksPill: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.primaryLight,
    borderRadius: RADIUS.full,
    marginTop: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  marksText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "800",
  },
  center: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  empty: {
    color: COLORS.textTertiary,
    marginTop: 10,
  },
  emptyCard: {
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    marginTop: 20,
    paddingVertical: 28,
  },
});
