import React from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";

const data = [
  { id: "1", name: "Aaqib", roll: 5, marks: 45 },
  { id: "2", name: "Ali", roll: 6, marks: 30 },
];

const ResultListScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Results</Text>

      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text>{item.roll}</Text>
            <Text>{item.name}</Text>
            <Text>{item.marks}</Text>
          </View>
        )}
      />
    </View>
  );
};

export default ResultListScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },

  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
});
