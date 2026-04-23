import { View, Text, StyleSheet } from "react-native";

export default function HeaderCard({ name, className }: any) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hi {name} 👋</Text>
      <Text style={styles.subtitle}>{className}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 20 },
  title: { fontSize: 22, fontWeight: "700" },
  subtitle: { color: "#666", marginTop: 4 },
});