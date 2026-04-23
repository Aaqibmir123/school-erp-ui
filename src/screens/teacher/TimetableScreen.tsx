"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";

import FallbackBanner from "@/src/components/FallbackBanner";
import { COLORS, SPACING, TYPOGRAPHY } from "@/src/theme";
import { useGetTimetableQuery } from "../../api/teacher/teacherApi";
import ClassItem from "../../components/timetable/ClassItem";
import DayTabs from "./DayTabs";

const TimetableScreen = ({ navigation }: any) => {
  const [selectedDay, setSelectedDay] = useState("Mon");

  const { data, isLoading, isError, refetch } = useGetTimetableQuery();

  /* ================= AUTO DAY SELECT ================= */
  useEffect(() => {
    if (data?.data) {
      const firstDayWithData = Object.keys(data.data).find(
        (day) => data.data[day]?.length > 0,
      );

      if (firstDayWithData) {
        setSelectedDay(firstDayWithData);
      }
    }
  }, [data]);

  /* ================= MEMO ================= */
  const classes = useMemo(() => {
    if (!data?.data) return [];
    return data.data[selectedDay] || [];
  }, [data, selectedDay]);

  /* ================= LOADING ================= */
  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading timetable</Text>
      </View>
    );
  }

  /* ================= ERROR ================= */
  if (isError) {
    return (
      <View style={styles.errorWrap}>
      <FallbackBanner
          title="Timetable unavailable"
          subtitle="We could not fetch your class schedule right now."
          actionLabel="Retry"
          onRetry={refetch}
        />
      </View>
    );
  }

  /* ================= UI ================= */
  return (
    <View style={styles.container}>
      <Text style={styles.kicker}>Teacher schedule</Text>
      <Text style={styles.title}>Timetable</Text>
      <Text style={styles.subtitle}>
        Review daily classes and jump into attendance or actions quickly.
      </Text>

      <DayTabs selectedDay={selectedDay} setSelectedDay={setSelectedDay} />

      {!classes.length ? (
        <FallbackBanner
          title="No classes today"
          subtitle="This day has no scheduled classes yet."
        />
      ) : (
        <FlatList
          data={classes}
          keyExtractor={(item, index) => item?._id || index.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <ClassItem item={item} navigation={navigation} />
          )}
        />
      )}
    </View>
  );
};

export default TimetableScreen;

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  errorWrap: {
    backgroundColor: COLORS.background,
    flex: 1,
    padding: SPACING.lg,
  },
  kicker: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  title: {
    ...TYPOGRAPHY.headline,
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  subtitle: {
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    marginTop: SPACING.xs,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
  },
  listContent: {
    paddingBottom: SPACING.xl,
  },
});
