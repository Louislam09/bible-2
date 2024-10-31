import Highlighter from "components/Highlighter";
import Icon from "components/Icon";
import { Text, View } from "components/Themed";
import { StyleSheet, TouchableOpacity } from "react-native";
import { TTheme } from "types";
import copyToClipboard from "utils/copyToClipboard";

export type TItem = {
  bookName: string;
  bookNumber: number;
  chapter: number;
  verse: number;
  text: string;
};

type TRenderVerse = {
  item: TItem;
  onItemClick: any;
  theme: TTheme;
  selected: any;
  sanitize?: any;
};

const RenderVerse = ({
  item,
  onItemClick,
  theme,
  selected,
  sanitize,
}: TRenderVerse) => {
  const styles = getStyles(theme);

  const onCopy = async (item: any) => {
    await copyToClipboard({
      ...item,
      book_number: item.bookNumber || item.book_number,
    });
  };

  const isArray = Array.isArray(selected);
  return (
    <TouchableOpacity activeOpacity={0.9} onPress={() => onItemClick(item)}>
      <View style={styles.cardContainer}>
        <View style={styles.headerContainer}>
          <Text
            style={styles.cardTitle}
          >{`${item.bookName} ${item.chapter}:${item.verse}`}</Text>
          <View style={styles.verseAction}>
            <Icon
              size={20}
              name="Copy"
              style={styles.icon}
              onPress={() => onCopy(item)}
            />
          </View>
        </View>
        <Highlighter
          sanitize={sanitize}
          textToHighlight={item.text}
          searchWords={isArray ? selected : [selected]}
          highlightStyle={{ color: theme.colors.notification }}
          style={[styles.verseBody]}
          onWordClick={() => { }}
        />
      </View>
    </TouchableOpacity>
  );
};

const getStyles = ({ colors }: TTheme) =>
  StyleSheet.create({
    verseBody: {
      color: colors.text,
      fontSize: 18,
    },
    scrollToTopButton: {
      position: "absolute",
      bottom: 20,
      right: 20,
      backgroundColor: colors.background,
      padding: 10,
      borderRadius: 50,
      borderColor: colors.notification,
      borderWidth: 1,
    },
    chapterHeader: {
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "center",
      padding: 16,
    },
    chapterHeaderTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: colors.text,
    },
    cardContainer: {
      display: "flex",
      borderRadius: 10,
      padding: 10,
      margin: 8,
    },
    headerContainer: {
      position: "relative",
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 8,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: colors.notification,
    },
    cardBody: {
      fontSize: 16,
      color: colors.text,
    },
    separator: {
      height: 1,
      backgroundColor: colors.notification + "99",
      marginVertical: 8,
    },
    noResultsContainer: {
      flex: 0.7,
      alignItems: "center",
      justifyContent: "center",
    },
    noResultsText: {
      fontSize: 18,
      color: colors.text,
    },
    verseAction: {
      alignSelf: "flex-end",
      flexDirection: "row",
    },
    icon: {
      fontWeight: "700",
      marginHorizontal: 10,
      color: colors.primary,
      fontSize: 24,
    },
  });

export default RenderVerse;
