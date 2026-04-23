import { View, Text, StyleSheet } from "react-native";

export default function HomeworkDetailScreen({ route }: any) {
  const { item } = route.params;

  const formatDate = (date: string) => {
    const d = new Date(date);
    return `${d.getDate()}/${d.getMonth() + 1}`;
  };

  return (
    <View style={styles.container}>
      {/* TITLE */}
      <Text style={styles.title}>{item.title}</Text>

      {/* STATUS */}
      <Text
        style={[
          styles.status,
          item.isExpired ? styles.expired : styles.active,
        ]}
      >
        {item.isExpired ? "Expired" : "Active"}
      </Text>

      {/* DATE */}
      <Text style={styles.date}>
        Due: {formatDate(item.dueDate)}
      </Text>

      {/* DESCRIPTION */}
      {item.description && (
        <Text style={styles.description}>
          {item.description}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fb",
    padding: 16,
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 10,
  },

  status: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
  },

  active: {
    color: "green",
  },

  expired: {
    color: "red",
  },

  date: {
    fontSize: 13,
    color: "#666",
    marginBottom: 12,
  },

  description: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
});