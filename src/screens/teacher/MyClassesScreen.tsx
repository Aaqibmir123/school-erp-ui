import React, { useMemo } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";

import BrandLoader from "@/src/components/BrandLoader";
import FallbackBanner from "@/src/components/FallbackBanner";
import { COLORS, RADIUS, SHADOWS, SPACING } from "@/src/theme";
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
    const subjectCount = Object.keys(item.subjectMap || {}).length;
    const sectionCount = Object.values(item.subjectMap || {}).reduce(
      (count: number, sub: any) => count + (sub.sections?.length || 0),
      0,
    );

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleWrap}>
            <Text style={styles.className}>{capitalize(item.className)}</Text>
            <Text style={styles.cardMeta}>
              {subjectCount} subjects • {sectionCount} sections
            </Text>
          </View>
          <View style={styles.countPill}>
            <Text style={styles.countPillText}>{subjectCount}</Text>
          </View>
        </View>

        {Object.values(item.subjectMap).map((sub: any, i: number) => (
          <View key={i} style={styles.row}>
            <View style={styles.subjectPill}>
              <Text style={styles.subject}>{capitalize(sub.subjectName)}</Text>
            </View>

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
        <BrandLoader />
      </View>
    );
  }

  return (
    <View style={styles.container}>
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
  card: {
    ...SHADOWS.soft,
    backgroundColor: "#F2F7FF",
    borderColor: "#D6E4FF",
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    marginBottom: SPACING.md,
    padding: SPACING.lg,
  },
  cardHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: SPACING.md,
  },
  cardTitleWrap: {
    flex: 1,
    paddingRight: SPACING.sm,
  },
  className: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: "800",
  },
  cardMeta: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },
  countPill: {
    alignItems: "center",
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
    height: 34,
    justifyContent: "center",
    width: 34,
  },
  countPillText: {
    color: COLORS.textInverse,
    fontSize: 13,
    fontWeight: "800",
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    flexWrap: "wrap",
    marginBottom: SPACING.sm,
  },
  subjectPill: {
    backgroundColor: "rgba(255,255,255,0.75)",
    borderColor: "rgba(191,219,254,0.85)",
    borderRadius: RADIUS.full,
    borderWidth: 1,
    marginRight: SPACING.xs,
    marginBottom: 6,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
  },
  subject: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: "700",
  },
  sectionWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  badge: {
    backgroundColor: "rgba(29,78,216,0.10)",
    borderColor: "rgba(29,78,216,0.16)",
    borderWidth: 1,
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
    alignItems: "center",
    justifyContent: "center",
  },
  listContent: {
    paddingBottom: SPACING.xl,
  },
});
