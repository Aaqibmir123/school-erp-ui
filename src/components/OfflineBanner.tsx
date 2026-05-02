import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { memo, useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { COLORS, SPACING, TYPOGRAPHY } from "@/src/theme";

type Props = {
  visible: boolean;
};

const BANNER_HEIGHT = 52;

function OfflineBannerView({ visible }: Props) {
  const insets = useSafeAreaInsets();
  const progress = useRef(new Animated.Value(visible ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: visible ? 1 : 0,
      duration: 240,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [progress, visible]);

  const animatedHeight = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, BANNER_HEIGHT + insets.top],
  });

  const animatedOpacity = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const animatedTranslateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [-14, 0],
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.outer,
        {
          height: animatedHeight,
          opacity: animatedOpacity,
          transform: [{ translateY: animatedTranslateY }],
        },
      ]}
    >
      <LinearGradient
        colors={["#F97316", "#DC2626"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.container, { paddingTop: insets.top }]}
      >
        <Ionicons
          name="cloud-offline-outline"
          size={16}
          color={COLORS.textInverse}
        />
        <Text style={styles.text}>No internet connection</Text>
      </LinearGradient>
    </Animated.View>
  );
}

export const OfflineBanner = memo(OfflineBannerView);

const styles = StyleSheet.create({
  outer: {
    overflow: "hidden",
  },
  container: {
    alignItems: "center",
    backgroundColor: COLORS.danger,
    flexDirection: "row",
    gap: SPACING.sm,
    justifyContent: "center",
    minHeight: BANNER_HEIGHT,
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
