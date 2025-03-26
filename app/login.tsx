import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Switch, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { authState$ } from '@/state/authState';
import { useStorage } from '@/context/LocalstoreContext';
import { use$ } from '@legendapp/state/react';
import GoogleAuth from '@/components/GoogleAuth';
import { useCustomTheme } from '@/context/ThemeContext';
import { useBibleContext } from '@/context/BibleContext';

const LoginScreen = () => {
  const router = useRouter();
  const { schema } = useCustomTheme();
  const { currentTheme } = useBibleContext();
  const isDark = schema === 'dark';
  const { toggleCloudSync } = useStorage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [enableSync, setEnableSync] = useState(false);
  const isLoading = use$(() => authState$.isLoading.get());

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Por favor, ingresa tu correo y contraseña');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Login with email and password
      const success = await authState$.login(email, password);
      
      if (success) {
        // Set cloud sync preference based on user choice
        toggleCloudSync(enableSync);
        
        // Navigate to home screen
        router.replace('/(dashboard)');
      } else {
        setError('Correo electrónico o contraseña incorrectos');
      }
    } catch (error: any) {
      setError(error.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async (userData: any) => {
    try {
      // Set cloud sync preference based on user choice
      toggleCloudSync(enableSync);
    } catch (error) {
      console.error('Error setting cloud sync preference:', error);
    }
  };

  return (
    <View style={[styles.container]}>
      <Text style={[styles.title]}>Bienvenido de Nuevo</Text>
      
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      
      <TextInput
        style={[styles.input]}
        placeholder="Correo Electrónico"
        placeholderTextColor="#999"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      
      <TextInput
        style={[styles.input]}
        placeholder="Contraseña"
        placeholderTextColor="#999"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      
      <View style={styles.syncContainer}>
        <Text style={[styles.syncText]}>
          Sincronizar con la nube
        </Text>
        <Switch
          value={enableSync}
          onValueChange={setEnableSync}
          trackColor={{ false: '#767577', true: '#4CAF50' }}
          thumbColor={enableSync ? '#f4f3f4' : '#f4f3f4'}
        />
      </View>
      
      <Text style={[styles.syncDescription]}>
        {enableSync 
          ? 'Tus configuraciones se sincronizarán con la nube' 
          : 'La aplicación funcionará sin conexión (puedes activar la sincronización más tarde)'}
      </Text>
      
      <TouchableOpacity
        style={[styles.button]}
        onPress={handleLogin}
        disabled={loading || isLoading}
      >
        {loading || isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Iniciar Sesión</Text>
        )}
      </TouchableOpacity>
      
      <GoogleAuth onSuccess={handleGoogleLogin} />
      
      <TouchableOpacity onPress={() => router.push('/register')}>
        <Text style={[styles.linkText]}>
          ¿No tienes una cuenta? Regístrate
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.skipButton} 
        onPress={() => router.replace('/(dashboard)')}
      >
        <Text style={[styles.skipText]}>
          Continuar sin iniciar sesión
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  button: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#4CAF50',
  },
  errorText: {
    color: 'red',
    marginBottom: 15,
    textAlign: 'center',
  },
  syncContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  syncText: {
    fontSize: 16,
  },
  syncDescription: {
    fontSize: 12,
    marginBottom: 15,
    fontStyle: 'italic',
  },
  skipButton: {
    marginTop: 30,
    alignItems: 'center',
  },
  skipText: {
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});

export default LoginScreen;