import Animation from "@/components/Animation";
import BottomModal from "@/components/BottomModal";
import Icon from "@/components/Icon";
import ScreenWithAnimation from "@/components/ScreenWithAnimation";
import { Text, View } from "@/components/Themed";
import RequestAccess from "@/components/admin/RequestAccess";
import { PressableScale } from "@/components/animations/pressable-scale";
import {
  singleScreenHeader,
  SingleScreenHeaderProps,
} from "@/components/common/singleScreenHeader";
import lottieAssets from "@/constants/lottieAssets";
import { storedData$ } from "@/context/LocalstoreContext";
import { useNetwork } from "@/context/NetworkProvider";
import { useMyTheme } from "@/context/ThemeContext";
import { pb } from "@/globalConfig";
import useRealtimeCollection from "@/hooks/useRealtimeCollection";
import { authState$ } from "@/state/authState";
import { Collections, RequestData, Screens, TTheme } from "@/types";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { use$ } from "@legendapp/state/react";
import { Stack, useNavigation } from "expo-router";
import { RecordModel } from "pocketbase";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ScrollView,
  StyleSheet
} from "react-native";
import { useAlert } from "@/context/AlertContext";

interface BibleVerse {
  verse: string;
  reference: string;
}
enum AccessStatus {
  Pending = "pending",
  Approved = "approved",
  Rejected = "rejected",
}

const getRandomNumberFromLength = (length: number): number =>
  Math.floor(Math.random() * length);

const BIBLE_VERSES: readonly BibleVerse[] = [
  {
    verse: "Cantad alegres a Dios, \nhabitantes de toda la tierra.",
    reference: "Salmos 100:1",
  },
  {
    verse: "Cantad al Señor cántico nuevo; \ncantad al Señor, toda la tierra.",
    reference: "Salmos 96:1",
  },
  {
    verse: "Cantaré eternamente las misericordias del Señor.",
    reference: "Salmos 89:1",
  },
  {
    verse: "Cantad a Dios, cantad; \ncantad a nuestro Rey, cantad.",
    reference: "Salmos 47:6",
  },
];

interface HymnOptionItem {
  icon: keyof typeof Icon.name;
  label: string;
  action: () => void;
  animation: any;
  isLocked: boolean;
}

interface HymnOptionProps {
  item: HymnOptionItem;
  onRequestAccess?: () => void;
  hasRequestAccess: boolean;
  statusColor: string;
}

const HymnOption: React.FC<HymnOptionProps> = ({
  item,
  onRequestAccess,
  hasRequestAccess,
  statusColor,
}) => {
  const { theme } = useMyTheme();
  const styles = getStyles(theme);

  const handlePress = () => {
    if (!item.isLocked) {
      item.action();
    }
  };

  return (
    <PressableScale
      style={[styles.card]}
      onPress={item.isLocked ? onRequestAccess : handlePress}
      disabled={item.isLocked && !onRequestAccess}
    >
      {item.isLocked && (
        <View style={[styles.lockCard, { borderColor: statusColor }]}>
          <Icon
            name={hasRequestAccess ? "Clock" : "Lock"}
            color={statusColor}
            size={35}
          />
          <Text
            style={[
              styles.lockTitle,
              hasRequestAccess && {
                backgroundColor: statusColor + 99,
                textAlign: "center",
              },
            ]}
          >
            {hasRequestAccess ? "Solicitud en proceso" : "Solicitar acceso"}
          </Text>
        </View>
      )}
      <Animation
        backgroundColor={"transparent"}
        source={item.animation}
        loop={false}
        size={{ width: 120, height: 120 }}
      />
      <Text style={styles.cardLabel}>{item.label}</Text>
    </PressableScale>
  );
};

