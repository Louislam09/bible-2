import { ParamListBase, RouteProp, useTheme } from "@react-navigation/native";
import {
  NativeStackNavigationOptions,
  createNativeStackNavigator,
} from "@react-navigation/native-stack";
import SearchHeader from "components/search/SearchHeader";
import { ScreensName } from "constants/ScreenName";
import { useStorage } from "context/LocalstoreContext";
import React from "react";
import Book from "screens/Book";
import ChooseFromListScreen from "screens/ChooseFromListScreen";
import Home from "screens/Home";
import Search from "screens/Search";
import { RootStackParamList, Screens, TTheme } from "types";

const Stack = createNativeStackNavigator<RootStackParamList>();

type Route = RouteProp<ParamListBase>;

const MainStack = () => {
  const { colors } = useTheme() as TTheme;
  const { storedData } = useStorage();
  const { lastBook, lastChapter } = storedData;

  const styling = {
    backgroundColor: colors.backgroundContrast,
    text: colors.text,
  };

  const screenOptions: (route: Route) => NativeStackNavigationOptions = (
    route: Route
  ) => ({
    headerTitle: ScreensName[route.name as Screens],
    headerShown: true,
    headerTitleAlign: "center",
    headerTintColor: styling.text,
    headerStyle: { backgroundColor: styling.backgroundColor },
    headerTitleStyle: { fontWeight: "bold" },
  });

  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false, animation: "none" }}
      initialRouteName="Home"
    >
      <Stack.Screen
        initialParams={{
          book: lastBook || "Génesis",
          chapter: lastChapter || 1,
          verse: 0,
        }}
        name="Home"
        component={Home}
      />
      <Stack.Screen
        name="Book"
        component={Book}
        options={({ route }) => screenOptions(route)}
      />
      <Stack.Screen
        initialParams={{ book: "Génesis" }}
        name="Search"
        component={Search}
        options={({ route }) => ({
          ...screenOptions(route),
          header: (props: any) => <SearchHeader {...props} />,
        })}
      />
      <Stack.Screen
        name="ChooseChapterNumber"
        component={ChooseFromListScreen}
        options={({ route }) => screenOptions(route)}
      />
      <Stack.Screen
        name="ChooseVerseNumber"
        component={ChooseFromListScreen}
        options={({ route }) => screenOptions(route)}
      />
    </Stack.Navigator>
  );
};

export default MainStack;
