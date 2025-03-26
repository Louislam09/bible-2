// app/set-password.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import { TTheme } from '@/types';
import SetPasswordScreen from '@/components/SetPasswordScreen';

export default function SetPasswordPage() {
  const router = useRouter();
  const theme = useTheme();
  const styles = getStyles(theme as TTheme);

  const handleSuccess = () => {
    // Navigate back to home or settings page after successful password set
    router.back();
  };

  const handleCancel = () => {
    // Go back to previous screen
    router.back();
  };

  return (
    <View style={styles.container}>
      <SetPasswordScreen 
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </View>
  );
}

const getStyles = ({ colors, dark }: TTheme) => StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: colors.background
  },
});
