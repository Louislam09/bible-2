import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import Popover from 'react-native-popover-view';
import { getVerseTextRaw } from '@/utils/getVerseTextRaw';

interface IReference {
    item: any;
    target: any;
    isVisible: boolean;
    onClose: () => void;
}

const Reference = ({ item, target, isVisible, onClose }: IReference) => {
    return (
        <Popover
            offset={10}
            from={target}
            isVisible={isVisible}
            onRequestClose={() => onClose()}
            popoverStyle={styles.popoverContainer}
        >
            <View style={styles.container}>
                <Text style={styles.cardTitle}>
                    {`${item?.bookName} ${item?.chapter}:${item?.verse}`}
                </Text>
                <Text style={styles.verseBody}>{getVerseTextRaw(item?.text || "")}</Text>
            </View>
        </Popover>
    );
};

export default Reference;

const styles = StyleSheet.create({
    popoverContainer: {
        backgroundColor: '#2D3748', // Modern dark shade
        borderRadius: 10,
        padding: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    container: {
        display: 'flex',
        flexDirection: 'column',
        paddingHorizontal: 15,
        paddingVertical: 10,
        // backgroundColor: '#1A202C', // Darker background for contrast
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#4A5568',
        width: 300,
    },
    verseBody: {
        color: '#E2E8F0', // Soft white for better readability
        fontSize: 16,
        lineHeight: 22,
        marginTop: 10,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#63B3ED', // Calming blue accent
        marginBottom: 5,
    },
});
