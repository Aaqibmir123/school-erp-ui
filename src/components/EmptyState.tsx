import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORS } from "../theme/colors";
import { RADIUS } from "../theme/radius";
import { SPACING } from "../theme/spacing";

const EmptyState = ({
  title = "No Data",
  description = "Nothing to show",
  buttonText,
  onPress,
  icon = "document-text-outline",
}: any) => {
  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={60} color={COLORS.primary} />

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.desc}>{description}</Text>

      {buttonText && (
        <TouchableOpacity style={styles.button} onPress={onPress}>
          <Text style={styles.btnText}>{buttonText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default React.memo(EmptyState);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.lg,
  },

  title: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: SPACING.sm,
    color: COLORS.textPrimary,
  },

  desc: {
    marginTop: SPACING.xs,
    color: COLORS.textSecondary,
  },

  button: {
    marginTop: SPACING.md,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
  },

  btnText: {
    color: "#fff",
    fontWeight: "600",
  },
});
