import DictionarySearch from "@/components/DictionarySearch";
import { useDBContext } from "@/context/databaseContext";
import { Stack } from "expo-router";
import React, { Fragment } from "react";

type DictionaryProps = {};

const Dictionary: React.FC<DictionaryProps> = () => {
  const { installedDictionary: dbNames } = useDBContext();
  return (
    <Fragment>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: dbNames.length > 0 ? "" : "Dictionario",
        }}
      />
      <DictionarySearch />
    </Fragment>
  );
};

export default Dictionary;
