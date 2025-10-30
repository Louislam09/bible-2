import { useMyTheme } from "@/context/ThemeContext";
import { TTheme } from "@/types";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type SortProps = {
  onSelect: (sort: any) => void;
  value: any;
  title: string;
  description?: string;
  options: any[];
  buttonText: string;
  noButton?: boolean;
};

const FilterList = ({
  onSelect,
  value,
  title,
  description,
  options,
  buttonText,
  noButton,
}: SortProps) => {
  const { theme } = useMyTheme();
  const styles = getStyles(theme);
  const [selectedSort, setSelectedSort] = useState<any>(value);

  const onOptionPress = (option: any) => {
    setSelectedSort(option);
    if (noButton) {
      onSelect(option);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title || "Ordenar lista de memoria"}</Text>
      <Text style={styles.subtitle}>
        {description || "¿Cómo te gustaría ordenar tus pasajes?"}
      </Text>

      {options.map((option) => (
        <TouchableOpacity
          key={option}
          style={styles.option}
          onPress={() => onOptionPress(option)}
        >
          <View style={styles.radioCircle}>
            {selectedSort === option && <View style={styles.selectedCircle} />}
          </View>
          <Text style={styles.optionText}>{option}</Text>
        </TouchableOpacity>
      ))}

      {!noButton && (
        <TouchableOpacity
          style={styles.sortButton}
          onPress={() => {
            onSelect(selectedSort);
          }}
        >
          <Text style={styles.sortButtonText}>{buttonText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const getStyles = ({ colors, dark }: TTheme) =>
  StyleSheet.create({
    container: {
      backgroundColor: "transparent",
      padding: 20,
      paddingTop: 10,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
    },
    title: {
      textAlign: "center",
      color: colors.text,
      fontSize: 20,
      fontWeight: "bold",
    },
    subtitle: {
      textAlign: "center",
      color: colors.text,
      fontSize: 16,
      marginBottom: 16,
      opacity: 0.8,
    },
    option: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
    },
    radioCircle: {
      width: 22,
      height: 22,
      borderRadius: 11,
      borderWidth: 2,
      borderColor: colors.notification,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 10,
    },
    selectedCircle: {
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: colors.notification,
    },
    optionText: {
      color: colors.text,
      fontSize: 16,
    },
    sortButton: {
      backgroundColor: colors.notification,
      borderRadius: 12,
      paddingVertical: 12,
      alignItems: "center",
      marginTop: 20,
    },
    sortButtonText: {
      color: dark ? "#fff" : "#fff",
      fontSize: 16,
      fontWeight: "bold",
      textTransform: "uppercase",
    },
  });

export default FilterList;
