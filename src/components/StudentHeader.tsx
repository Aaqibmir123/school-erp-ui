import { useEffect, useRef, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from "@/src/theme";

type Props = {
  onSearch: (value: string) => void;
  onAllPresent: () => void;
  onAllAbsent: () => void;
};

export default function StudentHeader({
  onSearch,
  onAllPresent,
  onAllAbsent,
}: Props) {
  const [search, setSearch] = useState("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      onSearch(search);
    }, 450);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [onSearch, search]);

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Search by name or roll..."
        value={search}
        onChangeText={setSearch}
        style={styles.search}
        placeholderTextColor={COLORS.textTertiary}
      />

      <View style={styles.actions}>
        <Pressable onPress={onAllPresent} style={styles.presentBtn}>
          <Text style={styles.presentText}>Mark all present</Text>
        </Pressable>

        <Pressable onPress={onAllAbsent} style={styles.absentBtn}>
          <Text style={styles.absentText}>Mark all absent</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  search: {
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    color: COLORS.textPrimary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  actions: {
    flexDirection: "row",
    gap: SPACING.sm,
  },
  presentBtn: {
    alignItems: "center",
    backgroundColor: COLORS.successSoft,
    borderRadius: RADIUS.md,
    flex: 1,
    paddingVertical: SPACING.md,
  },
  presentText: {
    ...TYPOGRAPHY.body,
    color: COLORS.success,
    fontWeight: "700",
  },
  absentBtn: {
    alignItems: "center",
    backgroundColor: COLORS.dangerSoft,
    borderRadius: RADIUS.md,
    flex: 1,
    paddingVertical: SPACING.md,
  },
  absentText: {
    ...TYPOGRAPHY.body,
    color: COLORS.danger,
    fontWeight: "700",
  },
});
