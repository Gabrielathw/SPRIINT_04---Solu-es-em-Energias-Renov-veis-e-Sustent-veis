import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from './context/ThemeContext';

export default function HomeScreen({ route, navigation }) {
  const { username } = route.params;
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* CABEÇALHO */}
      <View style={[styles.header, { backgroundColor: theme.primary }]}>
        <Text style={styles.titulo}>Olá, {username}! ⚡</Text>
        <Text style={styles.subtitulo}>O que deseja fazer hoje?</Text>
      </View>

      {/* CARDS DE AÇÃO */}
      <View style={styles.cardsContainer}>
        {/* Card Nova Recarga */}
        <TouchableOpacity 
          style={[styles.card, { backgroundColor: theme.card, borderColor: theme.primary }]} 
          onPress={() => navigation.navigate('NovaRecarga', { username })}
        >
          <Text style={styles.cardIcon}>⚡</Text>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Nova Recarga</Text>
          <Text style={[styles.cardDesc, { color: theme.subtext }]}>Iniciar agora</Text>
        </TouchableOpacity>

        {/* Card Agendar Recarga */}
        <TouchableOpacity 
          style={[styles.card, { backgroundColor: theme.card, borderColor: '#F59E0B' }]} 
          onPress={() => navigation.navigate('ScheduleScreen', { username })} // <-- AQUI ESTAVA O ERRO
        >
          <Text style={styles.cardIcon}>📅</Text>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Agendar Recarga</Text>
          <Text style={[styles.cardDesc, { color: theme.subtext }]}>Reservar horário</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 30, paddingTop: 60, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  titulo: { fontSize: 28, fontWeight: 'bold', color: '#FFF' },
  subtitulo: { fontSize: 16, color: 'rgba(255,255,255,0.8)', marginTop: 5 },
  cardsContainer: { padding: 20, gap: 15, marginTop: 20 },
  card: { padding: 25, borderRadius: 16, borderWidth: 2, elevation: 3 },
  cardIcon: { fontSize: 40, marginBottom: 10 },
  cardTitle: { fontSize: 20, fontWeight: 'bold' },
  cardDesc: { fontSize: 14, marginTop: 5 }
});