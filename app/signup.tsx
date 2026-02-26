import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import HeaderF1 from '../components/HeaderF1';
import { supabase } from '../lib/supabase';

export default function SignupScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function signUpWithEmail() {
    if (!email || !password || !firstName || !lastName) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    setLoading(true);
    
    // 1. Registramos al usuario en la autenticación de Supabase
    const { data, error: authError } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        }
      }
    });

    if (authError) {
      Alert.alert('Error de Registro', authError.message);
    } else {
      Alert.alert('¡Éxito!', 'Revisá tu email para confirmar la cuenta.');
      router.replace('/login');
    }
    
    setLoading(false);
  }

  return (
    <View style={styles.container}>
    <HeaderF1 />
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.inner}>
      <View style={styles.form}>
        <Text style={styles.title}>JOIN THE GRID</Text>

        <View style={styles.form}>
          <Text style={styles.label}>Create your account</Text>
          
          <TextInput
            style={styles.input}
            placeholder="First Name"
            value={firstName}
            onChangeText={setFirstName}
          />

          <TextInput
            style={styles.input}
            placeholder="Last Name"
            value={lastName}
            onChangeText={setLastName}
          />

          <TextInput
            style={styles.input}
            placeholder="Email address"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          
          <TextInput
            style={styles.input}
            placeholder="Password (8+ characters)"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity 
            style={styles.signupButton} 
            onPress={signUpWithEmail}
            disabled={loading}
          >
            <Text style={styles.buttonText}>{loading ? 'Creating...' : 'Sign Up'}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.back()} style={{marginTop: 20}}>
            <Text style={styles.footerText}>Already have an account? <Text style={styles.boldText}>Login</Text></Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContainer: {
    flexGrow: 1,
  },
  inner: { flex: 1, justifyContent: 'center' },
  header: {
    height: 200,
    backgroundColor: '#000', // Negro para variar un poco del Login
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomLeftRadius: 60,
    borderBottomRightRadius: 60,
  },
title: { fontSize: 24, fontFamily: 'F1-Bold', textAlign: 'center', marginBottom: 30, color: '#E10600' },
  form: {
    padding: 30
  },
  label: {
    fontSize: 18,
    fontFamily: 'F1-Bold',
    color: '#e10600',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 50,
    fontFamily: 'F1-Regular',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
  },
  signupButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#e10600',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontFamily: 'F1-Bold',
    fontSize: 18,
  },
  footerText: {
    color: '#666',
    fontFamily: 'F1-Regular',
    fontSize: 14,
  },
  boldText: {
    color: '#e10600',
    fontFamily: 'F1-Bold',
    fontSize: 14,
    justifyContent: 'center',
  }
});