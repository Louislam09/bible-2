import DecoratorLine from "@/components/DecoratorLine";
import Icon from "@/components/Icon";
import { iconSize } from "@/constants/size";
import { useDBContext } from "@/context/databaseContext";
import { storedData$ } from "@/context/LocalstoreContext";
import { TTheme } from "@/types";
import React, { FC } from "react";
import { Platform, StyleSheet, TouchableOpacity } from "react-native";
import { Text, View } from "../../Themed";

interface IVersionList {
  currentBibleVersion: string;
  onSelect: Function;
  theme: TTheme;
}

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
              <Text style={[styles.versionText, {}]}>
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
      backgroundColor: colors.notification + "99",
      fontWeight: "bold",
      borderRadius: 10,
      marginBottom: 10,
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
      paddingVertical: 10,
      paddingLeft: 10,
      alignItems: "center",
      backgroundColor: colors.background + "80",
      borderLeftColor: colors.primary,
      borderLeftWidth: 3,
      borderRadius: 10,
    },
    icon: {
      fontWeight: "700",
      marginHorizontal: 10,
      color: colors.notification + "90",
      fontSize: 28,
    },
    versionText: {
      color: colors.text,
      fontWeight: "600",
    },
  });

export default VersionList;
