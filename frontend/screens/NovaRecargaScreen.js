import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // <-- Importação do ícone adicionada
import { useTheme } from './context/ThemeContext';

const PRICE_PER_KWH = 0.90;
const POWER_KW = 7.4;

export default function NovaRecargaScreen({ route, navigation }) {
  const { username } = route.params;
  const { theme } = useTheme();
  
  const [modo, setModo] = useState('kwh'); // 'kwh' ou 'tempo'
  const [kwh, setKwh] = useState(20);
  const [horas, setHoras] = useState('1');
  const [minutos, setMinutos] = useState('0');

  // Cálculos dinâmicos
  let energiaFinal = 0;
  if (modo === 'kwh') {
    energiaFinal = parseFloat(kwh) || 0;
  } else {
    const tempoTotalHoras = (parseFloat(horas) || 0) + (parseFloat(minutos) || 0) / 60;
    energiaFinal = tempoTotalHoras * POWER_KW;
  }
  const custoTotal = energiaFinal * PRICE_PER_KWH;
  const duracaoMinutos = (energiaFinal / POWER_KW) * 60;

  const handleAvancar = () => {
    navigation.navigate('StationScreen', { 
      username, energia: energiaFinal, custo: custoTotal, duracao: duracaoMinutos 
    });
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* CABEÇALHO COM BOTÃO DE VOLTAR */}
      <View style={[styles.header, { backgroundColor: theme.primary }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 15 }}>
          <Ionicons name="arrow-back" size={28} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>⚡ Nova Recarga</Text>
      </View>

      <View style={styles.content}>
        {/* ABAS KWH / TEMPO */}
        <View style={[styles.tabContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <TouchableOpacity style={[styles.tabButton, modo === 'kwh' && { backgroundColor: theme.primary }]} onPress={() => setModo('kwh')}>
            <Text style={[styles.tabText, { color: modo === 'kwh' ? '#FFF' : theme.text }]}>Por KWh</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tabButton, modo === 'tempo' && { backgroundColor: theme.primary }]} onPress={() => setModo('tempo')}>
            <Text style={[styles.tabText, { color: modo === 'tempo' ? '#FFF' : theme.text }]}>Por Tempo</Text>
          </TouchableOpacity>
        </View>

        {/* SELETOR */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          {modo === 'kwh' ? (
            <>
              <Text style={[styles.cardTitle, { color: theme.text }]}>Quantos KWh deseja adicionar?</Text>
              <View style={styles.grid}>
                {[10, 20, 30, 40, 50, 60].map((val) => (
                  <TouchableOpacity 
                    key={val} 
                    style={[styles.gridItem, { borderColor: kwh === val ? theme.primary : theme.subtext, backgroundColor: kwh === val ? theme.primary : 'transparent' }]}
                    onPress={() => setKwh(val)}
                  >
                    <Text style={{ color: kwh === val ? '#FFF' : theme.text, fontWeight: 'bold' }}>{val} KWh</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={[styles.label, { color: theme.subtext, marginTop: 15 }]}>Ou informe um valor personalizado:</Text>
              <TextInput 
                style={[styles.input, { borderColor: theme.border, color: theme.text }]} 
                keyboardType="numeric" value={String(kwh)} onChangeText={(v) => setKwh(v)} 
              />
            </>
          ) : (
            <>
              <Text style={[styles.cardTitle, { color: theme.text }]}>Por quanto tempo deseja carregar?</Text>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: theme.subtext }}>Horas</Text>
                  <TextInput style={[styles.input, { borderColor: theme.border, color: theme.text }]} keyboardType="numeric" value={horas} onChangeText={setHoras} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: theme.subtext }}>Minutos</Text>
                  <TextInput style={[styles.input, { borderColor: theme.border, color: theme.text }]} keyboardType="numeric" value={minutos} onChangeText={setMinutos} />
                </View>
              </View>
              <Text style={{ color: theme.subtext, marginTop: 10, fontSize: 12 }}>Potência do carregador: {POWER_KW} kW</Text>
            </>
          )}
        </View>

        {/* RESUMO */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Resumo da Recarga</Text>
          <View style={styles.summaryRow}><Text style={{ color: theme.subtext }}>Energia</Text><Text style={{ color: theme.text, fontWeight: 'bold' }}>{energiaFinal.toFixed(2)} KWh</Text></View>
          <View style={styles.summaryRow}><Text style={{ color: theme.subtext }}>Preço por KWh</Text><Text style={{ color: theme.text, fontWeight: 'bold' }}>R$ 0,90/KWh</Text></View>
          <View style={styles.summaryRow}><Text style={{ color: theme.subtext }}>Duração estimada</Text><Text style={{ color: theme.text, fontWeight: 'bold' }}>{Math.floor(duracaoMinutos/60)}h {Math.round(duracaoMinutos%60)}min</Text></View>
          <View style={[styles.summaryRow, { borderTopWidth: 1, borderColor: theme.border, paddingTop: 10, marginTop: 10 }]}>
            <Text style={{ color: theme.text, fontWeight: 'bold', fontSize: 18 }}>Total</Text>
            <Text style={{ color: theme.primary, fontWeight: 'bold', fontSize: 22 }}>R$ {custoTotal.toFixed(2).replace('.', ',')}</Text>
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
  container: { flex: 1 },
  header: { padding: 20, paddingTop: 60, flexDirection: 'row', alignItems: 'center' }, // <-- flexDirection adicionado para alinhar a setinha
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#FFF' },
  content: { padding: 20 },
  tabContainer: { flexDirection: 'row', borderRadius: 12, borderWidth: 2, marginBottom: 20, overflow: 'hidden' },
  tabButton: { flex: 1, padding: 15, alignItems: 'center' },
  tabText: { fontWeight: 'bold', fontSize: 16 },
  card: { padding: 20, borderRadius: 16, borderWidth: 2, marginBottom: 20 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'space-between' },
  gridItem: { width: '30%', padding: 12, borderRadius: 10, borderWidth: 2, alignItems: 'center' },
  label: { fontSize: 14, marginBottom: 5 },
  input: { borderWidth: 2, borderRadius: 10, padding: 12, fontSize: 16 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  mainButton: { padding: 18, borderRadius: 12, alignItems: 'center' },
  mainButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' }
});