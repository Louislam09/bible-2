import Animation from "@/components/Animation";
import Icon from "@/components/Icon";
import { Text, View } from "@/components/Themed";
import { htmlTemplate } from "@/constants/HtmlTemplate";
import { useBibleContext } from "@/context/BibleContext";
import useNotesExportImport from '@/hooks/useNotesExportImport';
import usePrintAndShare from '@/hooks/usePrintAndShare';
import { IVerseItem, Screens, TTheme } from '@/types';
import { formatDateShortDayMonth } from '@/utils/formatDateShortDayMonth';
import removeAccent from '@/utils/removeAccent';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme } from '@react-navigation/native';
import { FlashList } from '@shopify/flash-list';
import { Stack, useNavigation } from 'expo-router';
import React, {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Keyboard,
  StyleSheet,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';

type TListVerse = {
  data: IVerseItem[] | any;
  setShouldFetch: any;
};

const RenderItem = ({
  item,
  onOpenNoteDetail,
  styles,
  warnBeforeDelete,
  index,
  printToFile,
  theme,
}: any) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateXAnim = useRef(new Animated.Value(300)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        delay: index * 200,
        useNativeDriver: true,
      }),
      Animated.timing(translateXAnim, {
        toValue: 0,
        duration: 500,
        delay: index * 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, translateXAnim, index]);

  return (
    <Animated.View
      style={[
        {
          opacity: fadeAnim,
          transform: [{ translateX: translateXAnim }],
        },
      ]}
    >
      <TouchableOpacity
        style={{ backgroundColor: 'transparent' }}
        activeOpacity={0.9}
        onPress={() => onOpenNoteDetail(item.id)}
      >
        <View style={[styles.cardContainer]}>
          <View style={[styles.headerContainer]}>
            <Text style={[styles.cardTitle]}>{item.title}</Text>
            <View style={[styles.verseAction]}>
              <>
                <Icon
                  size={24}
                  name='Trash2'
                  style={[
                    styles.icon,
                    {
                      color: '#e74856',
                    },
                  ]}
                  onPress={() => warnBeforeDelete(item.id)}
                />
                <Icon
                  style={styles.icon}
                  name='Share2'
                  size={24}
                  onPress={() => {
                    const html = htmlTemplate(
                      [{ definition: item.note_text, topic: item.title }],
                      theme.colors,
                      10,
                      true
                    );
                    printToFile(html, item?.title?.toUpperCase() || '--');
                  }}
                />
              </>
            </View>
          </View>
          <Text style={styles.verseBody}>
            {item?.note_text
              ?.slice(0, 100)
              .replace(/<br>/gi, '-')
              .replace(/<.*?>|<.*?\/>/gi, '')}
          </Text>
          <Text style={[styles.date]}>
            {formatDateShortDayMonth(item.updated_at || item.created_at)}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

interface ActionButtonProps {
  item: {
    bottom: number;
    name: string;
    color: string;
    action: () => void;
  };
  index: number;
  styles: any;
  theme: any;
}

const ActionButton = ({ item, index, styles, theme }: ActionButtonProps) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(100)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        delay: index * 200,
        useNativeDriver: true,
      }),
      Animated.timing(translateYAnim, {
        toValue: 0,
        duration: 500,
        delay: index * 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, translateYAnim, index]);

  return (
    <Animated.View
      key={`button-${item.name}`}
      style={[
        styles.scrollToTopButton,
        {
          bottom: item.bottom,
          backgroundColor: item.color + '99',
          opacity: fadeAnim,
          transform: [{ translateY: translateYAnim }],
        },
      ]}
    >
      <TouchableOpacity onPress={item.action}>
        <Icon
          style={[{}]}
          color={theme.colors.text}
          name={item.name as any}
          size={30}
        />
      </TouchableOpacity>
    </Animated.View>
  );
};

