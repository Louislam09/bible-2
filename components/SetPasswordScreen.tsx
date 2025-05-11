// components/SetPasswordScreen.tsx
import { TTheme } from '@/types';
import { useTheme } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { pb, setUserPassword } from '../globalConfig';

interface SetPasswordScreenProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const SetPasswordScreen: React.FC<SetPasswordScreenProps> = ({
  onSuccess,
  onCancel
}) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const theme = useTheme();
  const styles = getStyles(theme as TTheme);

  const handleSetPassword = async () => {
    try {
      setLoading(true);

      // Validate passwords
      if (!newPassword || newPassword.length < 8) {
        Alert.alert('Password Error', 'Password must be at least 8 characters long.');
        return;
      }

      if (newPassword !== confirmPassword) {
        Alert.alert('Password Error', 'Passwords do not match.');
        return;
      }

      // Check if user is authenticated
      if (!pb.authStore.isValid) {
        Alert.alert('Authentication Error', 'You must be logged in to set a password.');
        return;
      }

      // Set the user's password
      const userId = pb.authStore.record?.id;
      if (!userId) {
        Alert.alert('Error', 'User ID not found.');
        return;
      }

      const success = await setUserPassword(userId, newPassword);

      if (success) {
        Alert.alert(
          'Success',
          'Your password has been set. You can now log in with your email and password.',
          [
            {
              text: 'OK',
              onPress: () => {
                if (onSuccess) {
                  onSuccess();
                }
              }
            }
          ]
        );
      } else {
        Alert.alert('Error', 'Failed to set password. Please try again.');
      }
    } catch (error: any) {
      console.error('Set password error:', error);
      Alert.alert('Error', 'Failed to set password: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Set Your Password</Text>
      <Text style={styles.description}>
        Setting a password will allow you to log in with your email and password in addition to Google authentication.
      </Text>

      <TextInput
        style={styles.input}
        placeholder="New Password"
        placeholderTextColor={theme.colors.text}
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry
      />

      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        placeholderTextColor={theme.colors.text}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.disabledButton]}
        onPress={handleSetPassword}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Setting Password...' : 'Set Password'}
        </Text>
      </TouchableOpacity>

      {onCancel && (
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={onCancel}
          disabled={loading}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const getStyles = ({ colors, dark }: TTheme) => StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: colors.background,
    borderRadius: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: colors.primary
  },
  description: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
    color: colors.text
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 15,
    marginBottom: 15,
    borderColor: colors.border,
    color: colors.text,
    backgroundColor: colors.card
  },
  button: {
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    backgroundColor: colors.primary
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonText: {
    fontWeight: 'bold',
    color: '#fff',
  },
  cancelButton: {
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  cancelButtonText: {
    color: colors.text,
  },
});

export default SetPasswordScreen;
