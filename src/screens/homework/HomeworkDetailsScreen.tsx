import { View, Text } from "react-native";

const HomeworkDetailsScreen = ({ route }: any) => {
  const { item } = route.params || {};

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: "bold" }}>
        {item?.title}
      </Text>

      <Text style={{ marginTop: 10 }}>
        {item?.description || "No description"}
      </Text>
    </View>
  );
};

export default HomeworkDetailsScreen;