import { useTheme } from "@react-navigation/native";
import { useBibleContext } from "context/BibleContext";
import React, { FC } from "react";
import BookNameList from "./BookNameList";

type ChooseFromListScreen = {
  list: any[];
};

const ChooseFromListScreen: FC<ChooseFromListScreen> = ({ list }) => {
  const theme = useTheme();
  const { orientation } = useBibleContext();

  return <BookNameList key={orientation + theme.dark} bookList={list} />;
};

export default ChooseFromListScreen;
