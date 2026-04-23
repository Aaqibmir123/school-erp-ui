import { COLORS, SPACING } from "@/src/theme";
import React from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";

type Column = {
  title: string;
  key: string;
  render?: (item: any) => React.ReactNode;
};

const AppTable = ({ columns, data }: any) => {
  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        {columns.map((col: Column) => (
          <Text key={col.key} style={styles.headerText}>
            {col.title}
          </Text>
        ))}
      </View>

      {/* BODY */}
      <FlatList
        data={data}
        keyExtractor={(item, i) => i.toString()}
        renderItem={({ item }) => (
          <View style={styles.row}>
            {columns.map((col: Column) => (
              <View key={col.key} style={styles.cell}>
                {col.render ? (
                  col.render(item)
                ) : (
                  <Text style={styles.text}>{item[col.key]}</Text>
                )}
              </View>
            ))}
          </View>
        )}
      />
    </View>
  );
};

export default AppTable;

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
  },

  header: {
    flexDirection: "row",
    backgroundColor: COLORS.primaryLight,
    padding: SPACING.sm,
  },

  headerText: {
    flex: 1,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },

  row: {
    flexDirection: "row",
    padding: SPACING.sm,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },

  cell: {
    flex: 1,
  },

  text: {
    color: COLORS.textPrimary,
  },
});
