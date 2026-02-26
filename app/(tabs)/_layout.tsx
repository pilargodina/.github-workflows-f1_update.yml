import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
// 1. Importamos tu hook de tema
import { useTheme } from '../../context/ThemeContext';

export default function TabLayout() {
  // 2. Extraemos los colores y el estado del tema global
  const { colors, isDarkMode } = useTheme();

  return (
    <Tabs screenOptions={{ 
      // El rojo de F1 se mantiene siempre activo
      tabBarActiveTintColor: '#E10600', 
      // El color de los iconos inactivos cambia según el modo
      tabBarInactiveTintColor: isDarkMode ? '#888' : '#999',
      headerShown: false, 
      tabBarStyle: { 
        // 3. Aplicamos el color de fondo y borde dinámico
        backgroundColor: colors.background, 
        borderTopWidth: 1,
        borderTopColor: colors.border,
        height: 60,
        paddingBottom: 8
      },
      tabBarLabelStyle: {
        fontFamily: 'F1-Regular',
        fontSize: 10,
      }
    }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="race"
        options={{
          title: 'Race',
          tabBarIcon: ({ color }) => <Ionicons name="flag" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="data"
        options={{
          title: 'Data',
          tabBarIcon: ({ color }) => <Ionicons name="stats-chart" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <Ionicons name="person" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}