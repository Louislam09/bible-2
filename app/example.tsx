import AnimatedFab from "@/components/animations/animated-fab";
import ResizableSplitView from "@/components/animations/resizable-split-view";
import { Text, View } from "@/components/Themed";
import { useState } from "react";
import { StyleSheet } from "react-native";

export default function Example() {

  const [isFabOpen, setIsFabOpen] = useState(false);
  const handleFabPress = () => {
    setIsFabOpen(!isFabOpen);
  };
  const items = [
    {
      id: "1",
      label: "Item 1",
      onPress: () => {
        console.log("Item 1 pressed");
      },
    },
    {
      id: "2",
      label: "Item 2",
      onPress: () => {
        console.log("Item 2 pressed");
      },
    },
    {
      id: "3",
      label: "Item 3",
      onPress: () => {
        console.log("Item 3 pressed");
      },
    },
    {
      id: "4",
      label: "Item 4",
      onPress: () => {
        console.log("Item 4 pressed");
      },
    },
  ];
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Example</Text>
      <AnimatedFab
        fabIcon="NotebookText"
        isFabOpen={isFabOpen}
        handleFabPress={handleFabPress}
        items={items}
      />
      {/* <ResizableSplitView
        topContent={<View style={styles.topContent} />}
        bottomContent={<View style={styles.bottomContent} />}
        onHeightChange={(height) => console.log({ height })}
      /> */}
    </View>
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  topContent: {
    height: "100%",
    backgroundColor: "red",
    flex: 1,
  },
  bottomContent: {
    height: "100%",
    backgroundColor: "blue",
    flex: 1,
    borderWidth: 1,
    borderColor: "red",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",

  },
  pagination: {
    position: "absolute",
    bottom: 10,
    flexDirection: "row",
    alignSelf: "center",
    backgroundColor: "transparent",
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "#fff",
    marginHorizontal: 4,
  },
});
