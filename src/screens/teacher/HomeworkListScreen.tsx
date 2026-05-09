"use client";

import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import {
  Alert,
  FlatList,
  RefreshControl,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import BrandLoader from "@/src/components/BrandLoader";
import FallbackBanner from "@/src/components/FallbackBanner";
import HomeworkCard from "@/src/components/homework/HomeworkCard";
import { COLORS, SPACING, TYPOGRAPHY } from "@/src/theme";
import { showToast } from "@/src/utils/toast";
import {
  useDeleteHomeworkMutation,
  useGetTeacherHomeworkQuery,
} from "../../api/teacher/teacherApi";

const HomeworkListScreen = () => {
  const navigation = useNavigation<any>();
  const openCreateHomework = (params?: any) => {
    const rootNav = navigation.getParent?.()?.getParent?.();

    if (rootNav?.navigate) {
      rootNav.navigate("CreateHomework", params);
      return;
    }

    navigation.navigate("CreateHomework", params);
  };

  /* ================= RTK QUERY ================= */
  const {
    data: homework = [],
    isLoading,
    isFetching,
    refetch,
  } = useGetTeacherHomeworkQuery();

  /* ================= RTK MUTATION ================= */
  const [deleteHomework] = useDeleteHomeworkMutation();

  /* ================= DELETE ================= */
  const handleDelete = (id: string) => {
    Alert.alert("Delete Homework", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteHomework(id).unwrap();
          } catch {
            showToast.error("Unable to delete homework");
          }
        },
      },
    ]);
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
      <View style={styles.headerRow}>
        <Text style={styles.title}>Homework</Text>

        <Pressable
          onPress={() => openCreateHomework()}
          style={({ pressed }) => [styles.createButton, pressed && styles.pressed]}
        >
          <Ionicons name="add" size={18} color={COLORS.textInverse} />
          <Text style={styles.createButtonText}>New</Text>
        </Pressable>
      </View>

      <FlatList
        data={homework}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl refreshing={isFetching} onRefresh={refetch} />
        }
        ListEmptyComponent={<FallbackBanner title="No homework found" />}
        renderItem={({ item }) => (
          <HomeworkCard
            item={item}
            onPress={() => {}}
            onCheck={() =>
              navigation.navigate("HomeworkCheck", {
                homeworkId: item._id,
                students: item.students,
                classId: item.classId,
                subjectId: item.subjectId,
                sectionId: item.sectionId,
                maxMarks: item.maxMarks,
              })
            }
            onEdit={() =>
              openCreateHomework({
                isEdit: true,
                homework: item,
              })
            }
            onDelete={() => handleDelete(item._id)}
          />
        )}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

export default HomeworkListScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  headerRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: SPACING.xs,
  },
  center: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  createButton: {
    alignItems: "center",
    backgroundColor: COLORS.primary,
    borderRadius: 999,
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
  },
  createButtonText: {
    color: COLORS.textInverse,
    fontSize: 13,
    fontWeight: "800",
  },
  listContent: {
    paddingBottom: SPACING.xl,
  },
  title: {
    ...TYPOGRAPHY.headline,
    color: COLORS.textPrimary,
    flex: 1,
    marginTop: 0,
    paddingRight: SPACING.sm,
  },
  pressed: {
    opacity: 0.92,
  },
});
