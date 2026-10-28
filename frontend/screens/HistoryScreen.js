import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { buscarHistorico } from './api';

export default function HistoryScreen({ route, navigation }) {
  const { username } = route.params;
  const [historico, setHistorico] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarHistorico();
  }, []);

  const carregarHistorico = async () => {
    try {
      const res = await buscarHistorico(username);
      setHistorico(res.historico);
    } catch (erro) {
      console.error(erro);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.titulo}>Histórico de Recargas</Text>
        <Text style={styles.subtitulo}>Usuário: {username}</Text>
      </View>

      {carregando ? (
        <ActivityIndicator size="large" color="#2E86AB" style={{ marginTop: 50 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.lista}>
          {historico.length === 0 ? (
            <Text style={styles.textoVazio}>Nenhuma recarga realizada ainda.</Text>
          ) : (
            historico.map((item) => (
              <View key={item.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardData}>{item.data_hora}</Text>
                  <View style={styles.badge}>
                    <Text style={styles.badgeTexto}>{item.status}</Text>
                  </View>
                </View>
                <View style={styles.cardInfo}>
                  <View>
                    <Text style={styles.label}>Energia</Text>
                    <Text style={styles.valor}>{item.kwh} KWh</Text>
                  </View>
                  <View>
                    <Text style={styles.label}>Valor Pago</Text>
                    <Text style={[styles.valor, { color: '#10B981' }]}>R$ {item.custo.toFixed(2)}</Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}

      <TouchableOpacity style={styles.botaoVoltar} onPress={() => navigation.goBack()}>
        <Text style={styles.textoBotao}>Voltar para Nova Recarga</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { backgroundColor: '#2E86AB', padding: 20, paddingTop: 40, paddingBottom: 20 },
  titulo: { fontSize: 24, fontWeight: 'bold', color: '#FFF' },
  subtitulo: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  lista: { padding: 20 },
  textoVazio: { textAlign: 'center', color: '#666', marginTop: 20, fontSize: 16 },
  card: { backgroundColor: '#FFF', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  cardData: { fontSize: 12, color: '#666' },
  badge: { backgroundColor: '#E8F5E9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  badgeTexto: { color: '#10B981', fontSize: 12, fontWeight: 'bold' },
  cardInfo: { flexDirection: 'row', justifyContent: 'space-between' },
  label: { fontSize: 12, color: '#999', marginBottom: 4 },
  valor: { fontSize: 16, fontWeight: 'bold', color: '#1A1A1A' },
  botaoVoltar: { backgroundColor: '#FFF', padding: 16, alignItems: 'center', borderTopWidth: 1, borderColor: '#EEE' },
  textoBotao: { color: '#2E86AB', fontSize: 16, fontWeight: 'bold' }
});