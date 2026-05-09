import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  useGetSchoolProfileQuery,
  useGetTeacherAttendanceHistoryQuery,
  useMarkTeacherCheckInMutation,
  useMarkTeacherCheckOutMutation,
  useMarkTeacherLeaveMutation,
} from "@/src/api/teacher/teacherApi";
import { COLORS, SPACING } from "@/src/theme";
import { showToast } from "@/src/utils/toast";

type AttendanceRecord = {
  date: string;
  checkInAt?: string | null;
  checkOutAt?: string | null;
  status:
    | "PENDING"
    | "PRESENT"
    | "LATE"
    | "CHECKED_IN"
    | "CHECKED_OUT"
    | "LEAVE"
    | "HALF_DAY";
};

const getTodayDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const WEEKDAY_BY_INDEX = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
] as const;

const formatClock = (value?: string | null) => {
  if (!value) return "--:--";
  return new Date(value).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });
};

const AttendanceScreen = ({ navigation }: any) => {
  const today = useMemo(() => getTodayDate(), []);
  const { data: school } = useGetSchoolProfileQuery();
  const { data, isLoading, isFetching, refetch } =
    useGetTeacherAttendanceHistoryQuery({
      from: today,
      to: today,
      page: 1,
      limit: 10,
    });
  const [markCheckIn, checkInState] = useMarkTeacherCheckInMutation();
  const [markCheckOut, checkOutState] = useMarkTeacherCheckOutMutation();
  const [markLeave, leaveState] = useMarkTeacherLeaveMutation();

  const record = (data?.data?.[0] as AttendanceRecord | undefined) || null;

  const statusLabel = useMemo(() => {
    if (record?.status === "LEAVE") return "Leave";
    if (record?.status === "HALF_DAY") return "Half day";
    if (record?.status === "PRESENT") return "Present";
    if (record?.status === "LATE") return "Late";
    if (!record?.checkInAt) return "Not marked";
    if (record.checkOutAt) return "Checked out";
    return "Checked in";
  }, [record]);

  const checkInTime = record?.checkInAt ?? null;
  const checkOutTime = record?.checkOutAt ?? null;

  const schoolTimings = useMemo(
    () => ({
      checkInOpen: school?.checkInOpenTime || "",
      schoolStart: school?.schoolStartTime || "",
      lateAfter: school?.lateMarkAfterTime || "",
      checkInClose: school?.checkInCloseTime || "",
      schoolEnd: school?.schoolEndTime || "",
      checkOutClose: school?.checkOutCloseTime || "",
      workingDays: school?.workingDays || [],
    }),
    [school],
  );

  const parseMinutes = (value?: string) => {
    if (!value || !/^([01]\d|2[0-3]):([0-5]\d)$/.test(value)) return null;
    const [hours, minutes] = value.split(":").map(Number);
    return hours * 60 + minutes;
  };

  const currentMinutes = () => {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  };

  const currentWeekday = WEEKDAY_BY_INDEX[new Date().getDay()];
  const isWorkingDay =
    !schoolTimings.workingDays.length ||
    schoolTimings.workingDays.includes(currentWeekday);
  const checkInOpenMinutes = parseMinutes(schoolTimings.checkInOpen);
  const checkInCloseMinutes = parseMinutes(schoolTimings.checkInClose);
  const checkOutCloseMinutes = parseMinutes(schoolTimings.checkOutClose);
  const nowMinutes = currentMinutes();

  const beforeCheckInStarts =
    checkInOpenMinutes !== null && nowMinutes < checkInOpenMinutes;
  const afterCheckInClosed =
    checkInCloseMinutes !== null && nowMinutes > checkInCloseMinutes;
  const afterCheckOutClosed =
    checkOutCloseMinutes !== null && nowMinutes > checkOutCloseMinutes;

  const attendanceGateLocked =
    !isWorkingDay ||
    beforeCheckInStarts ||
    afterCheckInClosed ||
    afterCheckOutClosed;

  const disableCheckInButton =
    attendanceGateLocked ||
    !!record?.checkInAt ||
    record?.status === "LEAVE";
  const disableCheckOutButton =
    attendanceGateLocked ||
    !record?.checkInAt ||
    !!record?.checkOutAt ||
    record?.status === "LEAVE";
  const disableLeaveButton =
    attendanceGateLocked || !!record?.checkInAt || !!record?.checkOutAt;
  const disableHalfDayButton = attendanceGateLocked || !!record?.checkOutAt;

  const statusMessage = !isWorkingDay
    ? "School is closed today"
    : beforeCheckInStarts
      ? "Check-in has not started yet"
      : afterCheckInClosed
        ? "Check-in window closed"
        : afterCheckOutClosed
          ? "Check-out time has ended"
          : "Buttons are active now";

  const extractErrorMessage = (error: any, fallback: string) => {
    const candidate =
      error?.data?.message ||
      error?.data?.error ||
      error?.data?.detail ||
      error?.data?.title ||
      error?.error?.message ||
      error?.error ||
      error?.message ||
      error?.statusText;

    if (typeof candidate === "string" && candidate.trim()) {
      return candidate;
    }

    return fallback;
  };

  const handleCheckIn = async () => {
    if (disableCheckInButton) {
      if (!isWorkingDay) {
        showToast.warning("School is closed today");
        return;
      }
      if (beforeCheckInStarts) {
        showToast.warning("Check-in has not started yet");
        return;
      }
      if (afterCheckInClosed) {
        showToast.warning("Check-in window closed");
        return;
      }
    }

    if (record?.checkInAt) {
      showToast.warning("Attendance already checked in for today");
      return;
    }

    try {
      await markCheckIn({ date: today }).unwrap();
      await refetch();
      showToast.success("Check in saved");
    } catch (error: any) {
      showToast.error(
        extractErrorMessage(error, "Unable to check in. Please try again."),
      );
    }
  };

  const handleCheckOut = async () => {
    if (disableCheckOutButton) {
      if (!isWorkingDay) {
        showToast.warning("School is closed today");
        return;
      }
      if (beforeCheckInStarts) {
        showToast.warning("Check-in has not started yet");
        return;
      }
      if (afterCheckOutClosed) {
        showToast.warning("Check-out window closed");
        return;
      }
    }

    if (!record?.checkInAt) {
      showToast.warning("Check in first before checking out");
      return;
    }
    if (record.checkOutAt) {
      showToast.warning("Attendance already checked out for today");
      return;
    }

    try {
      await markCheckOut({ date: today }).unwrap();
      await refetch();
      showToast.success("Check out saved");
    } catch (error: any) {
      showToast.error(
        extractErrorMessage(error, "Unable to check out. Please try again."),
      );
    }
  };

  const handleMarkLeave = async () => {
    if (attendanceGateLocked) {
      showToast.warning(statusMessage);
      return;
    }

    if (record?.checkInAt || record?.checkOutAt) {
      showToast.warning("Leave can only be marked before check in");
      return;
    }
    try {
      await markLeave({ date: today }).unwrap();
      await refetch();
      showToast.success("Leave saved");
    } catch (error: any) {
      showToast.error(
        extractErrorMessage(error, "Unable to mark leave. Please try again."),
      );
    }
  };

  const handleMarkHalfDay = async () => {
    if (attendanceGateLocked) {
      showToast.warning(statusMessage);
      return;
    }

    if (record?.checkOutAt) {
      showToast.warning("Half day cannot be changed after checkout");
      return;
    }

    try {
      await markCheckOut({ date: today }).unwrap();
      await refetch();
      showToast.success("Half day saved");
    } catch (error: any) {
      showToast.error(
        extractErrorMessage(error, "Unable to mark half day. Please try again."),
      );
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["left", "right", "bottom"]}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["left", "right", "bottom"]}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={
              isFetching ||
              checkInState.isLoading ||
              checkOutState.isLoading ||
              leaveState.isLoading
            }
            onRefresh={refetch}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View style={styles.badge}>
              <Ionicons name="time-outline" size={14} color={COLORS.primary} />
              <Text style={styles.badgeText}>Teacher attendance</Text>
            </View>
            <View style={styles.datePill}>
              <Ionicons
                name="calendar-outline"
                size={14}
                color={COLORS.textSecondary}
              />
              <Text style={styles.datePillText}>
                {new Date().toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </Text>
            </View>
          </View>

          <Text style={styles.title}>My attendance</Text>
          <Text style={styles.subtitle}>
            Check in when you arrive and check out before you leave.
          </Text>

          <View style={styles.statusRow}>
            <View style={styles.statusPill}>
              <Text style={styles.statusPillLabel}>Status</Text>
              <Text style={styles.statusPillValue}>{statusLabel}</Text>
            </View>
            <View style={styles.statusPill}>
              <Text style={styles.statusPillLabel}>Checked in</Text>
              <Text style={styles.statusPillValue}>
                {checkInTime ? "Yes" : "No"}
              </Text>
            </View>
            <View style={styles.statusPill}>
              <Text style={styles.statusPillLabel}>Checked out</Text>
              <Text style={styles.statusPillValue}>
                {checkOutTime ? "Yes" : "No"}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.logCard}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.sectionLabel}>Daily log</Text>
              <Text style={styles.sectionTitle}>Today overview</Text>
            </View>
            <View style={styles.smallPill}>
              <Text style={styles.smallPillText}>Live</Text>
            </View>
          </View>

          <View style={styles.timelineGrid}>
            <View style={styles.timelineBox}>
              <Text style={styles.timelineCaption}>Check-in</Text>
              <Text style={styles.timelineValue}>{formatClock(checkInTime)}</Text>
            </View>
            <View style={styles.timelineBox}>
              <Text style={styles.timelineCaption}>Check-out</Text>
              <Text style={styles.timelineValue}>{formatClock(checkOutTime)}</Text>
            </View>
          </View>

          <View style={styles.banner}>
            <Ionicons
              name="shield-checkmark-outline"
              size={18}
              color={COLORS.primary}
            />
            <Text style={styles.bannerText}>{statusMessage}</Text>
          </View>
        </View>

        <View style={styles.buttonRow}>
          <Pressable
            onPress={handleCheckIn}
            disabled={disableCheckInButton}
            style={({ pressed }) => [
              styles.button,
              pressed && styles.pressed,
              disableCheckInButton && styles.disabledBtn,
            ]}
          >
            <Text style={styles.buttonText}>Check In</Text>
          </Pressable>

          <Pressable
            onPress={handleCheckOut}
            disabled={disableCheckOutButton}
            style={({ pressed }) => [
              styles.button,
              pressed && styles.pressed,
              disableCheckOutButton && styles.disabledBtn,
            ]}
          >
            <Text style={styles.buttonText}>Check Out</Text>
          </Pressable>
        </View>

        <View style={styles.buttonRow}>
          <Pressable
            onPress={handleMarkLeave}
            disabled={disableLeaveButton}
            style={({ pressed }) => [
              styles.button,
              pressed && styles.pressed,
              disableLeaveButton && styles.disabledBtn,
            ]}
          >
            <Text style={styles.buttonText}>Mark Leave</Text>
          </Pressable>

          <Pressable
            onPress={handleMarkHalfDay}
            disabled={disableHalfDayButton}
            style={({ pressed }) => [
              styles.button,
              pressed && styles.pressed,
              disableHalfDayButton && styles.disabledBtn,
            ]}
          >
            <Text style={styles.buttonText}>Half Day</Text>
          </Pressable>
        </View>

        <View style={styles.noteCard}>
          <Ionicons
            name="shield-checkmark-outline"
            size={18}
            color={COLORS.primary}
          />
          <Text style={styles.noteText}>
            Use the same daily flow from this screen. If your school timing
            changes, refresh to see the latest state.
          </Text>
        </View>

        <View style={styles.quickSection}>
          <Text style={styles.sectionLabel}>Quick access</Text>
          <Pressable
            onPress={() => navigation.navigate("AttendanceHistory")}
            style={({ pressed }) => [styles.linkRow, pressed && styles.pressed]}
          >
            <View style={styles.linkLeft}>
              <View style={styles.linkIcon}>
                <Ionicons
                  name="documents-outline"
                  size={18}
                  color={COLORS.primary}
                />
              </View>
              <View style={styles.linkTextWrap}>
                <Text style={styles.linkTitle}>Attendance History</Text>
                <Text style={styles.linkSub}>View your daily check-in log.</Text>
              </View>
            </View>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={COLORS.textTertiary}
            />
          </Pressable>

          <Pressable
            onPress={() => navigation.navigate("Timetable")}
            style={({ pressed }) => [styles.linkRow, pressed && styles.pressed]}
          >
            <View style={styles.linkLeft}>
              <View style={styles.linkIcon}>
                <Ionicons
                  name="calendar-outline"
                  size={18}
                  color={COLORS.primary}
                />
              </View>
              <View style={styles.linkTextWrap}>
                <Text style={styles.linkTitle}>Open Timetable</Text>
                <Text style={styles.linkSub}>Check today's live classes.</Text>
              </View>
            </View>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={COLORS.textTertiary}
            />
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AttendanceScreen;

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: COLORS.background,
    flex: 1,
  },
  container: {
    paddingHorizontal: SPACING.md,
    paddingTop: 0,
    paddingBottom: SPACING.lg,
  },
  loadingWrap: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  heroCard: {
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderRadius: 24,
    borderWidth: 1,
    padding: SPACING.md,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 2,
  },
  heroTopRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: SPACING.sm,
  },
  badge: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: COLORS.primarySoft,
    borderRadius: 999,
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
  },
  badgeText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "800",
  },
  datePill: {
    alignItems: "center",
    backgroundColor: COLORS.cardMuted,
    borderColor: COLORS.border,
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
  },
  datePillText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: "700",
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 24,
    fontWeight: "800",
    marginTop: SPACING.md,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
  statusRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  statusPill: {
    backgroundColor: COLORS.cardMuted,
    borderColor: COLORS.border,
    borderRadius: 16,
    borderWidth: 1,
    flexGrow: 1,
    minWidth: 96,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  statusPillLabel: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  statusPillValue: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: "800",
  },
  logCard: {
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderRadius: 24,
    borderWidth: 1,
    marginTop: SPACING.md,
    padding: SPACING.md,
  },
  cardHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sectionLabel: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  sectionTitle: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: "800",
    marginTop: 2,
  },
  smallPill: {
    backgroundColor: COLORS.primarySoft,
    borderRadius: 999,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
  },
  smallPillText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "800",
  },
  timelineGrid: {
    flexDirection: "row",
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  timelineBox: {
    backgroundColor: COLORS.cardMuted,
    borderColor: COLORS.border,
    borderRadius: 18,
    borderWidth: 1,
    flex: 1,
    padding: SPACING.md,
  },
  timelineCaption: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: "700",
  },
  timelineValue: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: "800",
    marginTop: 4,
  },
  banner: {
    alignItems: "center",
    backgroundColor: COLORS.primarySoft,
    borderRadius: 18,
    flexDirection: "row",
    gap: 8,
    marginTop: SPACING.md,
    padding: SPACING.sm,
  },
  bannerText: {
    color: COLORS.textPrimary,
    flex: 1,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 19,
  },
  buttonRow: {
    flexDirection: "row",
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  button: {
    alignItems: "center",
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    flex: 1,
    paddingVertical: 13,
  },
  buttonText: {
    color: COLORS.textInverse,
    fontSize: 14,
    fontWeight: "800",
  },
  disabledBtn: {
    opacity: 0.45,
  },
  noteCard: {
    alignItems: "center",
    backgroundColor: COLORS.primarySoft,
    borderRadius: 18,
    flexDirection: "row",
    gap: 8,
    marginTop: SPACING.md,
    padding: SPACING.sm,
  },
  noteText: {
    color: COLORS.textPrimary,
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
  },
  quickSection: {
    marginTop: SPACING.md,
  },
  linkRow: {
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: SPACING.sm,
    padding: SPACING.sm,
  },
  linkIcon: {
    alignItems: "center",
    backgroundColor: COLORS.primarySoft,
    borderRadius: 14,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  linkLeft: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
  },
  linkTextWrap: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  linkTitle: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: "800",
  },
  linkSub: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  noteRow: {
    alignItems: "center",
    flexDirection: "row",
  },
  pressed: {
    opacity: 0.92,
  },
});
