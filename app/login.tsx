import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React, { useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import HeaderF1 from '../components/HeaderF1';
import { supabase } from '../lib/supabase';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const googleIcon = require('../assets/images/google-icon.png');

async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
  });

  if (error) {
    Alert.alert('Error', error.message);
    return;
  }

  if (data?.url) {
    const result = await WebBrowser.openAuthSessionAsync(
      data.url,
      'https://auth.expo.io/@neekotina/F1Prode'
    );

    if (result.type === 'success') {
      router.replace('/(tabs)');
    }
  }
}
React.useEffect(() => {
  const { data: listener } = supabase.auth.onAuthStateChange(
    (event, session) => {
      console.log("Auth event:", event);
      console.log("Session:", session);

      if (session) {
        router.replace('/(tabs)');
      }
    }
  );

  return () => {
    listener.subscription.unsubscribe();
  };
}, []);

  async function signInWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) Alert.alert('Error', error.message);
    else router.replace('/(tabs)');
    setLoading(false);
  }

  return (
    <View style={styles.container}>
      <HeaderF1 />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.inner}>
        <View style={styles.form}>
          <Text style={styles.label}>ALREADY HAVE AN ACCOUNT?</Text>

          <TextInput
            style={[styles.input, { fontFamily: 'F1-Regular' }]}
            placeholder="Email address"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
          />

          <TextInput
            style={[styles.input, { fontFamily: 'F1-Regular' }]}
            placeholder="Password (8+ characters)"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity style={styles.loginButton} onPress={signInWithEmail} disabled={loading}>
            <Text style={styles.buttonText}>{loading ? 'LOADING...' : 'LOGIN'}</Text>
          </TouchableOpacity>

          <Text style={styles.orText}>or</Text>

          <View style={styles.socialContainer}>
            <TouchableOpacity 
              style={styles.googleButton} 
              onPress={signInWithGoogle}
            >
            <Image source={googleIcon} style={styles.googleIcon} />
            <Text style={styles.googleButtonText}>Continue with Google</Text>
          </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => router.push('/signup')}>
            <Text style={styles.footerText}>ARE YOU NEW HERE? <Text style={styles.boldText}>Sign up</Text></Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  inner: { flex: 1, justifyContent: 'center' },
  form: { padding: 30 },
  label: { fontFamily: 'F1-Bold', fontSize: 14, color: '#E10600', marginBottom: 20 },
  input: { borderBottomWidth: 1, borderColor: '#CCC', height: 40, marginBottom: 20 },
  loginButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#E10600',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: { fontFamily: 'F1-Bold', color: '#fff', fontSize: 15 },
  orText: { marginVertical: 20, color: '#999', fontFamily: 'F1-Regular', textAlign: 'center' },
  socialContainer: { flexDirection: 'row', gap: 20, marginBottom: 30, justifyContent: 'center' },
  socialIcon: { padding: 12, borderWidth: 1, borderColor: '#EEE', borderRadius: 10 },
  footerText: { fontFamily: 'F1-Regular', color: '#333', fontSize: 13, textAlign: 'center' },
  boldText: { fontFamily: 'F1-Bold', color: '#E10600' },
  googleButton: {
  flexDirection: 'row',
  backgroundColor: '#fff',
  width: '100%',
  height: 50,
  borderRadius: 12,
  justifyContent: 'center',
  alignItems: 'center',
  borderWidth: 1,
  borderColor: '#E0E0E0',
  gap: 12,
  marginTop: 20,
},
googleIcon: {
  width: 20,
  height: 20,
},
googleButtonText: {
  color: '#333',
  fontFamily: 'F1-Bold',
  fontSize: 14,
},
});