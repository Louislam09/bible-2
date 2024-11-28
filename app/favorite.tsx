import FavoriteList from "components/favorite/FavoriteList";
import { GET_ALL_FAVORITE_VERSES } from "constants/Queries";
import { useDBContext } from "context/databaseContext";
import React, { useEffect, useState } from "react";
import { RootStackScreenProps } from "types";

const Favorite: React.FC<RootStackScreenProps<"Favorite">> = (props) => {
  const { myBibleDB, executeSql } = useDBContext();
  const [data, setData] = useState<any | null>(null);

  useEffect(() => {
    (async () => {
      if (!myBibleDB || !executeSql) return;
      const verses = await executeSql(myBibleDB, GET_ALL_FAVORITE_VERSES, []);
      setData(verses ?? []);
    })();

    return () => {};
  }, [myBibleDB]);

  return <FavoriteList isLoading={false} data={data} />;
};

export default Favorite;
