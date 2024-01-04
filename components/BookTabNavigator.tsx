import {
  createMaterialTopTabNavigator,
  MaterialTopTabNavigationOptions,
  MaterialTopTabNavigationProp,
} from "@react-navigation/material-top-tabs";
import { StyleSheet } from "react-native";
const Tab = createMaterialTopTabNavigator();

import { useTheme } from "@react-navigation/native";
import { DB_BOOK_NAMES } from "constants/BookNames";
import React, { useMemo } from "react";
import { TTheme } from "types";
import BookNameList from "./BookNameList";

enum Routes {
  AT = "Antiguo",
  NT = "Nuevo",
}

interface BookTabNavigatorInterface {
  navigation?: MaterialTopTabNavigationProp<any>;
}

enum BookIndexes {
  Genesis = 0,
  Malaquias = 39,
  Mateo = 39,
  Apocalipsis = 66,
}

function BookTabNavigator({ navigation }: BookTabNavigatorInterface) {
  const ATBooks = DB_BOOK_NAMES.slice(
    BookIndexes.Genesis,
    BookIndexes.Malaquias
  );
  const NTBooks = DB_BOOK_NAMES.slice(
    BookIndexes.Mateo,
    BookIndexes.Apocalipsis
  );
  const { colors } = useTheme() as TTheme;
  const screenOptions: MaterialTopTabNavigationOptions = {
    tabBarStyle: {
      backgroundColor: colors.backgroundContrast,
    },
    tabBarActiveTintColor: colors.text,
    tabBarInactiveTintColor: colors.text,
    tabBarIndicatorStyle: { backgroundColor: colors.text },
  };

  const ABooks = useMemo(
    () => () => <BookNameList {...{ navigation }} bookList={ATBooks} />,
    []
  );

  const NBooks = useMemo(
    () => () => <BookNameList {...{ navigation }} bookList={NTBooks} />,
    []
  );

  const tabs = [
    {
      name: Routes.AT,
      component: ABooks,
    },
    {
      name: Routes.NT,
      component: NBooks,
    },
  ];

  return (
    <Tab.Navigator initialRouteName={Routes.AT} screenOptions={screenOptions}>
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

export default BookTabNavigator;
