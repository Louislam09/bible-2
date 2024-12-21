import WordDefinition from '@/components/WordDefinition';
import Characters from '@/constants/Characters';
import useParams from '@/hooks/useParams';
import { DictionaryData } from '@/types';
import { Stack } from 'expo-router';
import React, { Fragment } from 'react';
import { StyleSheet } from 'react-native';

const CharacterDetails = () => {
    const { characterId } = useParams();
    const wordData = Characters.find((x) => x.topic == characterId) as DictionaryData;

    return (
      <Fragment>
        <Stack.Screen
          options={{
            headerShown: true,
            headerTitle: characterId,
          }}
        />
        <WordDefinition subTitle='Historia' wordData={wordData} />
      </Fragment>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    description: {
        fontSize: 16,
        marginTop: 10,
    },
});

export default CharacterDetails;