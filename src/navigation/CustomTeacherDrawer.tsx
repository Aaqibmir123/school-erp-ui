import React from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import {
  DrawerContentScrollView,
  DrawerItemList,
} from "@react-navigation/drawer";
import { LinearGradient } from "expo-linear-gradient";

import { APP_ENV } from "@/src/config/env";
import { useAuth } from "@/src/context/AuthContext";
import { COLORS, RADIUS, SHADOWS, SPACING } from "@/src/theme";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

const CustomTeacherDrawer = (props: any) => {
  const { navigation } = props;
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      return;
    }
  };

  const avatarUri = user?.image
    ? /^https?:\/\//i.test(user.image)
      ? user.image
      : `${APP_ENV.SERVER_URL}${user.image.startsWith("/") ? "" : "/"}${user.image}`
    : null;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom", "left"]}>
      <View style={styles.container}>
        <DrawerContentScrollView
          {...props}
          contentContainerStyle={styles.content}
        >
          <LinearGradient
            colors={[COLORS.primaryDark, COLORS.primary]}
            style={styles.header}
          >
            <View style={styles.profileRow}>
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarFallback}>
                  <Text style={styles.avatarText}>
                    {user?.name?.charAt(0) || "T"}
                  </Text>
                </View>
              )}

              <View style={styles.profileTextWrap}>
                <Text style={styles.name}>{user?.name || "Teacher"}</Text>
                <Text style={styles.role}>{user?.role}</Text>
              </View>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.profileCard,
                pressed && styles.pressed,
              ]}
              onPress={() =>
                navigation.navigate("Home", {
                  screen: "Profile",
                })
              }
            >
              <Ionicons name="person-outline" size={18} color={COLORS.primary} />
              <View style={styles.profileCardText}>
                <Text style={styles.profileCardTitle}>My Profile</Text>
                <Text style={styles.profileCardSub}>
                  Photo, contact, and personal details
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={COLORS.primary}
              />
            </Pressable>
          </LinearGradient>

          <View style={styles.menu}>
            <DrawerItemList {...props} />
          </View>
        </DrawerContentScrollView>

        <View
          style={[
            styles.footer,
            { paddingBottom: Math.max(insets.bottom, SPACING.md) },
          ]}
        >
          <TouchableOpacity style={styles.logout} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={22} color={COLORS.danger} />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default CustomTeacherDrawer;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  safeArea: {
    backgroundColor: COLORS.background,
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingTop: 0,
  },
  header: {
    borderBottomLeftRadius: RADIUS.xl,
    borderBottomRightRadius: RADIUS.xl,
    marginBottom: SPACING.md,
    padding: SPACING.lg,
    paddingTop: SPACING.xl,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  avatarFallback: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.primary,
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
    opacity: 0.82,
    textTransform: "capitalize",
  },
  profileCard: {
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    flexDirection: "row",
    gap: SPACING.sm,
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  profileCardText: {
    flex: 1,
  },
  profileCardTitle: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: "800",
  },
  profileCardSub: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  menu: {
    paddingHorizontal: SPACING.xs,
  },
  footer: {
    padding: SPACING.md,
  },
  logout: {
    ...SHADOWS.soft,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.card,
  },
  logoutText: {
    marginLeft: 10,
    color: COLORS.danger,
    fontWeight: "700",
    fontSize: 15,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
  profileTextWrap: {
    flex: 1,
  },
});
