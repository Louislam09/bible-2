import DeepSearchTabNavigator from "components/DeepSearchTabNavigator";
import React from "react";
import { RootStackScreenProps } from "types";

const DeepSearch: React.FC<RootStackScreenProps<"DeepSearch">> = (props) => {
  return <DeepSearchTabNavigator {...props} />;
};

export default DeepSearch;
