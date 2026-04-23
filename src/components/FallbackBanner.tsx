import { Ionicons } from "@expo/vector-icons";
import { memo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from "@/src/theme";

type Props = {
  actionLabel?: string;
  onRetry?: () => void;
  subtitle?: string;
  title?: string;
};

function FallbackBanner({
  actionLabel = "Retry",
  onRetry,
  subtitle = "Nothing to show right now",
  title = "No Data",
}: Props) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.iconShell}>
        <Ionicons
          name={onRetry ? "refresh-circle-outline" : "sparkles-outline"}
          size={34}
          color={COLORS.primary}
        />
      </View>

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>

      {onRetry ? (
        <Pressable style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]} onPress={onRetry}>
          <Text style={styles.buttonText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export default memo(FallbackBanner);

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.sm,
  },
  buttonPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
  buttonText: {
    color: COLORS.textInverse,
    fontSize: 14,
    fontWeight: "700",
  },
  iconShell: {
    alignItems: "center",
    backgroundColor: COLORS.primarySoft,
    borderRadius: RADIUS.full,
    height: 72,
    justifyContent: "center",
    marginBottom: SPACING.md,
    width: 72,
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.textTertiary,
    maxWidth: 280,
    textAlign: "center",
  },
  title: {
    ...TYPOGRAPHY.sectionTitle,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
    textAlign: "center",
  },
  wrapper: {
    ...SHADOWS.soft,
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    marginTop: SPACING.xl,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.xxl,
    width: "100%",
  },
});
