import { Ionicons } from "@expo/vector-icons";
import { memo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { COLORS, SPACING, TYPOGRAPHY } from "@/src/theme";

function OfflineBannerView() {
  return (
    <View style={styles.container}>
      <Ionicons name="cloud-offline-outline" size={16} color={COLORS.textInverse} />
      <Text style={styles.text}>You are offline. Live data will sync once the network returns.</Text>
    </View>
  );
}

export const OfflineBanner = memo(OfflineBannerView);

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: COLORS.primaryDark,
    flexDirection: "row",
    gap: SPACING.sm,
    justifyContent: "center",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  text: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textInverse,
    fontWeight: "600",
    textAlign: "center",
  },
});
