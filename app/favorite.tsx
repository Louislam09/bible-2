import { singleScreenHeader } from "@/components/common/singleScreenHeader";
import FavoriteList from "@/components/favorite/FavoriteList";
import ScreenWithAnimation from "@/components/ScreenWithAnimation";
import { useTheme } from "@react-navigation/native";
import { Stack } from "expo-router";
import React from "react";
type FavoriteProps = {};

const Favorite: React.FC<FavoriteProps> = () => {
  const startSource = require("../assets/lottie/star.json");
  const theme = useTheme();

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
              headerRightText: `⭐`,
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
      <FavoriteList />
    </ScreenWithAnimation>
  );
};

export default Favorite;
