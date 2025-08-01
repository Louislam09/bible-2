import Animation from "@/components/Animation";
import BottomModal from "@/components/BottomModal";
import Icon from "@/components/Icon";
import ScreenWithAnimation from "@/components/ScreenWithAnimation";
import { Text, View } from "@/components/Themed";
import RequestAccess from "@/components/admin/RequestAccess";
import { singleScreenHeader } from "@/components/common/singleScreenHeader";
import lottieAssets from "@/constants/lottieAssets";
import { storedData$ } from "@/context/LocalstoreContext";
import { pb } from "@/globalConfig";
import useInternetConnection from "@/hooks/useInternetConnection";
import useRealtimeCollection from "@/hooks/useRealtimeCollection";
import { useNotificationService } from "@/services/notificationServices";
import { authState$ } from "@/state/authState";
import { Collections, RequestData, Screens, TTheme } from "@/types";
import checkConnection from "@/utils/checkConnection";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { use$ } from "@legendapp/state/react";
import { useTheme } from "@react-navigation/native";
import { FlashList } from "@shopify/flash-list";
import { Stack, useNavigation } from "expo-router";
import { RecordModel } from "pocketbase";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";

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
  onPress: () => void;
  isLocked: boolean;
  onRequestAccess?: () => void;
  hasRequestAccess: boolean;
  statusColor: string;
}

const HymnOption: React.FC<HymnOptionProps> = ({
  item,
  onPress,
  isLocked,
  onRequestAccess,
  hasRequestAccess,
  statusColor,
}) => {
  const theme = useTheme();
  const styles = getStyles(theme);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      friction: 5,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    if (!isLocked) {
      onPress();
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      disabled={isLocked && !onRequestAccess}
      accessibilityLabel={`${item.label}${isLocked ? " (Bloqueado)" : ""}`}
      accessibilityRole="button"
      accessibilityHint={
        isLocked ? "Pulse para solicitar acceso" : "Pulse para abrir himnario"
      }
    >
      <Animated.View
        style={[styles.card, { transform: [{ scale: scaleAnim }] }]}
      >
        {isLocked && (
          <Pressable
            style={({ pressed }) => [
              styles.lockCard,
              pressed && styles.pressed,
              { borderColor: statusColor },
            ]}
            onPress={onRequestAccess}
            accessibilityLabel={
              hasRequestAccess ? "Solicitud en proceso" : "Solicitar acceso"
            }
            accessibilityRole="button"
          >
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
          </Pressable>
        )}
        <Animation
          backgroundColor={"transparent"}
          source={item.animation}
          loop
          size={{ width: 120, height: 120 }}
        />
        <Text style={styles.cardLabel}>{item.label}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

const BibleQuote = ({ verse, reference }: BibleVerse) => {
  const theme = useTheme();
  const styles = getStyles(theme);

  return (
    <View style={styles.quoteContainer}>
      <Text style={styles.verse}>{verse}</Text>
      <Text style={styles.reference}>{reference}</Text>
    </View>
  );
};

const HymnScreen = () => {
  const theme = useTheme();
  const styles = getStyles(theme);
  const navigation = useNavigation();
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const { isConnected } = useInternetConnection();
  const requestAccessBottomSheetModalRef = useRef<BottomSheetModal>(null);
  const { sendPushNotificationToUser } = useNotificationService();

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
    if (!request?.id || isFetchingRequests) return;
    if (request.status === "approved") {
      storedData$.isAlegresNuevasUnlocked.set(true);
      storedData$.hasRequestAccess.set(true);
    } else if (
      [AccessStatus.Pending, AccessStatus.Rejected].includes(
        request.status as AccessStatus
      )
    ) {
      storedData$.isAlegresNuevasUnlocked.set(false);
    }
  }, [request, isFetchingRequests]);

  const handleRequestAccessPress = useCallback(() => {
    if (!isConnected) {
      Alert.alert(
        "Shalom",
        "Por favor, conecta a internet para solicitar acceso",
        [{ text: "Entendido", style: "default" }]
      );
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

  const renderItem = useCallback(
    ({ item }: { item: HymnOptionItem }) => (
      <HymnOption
        item={item}
        onPress={item.action}
        isLocked={item.isLocked}
        onRequestAccess={handleRequestAccessPress}
        hasRequestAccess={hasRequestAccess}
        statusColor={statusColor}
      />
    ),
    [hasRequestAccess, statusColor, handleRequestAccessPress]
  );

  const requestAccess = async (name: string) => {
    const isConnected = await checkConnection();
    if (!isConnected) {
      Alert.alert(
        "Sin conexión",
        "No hay conexión a Internet para solicitar accesso."
      );
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

  return (
    <ScreenWithAnimation
      title="Himnarios"
      animationSource={pickARandomAsset}
      speed={2}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Stack.Screen
          options={{
            ...singleScreenHeader({
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
            }),
          }}
        />

        <View style={styles.imageContainer}>
          <BibleQuote
            verse={selectedVerse.verse}
            reference={selectedVerse.reference}
          />

          <Animation
            backgroundColor={"transparent"}
            source={pickARandomAsset}
            loop
            size={{ width: 220, height: 220 }}
            style={{ backgroundColor: "transparent" }}
          />
        </View>

        <View style={[styles.optionContainer, { width: SCREEN_WIDTH }]}>
          <FlashList
            contentContainerStyle={styles.listContainer}
            data={options}
            keyExtractor={(item) => item.label}
            renderItem={renderItem}
            estimatedItemSize={200}
            numColumns={2}
            showsVerticalScrollIndicator={false}
          />
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
  );
};

const getStyles = ({ colors }: TTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
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
      width: "100%",
      backgroundColor: "transparent",
      minHeight: 390,
    },
    listContainer: {
      padding: 15,
      paddingBottom: 30,
    },
    card: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      padding: 10,
      paddingHorizontal: 18,
      borderRadius: 15,
      flex: 1,
      minHeight: 220,
      margin: 8,
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
