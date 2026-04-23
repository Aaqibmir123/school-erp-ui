import { View, TextInput, TouchableOpacity, Text } from "react-native";
import { useEffect, useState } from "react";

let timer: any;

const StudentHeader = ({ onSearch, onAllPresent, onAllAbsent }: any) => {
  const [search, setSearch] = useState("");

  useEffect(() => {
    clearTimeout(timer);

    timer = setTimeout(() => {
      onSearch(search);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  return (
    <View style={{ marginBottom: 15 }}>
      {/* 🔍 Search */}
      <TextInput
        placeholder="Search by name or roll..."
        value={search}
        onChangeText={setSearch}
        style={{
          backgroundColor: "#fff",
          padding: 12,
          borderRadius: 10,
          borderWidth: 1,
          borderColor: "#ddd",
          marginBottom: 12,
        }}
      />

      {/* 🔥 Buttons */}
      <View style={{ flexDirection: "row", gap: 10 }}>
        <TouchableOpacity
          onPress={onAllPresent}
          style={{
            flex: 1,
            backgroundColor: "#e6f4ea",
            padding: 12,
            borderRadius: 10,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#2e7d32", fontWeight: "600" }}>
            All Present
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onAllAbsent}
          style={{
            flex: 1,
            backgroundColor: "#fdecea",
            padding: 12,
            borderRadius: 10,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#c62828", fontWeight: "600" }}>
            All Absent
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default StudentHeader;
