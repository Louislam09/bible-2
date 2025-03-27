import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { pb } from '../globalConfig';
import GoogleAuth from '@/components/GoogleAuth';
import { useTheme } from '@react-navigation/native';
import { TTheme } from '@/types';

const RegisterScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const router = useRouter();
  const theme = useTheme();
  const styles = getStyles(theme as TTheme);

  const handleRegister = async () => {
    try {
      // Validar entradas
      if (!name || !email || !password || !confirmPassword) {
        Alert.alert('Error', 'Por favor completa todos los campos');
        return;
      }

      if (password !== confirmPassword) {
        Alert.alert('Error', 'Las contraseñas no coinciden');
        return;
      }

      // Crear el usuario
      const data = {
        name,
        email,
        password,
        passwordConfirm: confirmPassword,
      };
      console.log(data)
      await pb.collection('users').create(data);
      
      await pb.collection('users').authWithPassword(email, password);
      
      router.replace('/home');
    } catch (error: any) {
      console.error('Falló el registro:', error);
      
      if (error.originalError) {
        console.log('Error original', error.originalError);
      }
      
      if (error.originalError?.data?.data?.email?.message) {
        Alert.alert('Error de Registro', error.originalError.data.data.email.message);
      } else if (error.originalError?.data?.message) {
        Alert.alert('Error de Registro', error.originalError.data.message);
      } else {
        Alert.alert('Error de Registro', 'El registro falló. Por favor intenta de nuevo.');
      }
    }
  };

  const handleGoogleSuccess = (user: any) => {
    router.replace('/home');
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View style={[styles.container]}>
        <Text style={[styles.title]}>Crear Cuenta</Text>
        
        <TextInput
          style={[styles.input]}
          placeholder="Nombre Completo"
          placeholderTextColor={theme.colors.text}
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />
        
        <TextInput
          style={[styles.input]}
          placeholder="Correo Electrónico"
          placeholderTextColor={theme.colors.text}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        
        <TextInput
          style={[styles.input]}
          placeholder="Contraseña"
          placeholderTextColor={theme.colors.text}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        
        <TextInput
          style={[styles.input]}
          placeholder="Confirmar Contraseña"
          placeholderTextColor={theme.colors.text}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />
        
        <TouchableOpacity style={[styles.button]} onPress={handleRegister}>
          <Text style={[styles.buttonText]}>Registrarse</Text>
        </TouchableOpacity>
        
        <Text style={[styles.orText]}>O</Text>
        
        <GoogleAuth isRegistration={true} onSuccess={handleGoogleSuccess} />
        
        <TouchableOpacity onPress={() => router.push('/login')}>
          <Text style={[styles.linkText]}>¿Ya tienes una cuenta? Inicia Sesión</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const getStyles = ({ colors, dark }: TTheme) => StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: colors.background
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: colors.primary
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 15,
    marginBottom: 15,
    borderColor: colors.text,
    color: colors.primary,
    backgroundColor: colors.card
  },
  button: {
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    backgroundColor: colors.text
  },
  buttonText: {
    fontWeight: 'bold',
    color: colors.background,
  },
  orText: {
    textAlign: 'center',
    marginVertical: 15,
    color: colors.primary
  },
  linkText: {
    textAlign: 'center',
    marginTop: 15,
    color: colors.primary
  },
});

export default RegisterScreen;
