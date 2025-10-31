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
// import * as Notifications from "expo-notifications";
import { useMyTheme } from "@/context/ThemeContext";
import { useNavigation } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Linking,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { IDashboardOption } from "../../app/(dashboard)";
import BottomModal from "../BottomModal";
import EmptyStateMessage from "../EmptyStateMessage";
import VersionList from "../home/header/VersionList";
import { Text, View } from "../Themed";
import ProfileCard from "../UserProfile";
import VoiceList from "../VoiceList";
import BuyMeACoffeeButton from "./BuyMeACoffe";
import { Share } from "react-native";
import { URLS } from "@/constants/appConfig";
import { UpdateService } from "@/services/updateService";

export interface IAdditionalResourceList {
  advancedSearch: IDashboardOption[];
  manager: IDashboardOption[];
}

const NewDashboard = () => {
  const navigation = useNavigation();
  const { theme } = useMyTheme();
  const styles = getStyles(theme);
  const [currentEmpty, setCurrentEmpty] = useState<"doubible" | "timeline">(
    "doubible"
  );
  const [isRefreshing, setIsRefreshing] = useState(false);

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
    useDomComponent,
  } = storedData;
  const user = use$(() => storedData$.user.get()) || null;
  const isAdmin = _isAdmin || user?.isAdmin;

  const onSelect = (version: string) => {
    bibleState$.handleStrongWord({ text: "", code: "" });
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
      longAction: () => {
        // @ts-ignore
        navigation.navigate("example");
      },
    },
    user
      ? {
          icon: "NotebookText",
          label: "Notas",
          action: () =>
            navigation.navigate(Screens.Notes, { shouldRefresh: false }),
          color: theme.colors?.notification || "#78b0a4",
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
      icon: "Image",
      label: "Cita Image",
      action: () => navigation?.navigate(Screens.QuoteMaker),
      color: "#ec899e",
      isNew: isWithinTimeframe("3d", new Date("2025-10-15")).isActive,
    },
    {
      icon: "BookA",
      label: "Diccionarios",
      action: () =>
        navigation?.navigate(Screens.DictionarySearch, { word: "" }),
      color: "#ec899e",
    },
    {
      icon: "MessageSquare",
      label: "Comentarios",
      action: () => navigation?.navigate(Screens.Commentary),
      color: "#87c4ff",
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
      color: theme.colors?.notification || "#78b0a4",
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
    // {
    //   icon: "TreeDeciduous",
    //   label: "DuoBible",
    //   // @ts-ignore
    //   action: () => requestAccessHandlePresentModalPress("doubible"),
    //   // action: () => navigation.navigate("learn", {}),
    //   color: "#4caf50",
    //   // color: "#75d0fe",
    //   isNew: isWithinTimeframe("1w", new Date("2025-03-04")).isActive,
    // },
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

  const shareApp = async () => {
    try {
      await Share.share({
        message:
          "📖 Descarga esta increíble app de la Biblia:\n\n" + URLS.APP_URL,
        title: "Compartir la Aplicación",
      });
    } catch (error) {
      console.error("Error al compartir:", error);
    }
  };

  const additionalResourceList: IAdditionalResourceList = {
    advancedSearch: [
      {
        icon: "LayoutGrid",
        label: "Lista de Libro",
        action: () =>
          navigation.navigate(
            useDomComponent ? Screens.ChooseReferenceDom : Screens.ChooseBook,
            {}
          ),
        color: "#b76e5b",
      },
      {
        icon: "FileStack",
        label: "Versiones",
        action: versionHandlePresentModalPress,
        color: "#beeaff",
      },
      {
        icon: "Share2",
        label: "Compartir",
        action: shareApp,
        color: "#5bb77b",
      },
      // {
      //   icon: "AudioLines",
      //   label: "Selecciona \nUna Voz",
      //   action: voiceHandlePresentModalPress,
      //   color: "#5bb77b",
      // },
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

  const handleBuyMeACoffee = () => {
    Linking.openURL("https://buymeacoffee.com/santabibliarv60");
  };

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await UpdateService.handleUpdateFlow();
    } catch (error) {
      console.error("Error during refresh:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  return (
    <StatusBarBackground>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors?.primary || "#0c3e3d"}
            title="Buscando actualizaciones..."
            titleColor={theme.colors?.text || "#000"}
          />
        }
      >
        <ProfileCard user={user} />
        <DailyVerseTwo user={user} theme={theme} />
        <MainSection list={mainActionItems} theme={theme} />
        <StudyTools list={studyToolItems} theme={theme} />
        <AdditionalResources list={additionalResourceList} theme={theme} />

        {/* BUY ME A COFFE */}
        <BuyMeACoffeeButton />
        {/* <TouchableOpacity
          onPress={handleBuyMeACoffee}
          style={{
            backgroundColor: "#FFDD00",
            padding: 12,
            borderRadius: 8,
            alignItems: "center",
            marginVertical: 16,
          }}
        >
          <Text style={{ color: "#000", fontWeight: "bold" }}>
            Buy Me a Coffee
          </Text>
        </TouchableOpacity> */}

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

export default NewDashboard;
