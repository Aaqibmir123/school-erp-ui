import { memo } from "react";
import { StyleSheet, View } from "react-native";

import { COLORS, RADIUS, SPACING } from "@/src/theme";

function SimpleSkeleton() {
  return (
    <View style={styles.container}>
      <View style={[styles.block, styles.hero]} />

      <View style={styles.row}>
        <View style={[styles.block, styles.metric]} />
        <View style={[styles.block, styles.metric]} />
      </View>

      <View style={[styles.block, styles.card]} />
      <View style={[styles.block, styles.card]} />
      <View style={[styles.block, styles.card]} />
    </View>
  );
}

export default memo(SimpleSkeleton);

const styles = StyleSheet.create({
  block: {
    backgroundColor: COLORS.primarySoft,
    borderRadius: RADIUS.lg,
    overflow: "hidden",
  },
  card: {
    height: 88,
    marginBottom: SPACING.md,
  },
  container: {
    backgroundColor: COLORS.background,
    flex: 1,
    padding: SPACING.lg,
  },
  hero: {
    height: 136,
    marginBottom: SPACING.lg,
  },
  metric: {
    height: 100,
    width: "48%",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: SPACING.lg,
  },
});
