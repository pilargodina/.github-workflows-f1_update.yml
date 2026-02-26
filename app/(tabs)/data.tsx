import React, { useEffect, useState } from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import HeaderF1 from '../../components/HeaderF1';
import { F1_CALENDAR } from '../../constants/f1Calendar';
import { TRACKS_DATA } from '../../constants/tracksData';
import { useTheme } from '../../context/ThemeContext';

const { width } = Dimensions.get('window');

// Helper para formatear el nombre del archivo basado en la llave del objeto
// Ejemplo: "Saudi Arabia" -> "saudi_arabia"
const formatFileName = (name: string) => name.toLowerCase().replace(/\s+/g, '_');

// Mapeo manual de imágenes (necesario en React Native para archivos locales)
const trackImages: { [key: string]: any } = {
  australia: require('../../assets/images/tracks_info/australia.png'),
  belgium: require('../../assets/images/tracks_info/belgium.png'),
  bahrain: require('../../assets/images/tracks_info/bahrain.png'),
  saudi_arabia: require('../../assets/images/tracks_info/saudi_arabia.png'),
  china: require('../../assets/images/tracks_info/china.png'),
  japan: require('../../assets/images/tracks_info/japan.png'),
  italy: require('../../assets/images/tracks_info/italy.png'),
  monaco: require('../../assets/images/tracks_info/monaco.png'),
  canada: require('../../assets/images/tracks_info/canada.png'),
  barcelona: require('../../assets/images/tracks_info/barcelona.png'),
  austria: require('../../assets/images/tracks_info/austria.png'),
  hungary: require('../../assets/images/tracks_info/hungary.png'),
  netherlands: require('../../assets/images/tracks_info/netherlands.png'),
  mexico: require('../../assets/images/tracks_info/mexico.png'),
  brazil: require('../../assets/images/tracks_info/brazil.png'),
  texas: require('../../assets/images/tracks_info/texas.png'),
  singapore: require('../../assets/images/tracks_info/singapore.png'),
  qatar: require('../../assets/images/tracks_info/qatar.png'),
  abu_dhabi: require('../../assets/images/tracks_info/abu_dhabi.png'),
  miami: require('../../assets/images/tracks_info/miami.png'),
  great_britain: require('../../assets/images/tracks_info/great_britain.png'),
  azerbaijan: require('../../assets/images/tracks_info/azerbaijan.png'),
  las_vegas: require('../../assets/images/tracks_info/lasvegas.png'),
  madrid: require('../../assets/images/tracks_info/madrid.png'),
};

const flagImages: { [key: string]: any } = {
  australia: require('../../assets/images/flags/australia.png'),
  belgium: require('../../assets/images/flags/belgium.png'),
  bahrain: require('../../assets/images/flags/bahrain.png'),
  saudi_arabia: require('../../assets/images/flags/saudi_arabia.png'),
  china: require('../../assets/images/flags/china.png'),
  japan: require('../../assets/images/flags/japan.png'),
  italy: require('../../assets/images/flags/italy.png'),
  monaco: require('../../assets/images/flags/monaco.png'),
  canada: require('../../assets/images/flags/canada.png'),
  barcelona: require('../../assets/images/flags/spain.png'), // Corregido a spain.png según tu carpeta
  austria: require('../../assets/images/flags/austria.png'),
  hungary: require('../../assets/images/flags/hungary.png'),
  netherlands: require('../../assets/images/flags/netherlands.png'),
  mexico: require('../../assets/images/flags/mexico.png'),
  brazil: require('../../assets/images/flags/brazil.png'),
  texas: require('../../assets/images/flags/usa.png'), // Ajustar si es usa.png
  singapore: require('../../assets/images/flags/singapore.png'),
  qatar: require('../../assets/images/flags/qatar.png'),
  abu_dhabi: require('../../assets/images/flags/abu_dhabi.png'),
  miami: require('../../assets/images/flags/usa.png'),
  great_britain: require('../../assets/images/flags/great_britain.png'),
  azerbaijan: require('../../assets/images/flags/azerbaijan.png'),
  las_vegas: require('../../assets/images/flags/usa.png'),
  madrid: require('../../assets/images/flags/spain.png'),
};

export default function DataScreen() {
  const { colors, isDarkMode } = useTheme();
  const trackKeys = Object.keys(TRACKS_DATA);
  const [selectedKey, setSelectedKey] = useState(trackKeys[0]);

  // Lógica para encontrar el GP actual al cargar
  useEffect(() => {
    const now = new Date();
    // Buscamos en el calendario el primer GP cuya fecha de carrera no haya pasado
    const nextRace = F1_CALENDAR.find(race => new Date(race.raceDate) >= now);
    
    if (nextRace) {
      // Intentamos matchear el nombre del GP del calendario con la llave de TRACKS_DATA
      // Nota: Asegúrate que los nombres en F1_CALENDAR coincidan con las llaves de TRACKS_DATA
      const match = trackKeys.find(key => key.toLowerCase().includes(nextRace.gp.toLowerCase()));
      if (match) setSelectedKey(match);
    }
  }, []);

  const formatFileName = (name: string) => name.toLowerCase().replace(/\s+/g, '_');
  const trackInfo = TRACKS_DATA[selectedKey as keyof typeof TRACKS_DATA];
  const fileKey = formatFileName(selectedKey);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <HeaderF1 />

      <View style={[styles.selectorContainer, { borderBottomColor: colors.border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {trackKeys.map((key) => {
            const fKey = formatFileName(key);
            return (
              <TouchableOpacity
                key={key}
                onPress={() => setSelectedKey(key)}
                style={[
                  styles.trackChip,
                  { backgroundColor: colors.card, borderColor: colors.border },
                  selectedKey === key && styles.activeChip
                ]}
              >
                <Image source={flagImages[fKey]} style={styles.flagIcon} />
                <Text style={[styles.chipText, { color: colors.text }]}>{key.toUpperCase()}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView style={styles.detailsContainer}>
        <View style={styles.mapContainer}>
          <Image 
            source={trackImages[fileKey]} 
            style={styles.circuitMap} // Eliminado el tintColor para ver los colores reales
            resizeMode="contain"
          />
        </View>

        <View style={styles.statsGrid}>
          <StatBox label="First Grand Prix" value={trackInfo.firstGP} colors={colors} />
          <StatBox label="Number of Laps" value={trackInfo.laps.toString()} colors={colors} />
          <StatBox label="Circuit Length" value={trackInfo.length} colors={colors} />
          <StatBox label="Lap Record" value={trackInfo.record} colors={colors} />
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