import { ParamListBase, RouteProp, useTheme } from "@react-navigation/native";
import {
  NativeStackNavigationOptions,
  createNativeStackNavigator,
} from "@react-navigation/native-stack";
import ChooseBookHeader from "components/chooseBook/ChooseBookHeader";
import SearchHeader from "components/search/SearchHeader";
import { useStorage } from "context/LocalstoreContext";
import React from "react";
import Book from "screens/Book";
import ChooseBookScreen from "screens/ChooseBookScreen";
import ChooseFromListScreen from "screens/ChooseFromListScreen";
import Dashboard from "screens/Dashboard";
import Favorite from "screens/Favorite";
import Home from "screens/Home";
import OnboardingScreen from "screens/Onboarding";
import Notes from "screens/Notes";
import Search from "screens/Search";
import { RootStackParamList, Screens, ScreensName, TTheme } from "types";

const Stack = createNativeStackNavigator<RootStackParamList>();

type Route = RouteProp<ParamListBase>;

const MainStack = () => {
  const { colors } = useTheme() as TTheme;
  const { storedData } = useStorage();
  const { lastBook, lastChapter, lastVerse } = storedData;

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
      initialRouteName="Dashboard"
    >
      <Stack.Screen initialParams={{}} name="Dashboard" component={Dashboard} />
      <Stack.Screen
        initialParams={{
          book: lastBook || "Génesis",
          chapter: lastChapter || 1,
          verse: lastVerse || 0,
        }}
        name="Home"
        component={Home}
        options={{
          animation: "slide_from_right",
        }}
      />
      <Stack.Screen
        name="ChooseBook"
        component={ChooseBookScreen}
        options={({ route }) => ({
          ...screenOptions(route),
          header: (props: any) => <ChooseBookHeader {...props} />,
          animation: "slide_from_bottom",
        })}
      />
      <Stack.Screen
        name="Book"
        component={Book}
        options={({ route }) => ({
          ...screenOptions(route),
          animation: "slide_from_bottom",
        })}
      />
      <Stack.Screen
        initialParams={{ book: "Génesis" }}
        name="Search"
        component={Search}
        options={({ route }) => ({
          ...screenOptions(route),
          header: (props: any) => <SearchHeader {...props} />,
          animation: "slide_from_right",
        })}
      />
      <Stack.Screen
        name="ChooseChapterNumber"
        component={ChooseFromListScreen}
        options={({ route }) => ({
          ...screenOptions(route),
          animation: "slide_from_right",
        })}
      />
      <Stack.Screen
        name="ChooseVerseNumber"
        component={ChooseFromListScreen}
        options={({ route }) => ({
          ...screenOptions(route),
        })}
      />
      <Stack.Screen
        name="Onboarding"
        component={OnboardingScreen}
        options={({ route }) => ({
          ...screenOptions(route),
          animation: "slide_from_bottom",
          headerShown: false,
        })}
      />
      <Stack.Screen
        name="Favorite"
        component={Favorite}
        options={({ route }) => ({
          ...screenOptions(route),
          animation: "slide_from_right",
        })}
      />
      <Stack.Screen
        name="Notes"
        component={Notes}
        options={({ route }) => ({
          ...screenOptions(route),
          animation: "slide_from_right",
        })}
      />
    </Stack.Navigator>
  );
};

export default MainStack;
