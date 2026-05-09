import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { memo, useMemo } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from "@/src/theme";
import { useAuth } from "@/src/context/AuthContext";

const menu = [
  {
    icon: "checkmark-circle-outline",
    screen: "Attendance",
    title: "Attendance",
  },
  {
    icon: "document-text-outline",
    screen: "ExamScreen",
    title: "Exams",
  },
  {
    icon: "reader-outline",
    screen: "TestRecordsScreen",
    title: "Test Records",
  },
  {
    icon: "card-outline",
    screen: "AdmitCardsScreen",
    title: "Admit Cards",
  },
  { icon: "calendar-outline", screen: "Timetable", title: "Timetable" },
  { icon: "wallet-outline", screen: "FeesScreen", title: "My Fees" },
] as const;

function DashboardGrid() {
  const navigation = useNavigation<any>();
  const { role } = useAuth();
  const isReviewer = String(role || "").toUpperCase() === "REVIEWER";
  const { width } = useWindowDimensions();
  const accent = COLORS.primary;

  const cardWidth = useMemo(() => {
    // WHY: Tablets have more horizontal space, so widening the grid keeps
    // cards readable instead of stretching tiny two-column tiles edge-to-edge.
    if (width >= 900) return "31%";
    if (width >= 600) return "48.5%";
    return "48%";
  }, [width]);

  return (
    <View style={styles.container}>
      {menu.map((item) => (
        <Pressable
          key={item.title}
          onPress={() => {
            const target =
              isReviewer && item.screen === "Timetable"
                ? "StudentTimetable"
                : item.screen;
            // #region agent log
            void fetch("http://127.0.0.1:7878/ingest/404de2f9-5f5d-4a49-aafe-3e44b6c75caa", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "X-Debug-Session-Id": "686f1a",
              },
              body: JSON.stringify({
                sessionId: "686f1a",
                runId: "post-fix",
                hypothesisId: "H7",
                location: "student/dashboard/components/DashboardGrid.tsx:onPress",
                message: "Dashboard card navigation target",
                data: { isReviewer, source: item.screen, target },
                timestamp: Date.now(),
              }),
            }).catch(() => {});
            // #endregion agent log
            navigation.navigate(target);
          }}
          style={({ pressed }) => [
            styles.card,
            { width: cardWidth },
            pressed && styles.cardPressed,
          ]}
        >
          <View style={styles.iconWrapper}>
            <Ionicons name={item.icon as any} size={22} color={accent} />
          </View>

          <Text style={styles.text}>{item.title}</Text>
          <Text style={styles.helper}>Open module</Text>
        </Pressable>
      ))}
    </View>
  );
}

export default memo(DashboardGrid);

const styles = StyleSheet.create({
  card: {
    ...SHADOWS.soft,
    backgroundColor: "#fbfdff",
    borderColor: "rgba(37, 99, 235, 0.08)",
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    marginBottom: SPACING.md,
    minHeight: 116,
    padding: SPACING.lg,
  },
  cardPressed: {
    opacity: 0.94,
    transform: [{ scale: 0.985 }],
  },
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  helper: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textTertiary,
    marginTop: 6,
  },
  iconWrapper: {
    alignItems: "center",
    backgroundColor: "rgba(37, 99, 235, 0.06)",
    borderRadius: RADIUS.full,
    height: 50,
    justifyContent: "center",
    width: 50,
  },
  text: {
    ...TYPOGRAPHY.body,
    color: COLORS.textPrimary,
    fontWeight: "700",
    marginTop: SPACING.md,
  },
});
