import { LinkingOptions } from '@react-navigation/native';
import * as Linking from 'expo-linking';
import { RootStackParamList } from 'types';

const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [Linking.createURL('/')],
  config: {
    screens: {
      Dashboard: '',
      Home: 'home',
      ChooseBook: 'choose-book',
      Book: 'book/:id',
      Search: 'search',
      ChooseChapterNumber: 'choose-chapter',
      ChooseVerseNumber: 'choose-verse',
      Onboarding: 'onboarding',
      Favorite: 'favorite',
      Notes: 'notes',
      Character: 'character',
      NotFound: '*',
    },
  },
};

export default linking;
