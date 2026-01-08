import Icon from "@/components/Icon";
import { singleScreenHeader, SingleScreenHeaderProps } from "@/components/common/singleScreenHeader";
import HighlightedList from "@/components/highlight/HighlightedList";
import ScreenWithAnimation from "@/components/ScreenWithAnimation";
import TutorialWalkthrough from "@/components/TutorialWalkthrough";
import { storedData$ } from "@/context/LocalstoreContext";
import { useNetwork } from "@/context/NetworkProvider";
import { useMyTheme } from "@/context/ThemeContext";
import { useSyncHighlights } from "@/hooks/useSyncHighlights";
import { bibleState$ } from "@/state/bibleState";
import { useAlert } from "@/context/AlertContext";
import { showToast } from "@/utils/showToast";
import { use$ } from "@legendapp/state/react";
import { Stack, useNavigation } from "expo-router";
import React, { Fragment, useCallback, useEffect, useMemo } from "react";
import { TouchableOpacity, View } from "react-native";
import { Screens } from "@/types";

type HighlightedProps = {};

const Highlighted: React.FC<HighlightedProps> = () => {
  const { theme } = useMyTheme();
  const navigation = useNavigation();
  const { alertWarning } = useAlert();
  const netInfo = useNetwork();
  const { isConnected } = netInfo;

  const { syncHighlights } = useSyncHighlights();
  const isSyncing = use$(() => bibleState$.isSyncingHighlights.get());
  const user = use$(() => storedData$.user.get()) || null;

  // Auto-sync on mount
  useEffect(() => {
    if (user && isConnected && !isSyncing) {
      syncHighlights();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSyncPress = useCallback(async () => {
    if (!user) {
      alertWarning(
        "Sincronización requerida",
        "Debes iniciar sesión para sincronizar tus destacados con la nube",
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
      const result = await syncHighlights();
      if (result.success) {
        showToast(`Sincronizado: ${result.synced} destacados`);
      } else {
        showToast("Error al sincronizar algunos destacados");
      }
    } catch (error) {
      console.error("Error syncing highlights:", error);
      showToast("Error al sincronizar destacados");
    }
  }, [user, isConnected, syncHighlights, alertWarning]);

  const HeaderRightComponent = useCallback(() => (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <TouchableOpacity
        onPress={handleSyncPress}
        disabled={isSyncing}
        style={{
          padding: 8,
          opacity: isSyncing ? 0.5 : 1,
        }}
        accessibilityLabel="Sincronizar destacados"
      >
        <Icon
          name={isSyncing ? "Loader" : "Cloud"}
          size={24}
          color="#4dcd8d"
        />
      </TouchableOpacity>
    </View>
  ), [handleSyncPress, isSyncing]);

  const screenOptions: SingleScreenHeaderProps = useMemo(() => {
    return {
      theme,
      title: "Destacados",
      titleIcon: "Highlighter",
      titleIconColor: '#4dcd8d',
      goBack: () => { navigation.navigate(Screens.Dashboard as any) },
      headerRightProps: {
        headerRightIconColor: "#4dcd8d",
        RightComponent: HeaderRightComponent,
      }
    };
  }, [theme, navigation, HeaderRightComponent]);

  return (
    <Fragment>
      <Stack.Screen options={singleScreenHeader(screenOptions)} />
      <ScreenWithAnimation
        title="Destacados"
        icon="Highlighter"
        iconColor='#4dcd8d'
      >
        <HighlightedList />
      </ScreenWithAnimation>
      <TutorialWalkthrough />
    </Fragment>
  );
};

export default Highlighted;
