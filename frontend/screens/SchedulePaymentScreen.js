import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from './context/ThemeContext';
import { agendarRecarga } from './api';

const showAlert = (t, m) => Platform.OS === 'web' ? window.alert(`${t}\n\n${m}`) : Alert.alert(t, m);

export default function SchedulePaymentScreen({ route, navigation }) {
  const { username, estacao, dataFormatadaBackend, dataDigitada, hora, energia, custo } = route.params;
  const { theme } = useTheme();
  
  const [tipoPagamento, setTipoPagamento] = useState('antecipado'); // 'antecipado' ou 'na_hora'
  const [metodo, setMetodo] = useState('pix'); // 'pix', 'debito', 'credito'
  const [carregando, setCarregando] = useState(false);

  const handleConfirmar = async () => {
    setCarregando(true);
    const status_pagamento = tipoPagamento === 'antecipado' ? 'Pago Antecipadamente' : 'Pagamento Pendente';
    
    try {
      await agendarRecarga(username, estacao, dataFormatadaBackend, hora, energia, custo, status_pagamento);
      showAlert('Sucesso', `Agendamento confirmado para ${dataDigitada} às ${hora}.`);
      navigation.navigate('MainTabs', { username });
    } catch (erro) {
      showAlert('Erro', 'Falha ao confirmar agendamento.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={[styles.header, { backgroundColor: theme.primary }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 15 }}>
          <Ionicons name="arrow-back" size={28} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pagamento do Agendamento</Text>
      </View>

      <View style={styles.content}>
        
        {/* RESUMO DO AGENDAMENTO */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.card }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Resumo do Agendamento</Text>
          <View style={styles.row}><Text style={{ color: theme.subtext }}>Estação</Text><Text style={{ color: theme.text, fontWeight: 'bold' }}>{estacao}</Text></View>
          <View style={styles.row}><Text style={{ color: theme.subtext }}>Data</Text><Text style={{ color: theme.text, fontWeight: 'bold' }}>{dataDigitada}</Text></View>
          <View style={styles.row}><Text style={{ color: theme.subtext }}>Horário</Text><Text style={{ color: theme.text, fontWeight: 'bold' }}>{hora}</Text></View>
          <View style={styles.row}><Text style={{ color: theme.subtext }}>KWh</Text><Text style={{ color: theme.text, fontWeight: 'bold' }}>{energia.toFixed(2)} KWh</Text></View>
          <View style={[styles.row, { borderTopWidth: 1, borderColor: theme.border, paddingTop: 10, marginTop: 10 }]}>
            <Text style={{ color: theme.text, fontWeight: 'bold', fontSize: 16 }}>Valor</Text>
            <Text style={{ color: theme.primary, fontWeight: 'bold', fontSize: 20 }}>R$ {custo.toFixed(2)}</Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>Como deseja pagar?</Text>
        
        {/* OPÇÃO 1: PAGAR AGORA */}
        <TouchableOpacity 
          style={[styles.optionButton, { borderColor: tipoPagamento === 'antecipado' ? theme.primary : theme.border }]}
          onPress={() => setTipoPagamento('antecipado')}
        >
          <View style={[styles.radio, { borderColor: tipoPagamento === 'antecipado' ? theme.primary : theme.subtext, backgroundColor: tipoPagamento === 'antecipado' ? theme.primary : 'transparent' }]} />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={{ color: theme.text, fontWeight: 'bold' }}>Pagar antecipadamente</Text>
            <Text style={{ color: theme.subtext, fontSize: 12 }}>Pagamento confirmado agora</Text>
          </View>
        </TouchableOpacity>

        {/* OPÇÃO 2: PAGAR NA HORA */}
        <TouchableOpacity 
          style={[styles.optionButton, { borderColor: tipoPagamento === 'na_hora' ? theme.primary : theme.border }]}
          onPress={() => setTipoPagamento('na_hora')}
        >
          <View style={[styles.radio, { borderColor: tipoPagamento === 'na_hora' ? theme.primary : theme.subtext, backgroundColor: tipoPagamento === 'na_hora' ? theme.primary : 'transparent' }]} />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={{ color: theme.text, fontWeight: 'bold' }}>Pagar no momento da recarga</Text>
            <Text style={{ color: theme.subtext, fontSize: 12 }}>Pagamento pendente</Text>
          </View>
        </TouchableOpacity>

        {/* MÉTODOS DE PAGAMENTO (SÓ APARECEM SE FOR ANTECIPADO) */}
        {tipoPagamento === 'antecipado' && (
          <View style={{ marginTop: 20 }}>
            <Text style={[styles.sectionTitle, { color: theme.text, fontSize: 16 }]}>Método:</Text>
            
            <TouchableOpacity style={[styles.card, { borderColor: metodo === 'pix' ? theme.primary : theme.border, flexDirection: 'row', alignItems: 'center' }]} onPress={() => setMetodo('pix')}>
              <Text style={{ fontSize: 24, marginRight: 10 }}>📱</Text>
              <Text style={{ color: theme.text, fontWeight: 'bold', flex: 1 }}>Pix</Text>
              {metodo === 'pix' && <Ionicons name="checkmark-circle" size={24} color={theme.primary} />}
            </TouchableOpacity>

            <TouchableOpacity style={[styles.card, { borderColor: metodo === 'debito' ? theme.primary : theme.border, flexDirection: 'row', alignItems: 'center' }]} onPress={() => setMetodo('debito')}>
              <Text style={{ fontSize: 24, marginRight: 10 }}>💳</Text>
              <Text style={{ color: theme.text, fontWeight: 'bold', flex: 1 }}>Cartão de Débito</Text>
              {metodo === 'debito' && <Ionicons name="checkmark-circle" size={24} color={theme.primary} />}
            </TouchableOpacity>

            <TouchableOpacity style={[styles.card, { borderColor: metodo === 'credito' ? theme.primary : theme.border, flexDirection: 'row', alignItems: 'center' }]} onPress={() => setMetodo('credito')}>
              <Text style={{ fontSize: 24, marginRight: 10 }}>💳</Text>
              <Text style={{ color: theme.text, fontWeight: 'bold', flex: 1 }}>Cartão de Crédito</Text>
              {metodo === 'credito' && <Ionicons name="checkmark-circle" size={24} color={theme.primary} />}
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity style={[styles.mainButton, { backgroundColor: theme.primary, marginTop: 20 }]} onPress={handleConfirmar} disabled={carregando}>
          <Text style={styles.mainButtonText}>{carregando ? 'Processando...' : 'Confirmar Agendamento ✓'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 60, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#FFF' },
  content: { padding: 20, paddingBottom: 60 },
  card: { padding: 20, borderRadius: 16, borderWidth: 2, marginBottom: 15 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  optionButton: { flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderRadius: 12, padding: 15, marginBottom: 10 },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2 },
  mainButton: { padding: 18, borderRadius: 12, alignItems: 'center' },
  mainButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' }
});