import React, { useState, useRef } from "react";
import { Animated, Easing, TouchableOpacity, StyleSheet } from "react-native";
import Icon from "./Icon";
import { useStorage } from "@/context/LocalstoreContext";
import { TTheme } from "@/types";
import { useTheme } from "@react-navigation/native";

const CloudSyncFloatingButton: React.FC = () => {
  const { syncWithCloud, hasPendingCloudSync } = useStorage();
  const [loading, setLoading] = useState(false);
  const spinAnim = useRef(new Animated.Value(0)).current;
  const theme = useTheme();
  const styles = getStyles(theme);
  if (!hasPendingCloudSync) return null;

  if (loading) {
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  } else {
    spinAnim.stopAnimation();
    spinAnim.setValue(0);
  }

  const handleSync = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await syncWithCloud();
    } finally {
      setLoading(false);
    }
  };

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <TouchableOpacity
      style={styles.fab}
      onPress={handleSync}
      disabled={loading}
      activeOpacity={0.7}
    >
      <Animated.View style={{ transform: [{ rotate: spin }] }}>
        <Icon name={loading ? "Loader" : "CloudUpload"} color={'#fff'} size={32} />
      </Animated.View>
    </TouchableOpacity>
  );
};

const getStyles = ({ colors }: TTheme) =>

   StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 32,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.notification,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    zIndex: 9999,
  },
});

export default CloudSyncFloatingButton;
