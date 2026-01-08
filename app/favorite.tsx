import Icon from "@/components/Icon";
import { singleScreenHeader, SingleScreenHeaderProps } from "@/components/common/singleScreenHeader";
import FavoriteList from "@/components/favorite/FavoriteList";
import ScreenWithAnimation from "@/components/ScreenWithAnimation";
import { Text } from "@/components/Themed";
import TutorialWalkthrough from "@/components/TutorialWalkthrough";
import { storedData$ } from "@/context/LocalstoreContext";
import { useNetwork } from "@/context/NetworkProvider";
import { useMyTheme } from "@/context/ThemeContext";
import { useSyncFavorites } from "@/hooks/useSyncFavorites";
import { bibleState$ } from "@/state/bibleState";
import { useAlert } from "@/context/AlertContext";
import { showToast } from "@/utils/showToast";
import { use$ } from "@legendapp/state/react";
import { Stack, useNavigation } from "expo-router";
import React, { Fragment, useCallback, useEffect, useMemo } from "react";
import { TouchableOpacity, View } from "react-native";
import { Screens } from "@/types";

type FavoriteProps = {};

const Favorite: React.FC<FavoriteProps> = () => {
  const startSource = require("../assets/lottie/star.json");
  const { theme } = useMyTheme();
  const navigation = useNavigation();
  const { alertWarning } = useAlert();
  const netInfo = useNetwork();
  const { isConnected } = netInfo;

  const { syncFavorites } = useSyncFavorites();
  const isSyncing = use$(() => bibleState$.isSyncingFavorites.get());
  const user = use$(() => storedData$.user.get()) || null;

  // Auto-sync on mount
  useEffect(() => {
    if (user && isConnected && !isSyncing) {
      syncFavorites();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSyncPress = useCallback(async () => {
    if (!user) {
      alertWarning(
        "Sincronización requerida",
        "Debes iniciar sesión para sincronizar tus favoritos con la nube",
      );
      return;
    }

    if (!isConnected) {
      alertWarning(
        "Sin conexión",
        "Necesitas conexión a internet para sincronizar",
      );
      return;
    }

    try {
      const result = await syncFavorites();
      if (result.success) {
        showToast(`Sincronizado: ${result.synced} favoritos`);
      } else {
        showToast("Error al sincronizar algunos favoritos");
      }
    } catch (error) {
      console.error("Error syncing favorites:", error);
      showToast("Error al sincronizar favoritos");
    }
  }, [user, isConnected, syncFavorites, alertWarning]);

  const HeaderRightComponent = useCallback(() => (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <TouchableOpacity
        onPress={handleSyncPress}
        disabled={isSyncing}
        style={{
          padding: 8,
          opacity: isSyncing ? 0.5 : 1,
        }}
        accessibilityLabel="Sincronizar favoritos"
      >
        <Icon
          name={isSyncing ? "Loader" : "Cloud"}
          size={24}
          color="#fedf75"
        />
      </TouchableOpacity>
    </View>
  ), [handleSyncPress, isSyncing]);

  const screenOptions: SingleScreenHeaderProps = useMemo(() => {
    return {
      theme,
      title: "Favoritos",
      titleIcon: "Star",
      titleIconColor: "#fedf75",
      goBack: () => { navigation.navigate(Screens.Dashboard as any) },
      headerRightProps: {
        headerRightIconColor: "#fedf75",
        RightComponent: HeaderRightComponent,
      }
    };
  }, [theme, navigation, HeaderRightComponent]);

  return (
    <Fragment>
      <Stack.Screen options={singleScreenHeader(screenOptions)} />
      <ScreenWithAnimation
        title="Favoritos"
        animationSource={startSource}
        speed={2}
      >
        <FavoriteList />
      </ScreenWithAnimation>
      <TutorialWalkthrough />
    </Fragment>
  );
};

export default Favorite;
