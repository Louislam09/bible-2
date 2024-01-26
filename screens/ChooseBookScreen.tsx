import ChooseBook from "components/chooseBook";
import React from "react";
import { StyleSheet } from "react-native";

const ChooseBookScreen = (props: any) => {
  return <ChooseBook {...props} />;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
});

export default ChooseBookScreen;
