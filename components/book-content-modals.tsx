import React, { useRef, useCallback, useState, useEffect } from 'react';
import { Animated, StyleSheet, View, Dimensions } from 'react-native';
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useNavigation, useTheme } from "@react-navigation/native";
import CustomBottomSheet from "components/BottomSheet";
import BottomModal from "components/BottomModal";
import CompareVersions from "components/CompareVersions";
import DictionaryContent from "components/DictionaryContent";
import Icon from "components/Icon";
import { useBibleContext } from "context/BibleContext";
import useResizableBox from "hooks/useResizeBox";
import { TTheme } from "types";
import { useModal } from 'context/modal-context';
import StrongContent from './home/content/StrongContent';

const DragIconView = Animated.View;

const BookContentModals = ({ book, chapter }: any) => {
  const theme = useTheme();
  const { fontSize } = useBibleContext()
  const styles = getStyles(theme);
  const compareRef = useRef<BottomSheetModal>(null);
  const { verseToCompare, strongWord } = useBibleContext();
  const navigation = useNavigation();
  const strongSearchBottomSheetModalRef = useRef<BottomSheetModal>(null);
  const dictionaryBottomSheetModalRef = useRef<BottomSheetModal>(null);

  const {
    setCompareRef,
    setStrongSearchRef,
    setDictionaryRef,
    searchWordOnDic,
    dictionaryHandlePresentModalPress,
    isSheetClosed,
    handleSheetChange
  } = useModal();

  useEffect(() => {
    setCompareRef(compareRef);
    setStrongSearchRef(strongSearchBottomSheetModalRef);
    setDictionaryRef(dictionaryBottomSheetModalRef);
  }, [setCompareRef, setStrongSearchRef, setDictionaryRef]);

  const { topHeight, topWidth, _backgroundColor, panResponder } = useResizableBox({ theme });

  return (
    <>
      {!isSheetClosed && (
        <Animated.View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "100%",
            height: Animated.subtract(new Animated.Value(Dimensions.get('window').height), topHeight),
          }}
        >
          <CustomBottomSheet
            handleSheetChange={handleSheetChange}
            startAT={3}
            ref={strongSearchBottomSheetModalRef}
            handleComponent={() => (
              <DragIconView {...panResponder.panHandlers} style={[styles.slider]}>
                <Icon name="GripHorizontal" size={30} color={theme.colors.text} />
              </DragIconView>
            )}
          >
            <StrongContent
              navigation={navigation}
              theme={theme}
              data={strongWord}
              fontSize={fontSize}
              bottomRef={strongSearchBottomSheetModalRef}
              onDictionary={dictionaryHandlePresentModalPress}
            />
          </CustomBottomSheet>
        </Animated.View>
      )}

      <BottomModal
        backgroundColor={theme.dark ? theme.colors.background : "#eee"}
        shouldScroll
        startAT={2}
        ref={dictionaryBottomSheetModalRef}
      >
        <DictionaryContent
          word={searchWordOnDic}
          navigation={navigation}
          theme={theme}
          fontSize={fontSize}
          dicRef={dictionaryBottomSheetModalRef}
        />
      </BottomModal>

      <BottomModal shouldScroll startAT={3} ref={compareRef}>
        <CompareVersions
          {...{
            theme,
            book,
            chapter,
            verse: verseToCompare || 1,
            navigation,
            compareRef,
          }}
        />
      </BottomModal>
    </>
  );
};

const getStyles = ({ colors }: TTheme) =>
  StyleSheet.create({
    slider: {
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 10,
      width: "100%",
    },
  });

export default BookContentModals;