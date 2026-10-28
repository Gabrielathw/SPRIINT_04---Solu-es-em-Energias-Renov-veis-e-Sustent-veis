import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from './context/ThemeContext';
import { buscarHistorico, buscarAgendamentos } from './api';

export default function HistoryScreen({ route }) {
  const { username } = route.params;
  const { theme } = useTheme();
  
  const [abaAtiva, setAbaAtiva] = useState('recargas'); // 'recargas' ou 'agendamentos'
  const [recargas, setRecargas] = useState([]);
  const [agendamentos, setAgendamentos] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setCarregando(true);
    try {
      const resRecargas = await buscarHistorico(username);
      setRecargas(resRecargas.historico || []);
      
      const resAgendamentos = await buscarAgendamentos(username);
      setAgendamentos(resAgendamentos.agendamentos || []);
    } catch (error) {
      console.log("Erro ao carregar dados:", error);
    } finally {
      setCarregando(false);
    }
  };

  // Formata a data de AAAA-MM-DD para DD/MM/AAAA
  const formatarDataBR = (dataStr) => {
    if (!dataStr) return '';
    const [ano, mes, dia] = dataStr.split('-');
    return `${dia}/${mes}/${ano}`;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* CABEÇALHO */}
      <View style={[styles.header, { backgroundColor: theme.primary }]}>
        <Text style={styles.headerTitle}>Meu Histórico</Text>
        <Text style={styles.headerSubtitle}>Usuário: {username}</Text>
      </View>

      {/* ABAS INTERNAS */}
      <View style={{ flexDirection: 'row', padding: 20, paddingBottom: 10 }}>
        <TouchableOpacity 
          style={[styles.tabButton, { backgroundColor: abaAtiva === 'recargas' ? theme.primary : theme.card, borderColor: theme.primary }]}
          onPress={() => setAbaAtiva('recargas')}
        >
          <Text style={{ color: abaAtiva === 'recargas' ? '#FFF' : theme.text, fontWeight: 'bold' }}>Recargas</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tabButton, { backgroundColor: abaAtiva === 'agendamentos' ? theme.primary : theme.card, borderColor: theme.primary }]}
          onPress={() => setAbaAtiva('agendamentos')}
        >
          <Text style={{ color: abaAtiva === 'agendamentos' ? '#FFF' : theme.text, fontWeight: 'bold' }}>Agendamentos</Text>
        </TouchableOpacity>
      </View>

      {/* LISTA DE DADOS */}
      {carregando ? (
        <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 50 }} />
      ) : (
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          
          {/* MOSTRAR RECARGAS */}
          {abaAtiva === 'recargas' && (
            recargas.length === 0 ? (
              <Text style={{ textAlign: 'center', color: theme.subtext, marginTop: 20 }}>Nenhuma recarga realizada.</Text>
            ) : (
              recargas.map((item) => (
                <View key={item.id} style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
                  <View style={styles.row}>
                    <Text style={{ color: theme.text, fontWeight: 'bold' }}>Recarga Concluída</Text>
                    <Text style={{ color: theme.subtext, fontSize: 12 }}>{formatarDataBR(item.data_hora.split(' ')[0])}</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={{ color: theme.subtext }}>Energia: <Text style={{ color: theme.text, fontWeight: 'bold' }}>{item.kwh.toFixed(2)} KWh</Text></Text>
                    <Text style={{ color: theme.primary, fontWeight: 'bold' }}>R$ {item.custo.toFixed(2)}</Text>
                  </View>
                </View>
              ))
            )
          )}

          {/* MOSTRAR AGENDAMENTOS */}
          {abaAtiva === 'agendamentos' && (
            agendamentos.length === 0 ? (
              <Text style={{ textAlign: 'center', color: theme.subtext, marginTop: 20 }}>Nenhum agendamento encontrado.</Text>
            ) : (
              agendamentos.map((item) => (
                <View key={item.id} style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
                  <View style={styles.row}>
                    <Text style={{ color: theme.text, fontWeight: 'bold' }}>{item.estacao}</Text>
                    <View style={{ backgroundColor: item.status.includes('Pendente') ? '#FEF3C7' : '#D1FAE5', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 }}>
                      <Text style={{ color: item.status.includes('Pendente') ? '#D97706' : '#059669', fontSize: 10, fontWeight: 'bold' }}>
                        {item.status}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.row}>
                    <Text style={{ color: theme.subtext }}>Data/Hora:</Text>
                    <Text style={{ color: theme.text, fontWeight: 'bold' }}>{formatarDataBR(item.data)} às {item.hora}</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={{ color: theme.subtext }}>Energia:</Text>
                    <Text style={{ color: theme.text, fontWeight: 'bold' }}>{item.kwh.toFixed(2)} KWh</Text>
                  </View>
                  <View style={[styles.row, { marginTop: 5, borderTopWidth: 1, borderColor: theme.border, paddingTop: 5 }]}>
                    <Text style={{ color: theme.text, fontWeight: 'bold' }}>Valor:</Text>
                    <Text style={{ color: theme.primary, fontWeight: 'bold', fontSize: 16 }}>R$ {item.custo.toFixed(2)}</Text>
                  </View>
                </View>
              ))
            )
          )}

        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, paddingTop: 60 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#FFF' },
  headerSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  tabButton: { flex: 1, paddingVertical: 12, borderWidth: 2, borderRadius: 10, alignItems: 'center', marginHorizontal: 5 },
  card: { padding: 15, borderRadius: 12, borderWidth: 2, marginBottom: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }
});