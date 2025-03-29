import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
} from "react-native";

import Icon, { IconProps } from "@/components/Icon";
import ScreenWithAnimation from "@/components/ScreenWithAnimation";
import { Text, View } from "@/components/Themed";
import { singleScreenHeader } from "@/components/common/singleScreenHeader";
import { useBibleContext } from "@/context/BibleContext";
import { storedData$, useStorage } from "@/context/LocalstoreContext";
import { useCustomTheme } from "@/context/ThemeContext";
import { settingState$ } from "@/state/settingState";
import { authState$ } from "@/state/authState";
import { EThemes, RootStackScreenProps, TFont, TTheme } from "@/types";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { use$ } from "@legendapp/state/react";
import { useTheme } from "@react-navigation/native";
import { FlashList } from "@shopify/flash-list";
import * as Updates from "expo-updates";
import Constants from "expo-constants";
import { Stack, useRouter } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import FontSelector from "@/components/FontSelector";
import BottomModal from "@/components/BottomModal";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import ColorSelector from "@/components/ColorSelector";
import FontSizeAdjuster from "@/components/FontSizeAdjuster";
import getMinMaxFontSize from "@/utils/getMinMaxFontSize";

const URLS = {
  BIBLE: "market://details?id=com.louislam09.bible",
  MORE_APPS: "market://search?q=pub:Luis_Martinez",
  ME: "louislam09@hotmail.com",
};

const colorNames: any = {
  Orange: "Naranja",
  BlackWhite: "Negro",
  Cyan: "Cian",
  BlueLight: "Azul Claro",
  Green: "Verde",
  Red: "Rojo",
  Purple: "Púrpura",
  BlueGreen: "Azul Verde",
  Pink: "Rosa",
  PinkLight: "Rosa Claro",
  BlueGray: "Gris Azul",
  Blue: "Azul",
};

type TOption = {
  label: string;
  extraText?: string;
  iconName: IconProps["name"];
  action: () => void;
  isFont5?: boolean;
  isValue?: boolean;
  color?: any;
  isDisabled?: boolean;
  renderSwitch?: boolean;
  onToggle?: (value: boolean) => void;
  value?: boolean;
};

type TSection = {
  title: string;
  withIcon?: boolean;
  options: TOption[];
  id?: string;
};

