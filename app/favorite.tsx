import { singleScreenHeader } from "@/components/common/singleScreenHeader";
import FavoriteList from "@/components/favorite/FavoriteList";
import ScreenWithAnimation from "@/components/ScreenWithAnimation";
import { useMyTheme } from "@/context/ThemeContext";
import { Stack } from "expo-router";
import React, { Fragment } from "react";
type FavoriteProps = {};

const Favorite: React.FC<FavoriteProps> = () => {
  const startSource = require("../assets/lottie/star.json");
  const { theme } = useMyTheme();

  return (
    <Fragment>
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
      <ScreenWithAnimation
        title="Favoritos"
        animationSource={startSource}
        speed={2}
      >

        <FavoriteList />
      </ScreenWithAnimation>
    </Fragment>
  );
};

export default Favorite;
