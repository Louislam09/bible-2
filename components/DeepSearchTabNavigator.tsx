import {
  createMaterialTopTabNavigator,
  MaterialTopTabNavigationOptions,
} from "@react-navigation/material-top-tabs";
import { Logs } from "expo";
import { StyleSheet } from "react-native";
Logs.enableExpoCliLogging();

const Tab = createMaterialTopTabNavigator();

import { useTheme } from "@react-navigation/native";
import { useBibleContext } from "context/BibleContext";
import React, { useMemo } from "react";
import { BookIndexes, RootStackScreenProps, TTheme } from "types";
import ListVerse from "./search/ListVerse";

enum Routes {
  ALL = "Gn - Ap",
  AT = "Antigo Pacto",
  NT = "Nuevo Pacto",
}

export const filterDataByTab = (tabName: any, searchState: any, book: any) => {
  const result = searchState?.searchResults;
  const data = {
    ["AT"]: result?.filter(
      (x: any) =>
        x.bookNumber >= BookIndexes.Genesis &&
        x.bookNumber <= BookIndexes.Malaquias
    ),
    ["NT"]: result?.filter(
      (x: any) =>
        x.bookNumber >= BookIndexes.Mateo &&
        x.bookNumber <= BookIndexes.Malaquias
    ),
    [book]: result?.filter((x: any) => x.bookName === book),
  };

  return data[tabName];
};

const DeepSearchTabNavigator: React.FC<RootStackScreenProps<"DeepSearch">> = ({
  route,
}) => {
  const { searchState, isSearchCopy } = useBibleContext();
  const { query } = route.params as any;
  const { colors } = useTheme() as TTheme;
  const NT_BOOK_NUMBER = 470;
  const screenOptions: MaterialTopTabNavigationOptions = {
    tabBarStyle: {
      backgroundColor: colors.backgroundContrast,
    },
    tabBarActiveTintColor: colors.text,
    tabBarInactiveTintColor: colors.text,
    tabBarIndicatorStyle: { backgroundColor: colors.notification },
  };

  const filterDataByTab = (tabName: any) => {
    const result = searchState?.searchResults;
    const data: any = {
      AT: result?.filter((x) => x.book_number < NT_BOOK_NUMBER),
      NT: result?.filter((x) => x.book_number >= NT_BOOK_NUMBER),
    };

    return data[tabName];
  };

  const AllSearchs = useMemo(
    () => () =>
      (
        <ListVerse
          isLoading={!!searchState?.error}
          data={searchState?.searchResults}
        />
      ),
    [searchState, isSearchCopy]
  );
  const ASearchs = useMemo(
    () => () =>
      (
        <ListVerse
          isLoading={!!searchState?.error}
          data={filterDataByTab("AT")}
        />
      ),
    [searchState, isSearchCopy]
  );

  const NSearchs = useMemo(
    () => () =>
      (
        <ListVerse
          isLoading={!!searchState?.error}
          data={filterDataByTab("NT")}
        />
      ),
    [searchState, isSearchCopy]
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
};

const getStyles = ({ colors }: TTheme) =>
  StyleSheet.create({
    chapterHeader: {
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "center",
      padding: 16,
    },
    chapterHeaderTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: colors.text,
    },
    noResultsContainer: {
      flex: 0.7,
      alignItems: "center",
      justifyContent: "center",
    },
    noResultsText: {
      fontSize: 18,
      color: colors.text,
    },
  });

export default DeepSearchTabNavigator;
