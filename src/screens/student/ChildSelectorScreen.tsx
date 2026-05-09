import { useAuth } from "@/src/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from "@/src/theme";
import { STUDENT_GLAS_CARD, STUDENT_THEME } from "./studentTheme";

const ChildSelectorScreen = () => {
  const { students, setSelectedStudent } = useAuth();

  const handleSelect = (student: any) => {
    setSelectedStudent(student);
  };

  const renderItem = ({ item }: any) => {
    const initials = `${item.firstName?.charAt(0) || "S"}${
      item.lastName?.charAt(0) || ""
    }`;

    return (
      <TouchableOpacity
        style={styles.cardWrapper}
        onPress={() => handleSelect(item)}
        activeOpacity={0.85}
      >
        <LinearGradient colors={STUDENT_THEME.heroGradient} style={styles.card}>
          <View style={styles.glass}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.name}>
                {item.firstName} {item.lastName}
              </Text>
              <Text style={styles.meta}>🎓 Class: {item.classId?.name || "N/A"}</Text>
              <Text style={styles.meta}>🏫 Section: {item.sectionId?.name || "N/A"}</Text>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="people-outline" size={18} color={COLORS.primary} />
        <Text style={styles.heading}>Select Child</Text>
      </View>

      <FlatList
        data={students}
        keyExtractor={(item: any) => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default ChildSelectorScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: STUDENT_THEME.background,
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 18,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    marginBottom: 16,
  },
  heading: {
    color: COLORS.textPrimary,
    fontSize: 22,
    fontWeight: "900",
    marginLeft: 8,
  },
  listContent: {
    paddingBottom: 20,
  },
  cardWrapper: {
    marginBottom: 16,
    borderRadius: 22,
    overflow: "hidden",
  },
  card: {
    borderRadius: 22,
    ...SHADOWS.card,
  },
  glass: {
    backgroundColor: "rgba(255,255,255,0.14)",
    borderColor: "rgba(255,255,255,0.18)",
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    fontWeight: "900",
    color: COLORS.primary,
    fontSize: 18,
  },
  name: {
    ...TYPOGRAPHY.title,
    color: "#fff",
  },
  meta: {
    ...TYPOGRAPHY.caption,
    color: "rgba(255,255,255,0.86)",
    marginTop: 4,
  },
});
