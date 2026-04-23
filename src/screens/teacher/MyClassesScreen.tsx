import React, { useMemo } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";

import FallbackBanner from "@/src/components/FallbackBanner";
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from "@/src/theme";
import { useGetMyClassesQuery } from "../../api/teacher/teacherApi";

const capitalize = (str: string) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1) : "";

const MyClassesScreen = () => {
  const { data: classes = [], isLoading, refetch } = useGetMyClassesQuery();

  const grouped = useMemo(() => {
    const map: any = {};

    classes.forEach((item: any) => {
      if (!map[item.classId]) {
        map[item.classId] = {
          classId: item.classId,
          className: item.className,
          subjectMap: {},
        };
      }

      item.subjects?.forEach((sub: any) => {
        if (!map[item.classId].subjectMap[sub.subjectId]) {
          map[item.classId].subjectMap[sub.subjectId] = {
            subjectName: sub.subjectName,
            sections: [],
          };
        }

        item.sections?.forEach((sec: any) => {
          const exists = map[item.classId].subjectMap[
            sub.subjectId
          ].sections.find((s: any) => s._id === sec._id);

          if (!exists) {
            map[item.classId].subjectMap[sub.subjectId].sections.push(sec);
          }
        });
      });
    });

    return Object.values(map);
  }, [classes]);

  const renderItem = ({ item }: any) => {
    return (
      <View style={styles.card}>
        <Text style={styles.className}>{capitalize(item.className)}</Text>

        {Object.values(item.subjectMap).map((sub: any, i: number) => (
          <View key={i} style={styles.row}>
            <Text style={styles.subject}>{capitalize(sub.subjectName)}:</Text>

            <View style={styles.sectionWrap}>
              {sub.sections.map((sec: any) => (
                <View key={sec._id} style={styles.badge}>
                  <Text style={styles.badgeText}>{capitalize(sec.name)}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading classes</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.kicker}>Teaching load</Text>
      <Text style={styles.heading}>My Classes</Text>
      <Text style={styles.subtitle}>
        Subjects and sections grouped for a cleaner scan on mobile.
      </Text>

      <FlatList
        data={grouped}
        keyExtractor={(item: any) => item.classId}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        onRefresh={refetch}
        refreshing={isLoading}
        ListEmptyComponent={<FallbackBanner title="No classes found" />}
      />
    </View>
  );
};

export default React.memo(MyClassesScreen);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  heading: {
    ...TYPOGRAPHY.headline,
    color: COLORS.textPrimary,
  },
  kicker: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  subtitle: {
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    marginTop: SPACING.xs,
  },
  card: {
    ...SHADOWS.soft,
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    marginBottom: SPACING.md,
    padding: SPACING.lg,
  },
  className: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: "800",
    marginBottom: SPACING.sm,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    flexWrap: "wrap", // 💣 important
    marginBottom: SPACING.sm,
  },
  subject: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: "700",
    marginRight: SPACING.xs,
  },
  sectionWrap: {
    flexDirection: "row",
    flexWrap: "wrap", // 💣 wrap fix
  },
  badge: {
    backgroundColor: COLORS.primarySoft,
    borderRadius: RADIUS.full,
    marginRight: SPACING.xs,
    marginBottom: 4,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
  },
  badgeText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "700",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    paddingBottom: SPACING.xl,
  },
  loadingText: {
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
  },
});
