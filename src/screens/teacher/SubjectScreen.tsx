import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const subjectColors = ["#1677ff", "#52c41a", "#faad14", "#eb2f96", "#13c2c2"];

const subjectIcons: any = {
  Math: "calculator",
  English: "book",
  Urdu: "document-text",
  Science: "flask",
  Computer: "laptop",
};

export default function SubjectScreen({ route, navigation }: any) {
  const { subjects = [], classId, sectionId, className } = route.params || {};

  const [selected, setSelected] = useState<string | null>(null);

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <Text style={styles.title}>{className}</Text>
      <Text style={styles.subtitle}>
        Subjects (Actions available in Timetable)
      </Text>

      {/* SUBJECT LIST */}
      {subjects.map((sub: any, index: number) => {
        const isActive = selected === sub.subjectId;

        return (
          <TouchableOpacity
            key={sub.subjectId}
            style={[
              styles.card,
              { backgroundColor: subjectColors[index % subjectColors.length] },
              isActive && styles.activeCard,
            ]}
            onPress={() => {
              setSelected(sub.subjectId);

              // 🔥 IMPORTANT CHANGE
              navigation.navigate("Students", {
                subjectId: sub.subjectId,
                classId,
                sectionId: sectionId || "",
                mode: "view", // 🔥 VIEW MODE
                 fromTimetable: false, // optional
              });
            }}
          >
            {/* LEFT */}
            <View style={styles.row}>
              <Ionicons
                name={subjectIcons[sub.subjectName] || "book-outline"}
                size={20}
                color="#fff"
              />

              <Text style={styles.subjectText}>{sub.subjectName}</Text>
            </View>

            {/* RIGHT */}
            {isActive && (
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f7fb",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
  },
  subtitle: {
    color: "#666",
    marginBottom: 16,
  },
  card: {
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 3,
  },
  activeCard: {
    borderWidth: 2,
    borderColor: "#000",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  subjectText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 10,
  },
});
