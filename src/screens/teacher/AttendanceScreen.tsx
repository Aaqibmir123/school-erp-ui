import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView as SafeAreaContainer } from "react-native-safe-area-context";

import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from "@/src/theme";

const AttendanceScreen = ({ navigation }: any) => {
  return (
    <SafeAreaContainer style={styles.safeArea} edges={["top", "bottom"]}>
      <View style={styles.container}>
        <View style={styles.card}>
          <View style={styles.iconWrap}>
            <Ionicons name="calendar-outline" size={32} color={COLORS.primary} />
          </View>

          <Text style={styles.kicker}>Attendance</Text>
          <Text style={styles.title}>Teacher attendance workspace</Text>
          <Text style={styles.subtitle}>
            Mark attendance from timetable-driven class screens for the cleanest
            flow.
          </Text>

          <Pressable
            onPress={() => navigation?.goBack?.()}
            style={({ pressed }) => [styles.button, pressed && styles.pressed]}
          >
            <Text style={styles.buttonText}>Go back</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaContainer>
  );
};

export default AttendanceScreen;

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: COLORS.background,
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    padding: SPACING.lg,
  },
  card: {
    ...SHADOWS.soft,
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    padding: SPACING.xl,
  },
  iconWrap: {
    alignItems: "center",
    backgroundColor: COLORS.primarySoft,
    borderRadius: RADIUS.full,
    height: 72,
    justifyContent: "center",
    marginBottom: SPACING.md,
    width: 72,
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
    textAlign: "center",
  },
  subtitle: {
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginTop: SPACING.xs,
    textAlign: "center",
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  buttonText: {
    color: COLORS.textInverse,
    fontWeight: "800",
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
});