const HymnScreen = () => {
  const { alertWarning, alertInfo } = useAlert();
  const { theme } = useMyTheme();
  const styles = getStyles(theme);
  const navigation = useNavigation();
  const netInfo = useNetwork();
  const { isConnected } = netInfo;
  const requestAccessBottomSheetModalRef = useRef<BottomSheetModal>(null);

  const isAlegresNuevasUnlocked = use$(() =>
    storedData$.isAlegresNuevasUnlocked.get()
  );
  const hasRequestAccess = use$(() => storedData$.hasRequestAccess.get());
  const [selectedVerse] = useState(
    () => BIBLE_VERSES[getRandomNumberFromLength(BIBLE_VERSES.length)]
  );

  const assets = [...Object.values(lottieAssets)];
  const pickARandomAsset = assets[getRandomNumberFromLength(assets.length)];
  const statusColor = hasRequestAccess ? "#efbf43" : "#FFFFFF";

  const {
    data: request,
    loading: isFetchingRequests,
    refetch,
  } = useRealtimeCollection<RequestData & RecordModel, true>({
    collection: Collections.AccessRequest,
    options: {
      expand: "user",
    },
    byUser: true,
  });

  useEffect(() => {
    if (!request?.id || isFetchingRequests || !isConnected) return;
    if (request.status === "approved") {
      storedData$.isAlegresNuevasUnlocked.set(true);
      storedData$.hasRequestAccess.set(true);
    } else if (
      [AccessStatus.Pending, AccessStatus.Rejected].includes(
        request.status as AccessStatus
      )
    ) {
      if (isConnected) {
        storedData$.isAlegresNuevasUnlocked.set(false);
      }
    }
  }, [request, isFetchingRequests, isConnected]);

  const handleRequestAccessPress = useCallback(() => {
    if (!isConnected) {
      alertInfo("Shalom", "Por favor, conecta a internet para solicitar acceso");
      return;
    }

    requestAccessBottomSheetModalRef.current?.present();
  }, [isConnected, hasRequestAccess]);

  const navigateToSongs = useCallback(
    (isAlegres: boolean) => {
      navigation.navigate(Screens.Song, { isAlegres });
    },
    [navigation]
  );

  const options = [
    {
      icon: "Music" as keyof typeof Icon.name,
      label: "Himnario de Victoria",
      action: () => navigateToSongs(false),
      animation: assets[0],
      isLocked: false,
    },
    {
      icon: "Music2" as keyof typeof Icon.name,
      label: "Mensajero de Alegres Nuevas",
      action: () => navigateToSongs(true),
      animation: assets[1],
      isLocked: !isAlegresNuevasUnlocked,
    },
  ];

  const requestAccess = async (name: string) => {
    if (!isConnected) {
      alertWarning("Sin conexión", "No hay conexión a Internet para solicitar accesso.");
      return;
    }
    const user = authState$.user.get();
    const userId = user?.id || pb.authStore.record?.id;
    try {
      if (!pb.authStore.isValid) throw new Error("Not authenticated");

      const existing = await pb
        .collection(Collections.AccessRequest)
        .getFirstListItem(`user.id="${userId}" && status="pending"`);

      refetch();
    } catch (err: any) {
      if (err.status !== 404) {
        console.log("--------errr-----------", err.message || "Unknown error");
        return;
      }

      try {
        const created = await pb.collection(Collections.AccessRequest).create({
          user: userId,
          name: name || "",
          status: "pending",
        });

        refetch();
      } catch (createErr: any) {
        console.log(createErr.message || "Failed to request access");
      } finally {
      }
    }
  };

  const screenOptions = useMemo(() => {
    return {
      theme,
      title: "Himnarios",
      titleIcon: "Music",
      headerRightProps: {
        headerRightIcon: "Trash2",
        headerRightIconColor: "red",
        onPress: () => console.log(),
        disabled: true,
        style: { opacity: 0 },
      },
    } as SingleScreenHeaderProps;
  }, []);

  return (
    <>
      <Stack.Screen options={{ ...singleScreenHeader(screenOptions) }} />
      <ScreenWithAnimation
        title="Himnarios"
        animationSource={pickARandomAsset}
        speed={2.5}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.imageContainer}>
            <View style={styles.quoteContainer}>
              <Text style={styles.verse}>{selectedVerse.verse}</Text>
              <Text style={styles.reference}>{selectedVerse.reference}</Text>
            </View>
            <Animation
              backgroundColor={"transparent"}
              source={pickARandomAsset}
              loop
              size={{ width: 220, height: 220 }}
              style={{ backgroundColor: "transparent" }}
            />
          </View>
          <View style={[styles.optionContainer]}>
            {options.map((item) => {
              return (
                <HymnOption
                  item={item}
                  onRequestAccess={handleRequestAccessPress}
                  hasRequestAccess={hasRequestAccess}
                  statusColor={statusColor}
                  key={item.label}
                />
              );
            })}
          </View>
          {!isConnected && (
            <View style={styles.offlineNotice}>
              <Icon name="WifiOff" size={16} color={theme.colors.text} />
              <Text style={styles.offlineText}>
                Sin conexión. Algunas funciones pueden estar limitadas.
              </Text>
            </View>
          )}
        </ScrollView>
        <BottomModal
          justOneSnap
          showIndicator
          justOneValue={["65%", "90%"]}
          startAT={0}
          ref={requestAccessBottomSheetModalRef}
        >
          <RequestAccess
            onRequest={requestAccess as any}
            onClose={() => requestAccessBottomSheetModalRef.current?.dismiss()}
            isPending={isFetchingRequests}
          />
        </BottomModal>
      </ScreenWithAnimation>
    </>
  );
};

