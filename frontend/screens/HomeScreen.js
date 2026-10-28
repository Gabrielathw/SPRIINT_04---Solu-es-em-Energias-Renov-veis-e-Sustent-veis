import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from './context/ThemeContext';
import { useFocusEffect } from '@react-navigation/native'; // Para atualizar quando voltar pra tela

export default function HomeScreen({ route, navigation }) {
  const { username } = route.params;
  const { theme } = useTheme();
  const [pontos, setPontos] = useState(0);

  // Busca os pontos do usuário toda vez que a tela ganha foco
  useFocusEffect(
    React.useCallback(() => {
      fetch(`http://localhost:8000/usuario/${username}`)
        .then(res => res.json())
        .then(data => { if(data.pontos !== undefined) setPontos(data.pontos); })
        .catch(err => console.log("Erro ao buscar pontos:", err));
    }, [username])
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={[styles.header, { backgroundColor: theme.primary }]}>
        <Text style={styles.titulo}>Olá, {username}! ⚡</Text>
        <Text style={styles.subtitulo}>O que deseja fazer hoje?</Text>
        
        {/* CARD DE PONTOS NO TOPO */}
        <View style={styles.pontosContainer}>
          <Text style={styles.pontosTexto}>🌟 Meus Pontos:</Text>
          <Text style={styles.pontosValor}>{pontos}</Text>
        </View>
      </View>

      <View style={styles.cardsContainer}>
        <TouchableOpacity style={[styles.card, { backgroundColor: theme.card, borderColor: theme.primary }]} onPress={() => navigation.navigate('NovaRecarga', { username })}>
          <Text style={styles.cardIcon}>⚡</Text>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Nova Recarga</Text>
          <Text style={[styles.cardDesc, { color: theme.subtext }]}>Iniciar agora</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.card, { backgroundColor: theme.card, borderColor: '#F59E0B' }]} onPress={() => navigation.navigate('ScheduleScreen', { username })}>
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
  pontosContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', padding: 10, borderRadius: 10, marginTop: 15, alignSelf: 'flex-start' },
  pontosTexto: { color: '#FFF', fontWeight: 'bold', fontSize: 14, marginRight: 10 },
  pontosValor: { color: '#FEF3C7', fontWeight: 'bold', fontSize: 20 },
  cardsContainer: { padding: 20, gap: 15, marginTop: 20 },
  card: { padding: 25, borderRadius: 16, borderWidth: 2, elevation: 3 },
  cardIcon: { fontSize: 40, marginBottom: 10 },
  cardTitle: { fontSize: 20, fontWeight: 'bold' },
  cardDesc: { fontSize: 14, marginTop: 5 }
});