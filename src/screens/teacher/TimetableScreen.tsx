"use client";

import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";

import AppButton from "@/src/theme/Button";
import BrandLoader from "@/src/components/BrandLoader";
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from "@/src/theme";
import { useGetTimetableQuery } from "../../api/teacher/teacherApi";
import ClassItem from "../../components/timetable/ClassItem";
import DayTabs from "./DayTabs";

const TimetableScreen = ({ navigation }: any) => {
  const [selectedDay, setSelectedDay] = useState("Mon");

  const { data, isLoading, isFetching, isError, refetch } =
    useGetTimetableQuery();

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

  const classes = useMemo(() => {
    if (!data?.data) return [];
    return data.data[selectedDay] || [];
  }, [data, selectedDay]);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <BrandLoader />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.errorWrap}>
        <View style={styles.emptyCard}>
          <View style={styles.iconBubble}>
            <Ionicons
              name="calendar-outline"
              size={18}
              color={COLORS.primary}
            />
          </View>
          <Text style={styles.emptyTitle}>Timetable unavailable</Text>
          <AppButton title="Retry" onPress={refetch} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.iconBubble}>
          <Ionicons
            name="calendar-outline"
            size={18}
            color={COLORS.primary}
          />
        </View>
        <Text style={styles.title}>Timetable</Text>
      </View>

      <View style={styles.tabsCard}>
        <DayTabs selectedDay={selectedDay} setSelectedDay={setSelectedDay} />
      </View>

      {!classes.length ? (
        <View style={styles.emptyWrap}>
          <View style={styles.emptyCard}>
            <View style={styles.iconBubble}>
              <Ionicons
                name="sparkles-outline"
                size={18}
                color={COLORS.primary}
              />
            </View>
            <Text style={styles.emptyTitle}>No classes today</Text>
          </View>
        </View>
      ) : (
        <FlatList
          data={classes}
          keyExtractor={(item, index) => item?._id || index.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={isFetching} onRefresh={refetch} />
          }
          renderItem={({ item }) => (
            <ClassItem item={item} navigation={navigation} />
          )}
        />
      )}
    </View>
  );
};

export default TimetableScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  center: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  errorWrap: {
    backgroundColor: COLORS.background,
    flex: 1,
    padding: SPACING.lg,
  },
  headerRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  iconBubble: {
    alignItems: "center",
    backgroundColor: COLORS.primarySoft,
    borderRadius: RADIUS.full,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  title: {
    ...TYPOGRAPHY.headline,
    color: COLORS.textPrimary,
    flex: 1,
  },
  tabsCard: {
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderRadius: 24,
    borderWidth: 1,
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.sm,
    paddingTop: 6,
  },
  emptyWrap: {
    marginTop: SPACING.md,
  },
  emptyCard: {
    ...SHADOWS.soft,
    alignItems: "center",
    alignSelf: "stretch",
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.xl,
  },
  emptyTitle: {
    ...TYPOGRAPHY.sectionTitle,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
    marginTop: SPACING.sm,
    textAlign: "center",
  },
  listContent: {
    paddingBottom: SPACING.xl,
  },
});