const getStyles = ({ colors }: TTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    contentContainer: {
      paddingTop: 50,
      paddingBottom: 30,
    },
    imageContainer: {
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 15,
      padding: 5,
      backgroundColor: "transparent",
      marginBottom: 20,
    },
    quoteContainer: {
      alignItems: "center",
      paddingHorizontal: 20,
      marginBottom: 10,
      backgroundColor: "transparent",
    },
    verse: {
      fontSize: 20,
      color: colors.text,
      textAlign: "center",
      fontStyle: "italic",
      lineHeight: 28,
    },
    reference: {
      fontSize: 18,
      color: colors.notification,
      fontWeight: "bold",
      marginTop: 5,
    },
    optionContainer: {
      flex: 1,
      flexDirection: "row",
      justifyContent: "space-between",
      width: "100%",
      backgroundColor: "transparent",
      gap: 10,
      paddingHorizontal: 10,
      // minHeight: 390,
    },
    listContainer: {
      padding: 15,
      paddingBottom: 30,
    },
    card: {
      flex: 1,
      width: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      padding: 10,
      paddingHorizontal: 18,
      borderRadius: 15,
      minHeight: 220,
      backgroundColor: "white",
      overflow: "hidden",
    },
    lockCard: {
      position: "absolute",
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      backgroundColor: colors.background + "DD",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 99,
      borderRadius: 15,
      borderColor: "white",
      borderWidth: 2,
    },
    pressed: {
      opacity: 0.8,
      backgroundColor: colors.background + "E6",
      borderWidth: 2,
      zIndex: 99,
    },
    lockTitle: {
      fontSize: 18,
      color: "white",
      marginVertical: 8,
      backgroundColor: colors.notification + 99,
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 8,
      fontWeight: "bold",
      letterSpacing: 0.5,
      textAlign: "center",
    },
    cardLabel: {
      textAlign: "center",
      color: colors.border,
      fontWeight: "bold",
      fontSize: 18,
      marginTop: 5,
      letterSpacing: 0.25,
    },
    loadingContainer: {
      alignItems: "center",
      justifyContent: "center",
      padding: 30,
      height: 200,
    },
    loadingText: {
      marginTop: 15,
      fontSize: 16,
      color: colors.text,
    },
    offlineNotice: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.background + "AA",
      padding: 10,
      borderRadius: 8,
      marginHorizontal: 20,
      marginTop: 10,
    },
    offlineText: {
      fontSize: 14,
      color: colors.text,
      marginLeft: 6,
    },
  });

export default HymnScreen;
