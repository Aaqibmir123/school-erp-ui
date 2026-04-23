// src/screens/teacher/results/EnterMarksScreen.tsx

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as DocumentPicker from "expo-document-picker";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import {
  useDeleteResultMutation,
  useGetResultsByExamQuery
} from "../../../api/teacher/teacherApi";

const BASE_URL = "https://alertly-prehensile-gretta.ngrok-free.dev/api";

const EnterMarksScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const exam = route.params?.exam;

  const classId = exam?.classId?._id || exam?.classId;
  const sectionId = exam?.sectionId?._id || exam?.sectionId;
  const examId = exam?._id;

  const { data: students = [], isLoading } = useGetStudentsByClassApiQuery(
    { classId, sectionId },
    { skip: !classId },
  );

  const { data: resultsData, refetch } = useGetResultsByExamQuery({ examId });

  const [deleteResult] = useDeleteResultMutation(); // ✅

  const [marksData, setMarksData] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const [uploadedCount, setUploadedCount] = useState(0);
  const [totalStudents, setTotalStudents] = useState(0);

  const progressPercent = useMemo(() => {
    return totalStudents === 0
      ? 0
      : Math.round((uploadedCount / totalStudents) * 100);
  }, [uploadedCount, totalStudents]);

  /* ================= MERGE ================= */
  useEffect(() => {
    if (!students.length) return;

    const resultMap: any = {};

    if (resultsData?.data) {
      resultsData.data.forEach((r: any) => {
        resultMap[r.studentId._id] = r;
      });
    }

    const merged: any = {};

    students.forEach((s: any) => {
      const result = resultMap[s._id];

      merged[s._id] = {
        marks: result?.marksObtained?.toString() || "",
        fileUri: result?.marksheetUrl || null,
        fileName: result?.marksheetUrl
          ? result.marksheetUrl.split("/").pop()
          : null,
        fileType: "image/jpeg",
        isSaved: !!result,
        resultId: result?._id || null, // ✅ IMPORTANT
      };
    });

    setMarksData(merged);
  }, [students, resultsData]);

  /* ================= MARKS ================= */
  const handleMarksChange = useCallback((id: string, value: string) => {
    setMarksData((prev: any) => ({
      ...prev,
      [id]: {
        ...prev[id],
        marks: value,
      },
    }));
  }, []);

  /* ================= FILE ================= */
  const handleUpload = async (id: string) => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ["application/pdf", "image/*"],
    });

    if (result.canceled) return;

    const file = result.assets[0];

    setMarksData((prev: any) => ({
      ...prev,
      [id]: {
        ...prev[id],
        fileName: file.name,
        fileUri: file.uri,
        fileType: file.mimeType,
      },
    }));
  };

  /* ================= DELETE ================= */
  const handleDelete = async (studentId: string) => {
    const data = marksData[studentId];

    if (!data?.resultId) {
      Alert.alert("No saved result");
      return;
    }

    Alert.alert("Confirm", "Delete this result?", [
      {
        text: "Cancel",
      },
      {
        text: "Delete",
        onPress: async () => {
          try {
            await deleteResult(data.resultId).unwrap();

            Alert.alert("Deleted");

            refetch(); // 🔥 refresh
          } catch (err) {
            Alert.alert("Error deleting");
          }
        },
      },
    ]);
  };

  /* ================= SAVE ================= */
  const handleSave = async () => {
    try {
      setLoading(true);

      const token = await AsyncStorage.getItem("token");

      const validStudents = Object.keys(marksData).filter((id) => {
        const item = marksData[id];
        return item?.marks || item?.fileUri;
      });

      if (!validStudents.length) {
        Alert.alert("No data");
        return;
      }

      setTotalStudents(validStudents.length);
      setUploadedCount(0);

      const chunkSize = 10;

      for (let i = 0; i < validStudents.length; i += chunkSize) {
        const chunkIds = validStudents.slice(i, i + chunkSize);

        const formData = new FormData();
        const resultsArray: any[] = [];

        chunkIds.forEach((studentId) => {
          const item = marksData[studentId];

          resultsArray.push({
            examId: exam._id,
            studentId,
            classId: exam.classId._id,
            subjectId: exam.subjectId._id,
            marksObtained: Number(item.marks || 0),
            totalMarks: exam.totalMarks || 100,
          });

          if (item.fileUri && !item.fileUri.startsWith("http")) {
            formData.append(`file_${studentId}`, {
              uri: item.fileUri,
              name: item.fileName,
              type: item.fileType || "image/jpeg",
            } as any);
          }
        });

        formData.append("results", JSON.stringify(resultsArray));

        const response = await fetch(`${BASE_URL}/result/create`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        if (!response.ok) throw new Error("Upload failed");

        setUploadedCount((prev) => prev + chunkIds.length);
      }

      Alert.alert("Saved ✅");
      refetch(); // 🔥 refresh
    } catch (err: any) {
      Alert.alert("Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */
  const renderItem = ({ item }: any) => {
    const studentData = marksData[item._id] || {};

    return (
      <View style={styles.card}>
        <Text style={styles.name}>
          [{item.rollNumber}] {item.firstName} {item.lastName}
        </Text>

        <TextInput
          style={styles.input}
          value={studentData.marks}
          keyboardType="numeric"
          onChangeText={(val) => handleMarksChange(item._id, val)}
        />

        {studentData.fileUri && (
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("ResultPreview", {
                fileUrl: studentData.fileUri,
              })
            }
          >
            <Text style={styles.file}>📎 View</Text>
          </TouchableOpacity>
        )}

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.uploadBtn}
            onPress={() => handleUpload(item._id)}
          >
            <Text style={styles.btnText}>Upload</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => handleDelete(item._id)}
          >
            <Text style={styles.btnText}>Delete</Text>
          </TouchableOpacity>
        </View>

        {studentData.isSaved && <Text style={styles.saved}>Saved</Text>}
      </View>
    );
  };

  if (isLoading) return <Text style={styles.center}>Loading...</Text>;

  return (
    <View style={styles.container}>
      <FlatList
        data={students}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
      />

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveText}>Save Results</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default EnterMarksScreen;

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f6fa" },

  card: {
    backgroundColor: "#fff",
    margin: 10,
    padding: 14,
    borderRadius: 12,
  },

  name: { fontWeight: "bold" },

  input: {
    borderWidth: 1,
    marginTop: 5,
    padding: 8,
    borderRadius: 6,
  },

  file: { color: "blue", marginTop: 5 },

  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },

  uploadBtn: {
    backgroundColor: "#1677ff",
    padding: 8,
    borderRadius: 6,
  },

  deleteBtn: {
    backgroundColor: "red",
    padding: 8,
    borderRadius: 6,
  },

  btnText: { color: "#fff" },

  saved: {
    color: "green",
    marginTop: 5,
  },

  saveBtn: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "#1677ff",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },

  saveText: {
    color: "#fff",
    fontWeight: "bold",
  },

  center: { textAlign: "center", marginTop: 20 },
});
