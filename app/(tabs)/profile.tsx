import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking'; // Para abrir ajustes de notificaciones
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Image, Platform, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import HeaderF1 from '../../components/HeaderF1';
import { supabase } from '../../lib/supabase';

export default function ProfileScreen() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState({ name: '', lastName: '', avatarUrl: '' });
  const [isEditing, setIsEditing] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { colors, isDarkMode, toggleTheme } = useTheme();

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    setUser(user);
    const { data, error } = await supabase
      .from('profiles')
      .select('first_name, last_name, avatar_url')
      .eq('id', user.id)
      .single();

    if (data) {
      setProfile({
        name: data.first_name || '',
        lastName: data.last_name || '',
        avatarUrl: data.avatar_url || user.user_metadata?.avatar_url || ''
      });
    }
  }
}

  const openNotificationSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  };

 const handleUpdateProfile = async () => {
  setLoading(true);
  const { error } = await supabase
    .from('profiles')
    .upsert({ // Usamos upsert para asegurar que si no existe, lo cree
      id: user.id,
      first_name: profile.name,
      last_name: profile.lastName,
      updated_at: new Date()
    });

  if (error) {
    Alert.alert('Error', error.message);
  } else {
    setIsEditing(false);
    // IMPORTANTE: Volvemos a pedir los datos para refrescar el estado local
    await fetchProfile(); 
    Alert.alert('Éxito', 'Perfil actualizado');
  }
  setLoading(false);
};

  return (
    <ScrollView style={[styles.container, isDarkMode && styles.containerDark]}>
      <HeaderF1 />
      
      <View style={styles.headerSection}>
        <View style={styles.avatarContainer}>
          {profile.avatarUrl ? (
            <Image source={{ uri: profile.avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}><Ionicons name="person" size={40} color="white" /></View>
          )}
        </View>
        <Text style={[styles.userName, isDarkMode && styles.textWhite]}>
          {profile.name ? `${profile.name} ${profile.lastName}`.toUpperCase() : 'CARGANDO...'}
        </Text>
      </View>

      {isEditing ? (
        <View style={styles.editForm}>
          <TextInput 
            style={[styles.input, isDarkMode && styles.textWhite]} 
            placeholder="Nombre" 
            placeholderTextColor="#999"
            value={profile.name} 
            onChangeText={(t) => setProfile({...profile, name: t})} 
          />
          <TextInput 
            style={[styles.input, isDarkMode && styles.textWhite]} 
            placeholder="Apellido" 
            placeholderTextColor="#999"
            value={profile.lastName} 
            onChangeText={(t) => setProfile({...profile, lastName: t})} 
          />
          <TouchableOpacity style={styles.saveButton} onPress={handleUpdateProfile}>
            <Text style={styles.saveButtonText}>GUARDAR CAMBIOS</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.menuWrapper}>
          <View style={styles.menuGroup}>
            <Text style={styles.groupTitle}>ACCOUNT</Text>
            <MenuOption 
              icon="person-outline" 
              text="Edit profile" 
              onPress={() => setIsEditing(true)} 
              isDarkMode={isDarkMode}
            />
            <MenuOption 
              icon="notifications-outline" 
              text="Notifications" 
              onPress={openNotificationSettings} 
              isDarkMode={isDarkMode}
            />
          </View>

          <View style={styles.menuGroup}>
            <Text style={styles.groupTitle}>SETTINGS</Text>
            <View style={styles.optionRow}>
              <View style={styles.optionLeft}>
                <Ionicons name="moon-outline" size={22} color="#E10600" />
                <Text style={[styles.optionText, isDarkMode && styles.textWhite]}>Dark Mode</Text>
              </View>
              <Switch 
                value={isDarkMode} 
                onValueChange={toggleTheme} 
                trackColor={{ false: "#767577", true: "#E10600" }} 
              />
            </View>
          </View>

          <View style={styles.menuGroup}>
            <Text style={styles.groupTitle}>ACTIONS</Text>
            <MenuOption 
              icon="log-out-outline" 
              text="Log out" 
              onPress={() => supabase.auth.signOut()} 
              color="#E10600"
              isDarkMode={isDarkMode}
            />
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const MenuOption = ({ icon, text, onPress, color, isDarkMode }: any) => (
  <TouchableOpacity style={styles.optionRow} onPress={onPress}>
    <View style={styles.optionLeft}>
      <Ionicons name={icon} size={22} color="#E10600" />
      <Text style={[styles.optionText, isDarkMode ? styles.textWhite : { color: color || '#333' }]}>
        {text}
      </Text>
    </View>
    <Ionicons name="chevron-forward" size={18} color="#CCC" />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  containerDark: { backgroundColor: '#1A1A1A' },
  textWhite: { color: '#FFF' },
  headerSection: { alignItems: 'center', marginTop: 20, marginBottom: 20 },
  avatarContainer: { width: 100, height: 100, borderRadius: 50, marginBottom: 15, overflow: 'hidden', backgroundColor: '#EEE' },
  avatar: { width: 100, height: 100 },
  avatarPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#CCC' },
  userName: { fontFamily: 'F1-Bold', fontSize: 22, color: '#E10600' },
  menuWrapper: { paddingHorizontal: 20 },
  menuGroup: { marginBottom: 25 },
  groupTitle: { fontFamily: 'F1-Bold', fontSize: 13, color: '#E10600', marginBottom: 10 },
  optionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  optionLeft: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  optionText: { fontFamily: 'F1-Regular', fontSize: 16 },
  editForm: { padding: 20 },
  input: { borderBottomWidth: 1, borderColor: '#CCC', height: 45, marginBottom: 20, fontSize: 16 },
  saveButton: { backgroundColor: '#E10600', height: 50, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  saveButtonText: { color: '#FFF', fontFamily: 'F1-Bold' }
});