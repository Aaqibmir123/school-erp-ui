import { View, Text, TouchableOpacity } from "react-native";

const StudentItem = ({ item, onToggle }: any) => {
  const isPresent = item.status === "PRESENT";

  return (
    <View
      style={{
        backgroundColor: "#fff",
        padding: 14,
        borderRadius: 12,
        marginBottom: 10,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        elevation: 2,
      }}
    >
      {/* LEFT */}
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        
        {/* Roll Circle */}
        <View
          style={{
            backgroundColor: "#1677ff",
            width: 36,
            height: 36,
            borderRadius: 18,
            justifyContent: "center",
            alignItems: "center",
            marginRight: 10,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "bold" }}>
            {item.rollNumber}
          </Text>
        </View>

        {/* Name */}
        <Text style={{ fontSize: 15, fontWeight: "500" }}>
          {item.name}
        </Text>
      </View>

      {/* RIGHT (Status Pill) */}
      <TouchableOpacity onPress={() => onToggle(item._id)}>
        <View
          style={{
            backgroundColor: isPresent ? "#e6f4ea" : "#fdecea",
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 20,
          }}
        >
          <Text
            style={{
              color: isPresent ? "#2e7d32" : "#c62828",
              fontWeight: "600",
            }}
          >
            {item.status}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default StudentItem;