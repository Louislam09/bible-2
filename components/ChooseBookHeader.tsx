import { createMaterialTopTabNavigator, MaterialTopTabNavigationProp } from '@react-navigation/material-top-tabs';
import { StyleSheet } from 'react-native';
const Tab = createMaterialTopTabNavigator();

import React, { useMemo } from 'react';
import { DB_BOOK_NAMES } from '../constants/BookNames';
import BookNameList from './BookNameList';

enum Routes {
    AT = 'Antiguo Pacto',
    NT = 'Nuevo Pacto'
}

interface TabNavigatorInterface {
    navigation?: MaterialTopTabNavigationProp<any>
}

function TabNavigator({ navigation }: TabNavigatorInterface) {
    const ATBooks = DB_BOOK_NAMES.slice(0, 39)
    const NTBooks = DB_BOOK_NAMES.slice(39, 66)

    const AT = useMemo(() => {
        return () => <BookNameList {...{ navigation }} bookList={ATBooks} />
    }, [])

    const NT = useMemo(() => {
        return () => <BookNameList {...{ navigation }} bookList={NTBooks} />
    }, [])

    return (
        <Tab.Navigator
            initialRouteName={Routes.AT}
            screenOptions={{
                tabBarStyle: {
                    backgroundColor: '#607D8B',
                },
                tabBarActiveTintColor: 'white',
                tabBarInactiveTintColor: '#ddd',
                tabBarIndicatorStyle: { backgroundColor: 'red' },
            }}
        >
            <Tab.Screen name={Routes.AT} component={AT} initialParams={{ book: null }} />
            <Tab.Screen name={Routes.NT} component={NT} initialParams={{ book: null }} />
        </Tab.Navigator>
    );
}


const styles = StyleSheet.create({
    container: {
        backgroundColor: '#000',
    },
    listItem: {
        display: 'flex',
        alignItems: 'center',
        borderColor: '#ddd5',
        borderStyle: 'solid',
        borderWidth: 1,
        margin: 5,
        padding: 5,
        flex: 1
    },
    listTitle: {
        color: 'white',
        fontSize: 20
    },
    listChapterTitle: {
        color: 'white',
        padding: 20,
        paddingBottom: 0,
        fontSize: 20
    }
});

export default TabNavigator;