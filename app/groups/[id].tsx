import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, ActivityIndicator, TouchableOpacity, Share, Clipboard, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { groupService } from '@/services/groupService';
import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons'; // O el set de iconos que uses
import HeaderF1 from '@/components/HeaderF1';

export default function GroupDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { colors } = useTheme();
  
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [groupInfo, setGroupInfo] = useState<{name: string, code: string} | null>(null);

  useEffect(() => {
    
    const loadRanking = async () => {
      try {
        if (typeof id === 'string') {
          const data = await groupService.getGroupLeaderboard(id);
          setLeaderboard(data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadRanking();
  }, [id]);

  const handleInvite = async () => {
    // Aquí podrías traer el invite_code de la DB si no lo tienes
    await Share.share({
      message: `¡Sumate a mi grupo de Prode F1! El ID del grupo es: ${id}`,
    });
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} color="#e10600" />;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header Personalizado */}
      <HeaderF1 />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: '#e10600', fontFamily: 'F1-Bold' }}>Volver</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>RANKING</Text>
        <TouchableOpacity onPress={handleInvite}>
          <Text style={{ color: '#e10600', fontFamily: 'F1-Bold' }}>Invitar</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={leaderboard}
        keyExtractor={(item) => item.userId}
        contentContainerStyle={{ padding: 20 }}
        renderItem={({ item, index }) => (
          <View style={[styles.rankItem, { borderBottomColor: colors.border }]}>
            <Text style={styles.position}>{index + 1}</Text>
            <View style={styles.userInfo}>
              <Text style={[styles.username, { color: colors.text }]}>{item.username}</Text>
            </View>
            <Text style={styles.points}>{item.totalPoints} pts</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  title: { fontFamily: 'F1-Black', fontSize: 20 },
  rankItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  position: {
    fontFamily: 'F1-Black',
    fontSize: 18,
    color: '#e10600',
    width: 40
  },
  userInfo: { flex: 1 },
  username: { fontFamily: 'F1-Bold', fontSize: 16 },
  points: { fontFamily: 'F1-Black', fontSize: 16, color: '#e10600' }
});