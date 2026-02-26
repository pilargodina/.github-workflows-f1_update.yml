import { Bell } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Dimensions, NativeScrollEvent, NativeSyntheticEvent, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import HeaderF1 from '../../components/HeaderF1';
import { F1_CALENDAR } from '../../constants/f1Calendar';
// 1. Importamos el hook de tema
import { useTheme } from '../../context/ThemeContext';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedTrack, setSelectedTrack] = useState(F1_CALENDAR[0]);
  const [timeLeft, setTimeLeft] = useState("");
  
  // 2. Extraemos colores y estado
  const { colors, isDarkMode } = useTheme();

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const deadline = new Date(selectedTrack.limit).getTime();
      const distance = deadline - now;

      if (distance < 0) {
        setTimeLeft("CLOSED");
      } else {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        setTimeLeft(`${days}d ${hours}h ${minutes}m`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [selectedTrack]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / width);
    setCurrentIndex(index);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <HeaderF1 />

      <TouchableOpacity style={styles.notificationBtn}>
        <Bell color="#E10600" size={24} />
        <View style={styles.dot} />
      </TouchableOpacity>
      
      {/* Selector de GP */}
      <View style={[styles.selectorContainer, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {F1_CALENDAR.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={[
                styles.trackChip, 
                { backgroundColor: isDarkMode ? '#333' : '#F0F0F0' },
                selectedTrack.id === item.id && styles.activeChip
              ]}
              onPress={() => setSelectedTrack(item)}
            >
              <Text style={[styles.chipText, { color: colors.text }]}>
                {item.gp.toUpperCase()}
              </Text>
              <Text style={styles.chipDate}>{item.raceDate}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Widget de Cuenta Regresiva */}
      <View style={[styles.countdownCard, { backgroundColor: isDarkMode ? '#1A1A1A' : '#333' }]}>
        <Text style={styles.countdownLabel}>TIME UNTIL PREDICTIONS CLOSE</Text>
        <Text style={styles.countdownTime}>{timeLeft}</Text>
      </View>

      <Pagination currentIndex={currentIndex} isDarkMode={isDarkMode} />

      <ScrollView 
        horizontal 
        pagingEnabled 
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <View style={styles.page}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Último Resultado</Text>
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <Text style={styles.placeholder}>Datos de FastF1 para {selectedTrack.gp}...</Text>
          </View>
        </View>

        <View style={styles.page}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Mi Apuesta</Text>
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <Text style={styles.placeholder}>[ Aquí irán los inputs para la Prode ]</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const Pagination = ({ currentIndex, isDarkMode }: { currentIndex: number, isDarkMode: boolean }) => (
  <View style={styles.paginationContainer}>
    {[0, 1].map((_, index) => (
      <View 
        key={index}
        style={[
          styles.circle, 
          { 
            backgroundColor: currentIndex === index ? '#E10600' : (isDarkMode ? '#444' : '#D9D9D9'),
            width: currentIndex === index ? 16 : 8 
          }
        ]} 
      />
    ))}
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  selectorContainer: { paddingVertical: 10, borderBottomWidth: 1 },
  trackChip: { padding: 20, marginRight: 10, borderRadius: 8, minWidth: 100, alignItems: 'center', marginLeft: 10 },
  activeChip: { borderColor: '#E10600', borderWidth: 2 },
  chipText: { fontFamily: 'F1-Bold', fontSize: 13 },
  chipDate: { fontSize: 12, color: '#999', fontFamily: 'F1-Regular' },
  countdownCard: { margin: 20, padding: 15, borderWidth: 1, borderColor: '#E10600', borderRadius: 12, alignItems: 'center' },
  countdownLabel: { color: '#E10600', fontFamily: 'F1-Bold', fontSize: 12, marginBottom: 5 },
  countdownTime: { color: '#E10600', fontFamily: 'F1-Regular', fontSize: 20 },
  page: { width: width, paddingHorizontal: 20 },
  sectionTitle: { fontFamily: 'F1-Bold', fontSize: 20, marginVertical: 15 },
  card: { borderRadius: 15, height: 250, padding: 20, elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 },
  placeholder: { textAlign: 'center', marginTop: 80, color: '#999', fontFamily: 'F1-Regular' },
  notificationBtn: { position: 'absolute', right: 20, top: 65, zIndex: 10 },
  dot: { position: 'absolute', top: -2, right: 0, width: 10, height: 10, backgroundColor: '#E10600', borderRadius: 5, borderWidth: 2, borderColor: 'white' },
  paginationContainer: { flexDirection: 'row', justifyContent: 'center', marginVertical: 10 },
  circle: { height: 8, borderRadius: 4, marginHorizontal: 4 }
});