import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import { NativeStackHeaderProps } from "@react-navigation/native-stack";
import { Text, View } from "components/Themed";
import { useBibleContext } from "context/BibleContext";
import Checkbox from "expo-checkbox";
import React, { useEffect, useState } from "react";
import { StyleSheet, TextInput, TouchableOpacity } from "react-native";
import { TTheme } from "types";
import removeAccent from "utils/removeAccent";

const SearchHeader: React.FC<NativeStackHeaderProps> = ({ navigation }) => {
  const theme = useTheme();
  const styles = getStyles(theme);
  const {
    performSearch,
    setSearchQuery,
    searchQuery,
    toggleCopySearch,
    isSearchCopy,
  } = useBibleContext();

  const [query, setQuery] = useState("");

  const onCheckbox = (value: boolean) => {
    toggleCopySearch(value);
  };

  const handelSearch = async (query: string) => {
    setQuery(removeAccent(query));
    setSearchQuery(query);
  };

  useEffect(() => {
    if (!searchQuery) return;
    const abortController = new AbortController();
    (async () => {
      await performSearch(searchQuery ?? "", abortController);
    })();
    return () => abortController.abort();
  }, []);

  useEffect(() => {
    if (!query) return;
    const abortController = new AbortController();

    (async () => {
      await performSearch(query, abortController);
    })();

    return () => abortController.abort();
  }, [query]);

  return (
    <View>
      <View style={styles.container}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons style={styles.icon} name="arrow-back" size={24} />
        </TouchableOpacity>
        <TextInput
          placeholder="Buscar"
          style={styles.saerchInput}
          placeholderTextColor={theme.colors.text}
          onChangeText={handelSearch}
          defaultValue={searchQuery ?? ""}
        />
      </View>
      <View style={styles.checkboxContainer}>
        <View style={styles.checkboxItem}>
          <Checkbox
            style={{ margin: 8 }}
            value={isSearchCopy}
            onValueChange={() => onCheckbox(true)}
            color={isSearchCopy ? theme.colors.notification : undefined}
          />
          <Text>Copy</Text>
        </View>
        <View style={styles.checkboxItem}>
          <Checkbox
            style={{ margin: 8 }}
            value={!isSearchCopy}
            onValueChange={() => onCheckbox(false)}
            color={!isSearchCopy ? theme.colors.notification : undefined}
          />
          <Text>Ir</Text>
        </View>
      </View>
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
    checkboxContainer: {
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
    },
    checkboxItem: {
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
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
