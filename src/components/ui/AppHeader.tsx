import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from "@/src/theme";
import type { ReactNode } from "react";

type AppHeaderProps = {
  title: string;
  rightElement?: ReactNode;
  onBack?: () => void;
  onMenu?: () => void;
  subtitle?: string;
};

const AppHeader = ({ title, rightElement, onBack, onMenu, subtitle }: AppHeaderProps) => {
  const hasBack = !!onBack;

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <View style={styles.container}>
        <Pressable
          accessibilityRole="button"
          hitSlop={12}
          onPress={hasBack ? onBack : onMenu}
          style={({ pressed }) => [
            styles.iconButton,
            pressed && styles.pressed,
          ]}
        >
          <Ionicons
            name={hasBack ? "arrow-back" : "menu"}
            size={22}
            color={COLORS.textPrimary}
          />
        </Pressable>

        <View style={styles.titleWrap}>
          <Text numberOfLines={1} style={styles.title}>
            {title}
          </Text>
          {subtitle ? (
            <Text numberOfLines={1} style={styles.subtitle}>
              {subtitle}
            </Text>
          ) : null}
        </View>

        {rightElement ?? <View style={[styles.iconButton, { opacity: 0 }]} />}
      </View>
    </SafeAreaView>
  );
};

export default React.memo(AppHeader);

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: COLORS.background,
  },
  container: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "rgba(255,255,255,0.68)",
    borderBottomColor: "rgba(217,226,236,0.8)",
    borderBottomWidth: StyleSheet.hairlineWidth,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 18,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.sm,
    paddingTop: SPACING.sm,
    elevation: 2,
  },
  iconButton: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.82)",
    borderColor: "rgba(217,226,236,0.95)",
    borderRadius: RADIUS.full,
    borderWidth: 1,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
    textAlign: "center",
  },
  title: {
    ...TYPOGRAPHY.sectionTitle,
    color: COLORS.textPrimary,
    textAlign: "center",
  },
  titleWrap: {
    flex: 1,
    paddingHorizontal: SPACING.sm,
  },
});
