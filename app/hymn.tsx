import { useTheme } from "@react-navigation/native";
import { FlashList } from "@shopify/flash-list";
import Animation from "@/components/Animation";
import Icon, { IconProps } from "@/components/Icon";
import { Text, View } from "@/components/Themed";
import { Stack, useNavigation } from "expo-router";
import React, { useCallback, useEffect, useRef } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
  useWindowDimensions,
} from "react-native";
import { Screens, TTheme } from "@/types";
import lottieAssets from "@/constants/lottieAssets";
import ScreenWithAnimation from "@/components/ScreenWithAnimation";
import { singleScreenHeader } from "@/components/common/singleScreenHeader";
import BottomModal from "@/components/BottomModal";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import RequestAccess from "@/components/admin/RequestAccess";
import { use$ } from "@legendapp/state/react";
import { storedData$ } from "@/context/LocalstoreContext";
import useInternetConnection from "@/hooks/useInternetConnection";
import { useCheckStatus } from "@/services/queryService";

type IHymnOption = {
  icon: IconProps["name"];
  label: string;
  action: () => void;
  disabled?: boolean;
  isIonicon?: boolean;
  tag?: string;
  isLocked?: boolean;
};

const getRandomNumberFromLength = (length: number) =>
  Math.floor(Math.random() * length);

const HymnScreen = () => {
  const theme = useTheme();
  const styles = getStyles(theme);
  const assets = [...Object.values(lottieAssets)];
  const pickARandomAsset = assets[getRandomNumberFromLength(assets.length)];
  const navigation = useNavigation();
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const isConnected = useInternetConnection();
  const { mutate: checkStatus, isPending: isChecking } = useCheckStatus();
  const requestAccessBottomSheetModalRef = useRef<BottomSheetModal>(null);
  const isAlegresNuevasUnlocked = use$(() => storedData$.isAlegresNuevasUnlocked.get());
  const hasRequestAccess = use$(() => storedData$.hasRequestAccess.get());

  const statusColor = hasRequestAccess ? '#efbf43' : '#FFFFFF';

  useEffect(() => {
    if(isAlegresNuevasUnlocked || !isConnected) return;
    checkStatus(storedData$.userData.get()?.email || '');
  }, [ isAlegresNuevasUnlocked, isConnected])

  const voiceHandlePresentModalPress = useCallback(() => {
    if(!isConnected) {
      Alert.alert('Shalom', 'Por favor, conecta a internet para solicitar acceso');
      return
    }
    requestAccessBottomSheetModalRef.current?.present();
  }, [isConnected, hasRequestAccess]);

  const options: IHymnOption[] = [
    {
      icon: "Music",
      label: "Himnario de Victoria",
      action: () =>
        navigation.navigate(Screens.Song, {
          isAlegres: false,
        }),
    },
    {
      icon: "Music2",
      label: "Mensajero de Alegres Nuevas",
      action: () => navigation.navigate(Screens.Song, { isAlegres: true }),
      isLocked: !isAlegresNuevasUnlocked
    },
  ];

  const LockCard = () => {
    return (
      <Pressable
        style={({ pressed }) => [styles.lockCard, pressed && styles.pressed, { borderColor: statusColor }]}
        onPress={voiceHandlePresentModalPress}
      >
        <Icon name={hasRequestAccess ? 'Clock' : "Lock"} color={statusColor} size={35} />
        <Text style={[styles.lockTitle, hasRequestAccess && { backgroundColor: statusColor + 99, textAlign: 'center' }]}>{hasRequestAccess ? 'Solicitud en proceso' : 'Solicitar acceso'}</Text>
      </Pressable>
    )
  }

  const renderItem = ({
    item,
    index,
  }: {
    item: IHymnOption;
    index: number;
  }) => (
    <TouchableWithoutFeedback
      onPress={item.isLocked ? () => { } : item.action}
      style={[
        {
          padding: 0,
          flex: 1,
          display: "flex",
          width: SCREEN_WIDTH / 3,
          alignItems: "center",
          justifyContent: "center",
          position: 'relative'
        },
      ]}
      disabled={item.disabled}
    >
      <View style={[styles.card, item.disabled && { backgroundColor: "#ddd" }]}>
        {item.isLocked && <LockCard />}
        <Animation
          style={{ borderColor: "red", borderWidth: 1 }}
          backgroundColor={"transparent"}
          source={assets[index]}
          loop
          size={{ width: 120, height: 120 }}
        />
        <Text style={[styles.cardLabel]}>{item.label}</Text>
      </View>
    </TouchableWithoutFeedback>
  );

  return (
    <ScreenWithAnimation
      title="Himnarios"
      animationSource={pickARandomAsset}
      speed={2}
    >
      <ScrollView style={styles.container}>
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
          <Text style={styles.subtitle}>
            Cantad alegres a Dios, {"\n"} habitantes de toda la tierra.{"\n"}{" "}
            Salmos 100:1{" "}
          </Text>
          <Animation
            backgroundColor={"transparent"}
            source={pickARandomAsset}
            loop
            size={{ width: 220, height: 220 }}
            style={{ backgrund: "transparent" }}
          />
        </View>
        <View style={[styles.optionContainer, { width: SCREEN_WIDTH }]}>
          <FlashList
            contentContainerStyle={{ padding: 15 }}
            data={options}
            keyExtractor={(item) => item.label}
            renderItem={renderItem}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            estimatedItemSize={5}
            numColumns={2}
          />
        </View>
      </ScrollView>

      <BottomModal
        justOneSnap
        showIndicator
        justOneValue={["60%", "90%"]}
        startAT={0}
        ref={requestAccessBottomSheetModalRef}
      >
        <RequestAccess onClose={() => requestAccessBottomSheetModalRef.current?.dismiss()} />
      </BottomModal>
    </ScreenWithAnimation>
  );
};

const getStyles = ({ colors }: TTheme) =>
  StyleSheet.create({
    container: {
      paddingTop: 50,
      flex: 1,
    },
    lockCard: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      backgroundColor: colors.background + 99,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 99,
      borderRadius: 15,
      borderColor: 'white',
      borderWidth: 2,
    },
    pressed: {
      opacity: 0.8,
      backgroundColor: colors.background + 99,
      borderRadius: 15,
      borderColor: 'white',
      borderWidth: 2,
      zIndex: 99,
    },
    lockTitle: {
      fontSize: 22,
      color: 'white',
      marginVertical: 4,
      backgroundColor: colors.notification + 99,
      paddingHorizontal: 4,
      borderRadius: 4,
      fontWeight: 'bold',
    },
    imageContainer: {
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 15,
      padding: 5,
      backgroundColor: "transparent",
      marginBottom: 20,
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      color: colors.notification,
      marginTop: 10,
    },
    optionContainer: {
      flex: 1,
      width: "100%",
      backgroundColor: "transparent",
      minHeight: 390,
    },
    card: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      padding: 10,
      borderRadius: 15,
      elevation: 5,
      flex: 1,
      minHeight: 200,
      margin: 5,
      backgroundColor: "white",
    },
    separator: {
      margin: 10,
    },
    cardLabel: {
      textAlign: "center",
      color: colors.border,
      fontWeight: "bold",
      fontSize: 18,
    },
    cardIcon: {
      color: colors.notification,
      fontSize: 40,
    },
    text: {
      color: "white",
    },
    subtitle: {
      fontSize: 20,
      color: colors.text,
      textAlign: "center",
    },
  });

export default HymnScreen;
