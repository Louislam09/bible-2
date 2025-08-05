import { Text, View } from "@/components/Themed";
import { useTheme } from "@/context/ThemeContext";
import { FlashList, ListRenderItem } from "@shopify/flash-list";
import React, { useCallback } from "react";
import { Image, StyleSheet, TouchableOpacity } from "react-native";

interface ChapterItemProps {
  item: number;
  onPress: (item: number) => void;
  textColor: string;
  borderColor: string;
}

const ChapterItem = React.memo(
  ({ item, onPress, textColor, borderColor }: ChapterItemProps) => (
    <TouchableOpacity
      style={[styles.listItem, { borderColor: borderColor + "10" }]}
      onPress={() => onPress(item)}
      activeOpacity={0.7}
    >
      <Text style={[styles.listTitle, { color: textColor }]}>{item}</Text>
    </TouchableOpacity>
  )
);

interface OptimizedChapterListProps {
  bookName: string;
  selectedChapeter?: number;
  chapters: number[];
  onChapterSelect: (chapter: number) => void;
  bookImageUri: string;
}

const OptimizedChapterList = ({
  bookName,
  selectedChapeter,
  chapters,
  onChapterSelect,
  bookImageUri,
}: OptimizedChapterListProps) => {
  const { theme } = useTheme();
  const { colors } = theme;

  const ListHeader = useCallback(
    () => (
      <View style={styles.listWrapper}>
        <Image
          style={styles.bookImage}
          source={{ uri: bookImageUri }}
          alt={bookName}
        />
        <Text style={[styles.listChapterTitle, { color: colors.notification }]}>
          {bookName} {selectedChapeter}
        </Text>
      </View>
    ),
    [bookName, bookImageUri, colors.notification]
  );

  const renderItem: ListRenderItem<number> = useCallback(
    ({ item }) => (
      <ChapterItem
        item={item}
        onPress={onChapterSelect}
        textColor={colors.text}
        borderColor={colors.text}
      />
    ),
    [colors.text, onChapterSelect]
  );

  const keyExtractor = useCallback((item: number) => item.toString(), []);

  return (
    <FlashList
      data={chapters}
      renderItem={renderItem}
      estimatedItemSize={70}
      keyExtractor={keyExtractor}
      numColumns={5}
      ListHeaderComponent={ListHeader}
      contentContainerStyle={styles.flatContainer}
      removeClippedSubviews={true}
      getItemType={() => "chapter"}
      overrideItemLayout={(layout, item) => {
        layout.size = 70;
        layout.span = 1;
      }}
    />
  );
};

const styles = StyleSheet.create({
  listWrapper: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    backgroundColor: "transparent",
  },
  bookImage: {
    resizeMode: "contain",
    position: "relative",
    width: 100,
    height: 100,
  },
  flatContainer: {
    paddingVertical: 20,
    backgroundColor: "transparent",
  },
  listItem: {
    display: "flex",
    borderStyle: "solid",
    borderWidth: 1,
    padding: 10,
    flex: 1,
    height: 70,
    alignItems: "center",
    justifyContent: "center",
  },
  listTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  listChapterTitle: {
    paddingHorizontal: 20,
    paddingBottom: 0,
    fontSize: 26,
    paddingVertical: 5,
  },
});

export default React.memo(OptimizedChapterList);
