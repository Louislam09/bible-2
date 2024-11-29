import SearchHeader from "@/components/search/SearchHeader";
import SearchWordEntire from "@/components/SearchWordEntire";
import { Stack } from "expo-router";
import React, { Fragment } from "react";

type SearchProps = {};

const Search: React.FC<SearchProps> = () => {
  return (
    <Fragment>
      <Stack.Screen
        options={{
          headerShown: true,
          header: (props) => <SearchHeader {...props} />,
          animation: "slide_from_left",
        }}
      />
      <SearchWordEntire />
    </Fragment>
  );
};

export default Search;
