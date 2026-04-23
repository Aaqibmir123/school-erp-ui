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

const menu = [
  { color: COLORS.success, icon: "book-outline", screen: "Homework", title: "Homework" },
  {
    color: COLORS.warning,
    icon: "checkmark-circle-outline",
    screen: "Attendance",
    title: "Attendance",
  },
  { color: COLORS.info, icon: "calendar-outline", screen: "Timetable", title: "Timetable" },
  { color: COLORS.primary, icon: "document-text-outline", screen: "ExamScreen", title: "Exams" },
  { color: COLORS.primaryDark, icon: "wallet-outline", screen: "FeesScreen", title: "My Fees" },
  { color: COLORS.danger, icon: "bar-chart-outline", screen: "ResultScreen", title: "Results" },
] as const;

function DashboardGrid() {
  const navigation = useNavigation<any>();
  const { width } = useWindowDimensions();

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
          onPress={() => navigation.navigate(item.screen)}
          style={({ pressed }) => [
            styles.card,
            { width: cardWidth },
            pressed && styles.cardPressed,
          ]}
        >
          <View style={[styles.iconWrapper, { backgroundColor: `${item.color}18` }]}>
            <Ionicons name={item.icon as any} size={22} color={item.color} />
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
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.md,
    minHeight: 118,
    padding: SPACING.lg,
  },
  cardPressed: {
    opacity: 0.94,
    transform: [{ scale: 0.98 }],
  },
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  helper: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textTertiary,
    marginTop: SPACING.xs,
  },
  iconWrapper: {
    alignItems: "center",
    borderRadius: RADIUS.full,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  text: {
    ...TYPOGRAPHY.body,
    color: COLORS.textPrimary,
    fontWeight: "700",
    marginTop: SPACING.md,
  },
});
