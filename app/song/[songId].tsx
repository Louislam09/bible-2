import CustomHeaderLeft from '@/components/CustomHeaderLeft';
import Icon from '@/components/Icon';
import SongViewer from '@/components/song-viewer';
import { View } from '@/components/Themed';
import songs from '@/constants/songs';
import { useStorage } from '@/context/LocalstoreContext';
import useParams from '@/hooks/useParams';
import { TSongItem } from '@/types';
import { useTheme } from '@react-navigation/native';
import { Stack } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

const DisplaySong = () => {
  const { songId } = useParams();
  const theme = useTheme();
  const selected = songs.find((item) => +item.id === songId) as TSongItem;

  const {
    saveData,
    storedData: { songFontSize },
  } = useStorage();

  const increaseFont = () => {
    const value = Math.min(40, Math.max(21, (songFontSize as any) + 2));
    saveData({ songFontSize: value });
  };
  const decreaseFont = () => {
    const value = Math.max(21, (songFontSize as any) - 2);
    saveData({ songFontSize: value });
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: '',
          animation: 'slide_from_bottom',
          headerLeft: () => <CustomHeaderLeft title='Himnario' />,
          headerRight: () => (
            <View style={styles.headerActions}>
              <TouchableOpacity onPress={increaseFont} style={{}}>
                <Icon name='AArrowUp' size={24} color={theme.colors.text} />
              </TouchableOpacity>
              <TouchableOpacity onPress={decreaseFont} style={{}}>
                <Icon name='AArrowDown' size={24} color={theme.colors.text} />
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
    display: 'flex',
    flexDirection: 'row',
    gap: 30,
    backgroundColor: 'transparent',
  },
});
