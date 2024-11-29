import { ToastAndroid } from "react-native";

export const showToast = (
  message: string,
  type: "LONG" | "SHORT" = "SHORT"
) => {
  ToastAndroid.show(message, ToastAndroid[type]);
};
