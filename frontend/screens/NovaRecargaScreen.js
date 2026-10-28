import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from './context/ThemeContext';

const POWER_KW = 7.4;
const PRECO_NORMAL = 0.75;
const PRECO_PICO = 1.15;
const TAXA_FIXA = 0.15;

export default function NovaRecargaScreen({ route, navigation }) {
  const { username } = route.params;
  const { theme } = useTheme();
  
  const [modo, setModo] = useState('kwh');
  const [kwh, setKwh] = useState(20);
  const [horas, setHoras] = useState('1');
  const [minutos, setMinutos] = useState('0');

  // Pega a hora atual para calcular o preço dinamicamente
  const horaAtual = new Date().getHours();
  const isPico = (horaAtual >= 12 && horaAtual < 14) || (horaAtual >= 18 && horaAtual < 22);
  const precoAtualKwh = isPico ? PRECO_PICO : PRECO_NORMAL;

  let energiaFinal = 0;
  if (modo === 'kwh') {
    energiaFinal = parseFloat(kwh) || 0;
  } else {
    const tempoTotalHoras = (parseFloat(horas) || 0) + (parseFloat(minutos) || 0) / 60;
    energiaFinal = tempoTotalHoras * POWER_KW;
  }
  
  const custoTotal = (energiaFinal * precoAtualKwh) + TAXA_FIXA;
  const duracaoMinutos = (energiaFinal / POWER_KW) * 60;

  const handleAvancar = () => {
    // Passamos a horaAtual para a API saber qual preço cobrar
    navigation.navigate('StationScreen', { 
      username, energia: energiaFinal, custo: custoTotal, duracao: duracaoMinutos, horaSimulada: horaAtual 
    });
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={[styles.header, { backgroundColor: theme.primary, flexDirection: 'row', alignItems: 'center' }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 15 }}>
          <Ionicons name="arrow-back" size={28} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>⚡ Nova Recarga</Text>
      </View>

      <View style={styles.content}>
        <View style={[styles.tabContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <TouchableOpacity style={[styles.tabButton, modo === 'kwh' && { backgroundColor: theme.primary }]} onPress={() => setModo('kwh')}>
            <Text style={[styles.tabText, { color: modo === 'kwh' ? '#FFF' : theme.text }]}>Por KWh</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tabButton, modo === 'tempo' && { backgroundColor: theme.primary }]} onPress={() => setModo('tempo')}>
            <Text style={[styles.tabText, { color: modo === 'tempo' ? '#FFF' : theme.text }]}>Por Tempo</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          {modo === 'kwh' ? (
            <>
              <Text style={[styles.cardTitle, { color: theme.text }]}>Quantos KWh deseja adicionar?</Text>
              <View style={styles.grid}>
                {[10, 20, 30, 40, 50, 60].map((val) => (
                  <TouchableOpacity key={val} style={[styles.gridItem, { borderColor: kwh === val ? theme.primary : theme.subtext, backgroundColor: kwh === val ? theme.primary : 'transparent' }]} onPress={() => setKwh(val)}>
                    <Text style={{ color: kwh === val ? '#FFF' : theme.text, fontWeight: 'bold' }}>{val} KWh</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TextInput style={[styles.input, { borderColor: theme.border, color: theme.text, marginTop: 15 }]} keyboardType="numeric" value={String(kwh)} onChangeText={(v) => setKwh(v)} />
            </>
          ) : (
            <>
              <Text style={[styles.cardTitle, { color: theme.text }]}>Por quanto tempo deseja carregar?</Text>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}><Text style={{ color: theme.subtext }}>Horas</Text><TextInput style={[styles.input, { borderColor: theme.border, color: theme.text }]} keyboardType="numeric" value={horas} onChangeText={setHoras} /></View>
                <View style={{ flex: 1 }}><Text style={{ color: theme.subtext }}>Minutos</Text><TextInput style={[styles.input, { borderColor: theme.border, color: theme.text }]} keyboardType="numeric" value={minutos} onChangeText={setMinutos} /></View>
              </View>
            </>
          )}
        </View>

        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Resumo da Recarga</Text>
          <View style={styles.summaryRow}><Text style={{ color: theme.subtext }}>Energia</Text><Text style={{ color: theme.text, fontWeight: 'bold' }}>{energiaFinal.toFixed(2)} KWh</Text></View>
          <View style={styles.summaryRow}><Text style={{ color: theme.subtext }}>Preço do KWh {isPico ? '(PICO)' : '(NORMAL)'}</Text><Text style={{ color: theme.text, fontWeight: 'bold' }}>R$ {precoAtualKwh.toFixed(2)}</Text></View>
          <View style={styles.summaryRow}><Text style={{ color: theme.subtext }}>Taxa de Sessão</Text><Text style={{ color: theme.text, fontWeight: 'bold' }}>R$ {TAXA_FIXA.toFixed(2)}</Text></View>
          <View style={[styles.summaryRow, { borderTopWidth: 1, borderColor: theme.border, paddingTop: 10, marginTop: 10 }]}>
            <Text style={{ color: theme.text, fontWeight: 'bold', fontSize: 18 }}>Total</Text>
            <Text style={{ color: theme.primary, fontWeight: 'bold', fontSize: 22 }}>R$ {custoTotal.toFixed(2)}</Text>
          </View>
        </View>

        <TouchableOpacity style={[styles.mainButton, { backgroundColor: theme.primary }]} onPress={handleAvancar}>
          <Text style={styles.mainButtonText}>Identificar Estação →</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 }, header: { padding: 20, paddingTop: 60 }, headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#FFF' },
  content: { padding: 20 }, tabContainer: { flexDirection: 'row', borderRadius: 12, borderWidth: 2, marginBottom: 20, overflow: 'hidden' },
  tabButton: { flex: 1, padding: 15, alignItems: 'center' }, tabText: { fontWeight: 'bold', fontSize: 16 },
  card: { padding: 20, borderRadius: 16, borderWidth: 2, marginBottom: 20 }, cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'space-between' }, gridItem: { width: '30%', padding: 12, borderRadius: 10, borderWidth: 2, alignItems: 'center' },
  input: { borderWidth: 2, borderRadius: 10, padding: 12, fontSize: 16 }, summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  mainButton: { padding: 18, borderRadius: 12, alignItems: 'center' }, mainButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' }
});