import { singleScreenHeader } from "@/components/common/singleScreenHeader";
import FavoriteList from "@/components/favorite/FavoriteList";
import ScreenWithAnimation from "@/components/ScreenWithAnimation";
import TutorialWalkthrough from "@/components/TutorialWalkthrough";
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
              onPress: () => { },
              disabled: true,
              style: {},
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
      <TutorialWalkthrough />
    </Fragment>
  );
};

export default Favorite;
