import AdditionalResources from "@/components/AdditionalResources";
import DailyVerseTwo from "@/components/new-dashboard/DailyVerseTwo";
import MainSection from "@/components/new-dashboard/MainSection";
import StudyTools from "@/components/new-dashboard/StudyTools";
import StatusBarBackground from "@/components/StatusBarBackground";
import { useBibleContext } from "@/context/BibleContext";
import { storedData$ } from "@/context/LocalstoreContext";
import { useNotification } from "@/context/NotificationContext";
import { bibleState$ } from "@/state/bibleState";
import { Screens, TTheme } from "@/types";
import isWithinTimeframe from "@/utils/isWithinTimeframe";
import { showToast } from "@/utils/showToast";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { use$ } from "@legendapp/state/react";
import { useTheme } from "@react-navigation/native";
import * as Notifications from "expo-notifications";
import { useNavigation } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { IDashboardOption } from "../../app/(dashboard)";
import BottomModal from "../BottomModal";
import EmptyStateMessage from "../EmptyStateMessage";
import VersionList from "../home/header/VersionList";
import ProfileCard from "../UserProfile";
import VoiceList from "../VoiceList";

export interface IAdditionalResourceList {
  advancedSearch: IDashboardOption[];
  manager: IDashboardOption[];
}

