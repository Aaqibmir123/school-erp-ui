import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity } from "react-native";

import { COLORS, RADIUS, SPACING } from "@/src/theme";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const DayTabs = ({ selectedDay, setSelectedDay }: any) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {days.map((day) => {
        const isActive = selectedDay === day;

        return (
          <TouchableOpacity
            key={day}
            style={[styles.tab, isActive && styles.activeTab]}
            onPress={() => setSelectedDay(day)}
          >
            <Text style={[styles.text, isActive && styles.activeText]}>
              {day}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

export default DayTabs;

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    marginBottom: SPACING.md,
    paddingRight: SPACING.sm,
  },

  tab: {
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    marginRight: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },

  activeTab: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },

  text: {
    color: COLORS.textSecondary,
    fontWeight: "700",
  },

  activeText: {
    color: COLORS.textInverse,
  },
});
