import Icon from '@/components/Icon';
import { Text, View } from '@/components/Themed';
import { DB_BOOK_NAMES } from '@/constants/BookNames';
import { useBibleContext } from '@/context/BibleContext';
import useParams from '@/hooks/useParams';
import {
  BookIndexes,
  ChooseChapterNumberParams,
  IDBBookNames,
  Screens,
  TTheme,
} from '@/types';
import removeAccent from '@/utils/removeAccent';
import { useTheme } from '@react-navigation/native';
import { FlashList, ListRenderItem } from '@shopify/flash-list';
import { Stack, useNavigation } from 'expo-router';
import React, { Fragment, useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

type ChooseBookProps = {};

const ChooseBook: React.FC<ChooseBookProps> = () => {
  const navigation = useNavigation();
  const routeParam = useParams<ChooseChapterNumberParams>();
  const { book } = routeParam;
  const theme = useTheme();
  const styles = getStyles(theme);
  const {
    viewLayoutGrid,
    toggleViewLayoutGrid,
    isBottomSideSearching,
    orientation,
  } = useBibleContext();
  const [query, setQuery] = useState('');
  const isPortrait = orientation === 'PORTRAIT';

  const handlePress = (item: IDBBookNames) => {
    const topSide: any = { book: item.longName };
    const bottomSide: any = { bottomSideBook: item.longName };
    const params = isBottomSideSearching ? bottomSide : topSide;
    navigation.navigate(Screens.ChooseChapterNumber, {
      ...routeParam,
      ...params,
    });
  };

  const handelSearch = async (query: string) => {
    setQuery(query);
  };

  const withTitle = (index: number) =>
    [BookIndexes.Genesis, BookIndexes.Mateo].includes(index);

  const title: { [key: string]: string } = {
    Gn: 'Antiguo Pacto',
    Mt: 'Nuevo Pacto',
  };

  const renderItem: ListRenderItem<IDBBookNames> = ({ item, index }) => {
    const isCurrent = book === item.longName;
    const isNewVow = index >= BookIndexes.Malaquias;
    return (
      <TouchableOpacity
        style={[
          styles.listItem,
          isCurrent && { backgroundColor: theme.colors.notification + '60' },
          isNewVow && { backgroundColor: theme.colors.text + 20 },
        ]}
        onPress={() => handlePress(item)}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.listTitle,
            { color: theme.dark ? item.bookColor : '' },
          ]}
        >
          {item.longName.replace(/\s+/g, '').slice(0, 3)}
        </Text>
        <Text numberOfLines={1} ellipsizeMode='middle' style={styles.subTitle}>
          {item.longName}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <Fragment>
      <Stack.Screen
        options={{
          headerShown: true,
          headerRight: () => (
            <TouchableOpacity onPress={() => toggleViewLayoutGrid()}>
              <Icon
                style={styles.icon}
                name={!viewLayoutGrid ? 'LayoutGrid' : 'List'}
                size={24}
              />
            </TouchableOpacity>
          ),
        }}
      />
      <View
        key={orientation + theme.dark}
        style={[styles.container, !isPortrait && { flexDirection: 'row' }]}
      >
        <View style={styles.listWrapper}>
          <FlashList
            contentContainerStyle={styles.flatContainer}
            data={DB_BOOK_NAMES}
            renderItem={renderItem}
            estimatedItemSize={47}
            numColumns={viewLayoutGrid ? 4 : 1}
          />
        </View>
      </View>
    </Fragment>
  );
};

const getStyles = ({ colors, dark }: TTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      position: 'relative',
      alignItems: 'flex-start',
      width: '100%',
      backgroundColor: dark ? colors.background : colors.text + 20,
    },
    listWrapper: {
      display: 'flex',
      flex: 1,
      width: '100%',
      height: '100%',
    },
    bookImage: {
      resizeMode: 'contain',
      position: 'relative',
      width: 200,
      height: 200,
    },
    flatContainer: {
      paddingBottom: 20,
      backgroundColor: colors.background,
    },
    listItem: {
      display: 'flex',
      borderStyle: 'solid',
      borderWidth: 1,
      borderColor: colors.text + 10,
      padding: 10,
      flex: 1,
      height: 70,
    },
    listViewItem: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderStyle: 'solid',
      borderWidth: 0.19,
      borderColor: '#4a4949',

      borderLeftWidth: 0,
      borderRightWidth: 0,
      padding: 15,
      flex: 1,
    },
    listViewTitle: {
      fontSize: 20,
      marginVertical: 10,
      paddingLeft: 15,
      color: colors.notification,
      textAlign: 'center',
    },
    listTitle: {
      color: colors.text,
      fontSize: 18,
      fontWeight: 'bold',
    },
    subTitle: {
      fontSize: 14,
      color: colors.text,
      opacity: 0.9,
    },
    listChapterTitle: {
      color: colors.notification,
      padding: 20,
      paddingBottom: 0,
      fontSize: 20,
    },
    icon: {
      fontWeight: '900',
      color: colors.text,
      marginHorizontal: 10,
    },
  });

export default ChooseBook;
