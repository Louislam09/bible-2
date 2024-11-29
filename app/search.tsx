import { RootStackScreenProps } from "@/types";
import SearchWordEntire from "components/SearchWordEntire";
import { Stack } from "expo-router";
import React, { Fragment } from "react";
// import { RootStackScreenProps } from "types";

const Search: React.FC<RootStackScreenProps<"search">> = (props) => {
  return (
    <Fragment>
      <Stack.Screen options={{ headerShown: false }} />
      <SearchWordEntire {...props} />;
    </Fragment>
  );
};

export default Search;