const SecondDashboard = () => {
  const navigation = useNavigation();
  const theme = useTheme();
  const styles = getStyles(theme);
  const [currentEmpty, setCurrentEmpty] = useState<"doubible" | "timeline">(
    "doubible"
  );

  const {
    currentBibleVersion,
    selectBibleVersion,
    historyManager: { getCurrentItem },
  } = useBibleContext();
  const storedData = storedData$.get();
  const requestAccessBottomSheetModalRef = useRef<BottomSheetModal>(null);
  const { notification, expoPushToken, error } = useNotification();

  const {
    lastBook,
    lastChapter,
    lastVerse,
    lastBottomSideBook,
    lastBottomSideChapter,
    lastBottomSideVerse,
    isAdmin: _isAdmin,
  } = storedData;
  const user = use$(() => storedData$.user.get()) || null;
  const isAdmin = _isAdmin || user?.isAdmin;

  const onSelect = (version: string) => {
    bibleState$.clearSelection();
    selectBibleVersion(version);
    versionRef.current?.dismiss();
  };

  const onSong = useCallback(() => {
    navigation.navigate(Screens.Hymn);
  }, [navigation]);

  const {
    book: lastHistoryBook,
    chapter: lastHistoryChapter,
    verse: lastHistoryVerse,
  } = (getCurrentItem?.() as any) || {};

  const homePageInitParams = {
    book: lastHistoryBook || lastBook || "Génesis",
    chapter: lastHistoryChapter || lastChapter || 1,
    verse: lastHistoryVerse || lastVerse || 1,
    bottomSideBook: lastBottomSideBook || "Génesis",
    bottomSideChapter: lastBottomSideChapter || 1,
    bottomSideVerse: lastBottomSideVerse || 0,
    isTour: false,
    isHistory: true,
  };

  const mainActionItems: IDashboardOption[] = [
    {
      icon: "Crown",
      label: "Santa Escritura",
      action: () => navigation.navigate(Screens.Home, homePageInitParams),
      longAction: () => {
        showToast("Santa Escritura");
      },
      tag: "crown-outline",
    },
    {
      icon: "Music4",
      label: "Himnos",
      isIonicon: true,
      action: onSong,
    },
    user
      ? {
          icon: "NotebookText",
          label: "Notas",
          action: () =>
            navigation.navigate(Screens.Notes, { shouldRefresh: false }),
          color: theme.colors.notification,
        }
      : {
          icon: "Cloudy",
          label: "Sincronizar",
          action: () => navigation.navigate(Screens.Login),
        },
  ];

  const requestAccessHandlePresentModalPress = useCallback(
    (state: "doubible" | "timeline") => {
      setCurrentEmpty(state);
      requestAccessBottomSheetModalRef.current?.present();
    },
    []
  );

  const stateMessage = {
    doubible: {
      title: "¡Nueva función en desarrollo!",
      message:
        "Estamos trabajando en esta función para ayudarte a aprender más sobre la santa escritura de una manera interactiva. Muy pronto podrás acceder a nuevas herramientas y contenido.",
      subText: "Gracias por tu paciencia y apoyo.",
      email: "",
    },
    timeline: {
      title: "Línea de tiempo en desarrollo",
      message:
        "Estamos creando una línea de tiempo interactiva para explorar la historia de la santa escritura de manera clara y visual. Pronto podrás recorrer los eventos clave y profundizar en su contexto.",
      subText: "Gracias por tu paciencia y entusiasmo.",
      email: "",
    },
  };

  const studyToolItems: IDashboardOption[] = [
    {
      icon: "BookA",
      label: "Diccionarios",
      action: () =>
        navigation?.navigate(Screens.DictionarySearch, { word: "" }),
      color: "#ec899e",
    },
    {
      icon: "Sparkles",
      label: "Busqueda inteligente",
      isIonicon: true,
      action: () => navigation.navigate(Screens.AISearch),
      color: "#fedf75",
    },
    {
      icon: "Quote",
      label: "Cita",
      action: () => navigation.navigate(Screens.Quote),
      color: "#CDAA7D",
      isNew: isWithinTimeframe("1w", new Date("2025-06-05")).isActive,
    },
    {
      icon: "SwatchBook",
      label: "Concordancia",
      action: () => navigation.navigate(Screens.Concordance, {}),
      color: "#ffffff",
      longAction: () => {
        showToast("Concordancia");
      },
    },
    {
      icon: "NotebookText",
      label: "Notas",
      action: () =>
        navigation.navigate(Screens.Notes, { shouldRefresh: false }),
      color: theme.colors.notification,
    },
    {
      icon: "Star",
      label: "Favoritos",
      action: () => navigation.navigate(Screens.Favorite),
      color: "#fedf75",
      longAction: () => {
        showToast("Favoritos");
      },
    },
    {
      icon: "History",
      label: "Historial",
      action: () => navigation.navigate(Screens.History),
      color: "#a9a9a9",
      isNew: isWithinTimeframe("3d", new Date("2025-02-16")).isActive,
    },
    {
      icon: "Gamepad",
      label: "Quiz Bíblico",
      action: () => navigation.navigate(Screens.ChooseGame),
      color: "#75d0fe",
      isNew: isWithinTimeframe("3d", new Date("2025-02-04")).isActive,
    },
    {
      icon: "Brain",
      label: "Memorizar",
      action: () => navigation.navigate(Screens.MemorizeVerse),
      color: "#f1abab",
      isNew: isWithinTimeframe("1w", new Date("2025-02-04")).isActive,
    },
    {
      icon: "CalendarRange",
      label: "Linea de tiempo",
      action: () => navigation.navigate(Screens.Timeline),
      color: "#6de5cb",
      isNew: isWithinTimeframe("1w", new Date("2025-03-18")).isActive,
    },
    {
      icon: "TreeDeciduous",
      label: "DuoBible",
      // @ts-ignore
      action: () => requestAccessHandlePresentModalPress("doubible"),
      // action: () => navigation.navigate("learn", {}),
      color: "#4caf50",
      // color: "#75d0fe",
      isNew: isWithinTimeframe("1w", new Date("2025-03-04")).isActive,
    },
    {
      icon: "ChartArea",
      label: "Admin",
      // @ts-ignore
      action: () => navigation.navigate("admin", {}),
      color: "#75d0fe",
      disabled: !isAdmin,
    },
    {
      icon: "UserSearch",
      label: "Buscar \nPersonaje",
      isIonicon: true,
      action: () => navigation.navigate(Screens.Character),
      color: "#cec8ff",
    },
  ];

  const versionRef = useRef<BottomSheetModal>(null);
  const currentModalOpenRef = useRef<any>(null);
  const voiceBottomSheetModalRef = useRef<BottomSheetModal>(null);

  const voiceHandlePresentModalPress = useCallback(() => {
    voiceBottomSheetModalRef.current?.present();
    currentModalOpenRef.current = voiceBottomSheetModalRef.current;
  }, []);

  const versionHandlePresentModalPress = useCallback(() => {
    versionRef.current?.present();
    currentModalOpenRef.current = versionRef.current;
  }, []);

  const additionalResourceList: IAdditionalResourceList = {
    advancedSearch: [
      {
        icon: "LayoutGrid",
        label: "Lista de Libro",
        action: () => navigation.navigate(Screens.ChooseBook, {}),
        color: "#b76e5b",
      },
      {
        icon: "FileStack",
        label: "Versiones",
        action: versionHandlePresentModalPress,
        color: "#beeaff",
      },
      {
        icon: "AudioLines",
        label: "Selecciona \nUna Voz",
        action: voiceHandlePresentModalPress,
        color: "#5bb77b",
      },
    ],
    manager: [
      {
        icon: "MonitorDown",
        label: "Modulos",
        action: () => navigation.navigate(Screens.DownloadManager),
        color: "#2cc47d",
      },
      {
        icon: "Info",
        label: "Incorporación",
        action: () => navigation.navigate(Screens.Onboarding),
        color: "#beeaff",
      },
      {
        icon: "Settings",
        label: "Ajustes",
        isIonicon: true,
        action: () => navigation.navigate(Screens.Settings),
        color: "#84b75b",
      },
    ],
  };

  return (
    <StatusBarBackground>
      <ScrollView style={styles.container}>
        <ProfileCard user={user} />
        <DailyVerseTwo user={user} theme={theme} />
        <MainSection list={mainActionItems} theme={theme} />
        <StudyTools list={studyToolItems} theme={theme} />
        <AdditionalResources list={additionalResourceList} theme={theme} />

        <BottomModal shouldScroll startAT={2} ref={voiceBottomSheetModalRef}>
          <VoiceList theme={theme} />
        </BottomModal>

        <BottomModal shouldScroll startAT={1} ref={versionRef}>
          <VersionList {...{ currentBibleVersion, onSelect, theme }} />
        </BottomModal>
      </ScrollView>

      <BottomModal
        justOneSnap
        showIndicator
        justOneValue={["60%", "90%"]}
        startAT={0}
        ref={requestAccessBottomSheetModalRef}
      >
        <EmptyStateMessage
          info={stateMessage[currentEmpty]}
          onClose={() => requestAccessBottomSheetModalRef.current?.dismiss()}
        />
      </BottomModal>
    </StatusBarBackground>
  );
};

const getStyles = ({ colors }: TTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: 16,
    },
  });

export default SecondDashboard;
