import { useNavigation, useRoute } from "@react-navigation/native";
import React from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useGetMyExamsQuery } from "../../../api/teacher/teacherApi";

const SelectExamScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const mode = route.params?.mode;

  const { data: exams = [], isLoading } = useGetMyExamsQuery();

  const handleSelect = (exam: any) => {
    if (mode === "view") {
      navigation.navigate("ResultList", { exam });
    } else {
      navigation.navigate("EnterMarks", { exam });
    }
  };

  if (isLoading) return <Text style={{ padding: 20 }}>Loading...</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Exam</Text>

      <FlatList
        data={exams}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => handleSelect(item)}
          >
            <Text style={styles.name}>{item.name}</Text>

            <Text style={styles.meta}>
              {item.classId?.name} • {item.subjectId?.name}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export default SelectExamScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },

  title: { fontSize: 20, fontWeight: "bold", marginBottom: 15 },

  card: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
  },

  name: { fontWeight: "600", fontSize: 16 },

  meta: { color: "#666", marginTop: 4 },
});
