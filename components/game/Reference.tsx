import { DB_BOOK_CHAPTER_VERSES, DB_BOOK_NAMES } from '@/constants/BookNames';
import { GET_SINGLE_OR_MULTIPLE_VERSES } from '@/constants/Queries';
import { useDBContext } from '@/context/databaseContext';
import { parseBibleReferences } from '@/utils/extractVersesInfo';
import { getVerseTextRaw } from '@/utils/getVerseTextRaw';
import { groupBy } from '@/utils/groupBy';
import { FlashList } from '@shopify/flash-list';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Popover from 'react-native-popover-view';

interface IReference {
    target: any;
    isVisible: boolean;
    onClose: () => void;
    references: string | null;
}

const Reference = ({ target, isVisible, onClose, references }: IReference) => {
    const [items, setItems] = useState<any[]>([]);
    const { executeSql, myBibleDB } = useDBContext();

    const fetchVerseDetails = async (references: string | null) => {
        if (!references) return;
        if (!myBibleDB || !executeSql) return;

        const parsedReferences = parseBibleReferences(references);

        const conditions: string[] = [];
        const params: (string | number)[] = [];

        parsedReferences.forEach(({ book, chapter, verse, endVerse }) => {
            const { bookNumber } = DB_BOOK_NAMES.find(
                (x) => x.longName === book || x.longName.includes(book)
            ) || {};
            const bookInfo = DB_BOOK_CHAPTER_VERSES.find(x => x.bookNumber == bookNumber)
            const isCompleteChapter = book && chapter && !verse && !endVerse

            if (!bookNumber) {
                console.log(`Book "${book}" not found in database.`);
                return;
            }

            if (endVerse || isCompleteChapter) {
                conditions.push(`(v.book_number = ? AND v.chapter = ? AND v.verse BETWEEN ? AND ?)`); 
                params.push(bookNumber, chapter, (verse || 1), (endVerse || (bookInfo?.verseCount || 1)));
            } else {
                conditions.push(`(v.book_number = ? AND v.chapter = ? AND v.verse = ?)`); 
                params.push(bookNumber, chapter, verse);
            }
        });

        if (conditions.length === 0) {
            console.log("No valid references found.");
            return;
        }

        const query = `${GET_SINGLE_OR_MULTIPLE_VERSES} ${conditions.join(" OR ")};
        `;

        try {
            const response: any = await executeSql(myBibleDB, query, params);
            setItems(response);
        } catch (error) {
            console.error("Error fetching verse details:", error);
        }
    };

    useEffect(() => {
        if (isVisible) {
            fetchVerseDetails(references);
        }
    }, [isVisible, references]);

    const RenderItem = ({ item, index }: any) => {
        return (
            <Text style={styles.verseBody}>
                <Text style={{ color: '#63B3ED' }}>{item?.verse}</Text> {getVerseTextRaw(item?.text || '')}
            </Text>
        );
    };

    const group = groupBy(items, verse => `${verse.bookName} ${verse.chapter}`);
    const flatData: (string | any)[] = [];
    const referencesArray = references?.split(/,|y /).map(item => item.trim()) || [];
    Object.keys(group).forEach((key, index) => {
        flatData.push(referencesArray[index]?.trim() || '');
        flatData.push(...group[key]);
    });

    const stickyHeaderIndices = flatData
        .map((item, index) => (typeof item === 'string' ? index : null))
        .filter((item) => item !== null) as number[];

    return (
        <Popover
            offset={30}
            from={target}
            isVisible={isVisible}
            onRequestClose={onClose}
            popoverStyle={styles.popoverContainer}
        >
            <View style={styles.container}>
                <FlashList
                    contentContainerStyle={styles.contentContainerStyle}
                    data={flatData}
                    keyExtractor={(_, index) => `ref-${index}`}
                    renderItem={({ item, index }) => {
                        const isString = typeof item === 'string'
                        if (isString) return <Text style={styles.cardTitle}>{item}</Text>
                        return <RenderItem item={item} index={index} />;
                    }}
                    stickyHeaderIndices={stickyHeaderIndices}
                    getItemType={(item) => (typeof item === 'string' ? 'sectionHeader' : 'row')}
                    estimatedItemSize={135}
                />
            </View>
        </Popover>
    );
};

export default Reference;

const styles = StyleSheet.create({
    popoverContainer: {
        backgroundColor: '#2D3748',
        borderRadius: 10,
        padding: 0,
    },
    contentContainerStyle: {
        backgroundColor: '#2D3748',
        paddingVertical: 20,
        paddingHorizontal: 15,
    },
    container: {
        width: 350,
        maxWidth: '100%',
        height: 400,
        borderRadius: 10,
        overflow: 'hidden',
        backgroundColor: '#2D3748',
    },
    itemContainer: {
        borderBottomWidth: 1,
        borderBottomColor: '#4A5568',
        paddingBottom: 10,
        marginBottom: 10,
    },
    verseBody: {
        color: '#E2E8F0',
        fontSize: 16,
        lineHeight: 22,
        marginTop: 10,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#63B3ED',
        backgroundColor: '#2D3748',
        textAlign: 'center',
        marginBottom: 5,
        borderRadius: 10,
        paddingVertical: 15,
    },
});
