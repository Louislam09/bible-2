import DecoratorLine from "@/components/DecoratorLine";
import Icon from "@/components/Icon";
import { iconSize } from "@/constants/size";
import { useDBContext } from "@/context/databaseContext";
import { storedData$ } from "@/context/LocalstoreContext";
import { DBName } from "@/enums";
import { deleteDatabaseFile } from "@/hooks/useDatabase";
import { EBibleVersions, TTheme } from "@/types";
import React, { FC } from "react";
import { Platform, StyleSheet, TouchableOpacity } from "react-native";
import { Text, View } from "../../Themed";

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
  const fontSize = storedData$.fontSize.get();

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
        <View
          key={version.path}
          style={{
            flexDirection: "row",
            marginVertical: 5,
            backgroundColor: "transparent",
          }}
        >
          <DecoratorLine theme={theme} />
          <TouchableOpacity
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
              <Icon
                style={[styles.icon]}
                size={iconSize}
                name="Check"
                color={theme.colors.notification}
              />
            )}
          </TouchableOpacity>
        </View>
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
      backgroundColor: dark ? colors.background : "white",
      borderWidth: dark ? 1 : 0,
      shadowColor: colors.notification,
      shadowOpacity: 1,
      shadowRadius: 10,
      borderRadius: 10,
      alignItems: "center",
      borderTopLeftRadius: 0,
      borderBottomLeftRadius: 0,
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
