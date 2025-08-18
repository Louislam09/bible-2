import { storedData$ } from "@/context/LocalstoreContext";
import { useMyTheme } from "@/context/ThemeContext";
import { POCKETBASE_URL } from "@/globalConfig";
import { authState$ } from "@/state/authState";
import { pbUser, Screens, TTheme } from "@/types";
import { use$ } from "@legendapp/state/react";
import { useNavigation } from "expo-router";
import { User } from "lucide-react-native";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import Icon from "./Icon";
import CloudSyncPopup from "./SyncPopup";
import { Text, View } from "./Themed";
import Tooltip from "./Tooltip";

interface ProfileCardProps {
  user: pbUser | null;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ user }) => {
  const nameInfo = user?.name.split(" ") || [];
  const firstName = nameInfo[0];
  const { theme } = useMyTheme();
  const styles = getStyles(theme);
  const navigation = useNavigation();
  const userRef = useRef(null);
  const [openUser, setOpenUser] = useState(false);
  const isAuth = authState$.isAuthenticated.get();
  const isLoading = use$(() => authState$.isLoading.get());
  const avatarUrl = user
    ? `${POCKETBASE_URL}/api/files/${user.collectionId}/${user.id}/${user.avatar}`
    : "";
  const defaultAvatar = user
    ? `https://robohash.org/set_set10/bgset_bg1/${user.id}?size=200x200`
    : "";

  const searchIcon = {
    icon: "Search",
    label: "Buscador",
    action: () => navigation.navigate(Screens.Search, {}),
  };

  const onLogout = () => {
    Alert.alert(
      "Cerrar Sesión",
      "¿Estás seguro de que deseas cerrar tu sesión?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Cerrar Sesión",
          onPress: () => authState$.logout().then(console.log),
        },
      ]
    );
  };

  const tooltipInfo = {
    login: {
      title: "Bienvenido",
      description:
        "Por favor, inicia sesión para acceder a todas las funciones.",
      buttonText: "Iniciar Sesión",
      action: () => {
        setOpenUser(false);
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
        setOpenUser(false);
        setTimeout(() => {
          onLogout();
        }, 500);
      },
    },
  };

  const [syncModalVisible, setSyncModalVisible] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  const tooltipData = tooltipInfo[isAuth ? "logout" : "login"];

  const onSync = () => {
    if (!storedData$.user.get()) {
      setOpenUser(false);
      setTimeout(() => {
        navigation.navigate(Screens.Login);
      }, 500);
      return;
    }

    setOpenUser(false);
    setSyncModalVisible(true);
  };

  return (
    <View style={styles.userInfoContainer}>
      <TouchableOpacity ref={userRef} onPress={() => setOpenUser(true)}>
        {user ? (
          <View style={styles.userHeader}>
            <View style={styles.avatarContainer}>
              <Image
                source={{
                  uri: user.avatar ? avatarUrl : defaultAvatar,
                }}
                style={styles.avatar}
                resizeMode="cover"
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
      <TouchableOpacity activeOpacity={0.8} onPress={() => searchIcon.action()}>
        <Icon
          name={searchIcon.icon as any}
          color={theme.colors.text}
          size={30}
          style={[]}
        />
      </TouchableOpacity>

      <CloudSyncPopup
        visible={syncModalVisible}
        onClose={() => setSyncModalVisible(false)}
        lastSyncTime={lastSyncTime}
      />
      <Tooltip
        offset={-20}
        target={userRef}
        isVisible={openUser}
        onClose={() => setOpenUser(false)}
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
    </View>
  );
};

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

export default ProfileCard;
