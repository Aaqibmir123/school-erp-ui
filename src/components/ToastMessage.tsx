import { StyleSheet, Text, View } from "react-native";

const ToastMessage = ({ type = "success", message }: any) => {
  return (
    <View
      style={[
        styles.container,
        type === "success" && styles.success,
        type === "error" && styles.error,
      ]}
    >
      <Text style={styles.text}>{message}</Text>
    </View>
  );
};

export default ToastMessage;

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 50,
    left: 20,
    right: 20,
    padding: 12,
    borderRadius: 10,
    zIndex: 999,
  },

  success: {
    backgroundColor: "#52c41a",
  },

  error: {
    backgroundColor: "#ff4d4f",
  },

  text: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
});
