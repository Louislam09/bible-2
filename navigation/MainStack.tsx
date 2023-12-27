import {
  NativeStackNavigationOptions,
  createNativeStackNavigator,
} from "@react-navigation/native-stack";
import React from "react";
import TabNavigator from "../components/ChooseBookHeader";
import ChooseFromListScreen from "../screens/ChooseFromListScreen";
import HomeScreen from "../screens/HomeScreen";
import { RootStackParamList, Screens, TTheme } from "../types";
import { ParamListBase, RouteProp, useTheme } from "@react-navigation/native";
import { ScreensName } from "../constants/ScreenName";

const Stack = createNativeStackNavigator<RootStackParamList>();

type Route = RouteProp<ParamListBase>;

const MainStack = () => {
  const { colors } = useTheme() as TTheme;
  const headerOptions: (route: Route) => NativeStackNavigationOptions = (
    route: Route
  ) => ({
    headerTitle: ScreensName[route.name as Screens],
    headerShown: true,
    headerTitleAlign: "center",
    headerTintColor: colors.text,
    headerStyle: { backgroundColor: colors.backgroundContrast },
    headerTitleStyle: { fontWeight: "bold" },
  });

  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false, animation: "none" }}
      initialRouteName="Home"
    >
      <Stack.Screen
        initialParams={{ book: "Génesis", chapter: 1, verse: 1 }}
        name="Home"
        component={HomeScreen}
      />
      <Stack.Screen
        name="Book"
        component={TabNavigator}
        options={({ route }) => headerOptions(route)}
      />
      <Stack.Screen
        name="ChooseChapterNumber"
        component={ChooseFromListScreen}
        options={({ route }) => headerOptions(route)}
      />
      <Stack.Screen
        name="ChooseVerseNumber"
        component={ChooseFromListScreen}
        options={({ route }) => headerOptions(route)}
      />
    </Stack.Navigator>
  );
};

export default MainStack;
