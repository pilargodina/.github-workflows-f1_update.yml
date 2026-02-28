import React, { useEffect, useState } from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import HeaderF1 from '../../components/HeaderF1';
import { F1_CALENDAR } from '../../constants/f1Calendar';
import { TRACKS_DATA } from '../../constants/tracksData';
import { useTheme } from '../../context/ThemeContext';
import {TRACKSINFO} from '../../constants/tracksinfo';
import { FLAGS_INFO } from '../../constants/flagsinfo';

const { width } = Dimensions.get('window');

// Helper para formatear el nombre del archivo basado en la llave del objeto
// Ejemplo: "Saudi Arabia" -> "saudi_arabia"
const formatFileName = (name: string) => name.toLowerCase().replace(/\s+/g, '_');

export default function DataScreen() {
  const { colors, isDarkMode } = useTheme();
  
  const trackKeys = React.useMemo(() => Object.keys(TRACKS_DATA), []);
  const [selectedKey, setSelectedKey] = useState(trackKeys[0]);

  useEffect(() => {
    const now = new Date();
    const nextRace = F1_CALENDAR.find(race => new Date(race.raceDate) >= now);
    if (nextRace) {
      const match = trackKeys.find(key => key.toLowerCase().includes(nextRace.gp.toLowerCase()));
      if (match) setSelectedKey(match);
    }
  }, [trackKeys]);

  const trackInfo = TRACKS_DATA[selectedKey as keyof typeof TRACKS_DATA];

  // Buscamos el circuito seleccionado en TRACKSINFO para el mapa grande
  const currentTrackData = TRACKSINFO.find(t => t.name.toLowerCase() === selectedKey.toLowerCase());
  const circuitImage = currentTrackData ? currentTrackData.image : null;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <HeaderF1 />

      <View style={[styles.selectorContainer, { borderBottomColor: colors.border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {trackKeys.map((key) => {
          const isSelected = selectedKey === key;

          // Buscamos la bandera que coincida con la "key" (nombre del circuito)
          const flagData = FLAGS_INFO.find(
            (f) => f.name.toLowerCase() === key.toLowerCase()
          );
            // ----------------------------------

            return (
              <TouchableOpacity
                key={key}
                onPress={() => setSelectedKey(key)}
                style={[
                  styles.trackChip,
                  { 
                    backgroundColor: colors.card, 
                    borderColor: isSelected ? '#E10600' : colors.border 
                  },
                  isSelected && { borderWidth: 2 }
                ]}
              >
                {/* Renderizado de la bandera con fallback */}
                {flagData ? (
                  <Image source={flagData.image} style={styles.flagIcon} />
                ) : (
                  /* Opcional: un icono por defecto si no encuentra la bandera */
                  <View style={[styles.flagIcon, { backgroundColor: '#ccc' }]} />
                )}
                
                <Text style={[styles.chipText, { color: colors.text }]}>
                  {key.toUpperCase()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView style={styles.detailsContainer}>
        <View style={styles.mapContainer}>
          {circuitImage && (
            <Image 
              source={circuitImage} 
              style={styles.circuitMap} 
              resizeMode="contain"
            />
          )}
        </View>

        <View style={styles.statsGrid}>
          <StatBox label="First Grand Prix" value={trackInfo.firstGP} colors={colors} />
          <StatBox label="Laps" value={trackInfo.laps.toString()} colors={colors} />
          <StatBox label="Length" value={trackInfo.length} colors={colors} />
          <StatBox label="Record" value={trackInfo.record} colors={colors} />
          <StatBox label="Difficulty" value={trackInfo.difficulty} colors={colors} />
        </View>

        <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.infoTitle, { color: colors.text }]}>{selectedKey}</Text>
          <Text style={[styles.description, { color: isDarkMode ? '#CCC' : '#444' }]}>
            {trackInfo.description}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const StatBox = ({ label, value, colors }: any) => (
  <View style={[styles.statBox, { borderColor: colors.border }]}>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  selectorContainer: { paddingVertical: 12, borderBottomWidth: 1 },
  scrollContent: { paddingHorizontal: 15, gap: 10 },
  trackChip: { flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: 8, borderWidth: 1, gap: 8 },
  activeChip: { borderColor: '#E10600', borderWidth: 2 },
  flagIcon: { width: 20, height: 14, borderRadius: 2 },
  chipText: { fontFamily: 'F1-Bold', fontSize: 12 },
  detailsContainer: { flex: 1, padding: 20 },
  mapContainer: { alignItems: 'center', marginBottom: 25, height: 200, justifyContent: 'center' },
  circuitMap: { width: width * 0.85, height: '100%' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 10, marginBottom: 25 },
  statBox: { width: '48%', padding: 15, borderWidth: 1, borderRadius: 12 },
  statLabel: { fontFamily: 'F1-Regular', fontSize: 10, color: '#999', marginBottom: 5 },
  statValue: { fontFamily: 'F1-Bold', fontSize: 18 },
  infoCard: { padding: 20, borderRadius: 20, marginBottom: 40 },
  infoTitle: { fontFamily: 'F1-Bold', fontSize: 24, marginBottom: 15 },
  description: { fontFamily: 'F1-Regular', fontSize: 14, lineHeight: 22 },
});