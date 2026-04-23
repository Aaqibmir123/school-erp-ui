import { useNavigation } from "@react-navigation/native";
import { Text, TouchableOpacity, View } from "react-native";

const ExamDetailScreen = () => {
  const navigation = useNavigation<any>();

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: "bold" }}>📘 Class Test</Text>

      <Text style={{ marginTop: 6 }}>Class: 2nd</Text>

      <TouchableOpacity
        style={{
          marginTop: 20,
          backgroundColor: "#1677ff",
          padding: 12,
          borderRadius: 10,
          alignItems: "center",
        }}
        onPress={() => navigation.navigate("EnterMarks")}
      >
        <Text style={{ color: "#fff" }}>Enter Marks</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ExamDetailScreen;
