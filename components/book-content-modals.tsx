import BottomModal from "@/components/BottomModal";
import CustomBottomSheet from "@/components/BottomSheet";
import CompareVersions from "@/components/CompareVersions";
import DictionaryContent from "@/components/DictionaryContent";
import Icon from "@/components/Icon";
import { useBibleContext } from "@/context/BibleContext";
import useResizableBox from "@/hooks/useResizeBox";
import { bibleState$ } from "@/state/bibleState";
import { modalState$ } from "@/state/modalState";
import { TTheme } from "@/types";
import { use$ } from "@legendapp/state/react";
import { useNavigation, useTheme } from "@react-navigation/native";
import React from "react";
import { Animated, Dimensions, StyleSheet } from "react-native";
import StrongContent from "./home/content/StrongContent";

const DragIconView = Animated.View;

const BookContentModals = ({ book, chapter }: any) => {
  const theme = useTheme();
  const { fontSize } = useBibleContext();
  const styles = getStyles(theme);
  const { strongWord } = useBibleContext();
  const navigation = useNavigation();
  const isSheetClosed = use$(() => modalState$.isSheetClosed.get());

  const { topHeight, panResponder } = useResizableBox({ theme });

  return (
    <>
      {!isSheetClosed && (
        <Animated.View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "100%",
            height: Animated.subtract(
              new Animated.Value(Dimensions.get("window").height),
              topHeight
            ),
          }}
        >
          <CustomBottomSheet
            handleSheetChange={(index) => modalState$.handleSheetChange(index)}
            startAT={3}
            ref={modalState$.strongSearchRef.get()}
            handleComponent={() => (
              <DragIconView
                {...panResponder.panHandlers}
                style={[styles.slider]}
              >
                <Icon
                  name="GripHorizontal"
                  size={30}
                  color={theme.colors.text}
                />
              </DragIconView>
            )}
          >
            <StrongContent
              navigation={navigation}
              theme={theme}
              data={strongWord}
              fontSize={fontSize}
            />
          </CustomBottomSheet>
        </Animated.View>
      )}

      <BottomModal
        backgroundColor={theme.dark ? theme.colors.background : "#eee"}
        shouldScroll
        startAT={2}
        ref={modalState$.dictionaryRef.get()}
      >
        <DictionaryContent
          navigation={navigation}
          theme={theme}
          fontSize={fontSize}
        />
      </BottomModal>

      <BottomModal shouldScroll startAT={3} ref={modalState$.compareRef.get()}>
        <CompareVersions
          {...{
            theme,
            book,
            chapter,
            verse: bibleState$.verseToCompare.get() || 1,
            navigation,
            compareRef: modalState$.compareRef.get(),
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
