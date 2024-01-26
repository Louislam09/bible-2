import { useTheme } from "@react-navigation/native";
import React, { FC } from "react";
import { Platform, StyleSheet, TouchableOpacity } from "react-native";
import { EBibleVersions, TTheme } from "types";
import { Text, View } from "../../Themed";
import { deleteDatabaseFile } from "hooks/useDatabase";
import { DBName } from "enums";

interface IVersionList {
  currentBibleVersion: string;
  onSelect: Function;
  theme: TTheme;
}

const versionNames: any = {
  [EBibleVersions.NTV]: "Nueva Traduccion Viviente 2009",
  [EBibleVersions.RVR60]: "Reina Valera 1960",
};

const onLongPress = (version: any) => {
  deleteDatabaseFile(
    version === EBibleVersions.RVR60 ? DBName.BIBLE : DBName.NTV
  );
};

const VersionList: FC<IVersionList> = ({
  currentBibleVersion,
  onSelect,
  theme,
}) => {
  const styles = getStyles(theme);

  return (
    <View style={[styles.versionContainer]}>
      <Text style={styles.title}>Versiones</Text>
      {(Object.values(EBibleVersions) as string[]).map((version) => (
        <TouchableOpacity
          key={version}
          style={[
            styles.card,
            ,
            currentBibleVersion === version && {
              borderColor: theme.colors.notification,
              borderWidth: 1,
            },
          ]}
          onPress={() => onSelect(version)}
          // onLongPress={() => onLongPress(version)}
        >
          <Text
            style={[
              styles.versionText,
              ,
              currentBibleVersion === version && {
                color: theme.colors.notification,
              },
            ]}
          >
            {versionNames[version]}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const getStyles = ({ colors }: TTheme) =>
  StyleSheet.create({
    title: {
      color: "white",
      fontSize: 20,
      padding: 5,
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
      width: "90%",
      backgroundColor: "white",
      borderRadius: 8,
      padding: 5,
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
    versionText: {
      color: colors.text,
      fontSize: 22,
      textAlign: "center",
    },
  });

export default VersionList;
