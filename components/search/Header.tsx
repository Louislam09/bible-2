import React, { useEffect, useState } from "react";
import {
  Text,
  TouchableOpacity,
  TextInput,
  TextStyle,
  ViewStyle,
  StyleSheet,
  Pressable,
  Button,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackHeaderProps } from "@react-navigation/native-stack";
import { TTheme } from "types";
import { useTheme } from "@react-navigation/native";
import { View } from "components/Themed";
import { useBibleContext } from "context/BibleContext";

const CustomHeader: React.FC<NativeStackHeaderProps> = ({ navigation }) => {
  const theme = useTheme();
  const styles = getStyles(theme);
  const { performSearch } = useBibleContext();
  const [query, setQuery] = useState("");

  const handelSearch = async (query: string) => {
    setQuery(query);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Ionicons style={styles.icon} name="arrow-back" size={24} />
      </TouchableOpacity>
      <TextInput
        placeholder="Buscar"
        style={styles.saerchInput}
        placeholderTextColor={theme.colors.text}
        onChangeText={handelSearch}
      />
      <TouchableOpacity
        onPress={() => performSearch(query)}
        style={{ backgroundColor: theme.colors.border, padding: 10 }}
      >
        <Text style={{ color: theme.colors?.text }}>Buscar</Text>
      </TouchableOpacity>
    </View>
  );
};

const getStyles = ({ colors }: TTheme) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      padding: 10,
      height: 70,
      backgroundColor: colors.background,
    },
    saerchInput: {
      flex: 1,
      fontSize: 22,
      borderBottomColor: colors.border,
      borderBottomWidth: 1,
      borderStyle: "solid",
      color: colors.text,
      paddingVertical: 5,
    },
    icon: {
      color: colors.text,
      marginRight: 30,
    },
  });

export default CustomHeader;
