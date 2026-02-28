import React, { useMemo, useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, Image, 
  ScrollView, SafeAreaView, Modal, TextInput, Alert, ActivityIndicator, Clipboard
} from 'react-native';
import { useRouter } from 'expo-router';
import HeaderF1 from '../../components/HeaderF1';
import { F1_CALENDAR } from '@/constants/f1Calendar';
import { useTheme } from '../../context/ThemeContext';
import { useVoting } from '@/context/VotingContext';
import { groupService } from '@/services/groupService';
import { supabase } from '@/lib/supabase';

export default function RaceHomeScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { hasVoted } = useVoting();

  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setCurrentUserId(user.id);

      const { data, error } = await supabase
        .from('group_members')
        .select('groups (*)')
        .eq('user_id', user.id);

      if (error) throw error;
      setGroups(data.map(item => item.groups));
    } catch (error: any) {
      console.error("Error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchGroups(); }, []);

  const handleDeleteGroup = (group: any) => {
    const isAdmin = group.admin_id === currentUserId;
    Alert.alert(
      isAdmin ? "Eliminar Grupo" : "Salir del Grupo",
      isAdmin ? "¿Estás seguro? Se borrará para todos." : "¿Deseas salir de este grupo?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Confirmar", 
          style: "destructive", 
          onPress: async () => {
            await groupService.leaveOrDeleteGroup(group.id, currentUserId!, isAdmin);
            fetchGroups();
          } 
        }
      ]
    );
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return Alert.alert("Error", "Nombre vacío");
    try {
      setIsCreating(true);
      await groupService.createGroup(newGroupName, currentUserId!);
      setNewGroupName('');
      setModalVisible(false);
      fetchGroups();
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinGroup = async () => {
    if (!inviteCode.trim()) return Alert.alert("Error", "Ingresá un código");
    try {
      setIsCreating(true);
      await groupService.joinGroup(inviteCode, currentUserId!);
      setInviteCode('');
      setModalVisible(false);
      fetchGroups();
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setIsCreating(false);
    }
  };

  // Lógica de carrera...
  const nextRace = useMemo(() => {
    const now = new Date();
    return F1_CALENDAR.find(race => new Date(race.limit) > now) || F1_CALENDAR[F1_CALENDAR.length - 1];
  }, []);
  const canVote = new Date() < new Date(nextRace.limit);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <HeaderF1 />
      <ScrollView contentContainerStyle={styles.container}>
        {/* Card Principal */}
        <View style={styles.redCard}>
          <View style={styles.cardInfo}>
            <Text style={styles.gpName}>{nextRace.gp.toUpperCase()} GP</Text>
            <Text style={styles.gpDate}>{nextRace.raceDate}</Text>
            <TouchableOpacity 
              style={[styles.voteButton, !canVote && styles.disabledButton]}
              disabled={!canVote}
              onPress={() => router.push('/race/voting')}
            >
              <Text style={styles.voteButtonText}>
                {!canVote ? "Votación cerrada" : hasVoted ? "Cambiar voto" : "Votar ahora"}
              </Text>
            </TouchableOpacity>
          </View>
          <Image source={nextRace.trackImage} style={styles.circuitImage} />
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>MIS GRUPOS</Text>

        {loading ? <ActivityIndicator color="#e10600" /> : groups.map((group) => (
          <View key={group.id} style={[styles.groupCard, { borderColor: colors.border }]}>
            <TouchableOpacity 
              style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}
              onPress={() => router.push(`/groups/${group.id}` as any)}
            >
              <View style={styles.groupIconPlaceholder}><Text style={{fontSize: 24}}>🏁</Text></View>
              <View style={{flex: 1}}>
                <Text style={[styles.groupText, { color: colors.text }]}>{group.name}</Text>
                <Text style={{color: colors.text, opacity: 0.6, fontSize: 12}}>Ranking →</Text>
              </View>
            </TouchableOpacity>

            <View style={{ alignItems: 'center', gap: 10 }}>
              <TouchableOpacity 
                style={styles.copyBadge}
                onPress={() => Clipboard.setString(group.invite_code)}
              >
                <Text style={styles.copyBadgeText}>{group.invite_code}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity onPress={() => handleDeleteGroup(group)}>
                <Text style={{ color: '#e10600', fontSize: 10, fontFamily: 'F1-Bold' }}>ELIMINAR</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.newGroupBtn} onPress={() => setModalVisible(true)}>
          <Text style={styles.newGroupText}>Nuevo grupo</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* MODAL CORREGIDO */}
      <Modal animationType="fade" transparent={true} visible={modalVisible}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background, width: '85%' }]}>
            
            <Text style={[styles.modalTitle, { color: colors.text }]}>Crear Grupo</Text>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.border }]}
              placeholder="Nombre del grupo"
              value={newGroupName}
              onChangeText={setNewGroupName}
            />
            <TouchableOpacity 
              style={[styles.btnAction, { backgroundColor: '#e10600' }]} 
              onPress={handleCreateGroup}
            >
              <Text style={styles.btnActionText}>CONFIRMAR CREACIÓN</Text>
            </TouchableOpacity>

            <View style={styles.divider} />

            <Text style={[styles.modalTitle, { color: colors.text, fontSize: 16 }]}>Unirse con Código</Text>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.border }]}
              placeholder="Ej: F1-ABCDE"
              value={inviteCode}
              onChangeText={setInviteCode}
              autoCapitalize="characters"
            />
            <TouchableOpacity 
              style={[styles.btnAction, { backgroundColor: '#333' }]} 
              onPress={handleJoinGroup}
            >
              <Text style={styles.btnActionText}>UNIRME</Text>
            </TouchableOpacity>

            <TouchableOpacity style={{ marginTop: 20 }} onPress={() => setModalVisible(false)}>
              <Text style={{ color: '#e10600', fontFamily: 'F1-Bold' }}>CANCELAR</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { padding: 20 },
  sectionTitle: { fontFamily: 'F1-Black', fontSize: 18, marginBottom: 15 },
  redCard: { backgroundColor: '#e10600', borderRadius: 15, padding: 20, flexDirection: 'row', alignItems: 'center', height: 160, marginBottom: 30 },
  cardInfo: { flex: 1 },
  gpName: { color: '#fff', fontSize: 22, fontFamily: 'F1-Black' },
  gpDate: { color: '#fff', fontSize: 14, fontFamily: 'F1-Regular', marginVertical: 8 },
  voteButton: { backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, alignSelf: 'flex-start' },
  voteButtonText: { color: '#e10600', fontFamily: 'F1-Bold', fontSize: 12 },
  disabledButton: { backgroundColor: '#ff9999' },
  circuitImage: { width: 120, height: 90, resizeMode: 'contain' },
  groupCard: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderRadius: 20, padding: 20, marginBottom: 15 },
  groupIconPlaceholder: { width: 50, height: 50, backgroundColor: '#f0f0f0', borderRadius: 12, marginRight: 15, justifyContent: 'center', alignItems: 'center' },
  groupText: { fontFamily: 'F1-Black', fontSize: 16 },
  copyBadge: { backgroundColor: '#f0f0f0', padding: 8, borderRadius: 8 },
  copyBadgeText: { color: '#e10600', fontFamily: 'F1-Bold', fontSize: 10 },
  newGroupBtn: { backgroundColor: '#e10600', borderRadius: 30, padding: 18, marginTop: 20 },
  newGroupText: { color: '#fff', textAlign: 'center', fontFamily: 'F1-Bold', fontSize: 18 },
  
  // Estilos de Modal arreglados
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { borderRadius: 25, padding: 25, alignItems: 'center', shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
  modalTitle: { fontFamily: 'F1-Black', fontSize: 20, marginBottom: 15 },
  input: { width: '100%', borderWidth: 1, borderRadius: 10, padding: 12, marginBottom: 15, fontFamily: 'F1-Regular' },
  divider: { height: 1, backgroundColor: '#eee', width: '100%', marginVertical: 20 },
  btnAction: { width: '100%', padding: 15, borderRadius: 12, alignItems: 'center' },
  btnActionText: { color: '#fff', fontFamily: 'F1-Bold', fontSize: 14 },
});