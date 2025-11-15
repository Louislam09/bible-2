import LottieAssets from "@/constants/lottieAssets";
import { Screens } from "@/types";
import { router, Stack } from "expo-router";
import React, { useEffect } from "react";

const screenAnimations: any = {
  [Screens.Hymns]: "slide_from_bottom",
  ["[isAlegres]/index" as any]: "slide_from_bottom",
  ["[isAlegres]/[songId]" as any]: "slide_from_bottom",
}

const SearchLayout = () => {
  const assets = [...Object.values(LottieAssets)];
  const randomIndex = Math.floor(Math.random() * assets.length);

  useEffect(() => {
    router.setParams({ animationIndex: randomIndex });
  }, []);

  return (
    <Stack
      screenOptions={(props: any) => ({
        headerTitle: "",
        headerShown: false,
        headerTitleAlign: "center",
        headerTitleStyle: { fontWeight: "bold" },
        animation: screenAnimations[props.route.name as Screens]
      })}
    />
  );
};

export default SearchLayout;
