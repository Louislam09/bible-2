import { StoryList } from "@/components/animations/story-list";
import { Text, View } from "@/components/Themed";
import { StyleSheet } from "react-native";

export default function Example() {
  return (
    <View style={styles.container}>
      {/* <Text style={styles.text}>Example</Text> */}
      <StoryList />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 20,
    fontWeight: "bold",
  },
});
