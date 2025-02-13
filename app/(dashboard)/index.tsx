import BottomModal from '@/components/BottomModal';
import DailyVerse from '@/components/DailyVerse';
import Icon, { IconProps } from '@/components/Icon';
import { Text, View } from '@/components/Themed';
import VoiceList from '@/components/VoiceList';
import VersionList from '@/components/home/header/VersionList';
import { useBibleContext } from '@/context/BibleContext';
import { useStorage } from '@/context/LocalstoreContext';
import { EBibleVersions, Screens, TTheme } from '@/types';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useTheme } from '@react-navigation/native';
import { FlashList } from '@shopify/flash-list';
import { useNavigation } from 'expo-router';
import React, { useCallback, useMemo, useRef } from 'react';
import { StyleSheet, ToastAndroid, useWindowDimensions } from 'react-native';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import SecondDashboard from '../../components/new-dashboard';
import { NewFeatureBadge } from '@/components/NewFeatureBadge';
import isWithinTimeframe from '@/utils/isWithinTimeframe';
import useHistoryManager from '@/hooks/useHistoryManager';
import { useBibleChapter } from '@/context/BibleChapterContext';

export type IDashboardOption = {
  icon: IconProps['name'];
  label: string;
  action: () => void;
  disabled?: boolean;
  isIonicon?: boolean;
  tag?: string;
  color?: string;
  isNew?: boolean;
};

type RenderItemProps = {
  item: IDashboardOption;
  index: number;
};

type DashboardProps = {};

