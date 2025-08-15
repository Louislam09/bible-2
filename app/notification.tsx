import { singleScreenHeader } from "@/components/common/singleScreenHeader";
import DatabaseDebug from "@/components/DatabaseDebug";
import Icon from "@/components/Icon";
import ScreenWithAnimation from "@/components/ScreenWithAnimation";
import { Text, View } from "@/components/Themed";
import { storedData$, useStorage } from "@/context/LocalstoreContext";
import { useNotification } from "@/context/NotificationContext";
import { IS_DEV } from "@/globalConfig";
import {
  NotificationPreferences,
  useNotificationService,
} from "@/services/notificationServices";
import { use$ } from "@legendapp/state/react";
import { Picker } from "@react-native-picker/picker";
import { useTheme } from "@react-navigation/native";
import { Stack } from "expo-router";
import { icons } from "lucide-react-native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Animated,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  TouchableOpacity,
} from "react-native";

type TOption = {
  label: string;
  extraText?: string;
  iconName: keyof typeof icons;
  action: () => void;
  renderSwitch?: boolean;
  value?: boolean;
  isDisabled?: boolean;
  badge?: string;
  color?: string;
};

type TSection = {
  title: string;
  options: TOption[];
  id?: string;
  hide?: boolean;
};

const NotificationSettingsScreen = () => {
  const theme = useTheme();
  const { expoPushToken, error } = useNotification();
  const notificationService = useNotificationService();
  const styles = getStyles(theme);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedHour, setSelectedHour] = useState("08");
  const [selectedMinute, setSelectedMinute] = useState("00");
  const [isScheduling] = useState(false);

  const user = use$(() => storedData$.user.get()) || null;
  const isAdmin = user?.isAdmin;

  const notificationPreferences = use$(() => {
    const preferences = storedData$.notificationPreferences.get();
    const defaultPreferences = {
      notificationEnabled: true,
      dailyVerseEnabled: false,
      dailyVerseTime: "08:00",
      devotionalReminder: false,
      memorizationReminder: false,
      pushToken: null,
    };
    return {
      ...defaultPreferences,
      ...preferences,
    };
  });

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const preferences = notificationService.getNotificationPreferences();
      const [h, m] = preferences?.dailyVerseTime?.split(":") || ["08", "00"];
      setSelectedHour(h);
      setSelectedMinute(m);
    } catch (error) {
      console.error("Error loading preferences:", error);
    }
  };

  const savePreferences = async (
    newPrefs: Partial<NotificationPreferences>
  ) => {
    try {
      await notificationService.updateNotificationSettings(newPrefs);
    } catch (error) {
      console.error("Error saving preferences:", error);
      Alert.alert("Error", "No se pudieron guardar las preferencias.");
    }
  };

  const updateTime = () => {
    const timeStr = `${selectedHour}:${selectedMinute}`;
    setModalVisible(false);
    savePreferences({ dailyVerseTime: timeStr });
  };

  const testNotification = async () => {
    await notificationService.sendTestNotification();
  };

  const testNotificationSchedule = async () => {
    const now = new Date();
    const oneMinuteFromNow = new Date(now.getTime() + 60000);
    await notificationService.scheduleAlarm(oneMinuteFromNow, "Test", "Test");
  };

  const handleNotificationEnabled = async () => {
    if (!notificationPreferences.notificationEnabled) {
      const hasPermission = await notificationService.requestPermissions();
      if (!hasPermission) return;
    }
    savePreferences({
      notificationEnabled: !notificationPreferences.notificationEnabled,
    });
  };

  const handleDevotionalReminder = () => {
    savePreferences({
      devotionalReminder: !notificationPreferences.devotionalReminder,
    });
  };

  const handleMemorizationReminder = () => {
    savePreferences({
      memorizationReminder: !notificationPreferences.memorizationReminder,
    });
  };

  const handleDailyVerseEnabled = async () => {
    if (!notificationPreferences.dailyVerseEnabled) {
      const hasPermission = await notificationService.requestPermissions();
      if (!hasPermission) return;
    }
    savePreferences({
      dailyVerseEnabled: !notificationPreferences.dailyVerseEnabled,
    });
  };

  const sections: TSection[] = useMemo(() => {
    return [
      {
        title: "Notificaciones Generales",
        id: "general",
        options: [
          {
            label: "Habilitar Notificaciones",
            extraText: "Habilita notificaciones en la aplicación",
            iconName: "Bell" as keyof typeof icons,
            action: handleNotificationEnabled,
            renderSwitch: true,
            value: notificationPreferences.notificationEnabled,
            color: theme.colors.notification,
          },
        ],
      },
      {
        title: "Notificaciones Diarias",
        id: "daily",
        options: [
          {
            label: "Versículo del Día",
            extraText: "Recibe un versículo inspirador cada día",
            iconName: "BookOpen" as keyof typeof icons,
            action: handleDailyVerseEnabled,
            renderSwitch: true,
            value: notificationPreferences.dailyVerseEnabled,
            color: theme.colors.notification,
          },
          ...(notificationPreferences.dailyVerseEnabled
            ? [
                {
                  label: "Hora de Notificación",
                  extraText: "Configura cuándo recibir el versículo diario",
                  iconName: "Clock" as keyof typeof icons,
                  action: () => setModalVisible(true),
                  badge: notificationPreferences.dailyVerseTime,
                  color: theme.colors.notification,
                },
              ]
            : []),
        ],
        hide: !notificationPreferences.notificationEnabled,
      },
      {
        title: "Recordatorios",
        id: "reminders",
        options: [
          {
            label: "Recordatorio Devocional",
            extraText: "Momentos de reflexión y oración diaria",
            iconName: "Heart" as keyof typeof icons,
            action: handleDevotionalReminder,
            renderSwitch: true,
            value: notificationPreferences.devotionalReminder,
            color: theme.colors.notification,
          },
          {
            label: "Recordatorio de Memorización",
            extraText: "Practica y memoriza versículos bíblicos",
            iconName: "Brain" as keyof typeof icons,
            action: handleMemorizationReminder,
            renderSwitch: true,
            value: notificationPreferences.memorizationReminder,
            color: theme.colors.notification,
          },
        ],
        hide: !notificationPreferences.notificationEnabled,
      },
      {
        title: "Configuración",
        id: "settings",
        options: [
          {
            label: "Probar Notificación",
            extraText: "Envía una notificación de prueba",
            iconName: "Send" as keyof typeof icons,
            // iconName: "Send",
            action: testNotification,
            color: "gold",
          },
          {
            label: "Permisos de Notificación",
            extraText: "Verificar y solicitar permisos",
            iconName: "Shield" as keyof typeof icons,
            action: async () => await notificationService.requestPermissions(),
            color: theme.colors.text,
          },
        ],
        hide: !notificationPreferences.notificationEnabled,
      },
      {
        title: "Información de Debug",
        id: "debug",
        options: [
          {
            label: "Probar Notificación Programada",
            extraText: "Envía una notificación de prueba programada",
            iconName: "ConciergeBell" as keyof typeof icons,
            action: testNotificationSchedule,
            color: "gold",
          },
          {
            label: "Estado de Notificaciones",
            extraText: notificationService.error
              ? JSON.stringify(notificationService.error)
              : "Sin errores",
            // extraText: error ? "Hay errores" : "Sin errores",
            iconName: "Bell" as keyof typeof icons,
            action: () => {
              if (notificationService.error) {
                try {
                  Alert.alert(
                    "Error",
                    JSON.stringify(notificationService.error, null, 2)
                  );
                } catch (error) {
                  console.log(error);
                }
              }
            },
            color: notificationService.error
              ? "red"
              : theme.colors.notification,
          },
          {
            label: "Token Push",
            extraText: `Token: ${expoPushToken}`,
            // extraText: expoPushToken ? "Token configurado" : "No disponible",
            iconName: "Key" as keyof typeof icons,
            action: () => {
              if (expoPushToken) {
                Alert.alert("Token Push", JSON.stringify(expoPushToken));
              }
            },
            color: expoPushToken
              ? theme.colors.notification
              : theme.colors.text,
          },
          {
            label: "Estado de Error",
            extraText: error ? JSON.stringify(error) : "Sin errores",
            // extraText: error ? "Hay errores" : "Sin errores",
            iconName: "BadgeAlert" as keyof typeof icons,
            action: () => {
              if (error) {
                Alert.alert("Error", JSON.stringify(error));
              }
            },
            color: error ? "red" : theme.colors.notification,
          },
        ],
        hide: !IS_DEV && !isAdmin,
      },
    ].filter((section) => !section.hide);
  }, [notificationPreferences, isAdmin]);

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
            <Text style={styles.listHistoryLabel}>
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
            ) : isScheduling && item.iconName === "Clock" ? (
              <Animated.View style={{}}>
                <Icon
                  size={26}
                  name="Loader"
                  color={item.color || theme.colors.text}
                />
              </Animated.View>
            ) : (
              <Icon
                size={26}
                name={item.iconName as any}
                color={item.color || theme.colors.text}
              />
            )}
          </View>
        </TouchableOpacity>
      );
    },
    [styles, theme, isScheduling]
  );

  const SettingSection = useCallback(
    ({ title, options, id }: TSection, index: number) => {
      if (options.length === 0) return null;

      return (
        <Animated.View style={[styles.sectionContainer]} key={id || index}>
          <Text style={styles.sectionTitle}>{title}</Text>
          {options.map((item, itemIndex) => (
            <SettingItem key={`${id}-${itemIndex}`} item={item} />
          ))}
        </Animated.View>
      );
    },
    [SettingItem, styles]
  );

  return (
    <ScreenWithAnimation duration={800} icon="Bell" title="Notificaciones">
      <ScrollView style={styles.container}>
        <Stack.Screen
          options={{
            ...singleScreenHeader({
              theme,
              title: "Notificaciones",
              titleIcon: "Bell",
              headerRightProps: {
                headerRightIcon: "Settings",
                headerRightIconColor: theme.colors.notification,
                onPress: () => {},
                disabled: true,
                style: { opacity: 0 },
              },
            }),
          }}
        />

        {sections.map(SettingSection)}
        {/* {(isAdmin || IS_DEV) && <DatabaseDebug />} */}

        {/* Time Picker Modal */}
        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Selecciona la hora</Text>

              <View style={styles.pickerContainer}>
                <View style={styles.pickerSection}>
                  <Text style={styles.pickerLabel}>Hora</Text>
                  <Picker
                    selectedValue={selectedHour}
                    style={styles.picker}
                    onValueChange={(itemValue) => setSelectedHour(itemValue)}
                    dropdownIconColor={theme.colors.text}
                    mode="dropdown"
                  >
                    {Array.from({ length: 24 }).map((_, i) => {
                      const val = String(i).padStart(2, "0");
                      return (
                        <Picker.Item
                          style={{
                            backgroundColor: theme.colors.background,
                            color: theme.colors.text,
                          }}
                          key={val}
                          label={val}
                          value={val}
                        />
                      );
                    })}
                  </Picker>
                </View>

                <View style={styles.pickerSection}>
                  <Text style={styles.pickerLabel}>Minutos</Text>
                  <Picker
                    selectedValue={selectedMinute}
                    style={styles.picker}
                    onValueChange={(itemValue) => setSelectedMinute(itemValue)}
                    dropdownIconColor={theme.colors.text}
                    mode="dropdown"
                  >
                    {Array.from({ length: 60 }).map((_, i) => {
                      const val = String(i).padStart(2, "0");
                      return (
                        <Picker.Item
                          style={{
                            backgroundColor: theme.colors.background,
                            color: theme.colors.text,
                          }}
                          key={val}
                          label={val}
                          value={val}
                        />
                      );
                    })}
                  </Picker>
                </View>
              </View>

              <View style={styles.modalButtons}>
                <Pressable
                  onPress={() => setModalVisible(false)}
                  style={styles.cancelButton}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </Pressable>
                <Pressable onPress={updateTime} style={styles.saveButton}>
                  <Text style={styles.saveButtonText}>Guardar</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </ScreenWithAnimation>
  );
};

const getStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.dark
        ? theme.colors.background
        : theme.colors.text + "20",
    },
    sectionContainer: {
      padding: 15,
      alignItems: "center",
      justifyContent: "flex-start",
      backgroundColor: theme.dark
        ? theme.colors.background
        : theme.colors.text + "20",
    },
    sectionTitle: {
      color: theme.colors.notification,
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
      borderColor: theme.colors.text + "70",
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
      backgroundColor: theme.colors.text + "20",
      maxHeight: 90,
    },
    listHistoryLabel: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.colors.text,
    },
    itemDate: {
      fontSize: 12,
      color: theme.dark ? "#ffffff" : "#000000",
      marginTop: 4,
      opacity: 0.7,
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
      backgroundColor: theme.colors.notification,
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
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
    },
    modalContent: {
      backgroundColor: theme.colors.background,
      marginHorizontal: 20,
      borderRadius: 20,
      padding: 24,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 10,
      },
      shadowOpacity: 0.3,
      shadowRadius: 20,
      elevation: 10,
      minWidth: "90%",
      borderColor: theme.colors.text + "70",
      borderWidth: 1,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: "600",
      color: theme.colors.text,
      textAlign: "center",
      marginBottom: 24,
    },
    pickerContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 24,
    },
    pickerSection: {
      flex: 1,
      marginHorizontal: 8,
    },
    pickerLabel: {
      fontSize: 16,
      fontWeight: "500",
      color: theme.colors.text,
      textAlign: "center",
      marginBottom: 8,
    },
    picker: {
      backgroundColor: theme.colors.text + "30",
      borderRadius: 10,
    },
    modalButtons: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    cancelButton: {
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 8,
      backgroundColor: theme.colors.text + "20",
      borderColor: theme.colors.text + "70",
      borderWidth: 1,
    },
    cancelButtonText: {
      color: theme.colors.text,
      fontSize: 16,
      fontWeight: "500",
    },
    saveButton: {
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 8,
      backgroundColor: theme.colors.notification,
    },
    saveButtonText: {
      color: "#ffffff",
      fontSize: 16,
      fontWeight: "600",
    },
  });

export default NotificationSettingsScreen;
