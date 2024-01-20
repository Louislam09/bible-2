import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import { NativeStackHeaderProps } from "@react-navigation/native-stack";
import { View } from "components/Themed";
import { useBibleContext } from "context/BibleContext";
import React, { useEffect, useState } from "react";
import { StyleSheet, TextInput, TouchableOpacity } from "react-native";
import { TTheme } from "types";

const SearchHeader: React.FC<NativeStackHeaderProps> = ({ navigation }) => {
  const theme = useTheme();
  const styles = getStyles(theme);
  const { performSearch, setSearchQuery } = useBibleContext();
  const [query, setQuery] = useState("");

  const handelSearch = async (query: string) => {
    console.log({ query });
    setQuery(query);
    setSearchQuery(query);
  };

  useEffect(() => {
    if (!query) return;
    const abortController = new AbortController();

    (async () => {
      await performSearch(query, abortController);
    })();

    return () => abortController.abort();
  }, [query]);

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
      borderBottomColor: colors.notification,
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

export default SearchHeader;
