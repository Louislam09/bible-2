import {
  Alert,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity
} from "react-native";

import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { useTheme } from "@react-navigation/native";
import { FlashList } from "@shopify/flash-list";
import Icon, { IconProps } from "components/Icon";
import { Text, View } from "components/Themed";
import { useBibleContext } from "context/BibleContext";
import { useStorage } from "context/LocalstoreContext";
import { useCustomTheme } from "context/ThemeContext";
import Constants from 'expo-constants';
import { Stack, useRouter } from 'expo-router';
import * as Updates from 'expo-updates';
import { useCallback, useMemo } from "react";
import { EThemes, RootStackScreenProps, TFont, TTheme } from "types";

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
};

type TSection = {
  title: string;
  withIcon?: boolean;
  options: TOption[];
  id?: string;
};

const SettingsScren: React.FC<RootStackScreenProps<"settings">> = ({
  navigation,
}) => {
  const router = useRouter()
  const theme = useTheme();
  const {
    selectTheme,
    orientation = "PORTRAIT",
    selectFont,
    decreaseFontSize,
    increaseFontSize,
    fontSize,
    selectedFont,
  } = useBibleContext();
  const { toggleTheme, schema } = useCustomTheme();
  const styles = getStyles(theme);
  const { storedData, saveData, isDataLoaded } = useStorage();

  const appVersion = Constants.nativeAppVersion;

  const checkForUpdate = async () => {
    try {
      const update = await Updates.checkForUpdateAsync();
      if (update.isAvailable) {
        Alert.alert(
          "Actualización Disponible",
          "Hay una nueva actualización. ¿Te gustaría descargarla e instalarla?",
          [
            { text: "Cancelar", style: "cancel" },
            { text: "Actualizar", onPress: applyUpdate }
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

  const warnBeforeDelete = () => {
    Alert.alert(
      "Borrar Historial",
      "¿Estás seguro que quieres borrar el historial de busqueda?",
      [
        {
          text: "Cancelar",
          onPress: () => { },
          style: "destructive",
        },
        { text: "Borrar", onPress: () => console.log?.() },
      ]
    );
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

  const getColosTheme: any = useCallback(() => {
    return Object.values(EThemes).map((color, index) => {
      const name = Object.keys(EThemes)[index];

      return {
        label: colorNames[name],
        iconName: color,
        action: () => {
          selectTheme(name);
        },
        extraText: "",
      };
    });
  }, []);

  const getFontType: any = useCallback(() => {
    const fontNames = Object.values(TFont) as string[];

    return fontNames.map((font, index) => {
      const name = Object.keys(EThemes)[index];

      return {
        label: font,
        iconName: "CaseSensitive",
        action: () => {
          selectFont(font);
        },
        extraText: "",
      };
    });
  }, []);

  const sections = useMemo(() => {
    const options: TSection[] = [
      //   {
      //     title: "General",
      //     options: [
      //       {
      //         label: "Borrar Historial",
      //         iconName: "Trash2",
      //         action: warnBeforeDelete,
      //         extraText: "Limpiar el historial de busqueda",
      //       },
      //     ],
      //   },
      {
        title: "Configuración",
        options: [
          {
            label: "Modo Claro / Modo Oscuro",
            iconName: `${theme.dark ? "Sun" : "Moon"}`,
            action: () => {
              toggleTheme();
            },
            extraText: "Cambiar entre el modo claro y el modo oscuro",
          },
          {
            label: "Buscar Actualización",
            iconName: "Download", // Icon for the update button
            action: checkForUpdate,
            extraText: "Verificar si hay actualizaciones de la app",
          },
        ],
      },
      {
        title: "Tipografia",
        id: "font",
        withIcon: true,
        options: [...getFontType()],
      },
      {
        title: "Tamaño de Letra",
        id: "font",
        withIcon: true,
        options: [
          {
            label: "",
            iconName: `AArrowDown`,
            action: () => {
              decreaseFontSize();
            },
            extraText: "",
          },
          {
            label: fontSize,
            isValue: true,
            iconName: `ChartNoAxesColumn`,
            action: () => { },
            extraText: "",
          },
          {
            label: "",
            iconName: `AArrowUp`,
            action: () => {
              increaseFontSize();
            },
            extraText: "",
          },
        ],
      },
      {
        title: "Temas",
        id: "tema",
        options: [...getColosTheme()],
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
            action: () => { }, // No action needed
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

    return options;
  }, [theme, fontSize]);

  const renderItem = ({ item, index }: { item: TOption; index: number }) => {
    return (
      <TouchableOpacity
        onPress={item.action}
        key={item + "+" + index}
        style={[
          styles.listItem,
          { backgroundColor: item.iconName, justifyContent: "center" },
        ]}
      >
        <Text
          style={[
            styles.listItemLabel,
            {
              color: "white",
              fontWeight: "bold",
            },
          ]}
        >
          {item.label}
        </Text>
      </TouchableOpacity>
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
            style={[styles.fontIcon]}
            color={selectedFont === label ? theme.colors.notification : "#000"}
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

  const SettingSection = ({ title, options, id }: TSection, index: any) => {
    return (
      <View style={styles.sectionContainer} key={index}>
        <Stack.Screen options={{ headerShown: true, }} />
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
                    color={theme.colors.text}
                  />
                )}
              </TouchableOpacity>
            </TouchableOpacity>
          ))
        )}
      </View>
    );
  };


  return (
    <View key={orientation + theme.dark} style={styles.container}>
      <ScrollView
        style={{
          backgroundColor: theme.colors.background,
        }}
      >
        {sections.map(SettingSection)}
      </ScrollView>
    </View>
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
      elevation: 5,
      ...Platform.select({
        ios: {
          shadowColor: "black",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
        },
      }),
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
      elevation: 7,
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
      elevation: 7,
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
      backgroundColor: "transparent",
      gap: 5,
    },
    fontIcon: {
      padding: 20,
      borderRadius: 50,
      elevation: 5,
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
  });

export default SettingsScren;
