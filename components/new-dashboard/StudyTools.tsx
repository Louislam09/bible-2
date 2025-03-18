import { IDashboardOption } from "@/app/(dashboard)";
import { TTheme } from "@/types";
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import Icon from "../Icon";
import { NewFeatureBadge } from "../NewFeatureBadge";

type StudyToolsProps = {
  list: IDashboardOption[];
  theme: TTheme;
};

const StudyTools = ({ list, theme }: StudyToolsProps) => {
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const columnNumber = 2;
  const itemWidth = SCREEN_WIDTH / columnNumber - 35;
  const styles = getStyles(theme);

  return (
    <View style={styles.studyTools}>
      <Text style={styles.sectionTitle}>Herramientas de Estudio</Text>
      <View style={styles.toolsContainer}>
        {list.map((item) => (
          <TouchableOpacity
            key={item.tag + item.label}
            onPress={item.action}
            onLongPress={
              item.longAction
                ? item.longAction
                : () => console.log("no long action")
            }
            style={[styles.tool, { width: itemWidth }, item.disabled && { display: 'none' }]}
            disabled={item.disabled}
          >
            {item.isNew && (
              <NewFeatureBadge title="Disponible" style={{ backgroundColor: "#f73043",  borderColor: theme.colors.background, borderWidth: 2 }} />
            )}
            <Icon
              size={24}
              name={item.icon as any}
              color={item.color}
              style={[styles.toolIcon]}
            />
            <Text style={styles.toolText}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default StudyTools;

const getStyles = ({ colors, dark }: TTheme) =>
  StyleSheet.create({
    studyTools: {
      backgroundColor: colors.text + 20,
      padding: 16,
      borderRadius: 16,
      marginBottom: 16,
    },
    sectionTitle: {
      color: colors.notification,
      fontSize: 20,
      marginBottom: 12,
      fontWeight: "bold",
    },
    toolsContainer: {
      display: "flex",
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
    },
    tool: {
      backgroundColor: colors.text + 30,
      marginVertical: 4,
      padding: 12,
      borderRadius: 8,
      flexDirection: "row",
      alignItems: "center",
    },
    toolIcon: {
      marginRight: 8,
      color: dark ? "#fff" : colors.text,
    },
    toolText: {
      color: dark ? "#fff" : colors.text,
    },
  });
