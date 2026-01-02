import { singleScreenHeader } from "@/components/common/singleScreenHeader";
import HighlightedList from "@/components/highlight/HighlightedList";
import ScreenWithAnimation from "@/components/ScreenWithAnimation";
import TutorialWalkthrough from "@/components/TutorialWalkthrough";
import { useMyTheme } from "@/context/ThemeContext";
import { Stack } from "expo-router";
import React, { Fragment } from "react";
type HighlightedProps = {};

const Highlighted: React.FC<HighlightedProps> = () => {
  const { theme } = useMyTheme();

  return (
    <Fragment>
      <Stack.Screen
        options={{
          ...singleScreenHeader({
            theme,
            title: "Destacados",
            titleIcon: "Highlighter",
            titleIconColor: '#4dcd8d',
            headerRightProps: {
              headerRightIconColor: "#4dcd8d",
              onPress: () => { },
              disabled: true,
              style: {},
            },
          }),
        }}
      />
      <ScreenWithAnimation
        title="Destacados"
        icon="Highlighter"
        iconColor='#4dcd8d'
      >
        <HighlightedList />
      </ScreenWithAnimation>
      <TutorialWalkthrough />
    </Fragment>
  );
};

export default Highlighted;
