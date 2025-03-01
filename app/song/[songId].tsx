import CustomHeaderLeft from "@/components/CustomHeaderLeft";
import Icon from "@/components/Icon";
import SongViewer from "@/components/song-viewer";
import { View } from "@/components/Themed";
import AlegreSongs from "@/constants/songs";
import hymnSong from "@/constants/hymnSong";
import { storedData$, useStorage } from "@/context/LocalstoreContext";
import useParams from "@/hooks/useParams";
import { TSongItem } from "@/types";
import { useTheme } from "@react-navigation/native";
import { Stack } from "expo-router";
import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { use$ } from "@legendapp/state/react";

const DisplaySong = () => {
  const { songId, isAlegres } = useParams();
  const theme = useTheme();
  const Songs = isAlegres ? AlegreSongs : hymnSong;
  const selected = Songs.find((item) => +item.id === songId) as TSongItem;

  const songFontSize = use$(() => storedData$.songFontSize.get());

  const increaseFont = () => {
    const value = Math.min(40, Math.max(21, (songFontSize as any) + 2));
    storedData$.songFontSize.set(value);
  };
  const decreaseFont = () => {
    const value = Math.max(21, (songFontSize as any) - 2);
    storedData$.songFontSize.set(value);
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: "",
          animation: "slide_from_bottom",
          headerLeft: () => <CustomHeaderLeft title="Himnario" />,
          headerRight: () => (
            <View style={styles.headerActions}>
              <TouchableOpacity onPress={increaseFont} style={{}}>
                <Icon name="AArrowUp" size={24} color={theme.colors.text} />
              </TouchableOpacity>
              <TouchableOpacity onPress={decreaseFont} style={{}}>
                <Icon name="AArrowDown" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      <SongViewer song={selected} />
    </>
  );
};

export default DisplaySong;

const styles = StyleSheet.create({
  headerActions: {
    display: "flex",
    flexDirection: "row",
    gap: 30,
    backgroundColor: "transparent",
  },
});
