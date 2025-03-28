import { pbUser, TTheme } from "@/types";
import { User } from "lucide-react-native";
import React from "react";
import { Image, StyleSheet } from "react-native";
import { Text, View } from "./Themed";
import { POCKETBASE_URL } from "@/globalConfig";
import { useTheme } from "@react-navigation/native";

interface ProfileCardProps {
  user: pbUser;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ user }) => {
  const nameInfo = user.name.split(" ");
  const firstName = nameInfo[0];
  const lastName = nameInfo[1];
  const theme = useTheme();
  const styles = getStyles(theme);

  return (
    <View style={styles.userInfoContainer}>
      <View style={styles.avatarContainer}>
        {user.avatar ? (
          <Image
            source={{
              uri: `${POCKETBASE_URL}/api/files/${user.collectionId}/${user.id}/${user.avatar}`,
            }}
            style={styles.avatar}
            resizeMode="cover"
          />
        ) : (
          <User color="gray" size={40} />
        )}
      </View>
      <View style={{ display: "none" }}>
        <Text style={styles.userName}>{user.name}</Text>
        <Text style={styles.userEmail}>{user.email}</Text>
      </View>
    </View>
  );
};

const getStyles = ({ colors }: TTheme) =>
  StyleSheet.create({
    userInfoContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 24,
    },
    avatarContainer: {
      width: 50,
      height: 50,
      borderRadius: 32,
      backgroundColor: colors.background, // bg-gray-700
      alignItems: "center",
      justifyContent: "center",
      marginRight: 16,

      borderWidth: 2,
      borderColor: colors.text + 30,
      //   borderColor: colors.background,
    },
    avatar: {
      width: "100%",
      height: "100%",
      borderRadius: 32,
    },
    userName: {
      fontSize: 18,
      fontWeight: "600",
      color: "white",
    },
    userEmail: {
      fontSize: 14,
      color: "#9ca3af", // text-gray-400
    },
  });

export default ProfileCard;
