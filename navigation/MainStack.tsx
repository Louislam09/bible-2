import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import TabNavigator from '../components/ChooseBookHeader';
import ChooseChapterNumberScreen from '../screens/ChooseChapterNumberScreen';
import HomeScreen from "../screens/HomeScreen";
import { RootStackParamList } from "../types";

const Stack = createNativeStackNavigator<RootStackParamList>();

const MainStack = () => {
  const headerOptions = {
    headerShown: true,
    headerTitleAlign: 'center',
    headerTintColor: 'white',
    headerStyle: { backgroundColor: '#607D8B' },
    headerTitleStyle: { fontWeight: 'bold' },
  } as any

  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName='Home'
    >
      <Stack.Screen
        initialParams={{ book: 'Génesis', chapter: 1 }}
        name="Home"
        component={HomeScreen}
      />
      <Stack.Screen
        name="Book"
        component={TabNavigator}
        options={{
          ...headerOptions,
          headerTitle: 'Libros'
        }}
      />
      <Stack.Screen
        name="ChooseChapterNumber"
        component={ChooseChapterNumberScreen}
        options={{
          ...headerOptions,
          headerTitle: 'Capitulos'
        }}
      />


    </Stack.Navigator>
  );
};

export default MainStack;
