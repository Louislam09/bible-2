import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "@react-navigation/native";
import { NativeStackHeaderProps } from "@react-navigation/native-stack";
import { Text, View } from "components/Themed";
import { useBibleContext } from "context/BibleContext";
import Checkbox from "expo-checkbox";
import useDebounce from "hooks/useDebounce";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet, TextInput, TouchableOpacity } from "react-native";
import { TTheme } from "types";
import removeAccent from "utils/removeAccent";

const SearchHeader: React.FC<NativeStackHeaderProps> = ({ navigation }) => {
  const theme = useTheme();
  const textInputRef = useRef<TextInput>(null);
  const styles = getStyles(theme);
  const {
    performSearch,
    setSearchQuery,
    searchQuery,
    toggleCopySearch,
    isSearchCopy,
  } = useBibleContext();

  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 500);

  const onCheckbox = (value: boolean) => {
    toggleCopySearch(value);
  };

  const handelSearch = async (query: string) => {
    setQuery(removeAccent(query));
    setSearchQuery(query);
  };

  const [abortController, setAbortController] =
    useState<AbortController | null>(null);

  useEffect(() => {
    if (debouncedQuery) {
      handleSearch();
    }
  }, [debouncedQuery]);

  const handleSearch = useCallback(() => {
    if (abortController) {
      abortController.abort();
    }

    const newAbortController = new AbortController();
    setAbortController(newAbortController);

    if (debouncedQuery.length < 3) return;
    performSearch(debouncedQuery, newAbortController);
  }, [debouncedQuery, performSearch]);

  const clearText = () => {
    textInputRef.current?.clear();
  };

  return (
    <View>
      <View style={styles.container}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons style={styles.icon} name="arrow-back" size={24} />
        </TouchableOpacity>
        <TextInput
          ref={textInputRef}
          placeholder="Buscar"
          style={styles.saerchInput}
          placeholderTextColor={theme.colors.text}
          onChangeText={handelSearch}
          defaultValue={searchQuery ?? ""}
          clearButtonMode="always"
        />
        {query !== "" && (
          <TouchableOpacity onPress={clearText} style={{ padding: 5 }}>
            <Ionicons
              style={{ color: theme.colors.text }}
              name="close-circle-outline"
              size={20}
              color="gray"
            />
          </TouchableOpacity>
        )}
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
