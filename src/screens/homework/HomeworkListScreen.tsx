"use client";

import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import BrandLoader from "@/src/components/BrandLoader";
import FallbackBanner from "@/src/components/FallbackBanner";
import HomeworkCard from "@/src/components/homework/HomeworkCard";
import { COLORS, RADIUS, SPACING } from "@/src/theme";
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

  const {
    data: homework = [],
    isLoading,
    refetch,
  } = useGetTeacherHomeworkQuery();
  const [deleteHomework, { isLoading: deleting }] = useDeleteHomeworkMutation();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await deleteHomework(deleteId).unwrap();
      showToast.success("Homework deleted");
      setDeleteId(null);
      await refetch();
    } catch {
      showToast.error("Unable to delete homework");
    }
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
      <View style={styles.heroRow}>
        <Pressable
          style={({ pressed }) => [styles.createBtn, pressed && styles.pressed]}
          onPress={() => openCreateHomework()}
        >
          <Ionicons name="add" size={18} color={COLORS.textInverse} />
          <Text style={styles.createText}>Create Homework</Text>
        </Pressable>
      </View>

      <FlatList
        data={homework}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshing={isLoading}
        onRefresh={refetch}
        ListEmptyComponent={
          <FallbackBanner
            title="No homework found"
            subtitle="Create the first assignment to see it here."
          />
        }
        renderItem={({ item }) => (
          <HomeworkCard
            item={item}
            onCheck={() =>
              navigation.navigate("HomeworkCheck", {
                homeworkId: item._id,
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
            onDelete={() => setDeleteId(item._id)}
          />
        )}
      />

      {deleteId ? (
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Delete homework?</Text>
            <Text style={styles.modalText}>This action cannot be undone.</Text>

            <View style={styles.actions}>
              <Pressable
                style={({ pressed }) => [
                  styles.cancelBtn,
                  pressed && styles.pressed,
                ]}
                onPress={() => setDeleteId(null)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.deleteBtn,
                  pressed && styles.pressed,
                ]}
                onPress={handleDelete}
                disabled={deleting}
              >
                <Text style={styles.deleteText}>
                  {deleting ? "Deleting..." : "Delete"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      ) : null}
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
  center: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  heroRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: SPACING.md,
    gap: SPACING.md,
  },
  createBtn: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    flexDirection: "row",
    gap: 6,
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  createText: {
    color: COLORS.textInverse,
    fontSize: 13,
    fontWeight: "800",
  },
  listContent: {
    paddingBottom: SPACING.xl,
  },
  overlay: {
    alignItems: "center",
    backgroundColor: "rgba(15, 23, 42, 0.48)",
    bottom: 0,
    justifyContent: "center",
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
  },
  modal: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    maxWidth: 360,
    padding: SPACING.lg,
    width: "86%",
  },
  modalTitle: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: "800",
  },
  modalText: {
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  actions: {
    flexDirection: "row",
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  cancelBtn: {
    alignItems: "center",
    backgroundColor: COLORS.cardMuted,
    borderRadius: RADIUS.md,
    flex: 1,
    paddingVertical: SPACING.sm,
  },
  cancelText: {
    color: COLORS.textPrimary,
    fontWeight: "700",
  },
  deleteBtn: {
    alignItems: "center",
    backgroundColor: COLORS.danger,
    borderRadius: RADIUS.md,
    flex: 1,
    paddingVertical: SPACING.sm,
  },
  deleteText: {
    color: COLORS.textInverse,
    fontWeight: "800",
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
});
