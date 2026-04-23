import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, View } from "react-native";

export default function HomeworkDetailScreen({ route }: any) {
  const { item } = route.params;

  return (
    <View style={styles.container}>
      {/* 🔥 TOP GRADIENT */}
      <LinearGradient colors={["#0f2027", "#2c5364"]} style={styles.topBg} />

      {/* 🔥 CONTENT */}
      <View style={styles.content}>
        <View style={styles.card}>
          {/* TITLE */}
          <Text style={styles.title}>{item.title}</Text>

          {/* DIVIDER */}
          <View style={styles.divider} />

          {/* DESCRIPTION */}
          <Text style={styles.desc}>
            {item.description || "No description available"}
          </Text>
        </View>
      </View>
    </View>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f6fa",
  },

  /* 🔥 TOP BG */
  topBg: {
    position: "absolute",
    height: 180,
    width: "100%",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },

  content: {
    marginTop: 100,
    paddingHorizontal: 16,
  },

  /* 🔥 CARD */
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 18,

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 5,
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#222",
    textAlign: "center", // 🔥 center align
  },

  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 14,
  },

  desc: {
    fontSize: 15,
    color: "#444",
    lineHeight: 22,
    textAlign: "center", // 🔥 premium feel
  },
});
