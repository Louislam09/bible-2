import { singleScreenHeader } from "@/components/common/singleScreenHeader";
import FavoriteList from "@/components/favorite/FavoriteList";
import ScreenWithAnimation from "@/components/ScreenWithAnimation";
import { GET_ALL_FAVORITE_VERSES } from "@/constants/Queries";
import { useDBContext } from "@/context/databaseContext";
import { Stack } from "expo-router";
import React, { useEffect, useState } from "react";
import { useTheme } from "@react-navigation/native";
type FavoriteProps = {};

const Favorite: React.FC<FavoriteProps> = () => {
  const { myBibleDB, executeSql } = useDBContext();
  const [data, setData] = useState<any | null>(null);
  const startSource = require("../assets/lottie/star.json");
  const theme = useTheme();

  useEffect(() => {
    (async () => {
      if (!myBibleDB || !executeSql) return;
      const verses = await executeSql(GET_ALL_FAVORITE_VERSES, []);
      setData(verses ?? []);
    })();

    return () => {};
  }, [myBibleDB]);

  return (
    <ScreenWithAnimation
      title="Favoritos"
      animationSource={startSource}
      speed={2}
    >
      <Stack.Screen
        options={{
          ...singleScreenHeader({
            theme,
            title: "Favoritos",
            titleIcon: "Star",
            headerRightProps: {
              headerRightIconColor: "#fedf75",
              headerRightText: `${(data || []).length} ⭐`,
              onPress: () => console.log(),
              disabled: true,
              style: {
                opacity: 1,
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
              },
            },
          }),
        }}
      />
      <FavoriteList isLoading={false} data={data} />
    </ScreenWithAnimation>
  );
};

export default Favorite;
