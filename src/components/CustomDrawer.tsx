import { Ionicons } from "@expo/vector-icons";
import { DrawerContentScrollView, DrawerItemList } from "@react-navigation/drawer";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "../context/AuthContext";
import { APP_ENV } from "@/src/config/env";
import { COLORS, RADIUS, SHADOWS, SPACING } from "../theme";
import { STUDENT_GLAS_CARD } from "@/src/screens/student/studentTheme";

export default function CustomDrawer(props: any) {
  const { navigation } = props;
  const insets = useSafeAreaInsets();
  const { logout, selectedStudent } = useAuth() as any;

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      return;
    }
  };

  const studentName =
    selectedStudent
      ? `${selectedStudent.firstName} ${selectedStudent.lastName}`
      : "Student";

  const avatarLabel = selectedStudent
    ? `${selectedStudent.firstName?.charAt(0) || "S"}${
        selectedStudent.lastName?.charAt(0) || ""
      }`
    : "S";
  const resolveImageUri = (value?: string | null) => {
    if (!value) return null;
    if (/^https?:\/\//i.test(value) || value.startsWith("file:")) return value;
    return `${APP_ENV.SERVER_URL}${value}`;
  };
  const avatarUri = resolveImageUri(
    selectedStudent?.profileImage || selectedStudent?.image,
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom", "left"]}>
      <View style={styles.container}>
        <DrawerContentScrollView
          {...props}
          contentContainerStyle={styles.content}
        >
          <LinearGradient
            colors={["#0F172A", "#1D4ED8", "#38BDF8"]}
            style={styles.header}
          >
            <View style={styles.profileRow}>
            <View style={styles.avatarShell}>
              {avatarUri ? (
                <Image
                  source={{ uri: avatarUri }}
                  style={styles.avatarImage}
                  contentFit="cover"
                />
              ) : (
                  <View style={styles.avatarOverlay}>
                    <Text style={styles.avatarText}>{avatarLabel}</Text>
                  </View>
                )}
              </View>

              <View style={styles.profileTextWrap}>
                <Text style={styles.name} numberOfLines={1}>
                  {studentName}
                </Text>
                <Text style={styles.role} numberOfLines={1}>
                  {selectedStudent?.classId?.name || "School Account"}
                </Text>
              </View>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.profileBtn,
                pressed && styles.pressed,
              ]}
              onPress={() => {
                navigation.closeDrawer?.();
                navigation.navigate("Home", { screen: "Profile" });
              }}
            >
              <Ionicons name="person-outline" size={16} color={COLORS.primary} />
              <Text style={styles.profileText}>View Profile</Text>
            </Pressable>
          </LinearGradient>

          <View style={styles.listWrap}>
            <DrawerItemList {...props} />
          </View>
        </DrawerContentScrollView>

        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, SPACING.md) }]}>
          <Pressable style={styles.logout} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color={COLORS.danger} />
            <Text style={styles.logoutText}>Logout</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: COLORS.background,
    flex: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingTop: 0,
  },
  header: {
    ...SHADOWS.card,
    borderBottomLeftRadius: RADIUS.xl,
    borderBottomRightRadius: RADIUS.xl,
    margin: SPACING.md,
    marginBottom: SPACING.sm,
    padding: SPACING.lg,
    ...STUDENT_GLAS_CARD,
  },
  profileRow: {
    alignItems: "center",
    flexDirection: "row",
  },
  avatarShell: {
    height: 58,
    marginRight: SPACING.md,
    width: 58,
  },
  avatarImage: {
    borderRadius: RADIUS.full,
    height: 58,
    position: "absolute",
    width: 58,
  },
  avatarOverlay: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: RADIUS.full,
    height: 58,
    justifyContent: "center",
    width: 58,
  },
  avatarText: {
    color: COLORS.primary,
    fontSize: 20,
    fontWeight: "800",
  },
  name: {
    color: COLORS.textInverse,
    fontSize: 16,
    fontWeight: "800",
  },
  role: {
    color: COLORS.textInverse,
    fontSize: 12,
    marginTop: 2,
    opacity: 0.84,
  },
  profileBtn: {
    alignSelf: "flex-start",
    alignItems: "center",
    backgroundColor: COLORS.textInverse,
    borderRadius: RADIUS.full,
    flexDirection: "row",
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  profileText: {
    color: COLORS.primary,
    fontWeight: "800",
    marginLeft: 6,
  },
  profileTextWrap: {
    flex: 1,
  },
  listWrap: {
    paddingHorizontal: SPACING.xs,
  },
  footer: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
  },
  logout: {
    ...SHADOWS.soft,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.9)",
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: RADIUS.lg,
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: SPACING.md,
  },
  logoutText: {
    color: COLORS.danger,
    fontSize: 15,
    fontWeight: "800",
    marginLeft: 8,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
});
