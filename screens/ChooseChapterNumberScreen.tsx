import { RouteProp } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useMemo } from 'react';
import BookNameList from '../components/BookNameList';
import { DB_BOOK_CHAPTER_NUMBER } from '../constants/BookNames';
import { HomeParams, RootStackParamList } from '../types';

type ChooseChapterNumberScreenRouteProp = RouteProp<RootStackParamList>;

type ChooseChapterNumberScreenNavigationProp = NativeStackScreenProps<
  RootStackParamList,
  'ChooseChapterNumber'
>;

type ChooseChapterNumberScreenProps = {
  route: ChooseChapterNumberScreenRouteProp;
  navigation: ChooseChapterNumberScreenNavigationProp;
};


function ChooseChapterNumberScreen({ route }: ChooseChapterNumberScreenProps) {
  const { book } = route.params as HomeParams

  const numberOfChapters = useMemo(() => {
    return new Array(DB_BOOK_CHAPTER_NUMBER[book ?? 'Mateo']).fill(0).map((a, index) => index + 1)
  }, [book])


  return <BookNameList bookList={numberOfChapters} />
}

export default ChooseChapterNumberScreen;