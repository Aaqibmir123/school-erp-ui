import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import { memo, type ReactNode } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useGetDashboardQuery } from "@/src/api/student/student.api";
import BrandLoader from "@/src/components/BrandLoader";
import DashboardGrid from "@/src/screens/student/dashboard/components/DashboardGrid";
import FallbackBanner from "@/src/components/FallbackBanner";
import { useAuth } from "@/src/context/AuthContext";
import { APP_ENV } from "@/src/config/env";
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from "@/src/theme";
import { STUDENT_GLAS_CARD, STUDENT_THEME } from "../studentTheme";

type DashboardData = {
  attendance?: {
    absent?: number;
    percentage?: number;
    present?: number;
    todayStatus?: "PRESENT" | "ABSENT" | "N/A";
  };
  className?: string;
  nextClass?: {
    endTime?: string;
    startTime?: string;
    subject?: string;
    teacher?: string;
  } | null;
  sectionName?: string;
  stats?: {
    activeHomeworkCount?: number;
    pendingFeeCount?: number;
    upcomingExamCount?: number;
  };
  rollNumber?: number | null;
  studentName?: string;
};

const resolveImageUri = (image?: string | null) => {
  if (!image) return null;
  if (/^https?:\/\//i.test(image)) return image;
  return `${APP_ENV.SERVER_URL}${image.startsWith("/") ? "" : "/"}${image}`;
};

const InfoCard = ({
  icon,
  title,
  subtitle,
  children,
  onPress,
  tone = COLORS.primary,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  children?: ReactNode;
  onPress?: () => void;
  subtitle?: string;
  title: string;
  tone?: string;
}) => {
  const content = (
    <>
      <View style={styles.infoHeader}>
        <View style={[styles.infoIcon, { backgroundColor: `${tone}18` }]}>
          <Ionicons name={icon} size={18} color={tone} />
        </View>

        <View style={styles.infoTitleWrap}>
          <Text style={styles.infoTitle}>{title}</Text>
          {subtitle ? <Text style={styles.infoSubtitle}>{subtitle}</Text> : null}
        </View>

        {onPress ? (
          <Ionicons name="chevron-forward" size={18} color={COLORS.textTertiary} />
        ) : null}
      </View>

      {children}
    </>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.infoCard, pressed && styles.pressed]}
      >
        {content}
      </Pressable>
    );
  }

  return <View style={styles.infoCard}>{content}</View>;
};

function StudentDashboardScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { selectedStudent } = useAuth();
  const studentId = selectedStudent?._id;

  const {
    data: dashboard,
    isLoading: dashboardLoading,
    isFetching: dashboardFetching,
    isError: dashboardError,
    refetch: refetchDashboard,
  } = useGetDashboardQuery(
    { studentId: studentId! },
    { skip: !studentId },
  );

  const dashboardData = (dashboard || {}) as DashboardData;

  const avatarUri = resolveImageUri(
    selectedStudent?.profileImage || selectedStudent?.image,
  );
  const selectedClassName =
    typeof selectedStudent?.classId === "object"
      ? selectedStudent?.classId?.name
      : "";
  const selectedSectionName =
    typeof selectedStudent?.sectionId === "object"
      ? selectedStudent?.sectionId?.name
      : "";
  const classLabel =
    dashboardData.className && dashboardData.sectionName
      ? `${dashboardData.className} - ${dashboardData.sectionName}`
      : dashboardData.className ||
        dashboardData.sectionName ||
        [selectedClassName, selectedSectionName].filter(Boolean).join(" - ") ||
        "Student";
  const rollNumber =
    dashboardData.rollNumber ?? selectedStudent?.rollNumber ?? null;
  const refreshAll = async () => {
    await refetchDashboard();
  };

  if (dashboardLoading && !dashboard) {
    return (
      <View style={styles.centeredState}>
        <BrandLoader />
      </View>
    );
  }

  if (dashboardError) {
    return (
      <View style={styles.centeredState}>
        <FallbackBanner
          title="Unable to load student home"
          subtitle="Pull down to refresh or try again in a moment."
          actionLabel="Retry"
          onRetry={refreshAll}
        />
      </View>
    );
  }

  return (
    <ScrollView
      refreshControl={
        <RefreshControl
          refreshing={dashboardFetching}
          onRefresh={refreshAll}
          tintColor={COLORS.primary}
        />
      }
      contentContainerStyle={[
        styles.container,
        { paddingBottom: insets.bottom + 120 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <LinearGradient colors={STUDENT_THEME.heroGradient} style={styles.hero}>
        <View style={styles.heroBadge}>
          <Ionicons name="sparkles-outline" size={14} color="#fff" />
          <Text style={styles.heroBadgeText}>Student profile</Text>
        </View>

        <View style={styles.profileRow}>
          <View style={styles.avatarWrap}>
            {avatarUri ? (
              <Image
                source={{ uri: avatarUri }}
                style={styles.avatar}
                contentFit="cover"
              />
            ) : (
              <View style={styles.avatarFallback}>
                <Ionicons name="person" size={24} color={COLORS.primary} />
              </View>
            )}
          </View>

          <View style={styles.profileTextWrap}>
            <Text style={styles.heroName}>
              {dashboardData.studentName || selectedStudent?.firstName || "Student"}
            </Text>
            <Text style={styles.heroClass}>{classLabel}</Text>
            <View style={styles.heroMetaRow}>
              <View style={styles.metaPill}>
              <Ionicons name="id-card-outline" size={14} color="#fff" />
              <Text style={styles.metaPillText}>
                  Roll #{rollNumber ?? "N/A"}
              </Text>
              </View>

              <View style={styles.metaPill}>
                <Ionicons name="person-outline" size={14} color="#fff" />
                <Text style={styles.metaPillText}>Active profile</Text>
              </View>
            </View>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick access</Text>
        <DashboardGrid />
      </View>

      <View style={styles.section}>
        <InfoCard
          icon="bus-outline"
          title="Bus tracking"
          subtitle="Coming later"
          tone={COLORS.info}
        >
          <View style={styles.busHeader}>
            <View style={styles.busBadge}>
              <Ionicons name="radio-outline" size={14} color={COLORS.info} />
              <Text style={styles.busBadgeText}>Future</Text>
            </View>
            <Text style={styles.busEta}>Disabled</Text>
          </View>

          <View style={styles.busRoute}>
            <View style={styles.busStop}>
              <View style={[styles.busDot, styles.busDotActive]} />
              <Text style={styles.busStopText}>School depot</Text>
            </View>
            <View style={styles.busLine} />
            <View style={styles.busStop}>
              <View style={styles.busDot} />
              <Text style={styles.busStopText}>Your stop</Text>
            </View>
          </View>

          <View style={styles.busFooter}>
            <Text style={styles.cardBody}>Feature not active yet</Text>
            <View style={styles.busIncomingPill}>
              <Text style={styles.busIncomingText}>Demo</Text>
            </View>
          </View>
        </InfoCard>
      </View>
    </ScrollView>
  );
}

export default memo(StudentDashboardScreen);

const styles = StyleSheet.create({
  centeredState: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  cardBody: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginTop: 6,
  },
  container: {
    backgroundColor: "#f6faff",
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },
  feeBanner: {
    ...STUDENT_GLAS_CARD,
    ...SHADOWS.soft,
    backgroundColor: "#fbfdff",
    borderColor: "#e5eefc",
    alignItems: "center",
    borderRadius: RADIUS.xl,
    flexDirection: "row",
    padding: SPACING.lg,
  },
  feeBannerPressed: {
    opacity: 0.94,
    transform: [{ scale: 0.99 }],
  },
  feeIcon: {
    alignItems: "center",
    backgroundColor: COLORS.warningSoft,
    borderRadius: RADIUS.full,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  feeSubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  feeTextWrap: {
    flex: 1,
    marginHorizontal: SPACING.md,
  },
  feeTitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.textPrimary,
    fontWeight: "800",
  },
  hero: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.xl,
    marginBottom: SPACING.lg,
    overflow: "hidden",
    padding: SPACING.md,
  },
  heroBadge: {
    alignSelf: "flex-start",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: RADIUS.full,
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  heroBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "800",
  },
  heroClass: {
    color: "rgba(255,255,255,0.88)",
    fontSize: 14,
    fontWeight: "700",
    marginTop: 4,
  },
  heroMetaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  heroName: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "900",
  },
  infoCard: {
    ...STUDENT_GLAS_CARD,
    ...SHADOWS.card,
    backgroundColor: "#fbfdff",
    borderColor: "#e5eefc",
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
  },
  infoHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: SPACING.md,
  },
  infoIcon: {
    alignItems: "center",
    borderRadius: RADIUS.full,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  infoSubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textTertiary,
    marginTop: 3,
  },
  infoTitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.textPrimary,
    fontWeight: "800",
  },
  infoTitleWrap: {
    flex: 1,
  },
  metaPill: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.16)",
    borderRadius: RADIUS.full,
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  metaPillText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  metaPillWarning: {
    backgroundColor: "rgba(251, 191, 36, 0.25)",
  },
  pressed: {
    opacity: 0.95,
    transform: [{ scale: 0.99 }],
  },
  profileRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: SPACING.sm,
    marginTop: 2,
  },
  profileTextWrap: {
    flex: 1,
  },
  progressBadge: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.16)",
    borderRadius: RADIUS.full,
    minWidth: 74,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  progressBadgeLabel: {
    color: "rgba(255,255,255,0.84)",
    fontSize: 11,
    fontWeight: "700",
    marginTop: 2,
  },
  progressBadgeValue: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "900",
  },
  resultExam: {
    ...TYPOGRAPHY.title,
    color: COLORS.textPrimary,
    fontSize: 18,
  },
  resultExamType: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "800",
    marginTop: 4,
    textTransform: "capitalize",
  },
  resultGrade: {
    color: COLORS.success,
    fontSize: 12,
    fontWeight: "800",
  },
  resultLeft: {
    flex: 1,
  },
  resultMeta: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: "600",
  },
  resultMetaRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  resultRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: SPACING.md,
    marginTop: 12,
  },
  resultScore: {
    alignItems: "center",
    backgroundColor: COLORS.primaryLight,
    borderRadius: RADIUS.full,
    height: 58,
    justifyContent: "center",
    width: 58,
  },
  resultScoreText: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: "900",
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    ...TYPOGRAPHY.title,
    color: COLORS.textPrimary,
    fontSize: 18,
    marginBottom: SPACING.md,
  },
  busBadge: {
    alignItems: "center",
    backgroundColor: "rgba(59, 130, 246, 0.08)",
    borderRadius: RADIUS.full,
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  busBadgeText: {
    color: COLORS.info,
    fontSize: 12,
    fontWeight: "800",
  },
  busDot: {
    backgroundColor: COLORS.border,
    borderRadius: RADIUS.full,
    height: 10,
    width: 10,
  },
  busDotActive: {
    backgroundColor: COLORS.info,
  },
  busEta: {
    color: COLORS.info,
    fontSize: 13,
    fontWeight: "800",
  },
  busFooter: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: SPACING.md,
  },
  busHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  busIncomingPill: {
    backgroundColor: "rgba(59, 130, 246, 0.08)",
    borderRadius: RADIUS.full,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  busIncomingText: {
    color: COLORS.info,
    fontSize: 11,
    fontWeight: "800",
  },
  busLine: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 999,
    flex: 1,
    height: 3,
    marginHorizontal: 10,
  },
  busRoute: {
    alignItems: "center",
    flexDirection: "row",
    marginTop: SPACING.md,
  },
  busStop: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  busStopText: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: "700",
  },
  avatar: {
    borderRadius: RADIUS.full,
    height: 56,
    width: 56,
  },
  avatarFallback: {
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: RADIUS.full,
    height: 56,
    justifyContent: "center",
    width: 56,
  },
  avatarWrap: {
    borderColor: "rgba(255,255,255,0.32)",
    borderRadius: RADIUS.full,
    borderWidth: 2,
    padding: 2,
  },
});
