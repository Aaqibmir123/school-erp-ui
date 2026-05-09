import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from "@/src/theme";

const ResultHomeScreen = () => {
  const navigation = useNavigation<any>();

  const actions = [
    {
      icon: "create-outline",
      title: "Enter Marks",
      desc: "Pick an exam and add marks.",
      onPress: () => navigation.navigate("SelectExam", { mode: "enter" }),
    },
    {
      icon: "eye-outline",
      title: "View Results",
      desc: "Review saved results by exam.",
      onPress: () => navigation.navigate("SelectExam", { mode: "view" }),
    },
  ] as const;

  return (
    <View style={styles.container}>
      <Text style={styles.kicker}>Results</Text>
      <Text style={styles.title}>Result workspace</Text>
      <Text style={styles.subtitle}>
        Choose whether to add marks or review existing results.
      </Text>

      <View style={styles.grid}>
        {actions.map((item) => (
          <Pressable
            key={item.title}
            onPress={item.onPress}
            style={({ pressed }) => [styles.card, pressed && styles.pressed]}
          >
            <View style={styles.iconWrap}>
              <Ionicons name={item.icon as any} size={20} color={COLORS.primary} />
            </View>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardDesc}>{item.desc}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
};

export default ResultHomeScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
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
  grid: {
    gap: SPACING.md,
    marginTop: SPACING.lg,
  },
  card: {
    ...SHADOWS.soft,
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    padding: SPACING.lg,
  },
  pressed: {
    opacity: 0.95,
    transform: [{ scale: 0.995 }],
  },
  iconWrap: {
    alignItems: "center",
    backgroundColor: COLORS.primarySoft,
    borderRadius: RADIUS.full,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  cardTitle: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: "800",
    marginTop: SPACING.sm,
  },
  cardDesc: {
    color: COLORS.textSecondary,
    marginTop: 4,
  },
});
