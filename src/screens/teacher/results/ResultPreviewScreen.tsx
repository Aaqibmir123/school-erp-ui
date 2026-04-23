// Expo compatible version

import { useRoute } from "@react-navigation/native";
import * as Linking from "expo-linking";
import React from "react";
import { Button, Image, StyleSheet, Text, View } from "react-native";

const ResultPreviewScreen = () => {
  const route = useRoute<any>();

  const fileUrl = route?.params?.fileUrl;

  const isPDF = fileUrl?.toLowerCase()?.endsWith(".pdf");

  if (!fileUrl) {
    return (
      <View style={styles.center}>
        <Text>No file available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isPDF ? (
        <>
          <Text style={{ color: "#fff", marginBottom: 10 }}>
            PDF Preview not supported inside app
          </Text>

          <Button title="Open PDF" onPress={() => Linking.openURL(fileUrl)} />
        </>
      ) : (
        <Image
          source={{ uri: fileUrl }}
          style={styles.image}
          resizeMode="contain"
        />
      )}
    </View>
  );
};

export default ResultPreviewScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
