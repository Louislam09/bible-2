import {
  Alert,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  TouchableOpacity,
} from "react-native";

import { AppIconSelector } from "@/components/AppIconSelector";
import BottomModal from "@/components/BottomModal";
import ColorSelector from "@/components/ColorSelector";
import FontSelector from "@/components/FontSelector";
import FontSizeAdjuster from "@/components/FontSizeAdjuster";
import Icon, { IconProps } from "@/components/Icon";
import ScreenWithAnimation from "@/components/ScreenWithAnimation";
import { Text, View } from "@/components/Themed";
import { singleScreenHeader } from "@/components/common/singleScreenHeader";
import { useBibleContext } from "@/context/BibleContext";
import { storedData$, useStorage } from "@/context/LocalstoreContext";
import { useMyTheme } from "@/context/ThemeContext";
import { authState$ } from "@/state/authState";
import { bibleState$ } from "@/state/bibleState";
import { settingState$ } from "@/state/settingState";
import { EThemes, RootStackScreenProps, TTheme } from "@/types";
import getMinMaxFontSize from "@/utils/getMinMaxFontSize";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { use$ } from "@legendapp/state/react";
import Constants from "expo-constants";
import { Stack, useRouter } from "expo-router";
import * as Updates from "expo-updates";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { URLS } from "@/constants/appConfig";


const colorNames: Record<string, string> = {
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
  color?: string;
  isDisabled?: boolean;
  renderSwitch?: boolean;
  value?: boolean;
  withAnimation?: boolean;
  badge?: string;
};

type TSection = {
  title: string;
  withIcon?: boolean;
  options: TOption[];
  id?: string;
};

