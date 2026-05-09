import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

import { COLORS, RADIUS, SPACING } from "@/src/theme";

type BrandLoaderProps = {
  compact?: boolean;
};

const DOT_SIZE = 12;

const BrandLoader = ({ compact = false }: BrandLoaderProps) => {
  const dot1 = useRef(new Animated.Value(0.35)).current;
  const dot2 = useRef(new Animated.Value(0.35)).current;
  const dot3 = useRef(new Animated.Value(0.35)).current;
  const values = [dot1, dot2, dot3];

  useEffect(() => {
    const animations = values.map((value, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(index * 120),
          Animated.timing(value, {
            toValue: 1,
            duration: 420,
            useNativeDriver: true,
          }),
          Animated.timing(value, {
            toValue: 0.35,
            duration: 420,
            useNativeDriver: true,
          }),
        ]),
      ),
    );

    animations.forEach((animation) => animation.start());

    return () => {
      animations.forEach((animation) => animation.stop());
    };
  }, [dot1, dot2, dot3]);

  return (
    <View style={[styles.wrap, compact && styles.compactWrap]}>
      {values.map((value, index) => (
        <Animated.View
          key={`brand-dot-${index}`}
          style={[
            styles.dot,
            {
              opacity: value,
              transform: [
                {
                  scale: value.interpolate({
                    inputRange: [0.35, 1],
                    outputRange: [0.85, 1.08],
                  }),
                },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
};

export default React.memo(BrandLoader);

const styles = StyleSheet.create({
  compactWrap: {
    paddingVertical: SPACING.sm,
  },
  dot: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
    height: DOT_SIZE,
    marginHorizontal: 5,
    width: DOT_SIZE,
  },
  wrap: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: SPACING.md,
  },
});
