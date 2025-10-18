import DomChooseReference from "@/components/dom-components/DomChooseReference";
import { singleScreenHeader } from "@/components/common/singleScreenHeader";
import { Text, View } from "@/components/Themed";
import { useMyTheme } from "@/context/ThemeContext";
import useParams from "@/hooks/useParams";
import { bibleState$ } from "@/state/bibleState";
import { ChooseChapterNumberParams, Screens } from "@/types";
import { Stack, useNavigation } from "expo-router";
import React, { Fragment, useCallback, useEffect, useState } from "react";
import "../global.css";
import { BackHandler } from "react-native";
import { chooseReferenceHtmlTemplate } from "@/chooseReferenceTemplate";
import WebviewReferenceChoose from "@/components/home/content/WebviewReferenceChoose";

enum Step {
  Book,
  Chapter,
  Verse,
}

const ChooseReferenceDom = () => {
  const navigation = useNavigation();
  const routeParam = useParams<ChooseChapterNumberParams>();
  const { theme } = useMyTheme();
  const [step, setStep] = useState<Step>(Step.Book);

  const onConfirm = useCallback(
    (ref: {
      book: string;
      chapter: number;
      verse: number;
      goHome: boolean;
    }) => {
      const isBottomSideSearching = bibleState$.isBottomBibleSearching.get();
      const params = {
        ...routeParam,
        [isBottomSideSearching ? "bottomSideBook" : "book"]: ref.book,
        [isBottomSideSearching ? "bottomSideChapter" : "chapter"]: ref.chapter,
        [isBottomSideSearching ? "bottomSideVerse" : "verse"]: ref.verse,
        isHistory: false,
      } as any;

      bibleState$.changeBibleQuery({
        ...params,
        isBibleBottom: isBottomSideSearching,
        shouldFetch: ref.goHome ? false : true,
        isHistory: false,
      });

      if (ref.goHome) {
        navigation.navigate(Screens.Home, params);
      }
    },
    [routeParam, navigation]
  );

  useEffect(() => {
    const backAction = () => {
      if (step === Step.Book) {
        navigation.goBack();
      } else {
        setStep((s) => s - 1);
      }
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, [step]);

  return (
    <Fragment>
      <Stack.Screen
        options={singleScreenHeader({
          theme,
          title: "Seleccionar",
          titleIcon: "List",
          headerRightProps: {
            headerRightIconColor: "red",
            onPress: () => {},
            disabled: true,
            style: { opacity: 1 },
          },
        })}
      />
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <WebviewReferenceChoose />
        {/* <DomChooseReference
                    theme={theme}
                    initialBook={(routeParam as any)?.book || (routeParam as any)?.bottomSideBook}
                    initialChapter={(routeParam as any)?.chapter || (routeParam as any)?.bottomSideChapter}
                    initialVerse={(routeParam as any)?.verse || (routeParam as any)?.bottomSideVerse}
                    onConfirm={onConfirm}
                    step={step}
                    onStepChange={setStep}
                /> */}
      </View>
    </Fragment>
  );
};

export default ChooseReferenceDom;
