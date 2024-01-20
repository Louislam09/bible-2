import SearchTabNavigator from "components/SearchTabNavigator";
import React from "react";
import { RootStackScreenProps } from "types"; // Update this import based on your actual types file

const Search: React.FC<RootStackScreenProps<"Search">> = (props) => {
  return <SearchTabNavigator {...props} />;
};

export default Search;
