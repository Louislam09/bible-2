import {
  createMaterialTopTabNavigator,
  MaterialTopTabNavigationOptions,
  MaterialTopTabNavigationProp,
} from "@react-navigation/material-top-tabs";
import { StyleSheet } from "react-native";
const Tab = createMaterialTopTabNavigator();

import {
  ParamListBase,
  RouteProp,
  useRoute,
  useTheme,
} from "@react-navigation/native";
import React, { useMemo } from "react";
import { IVerseItem, TTheme } from "types";
import { useBibleContext } from "context/BibleContext";
import ListVerse from "./search/ListVerse";

enum Routes {
  ALL = "TODO",
  AT = "AT",
  NT = "NT",
}

interface SearchTabNavigatorInterface {
  navigation?: MaterialTopTabNavigationProp<any>;
}

function SearchTabNavigator({ navigation }: SearchTabNavigatorInterface) {
  const { searchState } = useBibleContext();
  const route = useRoute();
  const { book } = route.params as any;
  const { colors } = useTheme() as TTheme;
  const screenOptions: MaterialTopTabNavigationOptions = {
    tabBarStyle: {
      backgroundColor: colors.backgroundContrast,
    },
    tabBarActiveTintColor: colors.text,
    tabBarInactiveTintColor: colors.text,
    tabBarIndicatorStyle: { backgroundColor: colors.border },
  };

  const AllSearchs = useMemo(
    () => () => <ListVerse data={searchState?.searchResults} />,
    [searchState]
  );
  const ASearchs = useMemo(
    () => () => <ListVerse data={searchState?.searchResults} />,
    [searchState]
  );

  const NSearchs = useMemo(
    () => () => <ListVerse data={searchState?.searchResults} />,
    [searchState]
  );
  const CurrentBook = useMemo(
    () => () => <ListVerse data={searchState?.searchResults} />,
    [searchState]
  );

  const tabs = [
    {
      name: Routes.ALL,
      component: AllSearchs,
    },
    {
      name: Routes.AT,
      component: ASearchs,
    },
    {
      name: Routes.NT,
      component: NSearchs,
    },
    {
      name: book,
      component: CurrentBook,
    },
  ];

  return (
    <Tab.Navigator initialRouteName={Routes.ALL} screenOptions={screenOptions}>
      {tabs.map((tab) => (
        <Tab.Screen
          key={tab.name}
          name={tab.name}
          component={tab.component}
          initialParams={{ book: null }}
        />
      ))}
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({});

export default SearchTabNavigator;
