import { View, Text, StyleSheet } from "react-native";

import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from "@/src/theme";

type Props = {
  name: string;
  className: string;
};

export default function HeaderCard({ name, className }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hi {name} 👋</Text>
      <Text style={styles.subtitle}>{className}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.md,
    padding: SPACING.lg,
  },
  title: {
    ...TYPOGRAPHY.title,
    color: COLORS.textPrimary,
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
});
