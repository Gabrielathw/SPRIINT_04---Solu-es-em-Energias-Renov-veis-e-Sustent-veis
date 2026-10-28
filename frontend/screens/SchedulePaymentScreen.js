import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform, Alert, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from './context/ThemeContext';
import { useCard } from './context/CardContext'; 
import { agendarRecarga } from './api';

const showAlert = (t, m) => Platform.OS === 'web' ? window.alert(`${t}\n\n${m}`) : Alert.alert(t, m);

export default function SchedulePaymentScreen({ route, navigation }) {
  const { username, estacao, dataFormatadaBackend, dataDigitada, hora, energia, custo } = route.params;
  const { theme } = useTheme();
  const { cartoes, adicionarCartao } = useCard(); 
  
  const [tipoPagamento, setTipoPagamento] = useState('antecipado'); 
  const [metodo, setMetodo] = useState('pix'); 
  const [tipoCartao, setTipoCartao] = useState('credito'); 
  const [cartaoSelecionado, setCartaoSelecionado] = useState(null);
  
  const [mostrarFormulario, setMostrarFormulario] = useState(cartoes.length === 0);
  const [novoCartao, setNovoCartao] = useState({ numero: '', nome: '', validade: '', cvv: '' });
  const [carregando, setCarregando] = useState(false);

  const handleSalvarNaHora = () => {
    if (novoCartao.numero.length < 16) return showAlert('Erro', 'O número do cartão precisa ter 16 dígitos.');
    if (!novoCartao.nome || !novoCartao.validade || !novoCartao.cvv) return showAlert('Erro', 'Preencha todos os campos.');
    
    adicionarCartao(novoCartao); 
    setNovoCartao({ numero: '', nome: '', validade: '', cvv: '' }); 
    setMostrarFormulario(false); 
    showAlert('Sucesso', 'Cartão cadastrado! Agora selecione-o.');
  };

  const handleConfirmar = async () => {
    if (tipoPagamento === 'antecipado' && metodo === 'cartao') {
      if (cartoes.length > 0 && cartaoSelecionado === null) {
        return showAlert('Aviso', 'Selecione um dos seus cartões para pagar.');
      }
      if (cartoes.length === 0) {
        return showAlert('Aviso', 'Você precisa cadastrar um cartão primeiro.');
      }
    }

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
        
        <TouchableOpacity style={[styles.optionButton, { borderColor: tipoPagamento === 'antecipado' ? theme.primary : theme.border }]} onPress={() => setTipoPagamento('antecipado')}>
          <View style={[styles.radio, { borderColor: tipoPagamento === 'antecipado' ? theme.primary : theme.subtext, backgroundColor: tipoPagamento === 'antecipado' ? theme.primary : 'transparent' }]} />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={{ color: theme.text, fontWeight: 'bold' }}>Pagar antecipadamente</Text>
            <Text style={{ color: theme.subtext, fontSize: 12 }}>Pagamento confirmado agora</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.optionButton, { borderColor: tipoPagamento === 'na_hora' ? theme.primary : theme.border }]} onPress={() => setTipoPagamento('na_hora')}>
          <View style={[styles.radio, { borderColor: tipoPagamento === 'na_hora' ? theme.primary : theme.subtext, backgroundColor: tipoPagamento === 'na_hora' ? theme.primary : 'transparent' }]} />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={{ color: theme.text, fontWeight: 'bold' }}>Pagar no momento da recarga</Text>
            <Text style={{ color: theme.subtext, fontSize: 12 }}>Pagamento pendente</Text>
          </View>
        </TouchableOpacity>

        {tipoPagamento === 'antecipado' && (
          <View style={{ marginTop: 20 }}>
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 15 }}>
              <TouchableOpacity style={[styles.tabButton, { borderColor: theme.primary, backgroundColor: metodo === 'pix' ? theme.primary : 'transparent' }]} onPress={() => setMetodo('pix')}>
                <Text style={{ color: metodo === 'pix' ? '#FFF' : theme.text, fontWeight: 'bold' }}>Pix</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.tabButton, { borderColor: theme.primary, backgroundColor: metodo === 'cartao' ? theme.primary : 'transparent' }]} onPress={() => setMetodo('cartao')}>
                <Text style={{ color: metodo === 'cartao' ? '#FFF' : theme.text, fontWeight: 'bold' }}>Cartão</Text>
              </TouchableOpacity>
            </View>

            {metodo === 'pix' ? (
              <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border, alignItems: 'center' }]}>
                <Text style={{ color: theme.text, fontWeight: 'bold', marginBottom: 10 }}>Escaneie o QR Code abaixo:</Text>
                <Text style={{ fontSize: 100 }}>🔳</Text>
                <Text style={{ color: theme.subtext, fontSize: 12 }}>Chave Pix: chargevolt@pagamentos.com</Text>
              </View>
            ) : (
              <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
                
                {mostrarFormulario ? (
                  <>
                    <Text style={{ color: theme.text, fontWeight: 'bold', marginBottom: 10 }}>Cadastre um novo cartão:</Text>
                    <TextInput style={[styles.input, { borderColor: theme.border, color: theme.text }]} placeholder="Número do Cartão" placeholderTextColor={theme.subtext} keyboardType="numeric" maxLength={16} value={novoCartao.numero} onChangeText={(t) => setNovoCartao({...novoCartao, numero: t})} />
                    <TextInput style={[styles.input, { borderColor: theme.border, color: theme.text }]} placeholder="Nome no Cartão" placeholderTextColor={theme.subtext} value={novoCartao.nome} onChangeText={(t) => setNovoCartao({...novoCartao, nome: t})} />
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                      <TextInput style={[styles.input, { flex: 1, borderColor: theme.border, color: theme.text }]} placeholder="MM/AA" placeholderTextColor={theme.subtext} value={novoCartao.validade} onChangeText={(t) => setNovoCartao({...novoCartao, validade: t})} />
                      <TextInput style={[styles.input, { flex: 1, borderColor: theme.border, color: theme.text }]} placeholder="CVV" placeholderTextColor={theme.subtext} maxLength={3} secureTextEntry value={novoCartao.cvv} onChangeText={(t) => setNovoCartao({...novoCartao, cvv: t})} />
                    </View>
                    <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                      <TouchableOpacity style={[styles.mainButton, { flex: 1, backgroundColor: theme.primary, padding: 12 }]} onPress={handleSalvarNaHora}>
                        <Text style={styles.mainButtonText}>Salvar</Text>
                      </TouchableOpacity>
                      {cartoes.length > 0 && (
                        <TouchableOpacity style={[styles.mainButton, { flex: 1, backgroundColor: '#EF4444', padding: 12 }]} onPress={() => setMostrarFormulario(false)}>
                          <Text style={styles.mainButtonText}>Cancelar</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </>
                ) : (
                  <>
                    <Text style={{ color: theme.text, fontWeight: 'bold', marginBottom: 10 }}>Selecione o Cartão:</Text>
                    {cartoes.map((c, index) => (
                      <TouchableOpacity key={index} style={[styles.cardItem, { borderColor: cartaoSelecionado === index ? theme.primary : theme.border, backgroundColor: cartaoSelecionado === index ? theme.bg : 'transparent' }]} onPress={() => setCartaoSelecionado(index)}>
                        <Text style={{ color: theme.text, fontWeight: 'bold' }}>💳 Cartão Final {c.numero.slice(-4)}</Text>
                        {cartaoSelecionado === index && <Ionicons name="checkmark-circle" size={20} color={theme.primary} />}
                      </TouchableOpacity>
                    ))}
                    <TouchableOpacity style={[styles.mainButton, { backgroundColor: 'transparent', borderWidth: 2, borderColor: theme.primary, padding: 10, marginTop: 10 }]} onPress={() => setMostrarFormulario(true)}>
                      <Text style={{ color: theme.primary, fontWeight: 'bold' }}>+ Adicionar Novo Cartão</Text>
                    </TouchableOpacity>
                  </>
                )}

                <Text style={{ color: theme.text, fontWeight: 'bold', marginTop: 20, marginBottom: 10 }}>Tipo de Transação:</Text>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <TouchableOpacity style={[styles.tabButton, { flex: 1, borderColor: theme.primary, backgroundColor: tipoCartao === 'credito' ? theme.primary : 'transparent' }]} onPress={() => setTipoCartao('credito')}>
                    <Text style={{ color: tipoCartao === 'credito' ? '#FFF' : theme.text }}>Crédito</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.tabButton, { flex: 1, borderColor: theme.primary, backgroundColor: tipoCartao === 'debito' ? theme.primary : 'transparent' }]} onPress={() => setTipoCartao('debito')}>
                    <Text style={{ color: tipoCartao === 'debito' ? '#FFF' : theme.text }}>Débito</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
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
  container: { flex: 1 }, header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 60, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#FFF' }, content: { padding: 20, paddingBottom: 60 },
  card: { padding: 20, borderRadius: 16, borderWidth: 2, marginBottom: 15 }, cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }, sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  optionButton: { flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderRadius: 12, padding: 15, marginBottom: 10 },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2 }, mainButton: { padding: 18, borderRadius: 12, alignItems: 'center' },
  mainButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' }, tabButton: { flex: 1, padding: 12, borderRadius: 10, borderWidth: 2, alignItems: 'center' },
  cardItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 2, borderRadius: 10, padding: 15, marginBottom: 10 },
  input: { borderWidth: 2, borderRadius: 10, padding: 12, marginBottom: 10, fontSize: 16 }
});