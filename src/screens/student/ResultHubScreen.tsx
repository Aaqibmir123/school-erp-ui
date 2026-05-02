import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { memo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from "@/src/theme";
import { STUDENT_GLAS_CARD, STUDENT_THEME } from "./studentTheme";

const ResultHubScreen = () => {
  const navigation = useNavigation<any>();

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      <LinearGradient colors={STUDENT_THEME.heroGradient} style={styles.hero}>
        <Text style={styles.eyebrow}>Results</Text>
        <Text style={styles.title}>Marks and records</Text>
        <Text style={styles.subtitle}>
          Open approved marks cards or class and unit test records.
        </Text>
      </LinearGradient>

      <View style={styles.quickGrid}>
        <Pressable
          onPress={() => navigation.navigate("ResultScreen")}
          style={({ pressed }) => [styles.actionCard, pressed && styles.pressed]}
        >
          <View style={styles.iconBox}>
            <Ionicons name="document-text-outline" size={20} color={COLORS.primary} />
          </View>
          <Text style={styles.cardTitle}>Marks Card</Text>
          <Text style={styles.cardSub}>Approved school exam result sheet</Text>
        </Pressable>

        <Pressable
          onPress={() => navigation.navigate("TestRecordsScreen")}
          style={({ pressed }) => [styles.actionCard, pressed && styles.pressed]}
        >
          <View style={styles.iconBoxSoft}>
            <Ionicons name="reader-outline" size={20} color={COLORS.info} />
          </View>
          <Text style={styles.cardTitle}>Test Records</Text>
          <Text style={styles.cardSub}>Class and unit test entries only</Text>
        </Pressable>
      </View>

      <View style={styles.noteCard}>
        <Ionicons name="flash-outline" size={18} color={COLORS.primary} />
        <Text style={styles.noteText}>
          Fast access. Open one result view at a time for lighter loading.
        </Text>
      </View>
    </ScrollView>
  );
};

export default memo(ResultHubScreen);

const styles = StyleSheet.create({
  actionCard: {
    ...STUDENT_GLAS_CARD,
    ...SHADOWS.card,
    backgroundColor: "#fbfdff",
    borderColor: "#e5eefc",
    borderRadius: RADIUS.xl,
    flex: 1,
    minHeight: 150,
    padding: SPACING.lg,
  },
  cardSub: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 6,
  },
  cardTitle: {
    ...TYPOGRAPHY.title,
    color: COLORS.textPrimary,
    fontSize: 16,
    marginTop: SPACING.md,
  },
  container: {
    backgroundColor: STUDENT_THEME.background,
    paddingBottom: SPACING.xxl,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  eyebrow: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  hero: {
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: "hidden",
    paddingBottom: 22,
    paddingHorizontal: 16,
    paddingTop: 28,
  },
  iconBox: {
    alignItems: "center",
    backgroundColor: COLORS.primarySoft,
    borderRadius: RADIUS.full,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  iconBoxSoft: {
    alignItems: "center",
    backgroundColor: COLORS.infoSoft,
    borderRadius: RADIUS.full,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  noteCard: {
    alignItems: "center",
    backgroundColor: "#F8FBFF",
    borderColor: "#E5EEFC",
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    marginTop: SPACING.lg,
    padding: SPACING.md,
  },
  noteText: {
    color: COLORS.textSecondary,
    flex: 1,
    fontSize: 12,
    fontWeight: "600",
  },
  pressed: {
    opacity: 0.94,
    transform: [{ scale: 0.99 }],
  },
  quickGrid: {
    flexDirection: "row",
    gap: SPACING.md,
    marginTop: SPACING.lg,
  },
  subtitle: {
    color: "rgba(255,255,255,0.86)",
    marginTop: 4,
  },
  title: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "900",
    marginTop: 2,
  },
});
