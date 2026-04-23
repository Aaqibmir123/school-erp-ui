import Toast from "react-native-toast-message";

export const showToast = {
  success: (message: string) => {
    Toast.show({
      type: "success",
      text1: "Success",
      text2: message,
      position: "top",
      visibilityTime: 2500,
    });
  },

  error: (message: string) => {
    Toast.show({
      type: "error",
      text1: "Error",
      text2: message,
      position: "top",
      visibilityTime: 3000,
    });
  },

  warning: (message: string) => {
    Toast.show({
      type: "info",
      text1: "Warning",
      text2: message,
      position: "top",
      visibilityTime: 2500,
    });
  },

  info: (message: string) => {
    Toast.show({
      type: "info",
      text1: "Info",
      text2: message,
      position: "top",
      visibilityTime: 2500,
    });
  },
};
