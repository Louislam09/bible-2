import WordDefinition from '@/components/WordDefinition';
import Characters from '@/constants/Characters';
import useParams from '@/hooks/useParams';
import { DictionaryData } from '@/types';
import { Stack } from 'expo-router';
import React, { Fragment } from 'react';
import { StyleSheet } from 'react-native';

const CharacterDetails = () => {
  const { characterId } = useParams();
  const wordData = Characters.find(
    (x) => x.topic == characterId
  ) as DictionaryData;

  return (
    <Fragment>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: characterId,
          animation: 'fade_from_bottom',
        }}
      />
      <WordDefinition subTitle='Historia' wordData={wordData} />
    </Fragment>
  );
};

const styles = StyleSheet.create({});

export default CharacterDetails;