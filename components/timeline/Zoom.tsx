import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Text,
} from "react-native";

const PinchZoomView = ({ minZoom = 1, maxZoom = 5, children }) => {
  const [scale, setScale] = useState(1);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);

  const zoomIn = () => {
    const newScale = Math.min(scale + 0.5, maxZoom);
    updateZoom(newScale);
  };

  const zoomOut = () => {
    const newScale = Math.max(scale - 0.5, minZoom);
    updateZoom(newScale);
  };

  const updateZoom = (newScale) => {
    const { width, height } = Dimensions.get("window");

    // Calculate the new translate values to keep the content centered
    const newTranslateX = (width - width * newScale) / 2;
    const newTranslateY = (height - height * newScale) / 2;

    setScale(newScale);
    setTranslateX(newTranslateX);
    setTranslateY(newTranslateY);
  };

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.content,
          {
            transform: [{ scale }, { translateX }, { translateY }],
          },
        ]}
      >
        {children}
      </View>

      {/* Zoom Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={zoomIn}>
          <Text style={styles.buttonText}>+</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={zoomOut}>
          <Text style={styles.buttonText}>-</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  content: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
  buttonContainer: {
    position: "absolute",
    bottom: 20,
    right: 20,
    flexDirection: "row",
  },
  button: {
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 5,
  },
  buttonText: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
});

export default PinchZoomView;
