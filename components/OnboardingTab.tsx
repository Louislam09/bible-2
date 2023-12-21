import { View, Text, useWindowDimensions, StyleSheet } from 'react-native'
import React, { useState } from 'react'
import { SceneMap, TabBar, TabView } from 'react-native-tab-view';
// import InitTabContent from './InitTabContent';
// import GuideTabContent from './GuideTabContent';
// import FavoriteList from './FavoriteList';


const Random = () => {
    return (
        <View style={{ flex: 1 }}>
            <Text>Todas</Text>
        </View>
    )
}

const renderScene = SceneMap({
    init: Random,
    favorite: Random,
    guide: Random,
});

const OnboardingTab = () => {
    const layout = useWindowDimensions();
    const [index, setIndex] = React.useState(0);
    const [routes] = useState([
        { key: 'init', title: 'Inicio' },
        { key: 'favorite', title: 'Favoritos' },
        { key: 'guide', title: 'Guia' },

    ]);

    const renderTabBar = (props: any) => {
        return <TabBar
            {...props}
            scrollEnabled
            indicatorStyle={styles.indicator}
            style={styles.tabbar}
            labelStyle={styles.label}
            tabStyle={styles.tabStyle}
            pressColor='transparent'
            activeColor='#fff'
        />
    }

    return (
        <TabView
            renderTabBar={renderTabBar}
            navigationState={{ index, routes }}
            renderScene={renderScene}
            onIndexChange={setIndex}
            initialLayout={{ width: layout.width }}
        />
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    tabbar: {
        backgroundColor: '#607D8B',
    },
    indicator: {
        backgroundColor: '#D56267',
    },
    label: {
        color: '#CCDAE4',
        fontWeight: 'bold'
    },
    tabStyle: {
        width: 'auto',
    },
});

export default OnboardingTab