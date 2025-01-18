import AdditionalResources from '@/components/AdditionalResources';
import DailyVerseTwo from '@/components/new-dashboard/DailyVerseTwo';
import MainSection from '@/components/new-dashboard/MainSection';
import StudyTools from '@/components/new-dashboard/StudyTools';
import StatusBarBackground from '@/components/StatusBarBackground';
import { useStorage } from '@/context/LocalstoreContext';
import { Screens, TTheme } from '@/types';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useTheme } from '@react-navigation/native';
import { useNavigation } from 'expo-router';
import React, { useCallback, useRef } from 'react';
import { ScrollView, StyleSheet, ToastAndroid } from 'react-native';
import { IDashboardOption } from '../../app/(dashboard)';
import BottomModal from '../BottomModal';
import VoiceList from '../VoiceList';
import VersionList from '../home/header/VersionList';
import { useBibleContext } from '@/context/BibleContext';

export interface IAdditionalResourceList {
  advancedSearch: IDashboardOption[];
  manager: IDashboardOption[];
}

const SecondDashboard = () => {
  const navigation = useNavigation();
  const theme = useTheme();
  const styles = getStyles(theme);

  const {
    currentBibleVersion,
    selectBibleVersion,
    clearHighlights,
    orientation = 'PORTRAIT',
  } = useBibleContext();
  const {
    storedData,
    historyManager: { getCurrentItem },
  } = useStorage();
  const {
    lastBook,
    lastChapter,
    lastVerse,
    lastBottomSideBook,
    lastBottomSideChapter,
    lastBottomSideVerse,
    isSongLyricEnabled,
  } = storedData;

  const onSelect = (version: string) => {
    clearHighlights();
    selectBibleVersion(version);
    versionRef.current?.dismiss();
  };

  const onSong = useCallback(() => {
    if (!isSongLyricEnabled) {
      ToastAndroid.show(
        'Busca 📖 y presiona el nombre del himnario 🔒🔑',
        ToastAndroid.LONG
      );
      return;
    }
    navigation.navigate(Screens.Hymn);
    // navigation.navigate(Screens.Song);
  }, [navigation, isSongLyricEnabled]);

  const {
    book: lastHistoryBook,
    chapter: lastHistoryChapter,
    verse: lastHistoryVerse,
  } = (getCurrentItem() as any) || {};

  const homePageInitParams = {
    book: lastHistoryBook || lastBook || 'Génesis',
    chapter: lastHistoryChapter || lastChapter || 1,
    verse: lastHistoryVerse || lastVerse || 1,
    bottomSideBook: lastBottomSideBook || 'Génesis',
    bottomSideChapter: lastBottomSideChapter || 1,
    bottomSideVerse: lastBottomSideVerse || 0,
    isTour: false,
    isHistory: true,
  };

  const mainActionItems: IDashboardOption[] = [
    {
      icon: 'Crown',
      label: 'Santa Escritura',
      action: () => navigation.navigate(Screens.Home, homePageInitParams),
      tag: 'crown-outline',
    },
    {
      icon: 'Music4',
      label: 'Himnos',
      isIonicon: true,
      action: onSong,
    },
    {
      icon: 'Search',
      label: 'Buscador',
      // @ts-ignore
      action: () => navigation.navigate('(search)', {}),
    },
  ];

  const studyToolItems: IDashboardOption[] = [
    {
      icon: 'BookA',
      label: 'Diccionarios',
      action: () =>
        navigation?.navigate(Screens.DictionarySearch, { word: '' }),
      color: '#ec899e',
    },
    {
      icon: 'SwatchBook',
      label: 'Concordancia',
      action: () => navigation.navigate(Screens.Concordance, {}),
      color: '#4c4c4c',
    },
    {
      icon: 'NotebookText',
      label: 'Notas',
      action: () =>
        navigation.navigate(Screens.Notes, { shouldRefresh: false }),
      color: theme.colors.notification,
    },
    {
      icon: 'Star',
      label: 'Favoritos',
      action: () => navigation.navigate(Screens.Favorite),
      color: '#fedf75',
    },
    {
      icon: 'Gamepad',
      label: 'Juego',
      // @ts-ignore
      action: () => navigation.navigate(Screens.ChooseGame, {}),
      // action: () => navigation.navigate('(game)', {}),
      color: '#75d0fe',
    },
  ];

  const versionRef = useRef<BottomSheetModal>(null);
  const currentModalOpenRef = useRef<any>(null);
  const voiceBottomSheetModalRef = useRef<BottomSheetModal>(null);
  const voiceHandlePresentModalPress = useCallback(() => {
    voiceBottomSheetModalRef.current?.present();
    currentModalOpenRef.current = voiceBottomSheetModalRef.current;
  }, []);

  const versionHandlePresentModalPress = useCallback(() => {
    versionRef.current?.present();
    currentModalOpenRef.current = versionRef.current;
  }, []);

  const additionalResourceList: IAdditionalResourceList = {
    advancedSearch: [
      {
        icon: 'LayoutGrid',
        label: 'Lista de Libro',
        action: () => navigation.navigate(Screens.ChooseBook, {}),
        color: '#b76e5b',
      },
      {
        icon: 'UserSearch',
        label: 'Buscar \nPersonaje',
        isIonicon: true,
        action: () => navigation.navigate(Screens.Character),
        color: '#cec8ff',
      },
      {
        icon: 'AudioLines',
        label: 'Selecciona \nUna Voz',
        action: voiceHandlePresentModalPress,
        color: '#5bb77b',
      },
    ],
    manager: [
      {
        icon: 'MonitorDown',
        label: 'Modulos',
        action: () => navigation.navigate(Screens.DownloadManager),
        color: '#2cc47d',
      },
      {
        icon: 'FileStack',
        label: 'Versiones',
        action: versionHandlePresentModalPress,
        color: '#beeaff',
      },
      {
        icon: 'Settings',
        label: 'Ajustes',
        isIonicon: true,
        action: () => navigation.navigate(Screens.Settings),
        color: '#84b75b',
      },
    ],
  };

  return (
    <StatusBarBackground>
      <ScrollView style={styles.container}>
        <DailyVerseTwo theme={theme} />
        <MainSection list={mainActionItems} theme={theme} />
        <StudyTools list={studyToolItems} theme={theme} />
        <AdditionalResources list={additionalResourceList} theme={theme} />

        <BottomModal shouldScroll startAT={2} ref={voiceBottomSheetModalRef}>
          <VoiceList theme={theme} />
        </BottomModal>

        <BottomModal shouldScroll startAT={1} ref={versionRef}>
          <VersionList {...{ currentBibleVersion, onSelect, theme }} />
        </BottomModal>
      </ScrollView>
    </StatusBarBackground>
  );
};

const getStyles = ({ colors }: TTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: 16,
    },
  });

export default SecondDashboard;
