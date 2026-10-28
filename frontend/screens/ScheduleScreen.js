import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from './context/ThemeContext';

const HORARIOS = ['06:00', '07:00', '08:00', '09:00', '10:00', '12:00', '13:00', '15:00', '16:00', '18:00', '19:00', '20:00'];
const POWER_KW = 7.4;
const PRECO_NORMAL = 0.75;
const PRECO_PICO = 1.15;
const TAXA_FIXA = 0.15;

const showAlert = (t, m) => Platform.OS === 'web' ? window.alert(`${t}\n\n${m}`) : Alert.alert(t, m);

export default function ScheduleScreen({ route, navigation }) {
  const { username } = route.params;
  const { theme } = useTheme();
  
  const [estacaoSelecionada, setEstacaoSelecionada] = useState('Shopping Central');
  const [dataDigitada, setDataDigitada] = useState('03/11/2026'); 
  const [horaSelecionada, setHoraSelecionada] = useState('');
  const [modo, setModo] = useState('kwh'); 
  const [kwh, setKwh] = useState('20');
  const [horas, setHoras] = useState('1');
  const [minutos, setMinutos] = useState('0');

  let energiaFinal = 0;
  if (modo === 'kwh') {
    energiaFinal = parseFloat(kwh) || 0;
  } else {
    const tempoTotalHoras = (parseFloat(horas) || 0) + (parseFloat(minutos) || 0) / 60;
    energiaFinal = tempoTotalHoras * POWER_KW;
  }
  
  // Descobre se a hora selecionada é pico
  let horaInt = -1;
  if (horaSelecionada) {
    horaInt = parseInt(horaSelecionada.split(':')[0]);
  }
  const isPico = (horaInt >= 12 && horaInt < 14) || (horaInt >= 18 && horaInt < 22);
  const precoAtualKwh = isPico ? PRECO_PICO : PRECO_NORMAL;
  
  // Cálculo final com a taxa
  const custoEstimado = (energiaFinal * precoAtualKwh) + TAXA_FIXA;
  
  const converterDataParaBackend = (dataBR) => {
    if (!dataBR || dataBR.length !== 10) return '';
    const [dia, mes, ano] = dataBR.split('/');
    return `${ano}-${mes}-${dia}`;
  };

  const handleAgendar = () => {
    if (!horaSelecionada) return showAlert('Aviso', 'Selecione um horário.');
    if (!dataDigitada || dataDigitada.length !== 10) return showAlert('Aviso', 'Digite uma data válida (DD/MM/AAAA).');
    
    const dataFormatadaBackend = converterDataParaBackend(dataDigitada);

    navigation.navigate('SchedulePaymentScreen', { 
      username, estacao: estacaoSelecionada, dataFormatadaBackend, dataDigitada, 
      hora: horaSelecionada, energia: energiaFinal, custo: custoEstimado 
    });
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={[styles.header, { backgroundColor: theme.primary, flexDirection: 'row', alignItems: 'center' }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 15 }}><Ionicons name="arrow-back" size={28} color="#FFF" /></TouchableOpacity>
        <View><Text style={styles.headerTitle}>Data e Horário</Text><Text style={styles.headerSubtitle}>{estacaoSelecionada}</Text></View>
      </View>

      <View style={styles.content}>
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.card }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Selecione a data</Text>
          <TextInput style={[styles.input, { borderColor: theme.border, color: theme.text, marginTop: 10 }]} value={dataDigitada} onChangeText={setDataDigitada} maxLength={10} />
        </View>

        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.card }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Selecione o horário</Text>
          <View style={styles.gridContainer}>
            {HORARIOS.map((hora) => (
              <TouchableOpacity key={hora} style={[styles.timeButton, { borderColor: horaSelecionada === hora ? theme.primary : theme.border, backgroundColor: horaSelecionada === hora ? theme.primary : 'transparent' }]} onPress={() => setHoraSelecionada(hora)}>
                <Text style={{ color: horaSelecionada === hora ? '#FFF' : theme.text, fontWeight: 'bold' }}>{hora}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.card }]}>
          <View style={{ flexDirection: 'row', backgroundColor: theme.bg, borderRadius: 10, padding: 4, marginBottom: 15 }}>
            <TouchableOpacity style={[styles.tabButton, modo === 'kwh' && { backgroundColor: theme.primary }]} onPress={() => setModo('kwh')}><Text style={{ color: modo === 'kwh' ? '#FFF' : theme.subtext, fontWeight: 'bold' }}>Por KWh</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.tabButton, modo === 'tempo' && { backgroundColor: theme.primary }]} onPress={() => setModo('tempo')}><Text style={{ color: modo === 'tempo' ? '#FFF' : theme.subtext, fontWeight: 'bold' }}>Por Duração</Text></TouchableOpacity>
          </View>

          {modo === 'kwh' ? (
            <><Text style={{ color: theme.subtext, marginBottom: 5 }}>Quantidade de KWh:</Text><TextInput style={[styles.input, { borderColor: theme.border, color: theme.text }]} value={kwh} onChangeText={setKwh} keyboardType="numeric" /></>
          ) : (
            <><Text style={{ color: theme.subtext, marginBottom: 5 }}>Tempo de duração:</Text><View style={{ flexDirection: 'row', gap: 10 }}><TextInput style={[styles.input, { flex: 1, borderColor: theme.border, color: theme.text }]} keyboardType="numeric" value={horas} onChangeText={setHoras} /><TextInput style={[styles.input, { flex: 1, borderColor: theme.border, color: theme.text }]} keyboardType="numeric" value={minutos} onChangeText={setMinutos} /></View></>
          )}

          <View style={[styles.summaryBox, { backgroundColor: theme.bg }]}>
            <View style={styles.summaryRow}><Text style={{ color: theme.subtext }}>Energia total</Text><Text style={{ color: theme.text, fontWeight: 'bold' }}>{energiaFinal.toFixed(2)} KWh</Text></View>
            <View style={styles.summaryRow}><Text style={{ color: theme.subtext }}>Preço do KWh {horaSelecionada ? (isPico ? '(PICO)' : '(NORMAL)') : ''}</Text><Text style={{ color: theme.text, fontWeight: 'bold' }}>R$ {precoAtualKwh.toFixed(2)}</Text></View>
            <View style={styles.summaryRow}><Text style={{ color: theme.subtext }}>Taxa de Sessão</Text><Text style={{ color: theme.text, fontWeight: 'bold' }}>R$ {TAXA_FIXA.toFixed(2)}</Text></View>
            <View style={[styles.summaryRow, { marginTop: 5, borderTopWidth: 1, borderColor: theme.border, paddingTop: 5 }]}><Text style={{ color: theme.text, fontWeight: 'bold' }}>Custo estimado</Text><Text style={{ color: theme.primary, fontWeight: 'bold', fontSize: 20 }}>R$ {custoEstimado.toFixed(2)}</Text></View>
          </View>
        </View>

        <TouchableOpacity style={[styles.mainButton, { backgroundColor: theme.primary }]} onPress={handleAgendar}>
          <Text style={styles.mainButtonText}>Escolher Pagamento →</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 }, header: { padding: 20, paddingTop: 60, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 }, headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#FFF' }, headerSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  content: { padding: 20, paddingBottom: 60 }, card: { padding: 20, borderRadius: 16, marginBottom: 15, elevation: 2 }, cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'flex-start', marginTop: 10 }, timeButton: { width: '22%', paddingVertical: 12, borderRadius: 10, borderWidth: 2, alignItems: 'center' },
  tabButton: { flex: 1, padding: 10, borderRadius: 8, alignItems: 'center' }, input: { borderWidth: 2, borderRadius: 10, padding: 15, fontSize: 16 },
  summaryBox: { padding: 15, borderRadius: 12, marginTop: 15 }, summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  mainButton: { padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 10 }, mainButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' }
});