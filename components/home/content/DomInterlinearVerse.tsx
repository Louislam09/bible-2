import React from "react";

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

const DomInterlinearVerse: React.FC<Props> = ({ item, withBackground = false }) => {
    const NT_BOOK_NUMBER = 470;
    const isNewCovenant = item.book_number >= NT_BOOK_NUMBER;

    return isNewCovenant ? (
        <p>GreekVerse</p>
        // <GreekVerse withBackground={withBackground} item={item} />
    ) : (
        <p>HebrewVerse</p>
        // <HebrewVerse withBackground={withBackground} item={item} />
    )
};

export default DomInterlinearVerse;