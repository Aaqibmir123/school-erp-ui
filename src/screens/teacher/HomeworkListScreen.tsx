"use client";

import { useNavigation } from "@react-navigation/native";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";

import FallbackBanner from "@/src/components/FallbackBanner";
import { COLORS, SPACING, TYPOGRAPHY } from "@/src/theme";
import { showToast } from "@/src/utils/toast";
import {
  useDeleteHomeworkMutation,
  useGetTeacherHomeworkQuery,
} from "../../api/student/student.api";

import HomeworkCard from "@/src/components/homework/HomeworkCard";

const HomeworkListScreen = () => {
  const navigation = useNavigation<any>();

  /* ✅ RTK QUERY */
  const { data: homework = [], isLoading } = useGetTeacherHomeworkQuery();

  /* ✅ RTK MUTATION */
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
          await deleteHomework(id).unwrap(); // 🔥 important
        } catch {
          showToast.error("Unable to delete homework");
        }
      },
    },
  ]);
  };

  /* ================= LOADING ================= */
  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading homework</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.kicker}>Homework management</Text>
      <Text style={styles.title}>Assigned Homework</Text>
      <Text style={styles.subtitle}>
        Review, edit, or check submissions from a cleaner mobile layout.
      </Text>

      <FlatList
        data={homework}
        keyExtractor={(item) => item._id}
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
                sectionId: item.sectionId, // 💣 ADD THIS
              })
            }
            onEdit={() =>
              navigation.navigate("CreateHomework", {
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
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  kicker: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  title: {
    ...TYPOGRAPHY.headline,
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  subtitle: {
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    marginTop: SPACING.xs,
  },
  listContent: {
    paddingBottom: SPACING.xl,
  },
  loadingText: {
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
  },
});