const Dashboard: React.FC<DashboardProps> = () => {
  const navigation = useNavigation();
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useWindowDimensions();
  const {
    currentBibleVersion,
    selectBibleVersion,
    clearHighlights,
    orientation = 'PORTRAIT',
  } = useBibleContext();
  const theme = useTheme();

  const { storedData } = useStorage();
  const {
    historyManager: { getCurrentItem },
  } = useBibleChapter();
  const voiceBottomSheetModalRef = useRef<BottomSheetModal>(null);
  const versionRef = useRef<BottomSheetModal>(null);
  const currentModalOpenRef = useRef<any>(null);

  const isPortrait = orientation === 'PORTRAIT';
  const styles = getStyles(theme, isPortrait);
  const isNTV = currentBibleVersion === EBibleVersions.NTV;
  const columnNumber = isPortrait ? 3 : 5;
  const {
    lastBook,
    lastChapter,
    lastVerse,
    lastBottomSideBook,
    lastBottomSideChapter,
    lastBottomSideVerse,
    isSongLyricEnabled,
  } = storedData;

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

  const voiceHandlePresentModalPress = useCallback(() => {
    voiceBottomSheetModalRef.current?.present();
    currentModalOpenRef.current = voiceBottomSheetModalRef.current;
  }, []);

  const versionHandlePresentModalPress = useCallback(() => {
    versionRef.current?.present();
    currentModalOpenRef.current = versionRef.current;
  }, []);

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
  }, [navigation, isSongLyricEnabled]);

  const dashboardItems: IDashboardOption[] = [
    {
      icon: isNTV ? 'BookText' : 'Crown',
      label: 'Santa Escritura',
      action: () => navigation.navigate(Screens.Home, homePageInitParams),
      tag: isNTV ? 'book-cross' : 'crown-outline',
    },
    {
      icon: 'Music4',
      label: 'Himnos',
      isIonicon: true,
      action: onSong,
    },
    {
      icon: 'Gamepad',
      label: 'Quiz Bíblico',
      action: () => navigation.navigate(Screens.ChooseGame),
      color: '#75d0fe',
      isNew: isWithinTimeframe('3d', new Date('2025-01-28')).isActive,
    },
    {
      icon: 'Brain',
      label: 'Momorizar',
      action: () => navigation.navigate(Screens.MemorizeVerse),
      color: '#f1abab',
      isNew: isWithinTimeframe('3d', new Date('2025-01-30')).isActive,
    },
    {
      icon: 'Search',
      label: 'Buscador',
      // @ts-ignore
      action: () => navigation.navigate(Screens.Search, {}),
    },
    {
      icon: 'LayoutGrid',
      label: 'Lista de Libro',
      action: () => navigation.navigate(Screens.ChooseBook, {}),
    },
    {
      icon: 'BookA',
      label: 'Diccionarios',
      action: () =>
        navigation?.navigate(Screens.DictionarySearch, { word: '' }),
    },
    {
      icon: 'SwatchBook',
      label: 'Concordancia Escritural',
      action: () => navigation.navigate(Screens.Concordance, {}),
    },
    {
      icon: 'NotebookText',
      label: 'Notas',
      action: () =>
        navigation.navigate(Screens.Notes, { shouldRefresh: false }),
    },
    {
      icon: 'MonitorDown',
      label: 'Gestor de descargas',
      action: () => navigation.navigate(Screens.DownloadManager),
    },
    {
      icon: 'Star',
      label: 'Versiculos Favoritos',
      action: () => navigation.navigate(Screens.Favorite),
    },
    {
      icon: 'UserSearch',
      label: 'Buscar Personaje',
      isIonicon: true,
      action: () => navigation.navigate(Screens.Character),
    },
    {
      icon: 'AudioLines',
      label: 'Selecciona Una Voz',
      action: voiceHandlePresentModalPress,
    },
    {
      icon: 'FileStack',
      label: 'Versiones',
      action: versionHandlePresentModalPress,
    },
    {
      icon: 'Settings',
      label: 'Ajustes',
      isIonicon: true,
      action: () => navigation.navigate(Screens.Settings),
    },
    {
      icon: 'HandHelping',
      label: 'Como Usar?',
      action: () => navigation.navigate(Screens.Onboarding),
    },
  ];

  const RenderItem = ({ item, index }: RenderItemProps) => (
    <TouchableWithoutFeedback
      onPress={item.action}
      style={[
        {
          padding: 0,
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        },
        { width: SCREEN_WIDTH / columnNumber },
      ]}
      disabled={item.disabled}
    >
      <View
        style={[
          styles.card,
          item.disabled && { backgroundColor: '#ddd' },
          index === 0 && {
            backgroundColor: theme.colors.notification,
          },
        ]}
      >
        {item.isNew && (
          <NewFeatureBadge style={{ backgroundColor: '#f73043' }} />
        )}

        <Icon
          name={item.icon as any}
          size={36}
          style={[styles.cardIcon]}
          color={index === 0 ? 'white' : theme.colors.notification}
        />

        <Text style={[styles.cardLabel, index === 0 && { color: 'white' }]}>
          {item.label}
        </Text>
      </View>
    </TouchableWithoutFeedback>
  );

  const StyleByOrientation = useMemo(() => {
    return isPortrait ? {} : { minHeight: SCREEN_HEIGHT - 40 };
  }, [SCREEN_WIDTH, SCREEN_HEIGHT, isPortrait]);

  return (
    <View
      key={orientation + theme.dark}
      style={[styles.container, !isPortrait && { flexDirection: 'row' }]}
    >
      {isPortrait && <DailyVerse theme={theme} />}

      <View style={[styles.optionContainer, StyleByOrientation]}>
        <FlashList
          data={dashboardItems}
          keyExtractor={(item) => item.label}
          renderItem={RenderItem}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          estimatedItemSize={5}
          numColumns={columnNumber}
        />
      </View>

      <BottomModal shouldScroll startAT={2} ref={voiceBottomSheetModalRef}>
        <VoiceList theme={theme} />
      </BottomModal>

      <BottomModal shouldScroll startAT={1} ref={versionRef}>
        <VersionList {...{ currentBibleVersion, onSelect, theme }} />
      </BottomModal>
    </View>
  );
};

const MyDashboard = () => {
  const { storedData: { isGridLayout } } = useStorage();
  return !isGridLayout ? <SecondDashboard /> : <Dashboard />;
};

export default MyDashboard;

const getStyles = ({ colors, dark }: TTheme, isPortrait: boolean) =>
  StyleSheet.create({
    container: {
      display: 'flex',
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    optionContainer: {
      flex: 1,
      width: '100%',
      backgroundColor: 'transparent',
      minHeight: 450,
    },
    card: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-evenly',
      padding: 10,
      paddingHorizontal: 5,
      borderRadius: 15,
      elevation: 5,
      height: 100,
      width: 100,
      margin: 5,
      marginBottom: 0,
      backgroundColor: '#fff',
    },
    separator: {
      margin: 10,
    },
    cardLabel: {
      backgroundColor: 'transparent',
      textAlign: 'center',
      fontWeight: 'bold',
      color: dark ? colors.card : colors.text,
    },
    cardIcon: {
      backgroundColor: 'transparent',
      color: colors.notification,
      fontSize: 36,
    },
    text: {
      color: 'white',
    },
  });
