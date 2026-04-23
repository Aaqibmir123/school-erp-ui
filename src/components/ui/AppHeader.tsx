import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from "@/src/theme";

type AppHeaderProps = {
  title: string;
  onBack?: () => void;
  onMenu?: () => void;
  subtitle?: string;
};

const AppHeader = ({ title, onBack, onMenu, subtitle }: AppHeaderProps) => {
  const insets = useSafeAreaInsets();
  const hasBack = !!onBack;

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <View style={[styles.container, { paddingBottom: SPACING.sm }]}>
        <Pressable
          accessibilityRole="button"
          hitSlop={12}
          onPress={hasBack ? onBack : onMenu}
          style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
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

        <View style={[styles.iconButton, { opacity: 0 }]} />
      </View>

      <View style={[styles.divider, { marginBottom: insets.bottom > 0 ? 0 : SPACING.xs }]} />
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
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
  },
  divider: {
    backgroundColor: COLORS.border,
    height: StyleSheet.hairlineWidth,
    opacity: 0.9,
  },
  iconButton: {
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
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
