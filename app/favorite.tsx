import FavoriteList from "@/components/favorite/FavoriteList";
import ScreenWithAnimation from '@/components/LottieTransitionScreen';
import { GET_ALL_FAVORITE_VERSES } from "@/constants/Queries";
import { useDBContext } from "@/context/databaseContext";
import React, { useEffect, useState } from "react";

type FavoriteProps = {}

const Favorite: React.FC<FavoriteProps> = () => {
  const { myBibleDB, executeSql } = useDBContext();
  const [data, setData] = useState<any | null>(null);
  const startSource = require("../assets/lottie/star.json");

  useEffect(() => {
    (async () => {
      if (!myBibleDB || !executeSql) return;
      const verses = await executeSql(GET_ALL_FAVORITE_VERSES, []);
      setData(verses ?? []);
    })();

    return () => {};
  }, [myBibleDB]);

  return (
    <ScreenWithAnimation title='Favoritos' animationSource={startSource} speed={2}>
      <FavoriteList isLoading={false} data={data} />
    </ScreenWithAnimation>

  )
};

export default Favorite;
