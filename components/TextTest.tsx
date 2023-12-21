import { FlashList } from '@shopify/flash-list';
import React, { useState } from 'react';
import { FlatList, Text, TouchableHighlight, View } from 'react-native'

interface WordProps {
    word: string;
    isSelected: boolean;
    onPress: () => void;
}

const Word: React.FC<WordProps> = ({ word, isSelected, onPress }) => (
    <TouchableHighlight onPress={onPress}>
        <Text style={{ fontWeight: isSelected ? 'bold' : 'normal' }}>{word} </Text>
    </TouchableHighlight>
);

const TextWithTouch: React.FC = ({ words }: { words: string[] }) => {
    const [selectedWord, setSelectedWord] = useState('');

    const handlePress = (word: string) => {
        console.log({ selectedWord })
        setSelectedWord(word);
    };

    // const words = ['Hello', 'world', 'I', 'am', 'Luis'];

    return (
        <View>
            <FlashList
                estimatedItemSize={24}
                data={words}
                renderItem={({ item }) => (
                    <Word
                        word={item}
                        isSelected={selectedWord === item}
                        onPress={() => handlePress(item)}
                    />
                )}
                keyExtractor={(item, index) => index.toString()}
                horizontal={true}
            />
        </View>
    );
};

export default TextWithTouch;
