import { Text, View } from "@/components/Themed";
import { TTheme } from "@/types";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";

type NoteHeader = {}

const NoteHeader: React.FC<NoteHeader> = () => {
  const router = useRouter();
  const theme = useTheme();
  const styles = getStyles(theme);

  const onAction = () => { console.log('action') }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()}>
        <Ionicons style={styles.icon} name="arrow-back" size={24} />
      </TouchableOpacity>

      <TouchableOpacity onPress={onAction} style={{ padding: 5, alignItems: 'center' }}>
        <Text>Exportar notas</Text>
      </TouchableOpacity>
    </View>
  );
};

const getStyles = ({ colors }: TTheme) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: 'space-between',
      padding: 10,
      backgroundColor: colors.background,
    },
    icon: {
      color: colors.text,
      marginRight: 30,
    },
  });

export default NoteHeader;
