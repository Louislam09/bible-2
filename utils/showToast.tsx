import { ToastAndroid } from "react-native";

export const showToast = (
  message: string,
  type: "LONG" | "SHORT" = "SHORT",
  gravity: "TOP" | "BOTTOM" | "CENTER" = "BOTTOM"
) => {
  if (gravity !== "BOTTOM") {
    ToastAndroid.showWithGravity(
      message,
      ToastAndroid[type],
      ToastAndroid[gravity]
    );
    return;
  }
  ToastAndroid.show(message, ToastAndroid[type]);
};
