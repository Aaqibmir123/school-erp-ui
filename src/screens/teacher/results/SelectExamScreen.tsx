import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useMemo } from "react";
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";

import BrandLoader from "@/src/components/BrandLoader";
import FallbackBanner from "@/src/components/FallbackBanner";
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from "@/src/theme";
import { useGetMyExamsQuery } from "../../../api/teacher/teacherApi";

const formatExamType = (value?: string) => {
  if (!value) return "Exam";

  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const SelectExamScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const mode = route.params?.mode;

  const { data: exams = [], isLoading, isFetching, isError, refetch } = useGetMyExamsQuery();

  const title = useMemo(() => {
    return mode === "view" ? "View Results" : "Enter Marks";
  }, [mode]);

  const subtitle = useMemo(() => {
    return mode === "view"
      ? "Open an exam to review recorded results."
      : "Choose an exam to enter student marks.";
  }, [mode]);

  const handleSelect = (exam: any) => {
    if (mode === "view") {
      navigation.navigate("ResultList", { exam });
    } else {
      navigation.navigate("EnterMarks", { exam });
    }
  };

  const renderItem = ({ item }: any) => {
    const className =
      item.classIds?.map((classItem: any) => classItem?.name).filter(Boolean).join(", ") ||
      "All classes";
    const sectionName = item.sectionId?.name || "All sections";
    const subjectName = item.subjectId?.name || "General";

    return (
      <Pressable
        onPress={() => handleSelect(item)}
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      >
        <View style={styles.cardTop}>
          <View style={styles.cardIcon}>
            <Ionicons name="school-outline" size={18} color={COLORS.primary} />
          </View>

          <View style={styles.cardTitleWrap}>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.cardSub}>
              {formatExamType(item.examType)} • {item.totalMarks || 0} marks
            </Text>
          </View>

          <View style={styles.badge}>
            <Text style={styles.badgeText}>{formatExamType(item.examType)}</Text>
          </View>
        </View>

        <View style={styles.metaGrid}>
          <MetaChip label="Class" value={className} />
          <MetaChip label="Section" value={sectionName} />
          <MetaChip label="Subject" value={subjectName} />
          <MetaChip label="Date" value={item.date?.slice(0, 10) || "--"} />
        </View>
      </Pressable>
    );
  };

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
      <Text style={styles.subtitle}>{subtitle}</Text>

      {isError ? (
        <FallbackBanner
          title="Unable to load exams"
          subtitle="Please try again."
          actionLabel="Retry"
          onRetry={refetch}
        />
      ) : (
        <FlatList
          data={exams}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={isFetching} onRefresh={refetch} />
          }
          ListEmptyComponent={
            <FallbackBanner
              title="No exams found"
              subtitle="Create an exam first to continue."
            />
          }
        />
      )}
    </View>
  );
};

const MetaChip = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.metaChip}>
    <Text style={styles.metaLabel}>{label}</Text>
    <Text style={styles.metaValue} numberOfLines={1}>
      {value}
    </Text>
  </View>
);

export default SelectExamScreen;

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
  cardPressed: {
    opacity: 0.95,
    transform: [{ scale: 0.995 }],
  },
  cardTop: {
    alignItems: "flex-start",
    flexDirection: "row",
  },
  cardIcon: {
    alignItems: "center",
    backgroundColor: COLORS.primarySoft,
    borderRadius: RADIUS.full,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  cardTitleWrap: {
    flex: 1,
    paddingHorizontal: SPACING.sm,
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
  badge: {
    alignItems: "center",
    backgroundColor: COLORS.primarySoft,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
  },
  badgeText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "800",
  },
  metaGrid: {
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
