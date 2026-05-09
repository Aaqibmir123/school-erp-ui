import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import BrandLoader from "@/src/components/BrandLoader";
import FallbackBanner from "@/src/components/FallbackBanner";
import { COLORS, RADIUS, SHADOWS, SPACING } from "@/src/theme";
import { showToast } from "@/src/utils/toast";
import {
  useDeleteExamMutation,
  useGetMyExamsQuery,
} from "../../../api/teacher/teacherApi";
import CreateExamModal from "./CreateExamModal";

const CreateExamScreen = () => {
  const navigation = useNavigation<any>();
  const [open, setOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<any>(null);

  const { data: exams = [], isLoading, isFetching, refetch } = useGetMyExamsQuery();
  const [deleteExam] = useDeleteExamMutation();

  const handleEdit = (item: any) => {
    setEditingExam(item);
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteExam(id).unwrap();
      showToast.success("Exam deleted");
      refetch();
    } catch {
      showToast.error("Unable to delete exam");
    }
  };

  const renderItem = ({ item }: any) => {
    const className = item.classIds?.[0]?.name || "All classes";
    const sectionName = item.sectionId?.name || "All sections";
    const subjectName = item.subjectId?.name || "Subject";
    const totalMarks = Number(item.totalMarks || 0);
    const examDate = item.date
      ? new Intl.DateTimeFormat("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }).format(new Date(item.date))
      : "No date";
    const canAddMarks = Boolean(
      item._id && item.subjectId?._id && item.classIds?.[0]?._id,
    );

    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <View style={styles.cardTitleWrap}>
            <Text style={styles.title}>{item.name}</Text>
            <View style={styles.examBadge}>
              <Text style={styles.examBadgeText}>
                {item.examType?.replace("_", " ") || "Exam"}
              </Text>
            </View>
          </View>

          <View style={styles.marksBadge}>
            <Text style={styles.marksBadgeText}>{totalMarks} Marks</Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaChip}>
            <Text style={styles.metaChipText}>{className}</Text>
          </View>
          <View style={styles.metaChipSoft}>
            <Text style={styles.metaChipTextSoft}>{sectionName}</Text>
          </View>
          <View style={styles.metaChipSoft}>
            <Text style={styles.metaChipTextSoft}>{subjectName}</Text>
          </View>
          <View style={styles.metaChipSoft}>
            <Text style={styles.metaChipTextSoft}>{examDate}</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.textBtn, !canAddMarks && styles.textBtnDisabled]}
            disabled={!canAddMarks}
            onPress={() =>
              navigation.navigate("ExamMarks", {
                examId: item._id,
                subjectId: item.subjectId?._id,
                classId: item.classIds?.[0]?._id,
                sectionId: item.sectionId?._id || null,
                totalMarks,
                examName: item.name,
                className,
                sectionName,
              })
            }
          >
            <Ionicons name="calculator-outline" size={16} color="#fff" />
            <Text style={styles.textBtnText}>Add marks</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconBtn} onPress={() => handleEdit(item)}>
            <Ionicons name="create-outline" size={18} color="#4F46E5" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.iconBtn, styles.deleteBtn]}
            onPress={() => handleDelete(item._id)}
          >
            <Ionicons name="trash-outline" size={18} color="#EF4444" />
          </TouchableOpacity>
        </View>
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
        data={exams}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isFetching} onRefresh={refetch} />
        }
        ListEmptyComponent={<FallbackBanner title="No exams created yet" />}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          setEditingExam(null);
          setOpen(true);
        }}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      <CreateExamModal
        visible={open}
        onClose={() => setOpen(false)}
        editingExam={editingExam}
        onSuccess={refetch}
      />
    </View>
  );
};

export default React.memo(CreateExamScreen);

const styles = StyleSheet.create({
  actions: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "flex-end",
    marginTop: SPACING.md,
    flexWrap: "wrap",
  },
  card: {
    backgroundColor: "#fff",
    borderColor: "rgba(79,70,229,0.14)",
    borderRadius: 18,
    borderWidth: 1,
    elevation: 4,
    marginBottom: 14,
    padding: 16,
  },
  cardTop: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  cardTitleWrap: {
    flex: 1,
    gap: 8,
  },
  center: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  container: {
    backgroundColor: "#F5F7FB",
    flex: 1,
    padding: 16,
  },
  deleteBtn: {
    borderColor: "rgba(239,68,68,0.18)",
    backgroundColor: "rgba(239,68,68,0.08)",
  },
  examBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(79,70,229,0.08)",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  examBadgeText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: "600",
  },
  fab: {
    alignItems: "center",
    backgroundColor: COLORS.primary,
    bottom: 30,
    elevation: 10,
    height: 60,
    justifyContent: "center",
    position: "absolute",
    right: 20,
    width: 60,
    borderRadius: 30,
  },
  iconBtn: {
    alignItems: "center",
    backgroundColor: "#fff",
    borderColor: "rgba(79,70,229,0.14)",
    borderRadius: 12,
    borderWidth: 1,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  marksBadge: {
    backgroundColor: "rgba(34,197,94,0.10)",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  marksBadgeText: {
    color: "#16A34A",
    fontSize: 12,
    fontWeight: "800",
  },
  metaChip: {
    backgroundColor: "rgba(79,70,229,0.10)",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  metaChipSoft: {
    backgroundColor: "#F3F4F6",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  metaChipText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: "800",
  },
  metaChipTextSoft: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: "700",
  },
  metaRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  listContent: {
    paddingBottom: 120,
    paddingTop: SPACING.sm,
  },
  title: {
    color: "#111827",
    flex: 1,
    fontSize: 18,
    fontWeight: "900",
  },
  textBtn: {
    alignItems: "center",
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  textBtnDisabled: {
    opacity: 0.45,
  },
  textBtnText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "800",
  },
});
