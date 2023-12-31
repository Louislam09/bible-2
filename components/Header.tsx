import React, { FC, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "../components/Themed";
import { StyleSheet, TouchableOpacity } from "react-native";
import {
  ParamListBase,
  RouteProp,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import { HomeParams, Screens } from "../types";
interface HeaderInterface {}

const Header: FC<HeaderInterface> = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<ParamListBase>>();
  const { book, chapter } = route.params as HomeParams;
  const headerIconSize = 26;

  return (
    <View style={styles.header}>
      <View style={styles.headerStart}>
        <TouchableOpacity onPress={() => console.log("burger menu")}>
          <Ionicons
            style={[styles.icon, { marginRight: 30 }]}
            name="menu-outline"
            size={headerIconSize}
            color="white"
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation?.navigate(Screens.Book)}>
          <Text style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>{`${book ?? ""} ${
              chapter ?? ""
            }`}</Text>
            <Ionicons
              name="chevron-down"
              style={[styles.icon]}
              size={18}
              color="white"
            />
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.headerEnd}>
        <TouchableOpacity>
          <Ionicons
            style={[styles.icon, { marginRight: 30 }]}
            name="search-sharp"
            size={headerIconSize}
            color="white"
          />
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons
            style={styles.icon}
            name="ellipsis-vertical"
            size={headerIconSize}
            color="white"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    display: "flex",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 15,
    paddingHorizontal: 10,
    backgroundColor: "#607D8B",
    boxSizing: "border-box",
  },
  headerStart: {
    display: "flex",
    alignItems: "center",
    flexDirection: "row",
    backgroundColor: "transparent",
    flex: 1,
  },
  headerEnd: {
    display: "flex",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "flex-end",
    color: "#fff",
    backgroundColor: "transparent",
    flex: 0.8,
  },
  headerTitleContainer: {
    textDecorationLine: "underline",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
  },
  icon: {
    fontWeight: "700",
    color: "#fff",
  },
});

export default Header;
