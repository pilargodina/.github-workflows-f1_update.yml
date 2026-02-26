import React from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const HeaderF1 = () => {
  const { colors, isDarkMode } = useTheme();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.container, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        {/* La línea roja con la curva */}
        <View style={styles.lineDecorator} />
        
        {/* El Título */}
        <Text style={[styles.title, { color: colors.primary }]}>F1 PRODE</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#FFF',
  },
  container: {
    height: 100, // Ajusta según necesites
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  lineDecorator: {
    position: 'absolute',
    top: 50,       // Espacio desde la parte superior (debajo del notch/hora)
    left: 0,
    right: 5,     // Deja un margen a la derecha para que la curva se vea bien
    height: 45,    // Altura del área que abarca la línea y la curva
    borderTopWidth: 3, // Grosor de la línea roja
    borderRightWidth: 3,
    borderColor: '#E10600', // Rojo oficial F1
    borderTopRightRadius: 30, // Esto genera el "medio círculo" o curva
  },
  title: {
    fontFamily: 'F1-Black', // La fuente que ya agregaste
    fontSize: 32,
    color: '#E10600',
    marginTop: 55, // Para que quede centrado debajo de la línea superior
  },
});

export default HeaderF1;