const SettingsScreen: React.FC<RootStackScreenProps<"settings">> = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    orientation = "PORTRAIT",
    handleFontSize,
    fontSize,
    currentTheme,
    selectTheme,
    selectFont,
    selectedFont,
  } = useBibleContext();
  const { toggleTheme, theme } = useMyTheme();
  const styles = getStyles(theme);
  const fontSizes = getMinMaxFontSize();
  const isGridLayout = use$(() => storedData$.isGridLayout.get());
  const isSyncedWithCloud = use$(() => storedData$.isSyncedWithCloud.get());
  const isAuthenticated = use$(() => authState$.isAuthenticated.get());
  const { toggleCloudSync, syncWithCloud, loadFromCloud } = useStorage();
  const [currentSetting, setCurrentBottomSetting] = useState<
    "font" | "theme" | "fontSize" | "appIcon"
  >("font");
  const [searchQuery, setSearchQuery] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  const fadeAnim = useRef(new Animated.Value(1)).current;

  const version = Constants.expoConfig?.version ?? "2.0.0"; // e.g. "1.2.3"
  const build = Constants.expoConfig?.android?.versionCode ?? "";
  const appVersion = ` ${version} (Build ${build})`;
  const isAnimationDisabled = use$(() =>
    settingState$.isAnimationDisabled.get()
  );

  const settingBottomSheetModalRef = useRef<BottomSheetModal>(null);
  const isFlashlist = use$(() => bibleState$.isFlashlist.get());

  useEffect(() => {
    const loadLastSyncTime = async () => {
      try {
        const time = await storedData$.lastSyncTime?.get();
        if (time) {
          setLastSyncTime(new Date(time).toLocaleString());
        }
      } catch (error) {
        console.error("Error loading last sync time:", error);
      }
    };

    loadLastSyncTime();
  }, []);

  const settingHandlePresentModalPress = useCallback(
    (setting: "font" | "theme" | "fontSize" | "appIcon") => {
      setCurrentBottomSetting(setting);
      settingBottomSheetModalRef.current?.present();
    },
    [isAnimationDisabled]
  );

  const onLogout = () => {
    Alert.alert(
      "Cerrar Sesión",
      "¿Estás seguro de que deseas cerrar tu sesión?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Cerrar Sesión",
          onPress: () => handleLogout(),
        },
      ]
    );
  };

  const handleLogout = async () => {
    try {
      Animated.timing(fadeAnim, {
        toValue: 0.5,
        duration: 300,
        useNativeDriver: true,
      }).start();

      await authState$.logout();

      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      Alert.alert("Sesión Cerrada", "Has cerrado sesión correctamente.");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      Alert.alert("Error", "No se pudo cerrar la sesión.");

      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  const handleLogin = () => {
    router.push("/login");
  };

  const handleSyncNow = async () => {
    if (
      !authState$.ensureAuthenticated(
        "Necesitas iniciar sesión para sincronizar con la nube.",
        handleLogin
      )
    )
      return;

    try {
      setIsSyncing(true);

      const success = await syncWithCloud({});

      if (success) {
        const now = new Date().toISOString();
        await storedData$.lastSyncTime.set(now);
        setLastSyncTime(new Date(now).toLocaleString());

        Alert.alert("Éxito", "Configuración sincronizada con la nube.");
      } else {
        Alert.alert("Error", "No se pudo sincronizar con la nube.");
      }
    } catch (error) {
      console.error("Error al sincronizar:", error);
      Alert.alert("Error", "No se pudo sincronizar con la nube.");
    } finally {
      setIsSyncing(false);
    }
  };

  const checkForUpdate = async () => {
    try {
      setIsUpdating(true);

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
    } finally {
      setIsUpdating(false);
    }
  };

  const applyUpdate = async () => {
    try {
      setIsUpdating(true);

      await Updates.fetchUpdateAsync();
      await Updates.reloadAsync();
    } catch (error) {
      console.error("Error al actualizar:", error);
      Alert.alert("Error", "Ocurrió un error al actualizar la aplicación.");
      setIsUpdating(false);
    }
  };

  const openAppInStore = async (appPackage: string) => {
    await Linking.openURL(appPackage);
  };

  const sendEmail = async (email: string) => {
    const emailAddress = email;
    const subject = "Consulta sobre la Aplicación";
    const body = `Versión de la aplicación: ${appVersion}\nDispositivo: ${Platform.OS} ${Platform.Version}`;

    const mailtoUrl = `mailto:${emailAddress}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;

    await Linking.openURL(mailtoUrl);
  };

  const rateApp = async () => {
    await Linking.openURL(URLS.RATE_APP);
  };

  const toggleHomeScreen = () => {
    storedData$.isGridLayout.set(!isGridLayout);
  };

  const toggleAnimation = () => {
    settingState$.isAnimationDisabled.set(!isAnimationDisabled);
  };

  const sections: TSection[] = [
    {
      title: "Cuenta",
      id: "account",
      options: [
        {
          label: isAuthenticated ? "Cerrar Sesión" : "Iniciar Sesión",
          iconName: "User",
          action: isAuthenticated ? onLogout : handleLogin,
          color: theme.colors.notification,
          extraText: isAuthenticated
            ? "Cerrar sesión de tu cuenta"
            : "Iniciar sesión para sincronizar tus datos",
          withAnimation: true,
        },
        {
          label: "Sincronizar ahora",
          iconName: isSyncing ? "Loader" : "RefreshCw",
          action: handleSyncNow,
          extraText: lastSyncTime
            ? `Última sincronización: ${lastSyncTime}`
            : "Sincronizar manualmente con la nube",
          color: isSyncedWithCloud
            ? theme.colors.notification
            : theme.colors.text,
          isDisabled: !isAuthenticated || isSyncing,
        },
      ],
    },

    {
      title: "Comportamiento",
      id: "behavior",
      options: [
        {
          label: isAnimationDisabled
            ? "Activar Animaciones"
            : "Desactivar Animaciones",
          iconName: "Sparkles",
          color: isAnimationDisabled
            ? theme.colors.text
            : theme.colors.notification,
          action: toggleAnimation,
          extraText: "Activar o desactivar las animaciones",
          renderSwitch: true,
          value: !isAnimationDisabled,
        },
        {
          label: "Mejorar Rendimiento en dispositivos lentos",
          iconName: storedData$.useDomComponent.get() ? "Rabbit" : "Turtle",
          action: () =>
            storedData$.useDomComponent.set(!storedData$.useDomComponent.get()),
          // mas rapido para dispositivos lentos
          extraText:
            "Versión DOM para mejorar el rendimiento en dispositivos lentos",
          color: storedData$.useDomComponent.get()
            ? theme.colors.notification
            : theme.colors.text,
          renderSwitch: true,
          value: storedData$.useDomComponent.get(),
        },
        {
          label: "Vista de Lista Rápida",
          iconName: isFlashlist ? "Zap" : "ZapOff",
          action: () => bibleState$.toggleList(),
          extraText:
            "Alternar entre la vista de lista rápida y la vista estándar",
          color: isFlashlist ? theme.colors.notification : theme.colors.text,
          // renderSwitch: true,
          value: isFlashlist,
        },
        {
          label: isGridLayout ? "Vista de Lista" : "Vista de Cuadrícula",
          iconName: isGridLayout ? "List" : "LayoutGrid",
          action: toggleHomeScreen,
          extraText: "Cambiar el diseño de la pantalla principal",
          renderSwitch: true,
          value: isGridLayout,
        },
      ],
    },
    {
      title: "Apariencia",
      id: "appearance",
      options: [
        {
          label: theme.dark ? "Modo Oscuro" : "Modo Claro",
          iconName: `${theme.dark ? "Sun" : "Moon"}`,
          action: toggleTheme,
          extraText: "Cambiar entre el modo claro y el modo oscuro",
          renderSwitch: true,
          value: theme.dark,
        },
        {
          label: "Temas",
          iconName: "PaintBucket",
          action: () => settingHandlePresentModalPress("theme"),
          extraText: "Personaliza el color del tema",
          color: theme.colors.notification,
          badge: colorNames[currentTheme] || currentTheme,
        },
        {
          label: "Tipografía",
          iconName: "Type",
          action: () => settingHandlePresentModalPress("font"),
          extraText: "Cambiar el tipo de letra",
          badge: selectedFont.split("-")[0],
        },
        {
          label: "Tamaño de Letra",
          iconName: "ALargeSmall",
          action: () => settingHandlePresentModalPress("fontSize"),
          extraText: "Ajustar el tamaño del texto",
          badge: `${fontSize}px`,
        },
        {
          label: "Ícono de la App",
          iconName: "Smartphone",
          action: () => settingHandlePresentModalPress("appIcon"),
          extraText: "Cambiar el ícono de la aplicación",
          color: theme.colors.notification,
        },
      ],
    },
    {
      title: "Notificaciones",
      id: "notifications",
      options: [
        {
          label: "Notificaciones",
          iconName: "Bell",
          action: () => router.push("/notification"),
          extraText: "Configura las notificaciones de la aplicación",
          color: theme.colors.notification,
        },
      ],
    },
    {
      title: "Inteligencia Artificial",
      id: "ai",
      options: [
        {
          label: "Configurar API Key de Google AI",
          iconName: "Brain",
          action: () => router.push("/ai-setup"),
          extraText: "Configura tu API key para usar la IA de Google",
          color: theme.colors.notification,
        },
      ],
    },

    {
      title: "Aplicación",
      id: "app",
      options: [
        {
          label: "Buscar Actualización",
          iconName: isUpdating ? "Loader" : "Download",
          action: checkForUpdate,
          extraText: "Verificar si hay actualizaciones de la app",
          isDisabled: isUpdating,
        },
        {
          label: "Calificar App",
          iconName: "Star",
          action: rateApp,
          extraText: "Valora nuestra aplicación en la tienda",
          color: "gold",
        },
      ],
    },
    {
      title: "Más Aplicaciones",
      id: "more-apps",
      options: [
        {
          label: "Santa Biblia RV60: Audio",
          iconName: "BookOpen",
          action: () => openAppInStore(URLS.BIBLE),
          extraText: "Descárgala y explora la Palabra de Dios.",
        },
        {
          label: "Mira Más Apps",
          iconName: "ExternalLink",
          action: () => openAppInStore(URLS.MORE_APPS),
          extraText: "Ver todas nuestras aplicaciones",
        },
      ],
    },
    {
      title: "Versión",
      id: "version",
      options: [
        {
          label: `Versión ${appVersion}`,
          iconName: "Info",
          action: () => { },
          extraText: `Fecha de Lanzamiento: Mar 13, 2024`,
        },
      ],
    },
    {
      title: "Acerca de",
      id: "about",
      options: [
        {
          label: "Contáctame",
          iconName: "Mail",
          action: () => sendEmail(URLS.ME),
          extraText: "Envíanos un correo electrónico",
        },
      ],
    },
  ];

  const filteredSections = useMemo(() => {
    if (!searchQuery) return sections;

    return sections
      .map((section) => {
        const filteredOptions = section.options.filter(
          (option) =>
            option.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (option.extraText &&
              option.extraText
                .toLowerCase()
                .includes(searchQuery.toLowerCase()))
        );

        return {
          ...section,
          options: filteredOptions,
        };
      })
      .filter((section) => section.options.length > 0);
  }, [sections, searchQuery]);

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
    handleFontSize(size);
  };

  const syncRotateAnim = useRef(new Animated.Value(0)).current;
  const rotate = syncRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["-360deg", "0deg"],
  });

  const startRotation = () => {
    Animated.loop(
      Animated.timing(syncRotateAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  };

  const stopRotation = () => {
    syncRotateAnim.stopAnimation();
    syncRotateAnim.setValue(0);
  };

  useEffect(() => {
    if (isSyncing) {
      startRotation();
    } else {
      stopRotation();
    }
  }, [isSyncing]);

  const SettingItem = useCallback(
    ({ item }: { item: TOption }) => {
      return (
        <TouchableOpacity
          activeOpacity={0.7}
          style={[
            styles.listItem,
            styles.historyItem,
            item.isDisabled && styles.disabledOption,
          ]}
          onPress={item.action}
          disabled={item.isDisabled}
        >
          <View style={styles.optionLeftSection}>
            <Text style={[styles.listHistoryLabel]}>
              {item.label}
              {"\n"}
              <Text style={styles.itemDate}>{item.extraText}</Text>
            </Text>

            {item.badge && (
              <View style={styles.badgeContainer}>
                <Text style={styles.badgeText}>{item.badge}</Text>
              </View>
            )}
          </View>

          <View style={styles.optionRightSection}>
            {item.renderSwitch ? (
              <Switch
                value={item.value}
                onValueChange={() => item.action()}
                trackColor={{
                  false: theme.dark ? "#555" : "#ddd",
                  true: theme.colors.notification,
                }}
                thumbColor={item.value ? "#fff" : "#f4f3f4"}
                ios_backgroundColor="#3e3e3e"
              />
            ) : item.isFont5 ? (
              <FontAwesome5 name="google-play" size={26} color={"green"} />
            ) : isSyncing && item.iconName === "Loader" ? (
              <Animated.View style={{ transform: [{ rotate }] }}>
                <Icon
                  size={26}
                  name={item.iconName || "Loader"}
                  color={item.color || theme.colors.text}
                />
              </Animated.View>
            ) : (
              <Icon
                size={26}
                name={item.iconName || "Sun"}
                color={item.color || theme.colors.text}
              />
            )}
          </View>
        </TouchableOpacity>
      );
    },
    [styles, theme]
  );

  const SettingSection = useCallback(
    ({ title, options, id }: TSection, index: number) => {
      if (options.length === 0) return null;

      return (
        <Animated.View
          style={[styles.sectionContainer, { opacity: fadeAnim }]}
          key={id || index}
        >
          <Text style={styles.sectionTitle}>{title}</Text>
          {options.map((item, itemIndex) => (
            <SettingItem key={`${id}-${itemIndex}`} item={item} />
          ))}
        </Animated.View>
      );
    },
    [SettingItem, styles, fadeAnim]
  );

  const Font = useMemo(() => {
    const FontComponent = () => (
      <FontSelector
        onSelectFont={handleFontChange}
        initialFont={selectedFont}
      />
    );
    FontComponent.displayName = 'FontComponent';
    return FontComponent;
  }, [handleFontChange, selectedFont]);

  const ThemeColor = useMemo(() => {
    const ThemeColorComponent = () => (
      <ColorSelector
        onSelectColor={handleColorChange}
        initialColor={currentTheme}
      />
    );
    ThemeColorComponent.displayName = 'ThemeColorComponent';
    return ThemeColorComponent;
  }, [handleColorChange, currentTheme]);

  const FontSize = useMemo(() => {
    const FontSizeComponent = () => (
      <FontSizeAdjuster
        onSizeChange={handleFontSizeChange}
        initialSize={fontSize}
        fontFamily={selectedFont}
        minSize={fontSizes.minPx}
        maxSize={fontSizes.maxPx}
        step={1}
      />
    );
    FontSizeComponent.displayName = 'FontSizeComponent';
    return FontSizeComponent;
  }, [handleFontSizeChange, fontSize, selectedFont, fontSizes]);

  const AppIcon = useMemo(() => {
    const AppIconComponent = () => (
      <AppIconSelector
        style={{
          backgroundColor: theme.colors.background,
          margin: 0,
          padding: 16,
        }}
      />
    );
    AppIconComponent.displayName = 'AppIconComponent';
    return AppIconComponent;
  }, [theme]);

  const BottomChild = {
    font: <Font />,
    theme: <ThemeColor />,
    fontSize: <FontSize />,
    appIcon: <AppIcon />,
  };

  return (
    <>
      <Stack.Screen
        options={{
          ...singleScreenHeader({
            theme,
            title: "Ajustes",
            titleIcon: "Settings",
            headerRightProps: {
              headerRightIcon: "Bell",
              headerRightIconColor: theme.colors.notification,
              onPress: () => router.push("/notification"),
              disabled: false,
              style: { opacity: 1 },
            },
          }),
        }}
      />
      <ScreenWithAnimation duration={800} icon="Settings" title="Ajustes">
        <ScrollView key={orientation + theme.dark} style={styles.container}>
          <View style={styles.searchContainer}>
            <Icon
              name="Search"
              size={20}
              color={theme.colors.text}
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar ajustes..."
              placeholderTextColor={theme.dark ? "#999" : "#777"}
              value={searchQuery}
              onChangeText={setSearchQuery}
              clearButtonMode="while-editing"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery("")}
                style={styles.clearButton}
              >
                <Icon name="X" size={16} color={theme.colors.text} />
              </TouchableOpacity>
            )}
          </View>

          <KeyboardAvoidingView
            style={{
              backgroundColor: theme.colors.background,
            }}
            contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
          >
            {filteredSections.length > 0 ? (
              filteredSections.map(SettingSection)
            ) : (
              <View style={styles.noResultsContainer}>
                <Icon
                  name="Search"
                  size={50}
                  color={theme.colors.text}
                  style={{ opacity: 0.5 }}
                />
                <Text style={styles.noResultsText}>
                  No se encontraron resultados
                </Text>
                <Text style={styles.noResultsSubText}>
                  Intenta con otra búsqueda
                </Text>
              </View>
            )}
          </KeyboardAvoidingView>

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
        </ScrollView>
      </ScreenWithAnimation>
    </>
  );
};

const getStyles = ({ colors, dark }: TTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: dark ? colors.background : colors.text + 20,
    },
    searchContainer: {
      flexDirection: "row",
      alignItems: "center",
      borderColor: colors.text + 70,
      backgroundColor: colors.text + 20,
      borderRadius: 10,
      marginHorizontal: 15,
      marginVertical: 10,
      paddingHorizontal: 10,
      paddingVertical: Platform.OS === "ios" ? 8 : 2,
      borderWidth: 1,
    },
    searchIcon: {
      marginRight: 8,
      opacity: 0.7,
    },
    searchInput: {
      flex: 1,
      color: colors.text,
      fontSize: 16,
      padding: 8,
    },
    clearButton: {
      padding: 8,
    },
    sectionContainer: {
      padding: 15,
      alignItems: "center",
      justifyContent: "flex-start",
      backgroundColor: dark ? colors.background : colors.text + 20,
    },
    sectionTitle: {
      color: colors.notification,
      alignSelf: "flex-start",
      paddingLeft: 15,
      marginBottom: 10,
      fontWeight: "bold",
      fontSize: 16,
      letterSpacing: 0.5,
    },
    listItem: {
      flex: 1,
      minWidth: 100,
      flexDirection: "row",
      paddingHorizontal: 20,
      borderColor: colors.text + 70,
      borderWidth: 1,
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
      marginHorizontal: 5,
      borderRadius: 10,
    },
    historyItem: {
      width: "100%",
      alignItems: "center",
      justifyContent: "space-between",
      padding: 15,
      marginBottom: 10,
      backgroundColor: colors.text + 20,
      maxHeight: 90,
    },
    listHistoryLabel: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
    },
    itemDate: {
      fontSize: 12,
      color: dark ? "#ffffff" : "#000000",
      marginTop: 4,
    },
    optionLeftSection: {
      flex: 1,
      flexDirection: "column",
      backgroundColor: "transparent",
    },
    optionRightSection: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-end",
      minWidth: 50,
      backgroundColor: "transparent",
    },
    disabledOption: {
      opacity: 0.5,
    },
    badgeContainer: {
      backgroundColor: colors.notification,
      borderRadius: 12,
      paddingHorizontal: 8,
      paddingVertical: 2,
      marginTop: 5,
      alignSelf: "flex-start",
    },
    badgeText: {
      fontSize: 10,
      color: "#fff",
      fontWeight: "bold",
    },
    noResultsContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingTop: 100,
      backgroundColor: dark ? colors.background : colors.text + 20,
    },
    noResultsText: {
      fontSize: 18,
      fontWeight: "bold",
      color: colors.text,
      marginTop: 20,
    },
    noResultsSubText: {
      fontSize: 14,
      color: dark ? "#999" : "#777",
      marginTop: 10,
    },
  });

export default SettingsScreen;
