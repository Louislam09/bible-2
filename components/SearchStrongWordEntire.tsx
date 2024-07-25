import { View, Text, Animated } from "react-native";
import React, { useEffect, useState } from "react";
import BottomModal from "./BottomModal";
import StrongSearchContent from "./StrongSearchContent";
import { useDBContext } from "context/databaseContext";
import {
  GET_ALL_FAVORITE_VERSES,
  SEARCH_STRONG_WORD_ENTIRE_SCRIPTURE,
} from "constants/Queries";
import { RootStackScreenProps, TTheme } from "types";
import { useTheme } from "@react-navigation/native";
import { useBibleContext } from "context/BibleContext";

type TSearchStrongWordEntire = {
  //   strongRef: any;
  //   getIndex: any;
  //   topHeight: any;
  //   theme: TTheme;
  //   strongWord: any;
};

const SearchStrongWordEntire: React.FC<
  RootStackScreenProps<"StrongSearchEntire">
> = ({ route }) => {
  const { paramCode } = route.params as any;
  const theme = useTheme();
  const { myBibleDB, executeSql } = useDBContext();
  const [data, setData] = useState<any | null>(null);
  const { strongWord } = useBibleContext();
  const code = (paramCode || strongWord?.code)?.match(/\d+/)?.[0];
  const codeFirstLetter = (paramCode || strongWord?.code)?.includes("H")
    ? "H"
    : "G";

  const queryFilter = {
    H: [0, 460],
    G: [470, 730],
  };

  useEffect(() => {
    (async () => {
      if (myBibleDB && executeSql) {
        if (!code) return;
        const param = `%>${code}<%`;
        executeSql(myBibleDB, SEARCH_STRONG_WORD_ENTIRE_SCRIPTURE, [
          param,
          ...queryFilter[codeFirstLetter],
        ])
          .then((verses) => {
            setData(verses ?? []);
          })
          .catch((error) => {
            console.error("Error:Favorite:", error);
          });
      }
    })();

    return () => {};
  }, [myBibleDB, code]);

  return (
    <Animated.View
      style={{
        backgroundColor: theme.colors.background,
        flex: 1,
      }}
    >
      <StrongSearchContent
        strongWord={{ code: paramCode?.split(",")?.[0], text: strongWord.text }}
        theme={theme}
        data={data}
      />
    </Animated.View>
  );
};

export default SearchStrongWordEntire;
