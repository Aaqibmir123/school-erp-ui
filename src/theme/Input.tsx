import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from "react-native";

import { COLORS, RADIUS, SPACING } from "@/src/theme";

type Props = TextInputProps & {
  label?: string;
  error?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightPress?: () => void;
};

const AppInput = ({
  label,
  error,
  leftIcon,
  rightIcon,
  onRightPress,
  style,
  ...props
}: Props) => {
  const [focused, setFocused] = useState(false);

  return (
    <View style={{ marginBottom: SPACING.md }}>
      {/* 🔥 LABEL */}
      {label && <Text style={styles.label}>{label}</Text>}

      {/* 🔥 INPUT CONTAINER */}
      <View
        style={[
          styles.container,
          focused && styles.focused,
          error && styles.errorBorder,
        ]}
      >
        {/* LEFT ICON */}
        {leftIcon && (
          <Ionicons
            name={leftIcon}
            size={18}
            color={COLORS.textSecondary}
            style={{ marginRight: 8 }}
          />
        )}

        {/* INPUT */}
        <TextInput
          {...props}
          style={[styles.input, style]}
          placeholderTextColor={COLORS.textSecondary}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />

        {/* RIGHT ICON */}
        {rightIcon && (
          <Ionicons
            name={rightIcon}
            size={18}
            color={COLORS.textSecondary}
            onPress={onRightPress}
          />
        )}
      </View>

      {/* 🔥 ERROR */}
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

export default React.memo(AppInput);

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  label: {
    fontSize: 13,
    marginBottom: 6,
    color: COLORS.textSecondary,
    fontWeight: "600",
  },

  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  focused: {
    borderColor: COLORS.primary,
  },

  errorBorder: {
    borderColor: COLORS.error,
  },

  input: {
    flex: 1,
    paddingVertical: SPACING.md,
    color: COLORS.textPrimary,
  },

  errorText: {
    marginTop: 4,
    fontSize: 12,
    color: COLORS.error,
  },
});
