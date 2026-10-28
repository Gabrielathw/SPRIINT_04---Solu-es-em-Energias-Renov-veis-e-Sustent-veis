import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform, Alert, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from './context/ThemeContext';
import { useCard } from './context/CardContext'; // <-- Puxa os cartões salvos
import { realizarRecarga } from './api';

const showAlert = (t, m) => Platform.OS === 'web' ? window.alert(`${t}\n\n${m}`) : Alert.alert(t, m);

export default function PaymentScreen({ route, navigation }) {
  const { username, energia, custo, duracao, estacao } = route.params;
  const { theme } = useTheme();
  
  // Puxa a lista global e a função de adicionar
  const { cartoes, adicionarCartao } = useCard(); 
  
  const [metodo, setMetodo] = useState('pix'); // 'pix' ou 'cartao'
  const [tipoCartao, setTipoCartao] = useState('credito'); 
  const [cartaoSelecionado, setCartaoSelecionado] = useState(null);
  
  // Estados para cadastrar cartão na hora (se não tiver nenhum)
  const [novoCartao, setNovoCartao] = useState({ numero: '', nome: '', validade: '', cvv: '' });
  const [carregando, setCarregando] = useState(false);

  // Função para salvar o cartão digitado na hora
  const handleSalvarNaHora = () => {
    if (novoCartao.numero.length < 16) return showAlert('Erro', 'O número do cartão precisa ter 16 dígitos.');
    if (!novoCartao.nome || !novoCartao.validade || !novoCartao.cvv) return showAlert('Erro', 'Preencha todos os campos do cartão.');
    
    adicionarCartao(novoCartao); // Salva na memória global
    setNovoCartao({ numero: '', nome: '', validade: '', cvv: '' }); // Limpa o formulário
    showAlert('Sucesso', 'Cartão cadastrado! Agora selecione-o e clique em Confirmar Pagamento.');
  };

  const handleConfirmar = async () => {
    // Validações antes de pagar
    if (metodo === 'cartao') {
      if (cartoes.length > 0 && cartaoSelecionado === null) {
        return showAlert('Aviso', 'Selecione um dos seus cartões para pagar.');
      }
      if (cartoes.length === 0) {
        return showAlert('Aviso', 'Você precisa cadastrar um cartão primeiro.');
      }
    }

    setCarregando(true);
    try {
      // Salva a recarga no banco
      await realizarRecarga(username, energia, 12); 
      navigation.navigate('SuccessScreen', { username, energia, custo, estacao, metodo });
    } catch (e) {
      showAlert('Erro', 'Falha ao processar pagamento.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={[styles.header, { backgroundColor: theme.primary }]}>
        <Text style={styles.headerTitle}>Pagamento</Text>
      </View>

      <View style={styles.content}>
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={{ color: theme.subtext }}>Valor Total</Text>
          <Text style={{ color: theme.primary, fontSize: 32, fontWeight: 'bold' }}>R$ {custo.toFixed(2)}</Text>
          <Text style={{ color: theme.text, marginTop: 10 }}>{estacao} • {energia.toFixed(2)} KWh</Text>
        </View>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>Forma de Pagamento</Text>
        
        {/* BOTÕES PIX / CARTÃO */}
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
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
            
            {/* SE JÁ TIVER CARTÃO SALVO, MOSTRA A LISTA */}
            {cartoes.length > 0 ? (
              <>
                <Text style={{ color: theme.text, fontWeight: 'bold', marginBottom: 10 }}>Selecione o Cartão:</Text>
                {cartoes.map((c, index) => (
                  <TouchableOpacity 
                    key={index} 
                    style={[styles.cardItem, { borderColor: cartaoSelecionado === index ? theme.primary : theme.border, backgroundColor: cartaoSelecionado === index ? theme.bg : 'transparent' }]}
                    onPress={() => setCartaoSelecionado(index)}
                  >
                    <Text style={{ color: theme.text, fontWeight: 'bold' }}>💳 Cartão Final {c.numero.slice(-4)}</Text>
                    {cartaoSelecionado === index && <Ionicons name="checkmark-circle" size={20} color={theme.primary} />}
                  </TouchableOpacity>
                ))}
              </>
            ) : (
              // SE NÃO TIVER NENHUM CARTÃO, MOSTRA O FORMULÁRIO
              <>
                <Text style={{ color: theme.text, fontWeight: 'bold', marginBottom: 10 }}>Nenhum cartão salvo. Cadastre um agora:</Text>
                <TextInput style={[styles.input, { borderColor: theme.border, color: theme.text }]} placeholder="Número do Cartão (16 dígitos)" placeholderTextColor={theme.subtext} keyboardType="numeric" maxLength={16} value={novoCartao.numero} onChangeText={(t) => setNovoCartao({...novoCartao, numero: t})} />
                <TextInput style={[styles.input, { borderColor: theme.border, color: theme.text }]} placeholder="Nome no Cartão" placeholderTextColor={theme.subtext} value={novoCartao.nome} onChangeText={(t) => setNovoCartao({...novoCartao, nome: t})} />
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <TextInput style={[styles.input, { flex: 1, borderColor: theme.border, color: theme.text }]} placeholder="MM/AA" placeholderTextColor={theme.subtext} value={novoCartao.validade} onChangeText={(t) => setNovoCartao({...novoCartao, validade: t})} />
                  <TextInput style={[styles.input, { flex: 1, borderColor: theme.border, color: theme.text }]} placeholder="CVV" placeholderTextColor={theme.subtext} maxLength={3} secureTextEntry value={novoCartao.cvv} onChangeText={(t) => setNovoCartao({...novoCartao, cvv: t})} />
                </View>
                <TouchableOpacity style={[styles.mainButton, { backgroundColor: theme.primary, padding: 12, marginTop: 10 }]} onPress={handleSalvarNaHora}>
                  <Text style={styles.mainButtonText}>Cadastrar Cartão</Text>
                </TouchableOpacity>
              </>
            )}

            {/* SELETOR CRÉDITO / DÉBITO */}
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

        <TouchableOpacity style={[styles.mainButton, { backgroundColor: theme.primary, marginTop: 20 }]} onPress={handleConfirmar} disabled={carregando}>
          <Text style={styles.mainButtonText}>{carregando ? 'Processando...' : 'Confirmar Pagamento ✓'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, paddingTop: 60 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#FFF' },
  content: { padding: 20 },
  card: { padding: 20, borderRadius: 16, borderWidth: 2, marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  tabButton: { flex: 1, padding: 12, borderRadius: 10, borderWidth: 2, alignItems: 'center' },
  mainButton: { padding: 18, borderRadius: 12, alignItems: 'center' },
  mainButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  cardItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 2, borderRadius: 10, padding: 15, marginBottom: 10 },
  input: { borderWidth: 2, borderRadius: 10, padding: 12, marginBottom: 10, fontSize: 16 }
});