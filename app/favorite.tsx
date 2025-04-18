import { singleScreenHeader } from "@/components/common/singleScreenHeader";
import FavoriteList from "@/components/favorite/FavoriteList";
import ScreenWithAnimation from "@/components/ScreenWithAnimation";
import { useFavoriteVerseService } from "@/services/favoriteVerseService"; // Use the new service
// import { useDBContext } from "@/context/databaseContext"; // No longer needed
import { Stack } from "expo-router";
import React, { useEffect, useState } from "react";
import { useTheme } from "@react-navigation/native";
type FavoriteProps = {};

const Favorite: React.FC<FavoriteProps> = () => {
  const { getAllFavoriteVerses, generateAndAssignUUID } = useFavoriteVerseService();
  const [data, setData] = useState<any | null>(null);
  const startSource = require("../assets/lottie/star.json");
  const theme = useTheme();

  useEffect(() => {
    (async () => {
      // Ensure UUIDs exist for all favorite_verses
      await generateAndAssignUUID();
      const verses = await getAllFavoriteVerses();
      setData(verses ?? []);
    })();
    return () => {};
  }, []);

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
