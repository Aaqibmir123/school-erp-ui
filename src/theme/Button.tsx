import React from "react";
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TextStyle,
    TouchableOpacity,
    View,
    ViewStyle,
} from "react-native";

import { COLORS, RADIUS, SPACING } from "@/src/theme";

type Props = {
  title: string;
  onPress: () => void;
  loading?: boolean;
  loadingText?: string;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  variant?: "primary" | "outline" | "ghost";
};

const AppButton = ({
  title,
  onPress,
  loading = false,
  loadingText,
  disabled = false,
  style,
  textStyle,
  variant = "primary",
}: Props) => {
  const isDisabled = disabled || loading;

  const handlePress = () => {
    if (__DEV__) {
      console.log("[AppButton] press", {
        title,
        disabled: isDisabled,
        loading,
        variant,
      });
    }

    if (isDisabled) {
      return;
    }

    onPress();
  };

  const getVariantStyle = () => {
    switch (variant) {
      case "outline":
        return {
          backgroundColor: "transparent",
          borderWidth: 1,
          borderColor: COLORS.primary,
        };
      case "ghost":
        return {
          backgroundColor: "transparent",
        };
      default:
        return {
          backgroundColor: COLORS.primary,
        };
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case "outline":
      case "ghost":
        return COLORS.primary;
      default:
        return "#fff";
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={handlePress}
      disabled={isDisabled}
      style={[
        styles.button,
        getVariantStyle(),
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <View style={styles.loadingContent}>
          <ActivityIndicator color={getTextColor()} />
          <Text style={[styles.text, { color: getTextColor() }, textStyle]}>
            {loadingText || title}
          </Text>
        </View>
      ) : (
        <Text style={[styles.text, { color: getTextColor() }, textStyle]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

export default React.memo(AppButton);

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  button: {
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    alignItems: "center",
    justifyContent: "center",
  },

  text: {
    fontSize: 15,
    fontWeight: "700",
  },

  loadingContent: {
    alignItems: "center",
    flexDirection: "row",
    gap: SPACING.sm,
    justifyContent: "center",
  },

  disabled: {
    opacity: 0.6,
  },
});
