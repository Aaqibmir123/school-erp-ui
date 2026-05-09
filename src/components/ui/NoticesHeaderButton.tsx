import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useGetNoticeFeedQuery } from "@/src/api/notice/notice.api";
import { useAuth } from "@/src/context/AuthContext";
import { COLORS, RADIUS } from "@/src/theme";
import { storage } from "@/src/utils/secureStorage";

type NoticesHeaderButtonProps = {
  onPress?: () => void;
  tintColor?: string;
  compact?: boolean;
};

const NoticesHeaderButton = ({
  onPress,
  tintColor,
  compact = false,
}: NoticesHeaderButtonProps) => {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const { data: notices = [] } = useGetNoticeFeedQuery();
  const [lastReadAt, setLastReadAt] = useState(0);
  const [loaded, setLoaded] = useState(false);

  const storageKey = useMemo(
    () => `notice-last-read:${user?._id || "anonymous"}:${user?.role || "guest"}`,
    [user?._id, user?.role],
  );

  useEffect(() => {
    let mounted = true;

    const loadLastReadAt = async () => {
      try {
        const value = await storage.getItem(storageKey);
        if (!mounted) return;

        const parsed = Number(value || 0);
        setLastReadAt(Number.isFinite(parsed) ? parsed : 0);
      } finally {
        if (mounted) setLoaded(true);
      }
    };

    void loadLastReadAt();

    return () => {
      mounted = false;
    };
  }, [storageKey]);

  const unreadCount = useMemo(
    () => {
      if (!loaded) return 0;

      return notices.filter((notice) => {
        const createdAt = new Date(notice.createdAt || 0).getTime();
        return createdAt > lastReadAt;
      }).length;
    },
    [loaded, notices, lastReadAt],
  );

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Open notices"
      onPress={() => {
        const now = Date.now();
        setLastReadAt(now);
        void storage.setItem(storageKey, String(now));

        if (onPress) {
          onPress();
          return;
        }
        navigation.navigate("Notices");
      }}
      style={({ pressed }) => [
        styles.button,
        compact ? styles.buttonCompact : null,
        pressed && styles.pressed,
      ]}
    >
      <Ionicons
        name="notifications-outline"
        size={21}
        color={tintColor || COLORS.textPrimary}
      />
      {unreadCount > 0 ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {unreadCount > 9 ? "9+" : String(unreadCount)}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
};

export default React.memo(NoticesHeaderButton);

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.92)",
    borderColor: COLORS.border,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  buttonCompact: {
    marginRight: 2,
  },
  badge: {
    alignItems: "center",
    backgroundColor: COLORS.danger,
    borderRadius: RADIUS.full,
    minWidth: 16,
    paddingHorizontal: 4,
    paddingVertical: 1,
    position: "absolute",
    right: -2,
    top: -3,
  },
  badgeText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "800",
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
});
