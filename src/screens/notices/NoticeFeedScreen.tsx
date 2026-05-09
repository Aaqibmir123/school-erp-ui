import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useMemo } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { useGetNoticeFeedQuery, type NoticeFeedItem } from "@/src/api/notice/notice.api";
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from "@/src/theme";

type NoticeTone = {
  label: string;
  tone: string;
  icon: keyof typeof Ionicons.glyphMap;
};

const classifyNotice = (notice: NoticeFeedItem): NoticeTone => {
  const text = `${notice.title} ${notice.body} ${notice.audience}`.toLowerCase();

  if (/(holiday|vacation|closed|festival|leave|off)/i.test(text)) {
    return { label: "Holiday", tone: COLORS.warning, icon: "moon-outline" };
  }

  if (/(urgent|important|immediate|alert)/i.test(text)) {
    return { label: "Urgent", tone: COLORS.danger, icon: "alert-circle-outline" };
  }

  if (/(exam|test|paper|assessment|result)/i.test(text)) {
    return { label: "Academic", tone: COLORS.primary, icon: "school-outline" };
  }

  return { label: "Notice", tone: COLORS.info, icon: "notifications-outline" };
};

const formatDate = (value?: string) => {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export default function NoticeFeedScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  const { data: notices = [], isLoading, isError, refetch } = useGetNoticeFeedQuery();

  const sortedNotices = useMemo(
    () => [...notices].sort((a, b) => {
      const aTime = new Date(a.createdAt || 0).getTime();
      const bTime = new Date(b.createdAt || 0).getTime();
      return bTime - aTime;
    }),
    [notices],
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
          hitSlop={12}
        >
          <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
        </Pressable>

        <View style={styles.headerTitleWrap}>
          <Text style={styles.title}>Notices</Text>
          <Text style={styles.subtitle}>Holiday, exam, and school updates.</Text>
        </View>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
        contentContainerStyle={[
          styles.container,
          { paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={styles.centered}>
            <ActivityIndicator color={COLORS.primary} />
            <Text style={styles.loadingText}>Loading notices...</Text>
          </View>
        ) : null}

        {isError ? (
          <View style={styles.emptyState}>
            <Ionicons name="alert-circle-outline" size={28} color={COLORS.warning} />
            <Text style={styles.emptyTitle}>Unable to load notices</Text>
            <Text style={styles.emptySubtitle}>
              Pull to refresh or try again in a moment.
            </Text>
          </View>
        ) : null}

        {!isLoading && !isError && sortedNotices.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="notifications-off-outline" size={28} color={COLORS.textTertiary} />
            <Text style={styles.emptyTitle}>No notices yet</Text>
            <Text style={styles.emptySubtitle}>
              School notices will appear here when admin publishes them.
            </Text>
          </View>
        ) : null}

        {sortedNotices.map((notice) => {
          const tone = classifyNotice(notice);
          return (
            <View key={notice._id} style={styles.card}>
              <View style={styles.cardTopRow}>
                <View style={[styles.tonePill, { backgroundColor: `${tone.tone}18` }]}>
                  <Ionicons name={tone.icon} size={14} color={tone.tone} />
                  <Text style={[styles.toneText, { color: tone.tone }]}>
                    {tone.label}
                  </Text>
                </View>

                <View style={styles.audiencePill}>
                  <Text style={styles.audienceText}>{notice.audience}</Text>
                </View>
              </View>

              <Text style={styles.cardTitle}>{notice.title}</Text>
              <Text style={styles.cardBody}>{notice.body}</Text>

              <View style={styles.cardFooter}>
                <Text style={styles.dateText}>{formatDate(notice.createdAt)}</Text>
                {notice.createdByRole ? (
                  <Text style={styles.roleText}>
                    {notice.createdByRole.replace(/_/g, " ")}
                  </Text>
                ) : null}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  backBtn: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.92)",
    borderColor: COLORS.border,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  headerTitleWrap: {
    flex: 1,
  },
  title: {
    ...TYPOGRAPHY.sectionTitle,
    color: COLORS.textPrimary,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  container: {
    gap: SPACING.md,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.xs,
  },
  centered: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  loadingText: {
    color: COLORS.textSecondary,
    marginTop: 10,
  },
  emptyState: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.9)",
    borderColor: COLORS.border,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    padding: SPACING.lg,
  },
  emptyTitle: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: "800",
    marginTop: 10,
  },
  emptySubtitle: {
    color: COLORS.textSecondary,
    marginTop: 6,
    textAlign: "center",
  },
  card: {
    ...SHADOWS.soft,
    backgroundColor: "rgba(255,255,255,0.94)",
    borderColor: COLORS.border,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    padding: SPACING.md,
  },
  cardTopRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  tonePill: {
    alignItems: "center",
    borderRadius: RADIUS.full,
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
  },
  toneText: {
    fontSize: 12,
    fontWeight: "800",
  },
  audiencePill: {
    backgroundColor: COLORS.primarySoft,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
  },
  audienceText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: "800",
  },
  cardTitle: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: "900",
  },
  cardBody: {
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginTop: 6,
  },
  cardFooter: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: SPACING.sm,
  },
  dateText: {
    color: COLORS.textTertiary,
    fontSize: 12,
    fontWeight: "600",
  },
  roleText: {
    color: COLORS.textTertiary,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
});
