import React from "react";
import {
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Dimensions,
    View as RNView
} from "react-native";
import { useRouter, Stack } from "expo-router";
import { Text, View } from "@/components/Themed";
import Icon from "@/components/Icon";
import { useMyTheme } from "@/context/ThemeContext";
import { HELP_GUIDES, IHelpGuide } from "@/constants/helpGuides";
import { singleScreenHeader } from "@/components/common/singleScreenHeader";
import ScreenWithAnimation from "@/components/ScreenWithAnimation";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 40) / 2;

export default function HelpMenuScreen() {
    const router = useRouter();
    const { theme } = useMyTheme();
    const styles = getStyles(theme);

    const renderItem = ({ item }: { item: IHelpGuide }) => (
        <TouchableOpacity
            style={[styles.card, { borderColor: item.color }]}
            // @ts-ignore
            onPress={() => router.push(`/help/${item.id}`)}
            activeOpacity={0.8}
        >
            <View style={[styles.iconContainer, { backgroundColor: item.color + "20" }]}>
                <Icon name={item.icon} size={40} color={item.color} />
            </View>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardDescription} numberOfLines={2}>
                {item.description}
            </Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Stack.Screen
                options={singleScreenHeader({
                    theme,
                    title: "Ayuda y Guía",
                    titleIcon: "HandHelping",
                    headerRightProps: {
                        headerRightIcon: "BookOpenText",
                        headerRightIconColor: theme.colors.text,
                        onPress: () => console.log(),
                        disabled: false,
                        style: { opacity: 1 },
                    },
                })}
            />
            <ScreenWithAnimation
                icon="HandHelping"
                title="Ayuda"
            // description="Aprende a usar la aplicación"
            >
                <FlatList
                    data={HELP_GUIDES}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    numColumns={2}
                    contentContainerStyle={styles.listContent}
                    columnWrapperStyle={styles.columnWrapper}
                    showsVerticalScrollIndicator={false}
                />
            </ScreenWithAnimation>
        </View>
    );
}

const getStyles = ({ colors }: any) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        listContent: {
            padding: 15,
        },
        columnWrapper: {
            justifyContent: "space-between",
        },
        card: {
            width: CARD_WIDTH,
            backgroundColor: colors.card || colors.background, // Fallback if card color not defined
            borderRadius: 20,
            padding: 15,
            marginBottom: 15,
            alignItems: "center",
            borderWidth: 2,
            elevation: 3,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
        },
        iconContainer: {
            width: 70,
            height: 70,
            borderRadius: 35,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 10,
        },
        cardTitle: {
            fontSize: 18,
            fontWeight: "bold",
            color: colors.text,
            textAlign: "center",
            marginBottom: 5,
        },
        cardDescription: {
            fontSize: 12,
            color: colors.text,
            opacity: 0.7,
            textAlign: "center",
        },
    });

