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
import {
  DB_BOOK_CHAPTER_NUMBER,
  DB_BOOK_NAMES,
} from "../../constants/BookNames";
interface FooterInterface {}

const CustomFooter: FC<FooterInterface> = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<ParamListBase>>();
  const { book, chapter = 1 } = route.params as HomeParams;
  const { bookNumber } = DB_BOOK_NAMES.find((x) => x.longName === book) || {};
  const bookIndex = DB_BOOK_NAMES.findIndex((x) => x.longName === book);
  const footerIconSize = 28;

  const nextOrPreviousBook = (name: string, chapter: number = 1) => {
    navigation.setParams({
      book: name,
      chapter,
    });
  };

  const nextChapter = () => {
    if (DB_BOOK_CHAPTER_NUMBER[book as any] === chapter) {
      console.log(bookNumber);
      if (bookNumber === 730) return;
      const newBookName = DB_BOOK_NAMES[bookIndex + 1].longName;
      nextOrPreviousBook(newBookName);
      return;
    }
    navigation.setParams({
      book,
      chapter: ((chapter as number) || 0) + 1,
    });
  };
  const previuosChapter = () => {
    if (bookNumber !== 10 && chapter === 1) {
      const newBookName = DB_BOOK_NAMES[bookIndex - 1].longName;
      const newChapter = DB_BOOK_CHAPTER_NUMBER[newBookName];
      nextOrPreviousBook(newBookName, newChapter);
      return;
    }
    if ((chapter as number) <= 1) return;
    navigation.setParams({
      book,
      chapter: (chapter as number) - 1,
    });
  };

  return (
    <View style={styles.footer}>
      <View style={styles.footerCenter}>
        <TouchableOpacity onPress={() => previuosChapter()}>
          <MaterialCommunityIcons
            style={styles.icon}
            name="less-than"
            size={footerIconSize}
            color="white"
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={{ flex: 1 }}
          onPress={() => navigation?.navigate(Screens.Book)}
        >
          <Text style={styles.bookLabel}>
            {`${book ?? ""} ${chapter ?? ""}`}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => nextChapter()}>
          <MaterialCommunityIcons
            style={styles.icon}
            name="greater-than"
            size={footerIconSize}
            color="white"
          />
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.footerEnd}>
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
    right: 0,
    width: "100%",
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
    flex: 1,
    fontSize: 24,
    fontWeight: "bold",
  },
});

export default CustomFooter;
