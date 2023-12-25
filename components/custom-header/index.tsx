import React, { FC, useState } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Button, Pressable, StyleSheet, TouchableOpacity } from "react-native";
import { Text, View } from "../Themed";
interface HeaderInterface {}
type TIcon = {
  name: any;
  color: string;
  visible: boolean;
};

const CustomHeader: FC<HeaderInterface> = () => {
  const headerIconSize = 28;

  const iconData: TIcon[] = [
    { name: "content-copy", color: "white", visible: true },
    { name: "volume-high", color: "white", visible: true },
    { name: "format-font", color: "white", visible: true },
    { name: "magnify", color: "white", visible: true },
  ];

  const onPressIcon = (r: string) => console.log("clicked: ", r);
  return (
    <View style={styles.header}>
      <View style={styles.headerCenter}>
        {iconData.map((icon, index) => (
          <TouchableOpacity
            style={{ display: icon.visible ? "flex" : "none" }}
            key={index}
            onPress={() => onPressIcon(icon.name)}
          >
            <MaterialCommunityIcons
              style={styles.icon}
              name={icon.name}
              size={headerIconSize}
              color={icon.color}
            />
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity
        style={styles.headerEnd}
        onPress={() => console.log("clicked")}
      >
        <MaterialCommunityIcons
          name="crown"
          size={headerIconSize}
          color="white"
        />
        <Text style={styles.text}>RVR1960</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingVertical: 15,
    paddingHorizontal: 10,
    backgroundColor: "#262a2d",
    boxSizing: "border-box",
    gap: 10,
  },
  headerCenter: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "none",
    gap: 5,
  },
  headerEnd: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 50,
    backgroundColor: "#373e43",
  },
  icon: {
    fontWeight: "700",
    color: "#fff",
    marginHorizontal: 10,
  },
  text: {},
});

export default CustomHeader;
