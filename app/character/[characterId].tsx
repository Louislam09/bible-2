import WordDefinition from '@/components/WordDefinition';
import Characters from '@/constants/Characters';
import useParams from '@/hooks/useParams';
import { DictionaryData } from '@/types';
import { Stack, useNavigation } from 'expo-router';
import React, { Fragment, useEffect } from 'react';
import { StyleSheet } from 'react-native';

const CharacterDetails = () => {
  const navigation = useNavigation();
  const { characterId } = useParams();
  const wordData = Characters.find(
    (x) => x.topic == characterId
  ) as DictionaryData;

  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTitle: characterId,
      animation: 'fade_from_bottom',
    });
  }, []);

  return (
    <Fragment>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: characterId,
          animation: 'fade_from_bottom',
        }}
      />
      <WordDefinition subTitle='Historia' wordData={wordData} mainColor="#cec8ff" />
    </Fragment>
  );
};

const styles = StyleSheet.create({});

export default CharacterDetails;