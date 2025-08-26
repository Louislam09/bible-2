import React from "react";
import { View } from "react-native";
import HebrewVerse from "./HebrewVerse";
import GreekVerse from "./GreekVerse";

interface VerseItem {
    book_number: number;
    chapter: number;
    verse: number;
    is_favorite: number;
    text: string;
}

interface Props {
    item: VerseItem;
    withBackground?: boolean;
}

const InterlinearVerse: React.FC<Props> = ({ item, withBackground = false }) => {
    const NT_BOOK_NUMBER = 470;
    const isNewCovenant = item.book_number >= NT_BOOK_NUMBER;

    return isNewCovenant ? (
        <GreekVerse withBackground={withBackground} item={item} />
    ) : (
        <HebrewVerse withBackground={withBackground} item={item} />
    )
};

export default InterlinearVerse;