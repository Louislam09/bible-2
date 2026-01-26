import { storedData$ } from "@/context/LocalstoreContext";
import { useMyTheme } from "@/context/ThemeContext";
import { POCKETBASE_URL } from "@/globalConfig";
import { useHaptics } from "@/hooks/useHaptics";
import { authState$ } from "@/state/authState";
import { modalState$ } from "@/state/modalState";
import { pbUser, Screens, TTheme } from "@/types";
import { observer, use$ } from "@legendapp/state/react";
import { Image } from "expo-image";
import { useNavigation } from "expo-router";
import { User } from "lucide-react-native";
import React, { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useAlert } from "@/context/AlertContext";
import Icon from "./Icon";
import CloudSyncPopup from "./SyncPopup";
import { Text, View } from "./Themed";
import Tooltip from "./Tooltip";

interface UserProfileProps {
  user: pbUser | null;
}

const UserProfile: React.FC<UserProfileProps> = ({ user }) => {
  const { confirm } = useAlert();
  const navigation = useNavigation();
  const haptics = useHaptics();
  const { theme } = useMyTheme();
  const styles = getStyles(theme);
  const nameInfo = user?.name.split(" ") || [];
  const firstName = nameInfo?.[0] || "";
  const userRef = useRef(null);

  // With observer(), we can directly access observables without use$()
  const isAuth = use$(() => authState$.isAuthenticated.get());
  const isLoading = use$(() => authState$.isLoading.get());

  const avatarUrl = user
    ? `${POCKETBASE_URL}/api/files/${user.collectionId}/${user.id}/${user.avatar}`
    : "";
  const defaultAvatar = user
    ? `https://robohash.org/set_set10/bgset_bg1/${user.id}?size=200x200`
    : "";

  const onOpenUser = useCallback(async () => {
    await haptics.impact.light();
    setIsUserTooltipVisible(!isUserTooltipVisible);
    // modalState$.openUserTooltip();
  }, []);

  const onSearch = () => {
    navigation.navigate(Screens.Search, {});
    haptics.impact.light();
  };

  const onLogout = () => {
    confirm(
      "Cerrar Sesión",
      "¿Estás seguro de que deseas cerrar tu sesión?",
      () => authState$.logout()
    );
  };

  const tooltipInfo = {
    login: {
      title: "Bienvenido",
      description:
        "Por favor, inicia sesión para acceder a todas las funciones.",
      buttonText: "Iniciar Sesión",
      action: () => {
        setIsUserTooltipVisible(false);
        setTimeout(() => {
          navigation.navigate(Screens.Login);
        }, 500);
      },
    },
    logout: {
      title: "¿Cerrar sesión?",
      description: "¿Estás seguro de que deseas cerrar tu sesión?",
      buttonText: "Cerrar Sesión",
      action: async () => {
        setIsUserTooltipVisible(false);
        setTimeout(() => {
          onLogout();
        }, 500);
      },
    },
  };

  const [syncModalVisible, setSyncModalVisible] = useState<boolean>(false);

  const tooltipData = tooltipInfo[isAuth ? "logout" : "login"];

  const onSync = () => {
    if (!storedData$.user.get()) {
      haptics.impact.light();
      setIsUserTooltipVisible(false);
      setTimeout(() => {
        navigation.navigate(Screens.Login);
      }, 500);
      return;
    }

    setIsUserTooltipVisible(false);
    setSyncModalVisible(true);
  };
  const [isUserTooltipVisible, setIsUserTooltipVisible] = useState(false);

  return (
    <View style={styles.userInfoContainer}>
      <Tooltip
        offset={10}
        target={
          <TouchableOpacity
            ref={userRef}
            onPress={() => onOpenUser()}
          >
            {user ? (
              <View style={styles.userHeader}>
                <View style={styles.avatarContainer}>
                  <Image
                    source={{
                      uri: user.avatar ? avatarUrl : defaultAvatar,
                    }}
                    style={styles.avatar}
                    contentFit="cover"
                  />
                </View>
                <View style={{ display: "flex", backgroundColor: "transparent" }}>
                  {isLoading ? (
                    <ActivityIndicator color={theme.colors.text} />
                  ) : (
                    <Text style={styles.userName}>{`Shalom ${firstName}!`}</Text>
                  )}
                </View>
              </View>
            ) : (
              <View style={styles.userHeader}>
                <View style={styles.avatarContainer}>
                  <User color={theme.colors.text} size={30} />
                </View>
                <View style={{ display: "flex", backgroundColor: "transparent" }}>
                  {isLoading ? (
                    <ActivityIndicator color={theme.colors.text} />
                  ) : (
                    <Text style={styles.userName}>{`Bienvenido!`}</Text>
                  )}
                </View>
              </View>
            )}
          </TouchableOpacity>
        }
        isVisible={isUserTooltipVisible}
        onClose={() => setIsUserTooltipVisible(false)}
      >
        <View
          style={{
            padding: 16,
            borderRadius: 12,
            backgroundColor: "transparent",
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontWeight: "bold",
              marginBottom: 12,
              color: theme.colors.text,
              textAlign: "center",
            }}
          >
            {tooltipData.title}
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: theme.colors.text,
              marginBottom: 16,
              textAlign: "center",
            }}
          >
            {tooltipData.description}
          </Text>

          <TouchableOpacity
            onPress={() => onSync()}
            style={{
              paddingVertical: 12,
              borderRadius: 8,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: theme.colors.notification,
              marginVertical: 10,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "bold",
                color: "white",
              }}
            >
              {"Sincronizar con la nube"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => tooltipData.action()}
            style={{
              paddingVertical: 12,
              borderRadius: 8,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: theme.colors.text + 80,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "bold",
                color: "white",
              }}
            >
              {tooltipData.buttonText}
            </Text>
          </TouchableOpacity>
        </View>
      </Tooltip>

      <TouchableOpacity activeOpacity={0.8} onPress={onSearch}>
        <Icon
          name="Search"
          color={theme.colors.text}
          size={30}
        />
      </TouchableOpacity>

      <CloudSyncPopup
        visible={syncModalVisible}
        onClose={() => setSyncModalVisible(false)}
        lastSyncTime={""}
      />
    </View>
  );
}

const getStyles = ({ colors }: TTheme) =>
  StyleSheet.create({
    userInfoContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 8,
      backgroundColor: "transparent",
      paddingVertical: 5,
      paddingHorizontal: 10,
    },
    userHeader: {
      flexDirection: "row",
      alignItems: "center",
    },
    avatarContainer: {
      width: 50,
      height: 50,
      borderRadius: 32,
      backgroundColor: colors.background,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 16,
      borderWidth: 2,
      borderColor: colors.text + 30,
      flexDirection: "row",
    },
    avatar: {
      width: "100%",
      height: "100%",
      borderRadius: 32,
    },
    userName: {
      fontSize: 20,
      fontWeight: "bold",
      color: colors.text,
      backgroundColor: "transparent",
    },
    userEmail: {
      fontSize: 14,
      color: "#9ca3af", // text-gray-400
    },
  });

export default UserProfile;
