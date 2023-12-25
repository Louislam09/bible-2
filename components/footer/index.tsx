import React, { FC, useState } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Button, Pressable, StyleSheet, TouchableOpacity } from "react-native";
import { Text, View } from "../Themed";
import {
  useNavigation,
  useRoute,
  RouteProp,
  ParamListBase,
} from "@react-navigation/native";
import { HomeParams, Screens } from "../../types";
interface FooterInterface {}

const CustomFooter: FC<FooterInterface> = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<ParamListBase>>();
  const { book, chapter } = route.params as HomeParams;
  const footerIconSize = 28;

  const onPressIcon = (r: string) => console.log("clicked: ", r);
  return (
    <View style={styles.footer}>
      <View style={styles.footerCenter}>
        <TouchableOpacity onPress={() => onPressIcon("left than")}>
          <MaterialCommunityIcons
            style={styles.icon}
            name="less-than"
            size={footerIconSize}
            color="white"
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation?.navigate(Screens.Book)}>
          <Text style={styles.bookLabel}>
            {`${book ?? ""} ${chapter ?? ""}`}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onPressIcon("greater than")}>
          <MaterialCommunityIcons
            style={styles.icon}
            name="greater-than"
            size={footerIconSize}
            color="white"
          />
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={styles.footerEnd}
        onPress={() => console.log("clicked")}
      >
        <MaterialCommunityIcons
          name="play"
          size={footerIconSize}
          color="white"
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    // position: "absolute",
    right: 0,
    width: "100%",
    // bottom: 0,
    display: "flex",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: 15,
    paddingHorizontal: 10,
    backgroundColor: "#262a2d",
    boxSizing: "border-box",
    gap: 10,
    borderTopColor: "#ddd",
    borderWidth: 0.5,
    borderStyle: "solid",
  },
  footerCenter: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 50,
    flex: 1,
    padding: 15,
    backgroundColor: "#373e43",
  },
  footerEnd: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    borderRadius: 50,
    backgroundColor: "#373e43",
  },
  icon: {
    fontWeight: "900",
    color: "#fff",
    marginHorizontal: 10,
  },
  bookLabel: {
    fontSize: 24,
    fontWeight: "bold",
  },
});

export default CustomFooter;
