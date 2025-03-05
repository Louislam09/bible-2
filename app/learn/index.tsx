import gameUnits from "@/constants/gameUnits";
import { Stack } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import UnitCard from "../../components/UnitCard";
import ScreenWithAnimation from "@/components/ScreenWithAnimation";

const LanguageLearningUI: React.FC = () => {
  const currentUnitProgress = 30;
  const currentUnit = 1;

  return (
    <>
      <ScrollView style={styles.container}>
        {/* <Stack.Screen options={{ headerShown: false }} /> */}
        {gameUnits.map((unit, unitIndex) => (
          <View key={unitIndex} style={styles.unit}>
            <UnitCard currentUnit={currentUnit} unit={unit} />
          </View>
        ))}
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#222d37",
    padding: 16,
  },
  unit: {
    width: "100%",
    maxWidth: 400,
  },
  unitTitle: {
    width: "100%",
    fontSize: 18,
    fontWeight: "500",
    textTransform: "uppercase",
    color: "#10b981",
  },
  lessonsContainer: {
    alignItems: "center",
    paddingHorizontal: 16,
    marginVertical: 16,
  },
  lesson: {
    marginBottom: 16,
  },
});

export default LanguageLearningUI;
