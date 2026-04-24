import { useAuth } from "@/src/context/AuthContext";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const COLORS = {
  primary: "#6366F1",
  secondary: "#8B5CF6",
  bg: "#F5F7FF",
  text: "#111827",
  sub: "#6B7280",
};

const ChildSelectorScreen = () => {
  const { students, setSelectedStudent } = useAuth();

  const handleSelect = (student: any) => {
    setSelectedStudent(student);
  };

  const renderItem = ({ item, index }: any) => {
    const initials = item.firstName?.charAt(0) + item.lastName?.charAt(0);

    return (
      <TouchableOpacity
        style={styles.cardWrapper}
        onPress={() => handleSelect(item)}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[COLORS.primary, COLORS.secondary]}
          style={styles.card}
        >
          {/* 🔥 GLASS OVERLAY */}
          <View style={styles.glass}>
            {/* AVATAR */}
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>

            {/* INFO */}
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>
                {item.firstName} {item.lastName}
              </Text>

              <Text style={styles.meta}>
                🎓 Class: {item.classId?.name || "N/A"}
              </Text>

              <Text style={styles.meta}>
                🏫 Section: {item.sectionId?.name || "N/A"}
              </Text>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>👨‍👩‍👧 Select Child</Text>

      <FlatList
        data={students}
        keyExtractor={(item: any) => item._id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
};

export default ChildSelectorScreen;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FF",
    padding: 16,
  },

  heading: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 16,
    color: "#111827",
  },

  cardWrapper: {
    marginBottom: 16,
    borderRadius: 20,
    overflow: "hidden",
  },

  card: {
    borderRadius: 20,
  },

  glass: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "rgba(255,255,255,0.15)",
    backdropFilter: "blur(10px)", // web only but ok fallback
  },

  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  avatarText: {
    fontWeight: "800",
    color: "#6366F1",
    fontSize: 18,
  },

  name: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },

  meta: {
    fontSize: 13,
    color: "#E0E7FF",
    marginTop: 2,
  },
});
