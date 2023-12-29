import {
  createMaterialTopTabNavigator,
  MaterialTopTabNavigationOptions,
  MaterialTopTabNavigationProp,
} from "@react-navigation/material-top-tabs";
import { StyleSheet } from "react-native";
const Tab = createMaterialTopTabNavigator();

import React, { useMemo } from "react";
import { DB_BOOK_NAMES } from "../constants/BookNames";
import BookNameList from "./BookNameList";
import { useTheme } from "@react-navigation/native";
import { TTheme } from "../types";

enum Routes {
  AT = "Antiguo Pacto",
  NT = "Nuevo Pacto",
}

interface TabNavigatorInterface {
  navigation?: MaterialTopTabNavigationProp<any>;
}

function TabNavigator({ navigation }: TabNavigatorInterface) {
  const ATBooks = DB_BOOK_NAMES.slice(0, 39);
  const NTBooks = DB_BOOK_NAMES.slice(39, 66);
  const { colors } = useTheme() as TTheme;
  const screenOptions: MaterialTopTabNavigationOptions = {
    tabBarStyle: {
      backgroundColor: colors.backgroundContrast,
    },
    tabBarActiveTintColor: colors.text,
    tabBarInactiveTintColor: colors.text,
    tabBarIndicatorStyle: { backgroundColor: colors.text },
  };

  const FirstTab = useMemo(() => {
    return () => <BookNameList {...{ navigation }} bookList={ATBooks} />;
  }, []);

  const SecondTab = useMemo(() => {
    return () => <BookNameList {...{ navigation }} bookList={NTBooks} />;
  }, []);

  return (
    <Tab.Navigator initialRouteName={Routes.AT} screenOptions={screenOptions}>
      <Tab.Screen
        name={Routes.AT}
        component={FirstTab}
        initialParams={{ book: null }}
      />
      <Tab.Screen
        name={Routes.NT}
        component={SecondTab}
        initialParams={{ book: null }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({});

export default TabNavigator;