const NotesPage = ({ data, setShouldFetch }: TListVerse) => {
  const theme = useTheme();
  const navigation = useNavigation();

  const { printToFile } = usePrintAndShare();
  const {
    onDeleteNote,
    onDeleteAllNotes,
    addToNoteText,
    currentBibleLongName,
  } = useBibleContext();
  const { exportNotes, importNotes, error, isLoading } = useNotesExportImport();

  const styles = getStyles(theme);
  const notFoundSource = require('../../assets/lottie/notFound.json');

  const [filterData, setFilterData] = useState([]);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [searchText, setSearchText] = useState<any>(null);
  const flatListRef = useRef<FlashList<any>>(null);

  const noteCountTitle = useMemo(
    () => `${filterData.length} ${filterData.length > 1 ? 'Notas' : 'Nota'}`,
    [filterData]
  );

  const getData = useMemo(() => {
    return searchText
      ? filterData.filter(
          (x: any) =>
            removeAccent(x.title).indexOf(searchText.toLowerCase()) !== -1 ||
            removeAccent(x.note_text).indexOf(searchText.toLowerCase()) !== -1
        )
      : filterData;
  }, [searchText, filterData]);

  useEffect(() => {
    if (!data) return;
    if (addToNoteText) showAddNoteAlert();
  }, [addToNoteText, data]);

  useEffect(() => {
    if (!data) return;
    setFilterData(data);
  }, [data]);

  const showAddNoteAlert = () => {
    ToastAndroid.show(
      'Seleccione la nota a la que quieres añadir el versiculo',
      ToastAndroid.LONG
    );
  };

  const onCreateNewNote = () => {
    navigation.navigate(Screens.NoteDetail, { noteId: null, isNewNote: true });
  };

  const onDelete = async (id: number) => {
    await onDeleteNote(id);
    setShouldFetch((prev: any) => !prev);
    ToastAndroid.show('Nota borrada!', ToastAndroid.SHORT);
    setSearchText('');
  };

  const onDeleteAll = async () => {
    await onDeleteAllNotes();
    setShouldFetch((prev: any) => !prev);
    ToastAndroid.show('Todas las notas han sido borradas!', ToastAndroid.SHORT);
    setSearchText('');
  };

  const warnBeforeDelete = (id: number) => {
    Alert.alert(
      'Eliminar Nota',
      '¿Estás seguro que quieres eliminar esta nota?',
      [
        {
          text: 'Cancelar',
          onPress: () => {},
          style: 'cancel',
        },
        { text: 'Eliminar', onPress: () => onDelete(id) },
      ]
    );
  };
  const warnBeforeDeleteAll = () => {
    Alert.alert(
      'Eliminar Todas las Notas',
      '¿Estás seguro que quieres eliminar todas las notas?',
      [
        {
          text: 'Cancelar',
          onPress: () => {},
          style: 'cancel',
        },
        { text: 'Eliminar', onPress: () => onDeleteAll() },
      ]
    );
  };

  const onOpenNoteDetail = useCallback((id: number) => {
    navigation.navigate(Screens.NoteDetail, { noteId: id, isNewNote: false });
  }, []);

  const NoteHero = () => {
    return (
      <View style={[styles.noteHeader]}>
        <Text style={[styles.noteListTitle]}>Mis Notas</Text>
        <Text
          style={[
            styles.noteHeaderSubtitle,
            !filterData.length && { display: 'none' },
          ]}
        >
          {noteCountTitle}
        </Text>
        <View style={styles.searchContainer}>
          <Ionicons
            style={styles.searchIcon}
            name='search'
            size={24}
            color={theme.colors.notification}
          />
          <TextInput
            placeholder='Buscar en tus notas...'
            style={[styles.noteHeaderSearchInput]}
            onChangeText={(text) => setSearchText(text)}
            value={searchText}
          />
        </View>
      </View>
    );
  };

  const ListEmptyComponent = () => {
    return (
      <View style={[styles.noResultsContainer]}>
        <Animation
          backgroundColor={theme.colors.background}
          source={notFoundSource}
          loop={false}
        />
        <Text style={styles.noResultsText}>
          <Text style={{ color: theme.colors.notification }}>
            ({currentBibleLongName})
          </Text>{' '}
          {'\n'}
          No tienes notas en esta version de la escritura.
        </Text>
      </View>
    );
  };

  const onImportNotes = async () => {
    await importNotes();
    setShouldFetch((prev: any) => !prev);
  };

  const showMoreOptionHandle = () => {
    setShowMoreOptions((prev) => !prev);
  };

  const dismiss = () => {
    Keyboard.dismiss();
    setShowMoreOptions(false);
  };

  const actionButtons = useMemo(
    () =>
      [
        {
          bottom: 25,
          name: 'Plus',
          color: theme.colors.notification,
          action: onCreateNewNote,
          hide: false,
        },
        {
          bottom: 90,
          name: 'EllipsisVertical',
          color: '#008CBA',
          action: showMoreOptionHandle,
          hide: showMoreOptions,
        },
        {
          bottom: 90,
          name: 'Import',
          color: '#008CBA',
          action: onImportNotes,
          hide: !showMoreOptions,
        },
        {
          bottom: 155,
          name: 'Share',
          color: '#45a049',
          action: exportNotes,
          hide: !showMoreOptions,
        },
      ].filter((item) => !item.hide),
    [showMoreOptions]
  );

  if (isLoading) <ActivityIndicator />;

  return (
    <Fragment>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: '',
          animation: 'slide_from_left',
          headerRight: () => (
            <TouchableOpacity onPress={warnBeforeDeleteAll}>
              <Icon
                style={[{ marginHorizontal: 10 }]}
                color={theme.colors.text}
                name={'Trash2'}
                size={25}
              />
            </TouchableOpacity>
          ),
        }}
      />
      <TouchableWithoutFeedback style={{ flex: 1 }} onPress={dismiss}>
        <View
          style={{
            flex: 1,
            padding: 5,
            backgroundColor: theme.dark ? theme.colors.background : '#eee',
          }}
        >
          {NoteHero()}
          {error && (
            <Text style={{ textAlign: 'center', color: '#e74856' }}>
              {error}
            </Text>
          )}
          <FlashList
            contentContainerStyle={styles.contentContainerStyle}
            ref={flatListRef}
            decelerationRate={'normal'}
            estimatedItemSize={135}
            data={getData}
            renderItem={({ item, index }) => (
              <RenderItem
                {...{
                  styles,
                  onOpenNoteDetail,
                  warnBeforeDelete,
                  printToFile,
                  theme,
                  item,
                  index,
                }}
              />
            )}
            keyExtractor={(item: any, index: any) =>
              `note-${item?.id}:${index}`
            }
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            ListEmptyComponent={ListEmptyComponent}
            ListFooterComponent={<View style={{ paddingVertical: 30 }} />}
          />
          {actionButtons.map((item, index) => (
            <ActionButton
              theme={theme}
              styles={styles}
              item={item}
              index={index}
            />
          ))}
        </View>
      </TouchableWithoutFeedback>
    </Fragment>
  );
};

