import { useTheme } from "@react-navigation/native";
import React, { FC } from "react";
import { Platform, StyleSheet, TouchableOpacity } from "react-native";
import { EBibleVersions, TTheme } from "types";
import { Text, View } from "../../Themed";
import { deleteDatabaseFile } from "hooks/useDatabase";
import { DBName } from "enums";
import { useDBContext } from "context/databaseContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useStorage } from "context/LocalstoreContext";
import { iconSize } from "constants/size";

interface IVersionList {
  currentBibleVersion: string;
  onSelect: Function;
  theme: TTheme;
}

const onLongPress = (version: any) => {
  deleteDatabaseFile(
    version === EBibleVersions.BIBLE ? DBName.BIBLE : DBName.NTV
  );
};

const VersionList: FC<IVersionList> = ({
  currentBibleVersion,
  onSelect,
  theme,
}) => {
  const styles = getStyles(theme);
  const { installedBibles } = useDBContext();
  const {
    storedData: { fontSize },
  } = useStorage();

  const dbNameList = installedBibles || [];

  return (
    <View style={[styles.versionContainer]}>
      <Text
        style={[
          styles.title,
          {
            textTransform: "capitalize",
            paddingVertical: 5,
            fontWeight: "bold",
          },
        ]}
      >
        Versiones Disponibles
      </Text>
      {dbNameList.map((version) => (
        <TouchableOpacity
          key={version.path}
          style={[styles.card]}
          onPress={() => onSelect(version.id)}
        >
          <View style={{ backgroundColor: "transparent", flex: 1 }}>
            <Text
              style={[
                styles.versionText,
                { color: theme.colors.notification, fontSize },
              ]}
            >
              {version.shortName}
            </Text>
            <Text style={[styles.versionText, { fontSize }]}>
              {version.name}
            </Text>
          </View>
          {currentBibleVersion === version.id && (
            <MaterialCommunityIcons
              style={[
                styles.icon,
                { color: theme.colors.notification, fontSize: iconSize },
              ]}
              name="check"
              color={theme.colors.notification}
            />
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
};

const getStyles = ({ colors, dark }: TTheme) =>
  StyleSheet.create({
    title: {
      color: "white",
      fontSize: 20,
      padding: 0,
      width: "90%",
      textAlign: "center",
      backgroundColor: colors.notification,
    },
    versionContainer: {
      position: "relative",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 25,
      borderRadius: 45,
      backgroundColor: "transparent",
    },
    card: {
      display: "flex",
      flexDirection: "row",
      width: "90%",
      padding: 5,
      marginVertical: 5,
      elevation: 5,
      ...Platform.select({
        ios: {
          shadowColor: "black",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
        },
      }),
      paddingVertical: 10,
      paddingLeft: 10,
      borderColor: colors.notification + "50",
      backgroundColor: colors.background,
      borderWidth: dark ? 1 : 0,
      shadowColor: colors.notification,
      shadowOpacity: 1,
      shadowRadius: 10,
      borderRadius: 10,
      alignItems: "center",
    },
    icon: {
      fontWeight: "700",
      marginHorizontal: 10,
      color: colors.notification + "90",
      fontSize: 28,
    },
    versionText: {
      color: colors.text,
    },
  });

export default VersionList;
