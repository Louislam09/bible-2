import SearchWordEntire from "components/SearchWordEntire";
import React from "react";
import { RootStackScreenProps } from "types";

const Search: React.FC<RootStackScreenProps<"Search">> = (props) => {
  return <SearchWordEntire {...props} />;
};

export default Search;