const getStyles = ({ colors, dark }: TTheme) =>
  StyleSheet.create({
    contentContainerStyle: {
      backgroundColor: dark ? colors.background : '#eee',
      paddingVertical: 20,
    },
    verseBody: {
      color: colors.text,
      backgroundColor: 'transparent',
    },
    date: {
      color: colors.notification,
      textAlign: 'right',
      marginTop: 10,
    },
    textInput: {
      padding: 10,
      fontSize: 22,
      color: colors.text,
      marginVertical: 5,
      textDecorationStyle: 'solid',
      textDecorationColor: 'red',
      textDecorationLine: 'underline',
    },
    scrollToTopButton: {
      position: 'absolute',
      right: 20,
      backgroundColor: colors.notification + 99,
      padding: 10,
      borderRadius: 10,
      elevation: 3,
      borderWidth: 1,
      borderColor: colors.notification,
    },
    noteHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 4,
      paddingVertical: 10,
      // marginTop: 40,
      backgroundColor: 'transparent',
    },
    noteListTitle: {
      fontSize: 30,
      // marginVertical: 10,
      fontWeight: 'bold',
      textAlign: 'center',
      color: colors.notification,
    },
    noteHeaderSubtitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      alignSelf: 'flex-start',
    },
    searchContainer: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-around',
      borderRadius: 10,
      marginVertical: 20,
      borderWidth: 1,
      borderColor: colors.notification,
      borderStyle: 'solid',
      width: '100%',
      fontWeight: '100',
      backgroundColor: colors.notification + '99',
    },
    searchIcon: {
      color: colors.text,
      paddingHorizontal: 15,
      borderRadius: 10,
      fontWeight: 'bold',
    },
    noteHeaderSearchInput: {
      borderRadius: 10,
      padding: 10,
      paddingLeft: 15,
      fontSize: 18,
      flex: 1,
      fontWeight: '100',
      backgroundColor: '#ddd',
      borderTopLeftRadius: 0,
      borderBottomLeftRadius: 0,
    },
    cardContainer: {
      display: 'flex',
      borderRadius: 10,
      backgroundColor: colors.card,
      padding: 15,
      margin: 5,
      elevation: 5,
      borderColor: '#ddd',
      borderWidth: 0.5,
    },
    headerContainer: {
      position: 'relative',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
      backgroundColor: 'transparent',
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.notification,
      flex: 1,
    },
    cardBody: {
      fontSize: 16,
      color: colors.text,
    },
    separator: {
      height: 1,
      backgroundColor: colors.notification + '99',
      marginVertical: 8,
    },
    noResultsContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 10,
      paddingBottom: 20,
      backgroundColor: 'transparent',
    },
    noResultsText: {
      fontSize: 18,
      color: colors.text,
      textAlign: 'center',
    },
    verseAction: {
      flexDirection: 'row',
      backgroundColor: 'transparent',
    },
    icon: {
      fontWeight: '700',
      marginHorizontal: 10,
      color: colors.primary,
      // fontSize: 24,
    },
  });

export default NotesPage;
