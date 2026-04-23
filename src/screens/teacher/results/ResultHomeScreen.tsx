import { useNavigation } from "@react-navigation/native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const ResultHomeScreen = () => {
  const navigation = useNavigation<any>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Results</Text>

      {/* VIEW RESULTS */}
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate("SelectExam", { mode: "view" })}
      >
        <Text style={styles.icon}>📊</Text>
        <Text style={styles.cardTitle}>View Results</Text>
        <Text style={styles.cardDesc}>
          Check student results and performance
        </Text>
      </TouchableOpacity>

      {/* ENTER MARKS */}
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate("SelectExam", { mode: "enter" })}
      >
        <Text style={styles.icon}>✍️</Text>
        <Text style={styles.cardTitle}>Enter Marks</Text>
        <Text style={styles.cardDesc}>Add marks and upload marksheets</Text>
      </TouchableOpacity>

      {/* UPLOAD */}
      <TouchableOpacity style={styles.card}>
        <Text style={styles.icon}>📤</Text>
        <Text style={styles.cardTitle}>Upload Marksheet</Text>
        <Text style={styles.cardDesc}>Upload bulk marksheets (optional)</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ResultHomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f6fa",
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },

  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 3,
  },

  icon: {
    fontSize: 20,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 6,
  },

  cardDesc: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
});