const SettingsScren: React.FC<RootStackScreenProps<"settings">> = ({}) => {
  const router = useRouter();
  const theme = useTheme();
  const {
    orientation = "PORTRAIT",
    decreaseFontSize,
    increaseFontSize,
    fontSize,
    currentTheme,
    selectTheme,
    selectFont,
    selectedFont,
  } = useBibleContext();
  const { toggleTheme } = useCustomTheme();
  const styles = getStyles(theme);
  const isGridLayout = use$(() => storedData$.isGridLayout.get());
  const enableCloudSync = use$(() => storedData$.enableCloudSync.get());
  const isSyncedWithCloud = use$(() => storedData$.isSyncedWithCloud.get());
  const isAuthenticated = use$(() => authState$.isAuthenticated.get());
  const { toggleCloudSync, syncWithCloud, loadFromCloud } = useStorage();
  const [currentSetting, setCurrentBottomSetting] = useState<
    "font" | "theme" | "fontSize"
  >("font");

  const appVersion = Constants.expoVersion ?? Constants.nativeAppVersion;
  const isAnimationDisabled = use$(() =>
    settingState$.isAnimationDisabled.get()
  );

  const settingBottomSheetModalRef = useRef<BottomSheetModal>(null);

  const settingHandlePresentModalPress = useCallback(
    (setting: "font" | "theme" | "fontSize") => {
      setCurrentBottomSetting(setting);
      settingBottomSheetModalRef.current?.present();
    },
    []
  );

  const handleLogout = async () => {
    try {
      await authState$.logout();
      Alert.alert("Sesión Cerrada", "Has cerrado sesión correctamente.");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      Alert.alert("Error", "No se pudo cerrar la sesión.");
    }
  };

  const handleLogin = () => {
    router.push("/login");
  };

  const handleToggleCloudSync = (value: boolean) => {
    if (value && !isAuthenticated) {
      Alert.alert(
        "Iniciar Sesión Requerido",
        "Necesitas iniciar sesión para activar la sincronización con la nube.",
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Iniciar Sesión", onPress: handleLogin },
        ]
      );
      return;
    }

    toggleCloudSync(value);

    if (value && isAuthenticated) {
      // If enabling cloud sync and authenticated, sync immediately
      syncWithCloud();
    }
  };

  const handleSyncNow = async () => {
    if (!isAuthenticated) {
      Alert.alert(
        "Iniciar Sesión Requerido",
        "Necesitas iniciar sesión para sincronizar con la nube.",
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Iniciar Sesión", onPress: handleLogin },
        ]
      );
      return;
    }

    if (!enableCloudSync) {
      Alert.alert(
        "Sincronización Desactivada",
        "Activa la sincronización con la nube primero.",
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Activar y Sincronizar",
            onPress: () => {
              toggleCloudSync(true);
              syncWithCloud();
            },
          },
        ]
      );
      return;
    }

    try {
      const success = await syncWithCloud();
      if (success) {
        Alert.alert("Éxito", "Configuración sincronizada con la nube.");
      } else {
        Alert.alert("Error", "No se pudo sincronizar con la nube.");
      }
    } catch (error) {
      console.error("Error al sincronizar:", error);
      Alert.alert("Error", "No se pudo sincronizar con la nube.");
    }
  };

  const checkForUpdate = async () => {
    try {
      const update = await Updates.checkForUpdateAsync();
      if (update.isAvailable) {
        Alert.alert(
          "Actualización Disponible",
          "Hay una nueva actualización. ¿Te gustaría descargarla e instalarla?",
          [
            { text: "Cancelar", style: "cancel" },
            { text: "Actualizar", onPress: applyUpdate },
          ]
        );
      } else {
        Alert.alert("No Hay Actualizaciones", "Ya tienes la última versión.");
      }
    } catch (error) {
      console.error("Error al verificar actualizaciones:", error);
      Alert.alert("Error", "Ocurrió un error al verificar actualizaciones.");
    }
  };

  const applyUpdate = async () => {
    try {
      await Updates.fetchUpdateAsync();
      await Updates.reloadAsync(); // Reinicia la app para aplicar la actualización
    } catch (error) {
      console.error("Error al actualizar:", error);
      Alert.alert("Error", "Ocurrió un error al actualizar la aplicación.");
    }
  };

  const openAppInStore = async (appPackage: string) => {
    await Linking.openURL(appPackage);
  };

  const sendEmail = async (email: string) => {
    const emailAddress = email;
    const subject = "";
    const body = "";

    const mailtoUrl = `mailto:${emailAddress}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;

    await Linking.openURL(mailtoUrl);
  };

  const toggleHomeScreen = () => {
    storedData$.isGridLayout.set(!isGridLayout);
  };

  const sections: TSection[] = [
    {
      title: "Cuenta",
      options: [
        {
          label: isAuthenticated ? "Cerrar Sesión" : "Iniciar Sesión",
          iconName: "User",
          action: isAuthenticated ? handleLogout : handleLogin,
          extraText: isAuthenticated
            ? "Cerrar sesión de tu cuenta"
            : "Iniciar sesión para sincronizar tus datos",
        },
        {
          label: "Sincronización con la nube",
          iconName: "Cloudy",
          color: !enableCloudSync
            ? theme.colors.text
            : theme.colors.notification,
          action: () => handleToggleCloudSync(!enableCloudSync),
          extraText: enableCloudSync
            ? "Desactivar sincronización con la nube"
            : "Activar sincronización con la nube",
          isValue: true,
          value: enableCloudSync,
          renderSwitch: true,
          onToggle: handleToggleCloudSync,
        },
        {
          label: "Sincronizar ahora",
          iconName: "RefreshCw",
          action: handleSyncNow,
          extraText: "Sincronizar manualmente con la nube",
          isDisabled: !enableCloudSync || !isAuthenticated,
        },
      ],
    },
    {
      title: "Configuración",
      options: [
        {
          label: theme.dark ? "Modo Oscuro" : "Modo Claro",
          iconName: `${theme.dark ? "Sun" : "Moon"}`,
          action: () => {
            toggleTheme();
          },
          extraText: "Cambiar entre el modo claro y el modo oscuro",
        },
        {
          label: isAnimationDisabled
            ? "Activar Animacion"
            : "Disabilitar Animacion",
          iconName: "Sparkles",
          color: isAnimationDisabled
            ? theme.colors.text
            : theme.colors.notification,
          action: () =>
            settingState$.isAnimationDisabled.set(!isAnimationDisabled),
          extraText: "Activar o desactivar las animaciones",
          isValue: true,
          value: !isAnimationDisabled,
          renderSwitch: true,
          onToggle: (value) => settingState$.isAnimationDisabled.set(!value),
        },
        {
          label: "Tipografia",
          iconName: "Type",
          action: () => settingHandlePresentModalPress("font"),
          extraText: "Toca para cambiar Tipografia",
        },
        {
          label: "Tamaño de Letra",
          iconName: "ALargeSmall",
          action: () => settingHandlePresentModalPress("fontSize"),
          extraText: "Toca para cambiar Tamaño de Letra",
        },
        {
          label: "Temas",
          iconName: "PaintBucket",
          action: () => settingHandlePresentModalPress("theme"),
          extraText: "Toca para cambiar Temas",
        },
        {
          label: "Buscar Actualización",
          iconName: "Download",
          action: checkForUpdate,
          extraText: "Verificar si hay actualizaciones de la app",
        },
      ],
    },
    {
      title: "Más Aplicaciones",
      options: [
        {
          label: "Santa Biblia RV60: Audio",
          iconName: "Crown",
          action: () => openAppInStore(URLS.BIBLE),
          extraText: "Descárgala y explora la Palabra de Dios.",
        },
        {
          label: "Mira Más Apps",
          iconName: "Play",
          action: () => openAppInStore(URLS.MORE_APPS),
          isFont5: true,
          extraText: "Ver todas nuestras aplicaciones",
        },
      ],
    },
    {
      title: "Versión",
      options: [
        {
          label: `Versión ${appVersion}`,
          iconName: "Info",
          action: () => {}, // No action needed
          extraText: `Fecha de Lanzamiento: Mar 13, 2024`,
        },
      ],
    },
    {
      title: "About",
      options: [
        {
          label: "Contactame",
          iconName: "Mail",
          action: () => sendEmail(URLS.ME),
          extraText: "Envíanos un correo electrónico",
        },
        {
          label: "Mira Más Apps",
          iconName: "Play",
          action: () => openAppInStore(URLS.MORE_APPS),
          isFont5: true,
          extraText: "Ver todas nuestras aplicaciones",
        },
      ],
    },
  ];

  const renderItem = ({ item }: { item: TOption }) => {
    return (
      <TouchableOpacity
        style={[
          styles.optionContainer,
          item.isDisabled && styles.disabledOption,
        ]}
        onPress={item.action}
        disabled={item.isDisabled}
      >
        <View style={styles.optionLeftContainer}>
          {item.isFont5 ? (
            <FontAwesome5
              name={item.iconName as any}
              size={20}
              color={theme.colors.text}
              style={styles.optionIcon}
            />
          ) : (
            <Icon
              name={item.iconName}
              size={20}
              color={theme.colors.text}
              style={styles.optionIcon}
            />
          )}
          <View style={styles.optionTextContainer}>
            <Text style={styles.optionLabel}>{item.label}</Text>
            {item.extraText && (
              <Text style={styles.optionExtraText}>{item.extraText}</Text>
            )}
            {item.isValue && (
              <Text style={styles.optionValue}>
                {item.value ? "Activado" : "Desactivado"}
              </Text>
            )}
            {item.label === "Sincronización con la nube" && enableCloudSync && (
              <Text
                style={[
                  styles.syncStatus,
                  { color: isSyncedWithCloud ? "green" : "orange" },
                ]}
              >
                {isSyncedWithCloud ? "✅ Sincronizado" : "⚠️ No sincronizado"}
              </Text>
            )}
          </View>
        </View>
        {item.renderSwitch && (
          <Switch
            value={item.value}
            onValueChange={item.onToggle}
            trackColor={{ false: "#767577", true: theme.colors.primary }}
            thumbColor={item.value ? "#f4f3f4" : "#f4f3f4"}
            disabled={item.isDisabled}
          />
        )}
      </TouchableOpacity>
    );
  };

  const SettingSection = ({ title, options, id }: TSection, index: any) => {
    return (
      <View style={styles.sectionContainer} key={index}>
        <Text style={styles.sectionTitle}>{title}</Text>

        {id ? (
          id === "font" ? (
            <View style={[styles.listItem, styles.historyItem]}>
              {options.map(renderFontItem)}
            </View>
          ) : (
            <View style={[styles.popularWordsContainer]}>
              <FlashList
                data={options}
                renderItem={renderItem}
                keyExtractor={(item) => item.label.toString()}
                estimatedItemSize={50}
                horizontal
                contentContainerStyle={{
                  padding: 5,
                  paddingTop: 1,
                  paddingLeft: 1,
                  backgroundColor: theme.colors.background,
                }}
              />
            </View>
          )
        ) : (
          options.map((item, itemIndex) => (
            <TouchableOpacity
              activeOpacity={0.9}
              key={itemIndex}
              style={[styles.listItem, styles.historyItem]}
              onPress={item.action}
            >
              <Text style={[styles.listHistoryLabel]}>
                {item?.label}
                {"\n"}
                <Text style={styles.itemDate}>{item.extraText}</Text>
              </Text>
              <TouchableOpacity>
                {item.isFont5 ? (
                  <FontAwesome5 name="google-play" size={26} color={"green"} />
                ) : (
                  <Icon
                    size={26}
                    name={item.iconName || "Sun"}
                    color={item.color || theme.colors.text}
                  />
                )}
              </TouchableOpacity>
            </TouchableOpacity>
          ))
        )}
      </View>
    );
  };

  const renderFontItem = (item: TOption, index: number) => {
    const { label, iconName, isValue, action } = item;

    if (isValue) {
      return (
        <Text
          key={index}
          style={[styles.fontSize, { color: theme.colors.notification }]}
        >
          {label}
        </Text>
      );
    }
    return (
      <TouchableOpacity key={index} onPress={() => action()}>
        <View style={styles.fontItem}>
          <Icon
            name={iconName}
            size={30}
            color={
              selectedFont === label
                ? theme.colors.notification
                : theme.colors.background
            }
          />

          {label && (
            <Text
              style={[
                styles.fontLabel,
                selectedFont === label && {
                  color: theme.colors.notification,
                },
              ]}
            >
              {label}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const handleFontChange = (fontFamily: string) => {
    selectFont(fontFamily);
  };

  const handleColorChange = (colorOption: {
    label: any;
    color: EThemes;
    value: string;
  }) => {
    selectTheme(colorOption.value);
  };

  const handleFontSizeChange = (size: number) => {
    console.log({ size });
  };

  const Font = () => {
    return (
      <FontSelector
        onSelectFont={handleFontChange}
        initialFont={selectedFont}
      />
    );
  };
  const ThemeColor = () => {
    return (
      <ColorSelector
        onSelectColor={handleColorChange}
        initialColor={currentTheme}
      />
    );
  };

  const fontSizes = getMinMaxFontSize();

  const FontSize = () => {
    return (
      <FontSizeAdjuster
        onSizeChange={handleFontSizeChange}
        initialSize={fontSize}
        fontFamily={selectedFont}
        minSize={fontSizes.minPx}
        maxSize={fontSizes.maxPx}
        step={1}
      />
    );
  };

  const BottomChild = {
    font: <Font />,
    theme: <ThemeColor />,
    fontSize: <FontSize />,
  };

  return (
    <ScreenWithAnimation duration={800} icon="Settings" title="Ajustes">
      <View key={orientation + theme.dark} style={styles.container}>
        <ScrollView
          style={{
            backgroundColor: theme.colors.background,
          }}
        >
          <Stack.Screen
            options={{
              ...singleScreenHeader({
                theme,
                title: "Ajustes",
                titleIcon: "Settings",
                headerRightProps: {
                  headerRightIcon: isGridLayout
                    ? "LayoutGrid"
                    : "LayoutPanelTop",
                  headerRightIconColor: isGridLayout
                    ? "#fff"
                    : theme.colors.notification,
                  onPress: toggleHomeScreen,
                  disabled: false,
                  style: { opacity: 0 },
                },
              }),
            }}
          />

          {sections.map(SettingSection)}
        </ScrollView>

        <BottomModal
          justOneSnap
          showIndicator
          justOneValue={["70%"]}
          startAT={0}
          ref={settingBottomSheetModalRef}
          shouldScroll
        >
          {BottomChild[currentSetting]}
        </BottomModal>
      </View>
    </ScreenWithAnimation>
  );
};

const getStyles = ({ colors, dark }: TTheme) =>
  StyleSheet.create({
    popularWordsContainer: {
      height: 60,
    },
    card: {
      backgroundColor: "white",
      borderWidth: 1,
      borderColor: colors.notification,
      borderRadius: 8,
      padding: 16,
      marginVertical: 8,
    },
    listItemLabel: {
      fontSize: 16,
    },
    container: {
      flex: 1,
      alignItems: "center",
      justifyContent: "flex-start",
      backgroundColor: colors.background,
    },
    sectionContainer: {
      padding: 15,
      alignItems: "center",
      justifyContent: "flex-start",
      backgroundColor: colors.background,
    },
    sectionTitle: {
      color: colors.notification,
      alignSelf: "flex-start",
      paddingLeft: 15,
      marginBottom: 10,
      fontWeight: "bold",
    },
    listItem: {
      flex: 1,
      minWidth: 100,
      flexDirection: "row",
      paddingHorizontal: 20,
      borderColor: colors.text,
      borderWidth: 1,
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
      marginHorizontal: 5,
      borderRadius: 5,
    },
    historyContainer: {
      flex: 1,
      width: "100%",
    },
    historyItem: {
      width: "100%",
      alignItems: "center",
      justifyContent: "space-between",
      padding: 15,
      marginBottom: 10,
      backgroundColor: colors.background,
      maxHeight: 76,
    },
    listHistoryLabel: {
      fontSize: 16,
      fontWeight: "bold",
      color: colors.text,
    },
    itemDate: {
      fontSize: 12,
      color: colors.text,
    },
    fontSizeContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-around",
      gap: 10,
      width: "90%",
    },
    fontItem: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.text,
      borderRadius: 5,
      padding: 10,
      gap: 5,
    },
    fontIcon: {
      padding: 20,
      borderRadius: 50,
      backgroundColor: "white",
      color: "#000",
      paddingHorizontal: 22,
    },
    fontLabel: {
      color: dark ? "#fff" : "#000",
      fontWeight: "bold",
    },
    fontSize: {
      fontWeight: "bold",
      color: "#000",
      fontSize: 30,
    },
    optionContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 15,
      marginVertical: 5,
      backgroundColor: colors.background,
      borderRadius: 5,
    },
    optionLeftContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    optionIcon: {
      marginRight: 10,
    },
    optionTextContainer: {
      flex: 1,
    },
    optionLabel: {
      fontSize: 16,
      color: colors.text,
    },
    optionExtraText: {
      fontSize: 12,
      color: colors.text,
    },
    optionValue: {
      fontSize: 12,
      color: colors.text,
    },
    disabledOption: {
      opacity: 0.5,
    },
    syncStatus: {
      fontSize: 12,
      marginTop: 4,
    },
  });

export default SettingsScren;
