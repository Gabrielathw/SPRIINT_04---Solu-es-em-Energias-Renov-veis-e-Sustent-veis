import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform, Alert, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from './context/ThemeContext';
import { useCard } from './context/CardContext'; 
import { realizarRecarga } from './api';

const showAlert = (t, m) => Platform.OS === 'web' ? window.alert(`${t}\n\n${m}`) : Alert.alert(t, m);

export default function PaymentScreen({ route, navigation }) {
  const { username, energia, custo, duracao, estacao, horaSimulada } = route.params;
  const { theme } = useTheme();
  const { cartoes, adicionarCartao } = useCard(); 
  
  const [metodo, setMetodo] = useState('pix'); 
  const [tipoCartao, setTipoCartao] = useState('credito'); 
  const [cartaoSelecionado, setCartaoSelecionado] = useState(null);
  
  const [mostrarFormulario, setMostrarFormulario] = useState(cartoes.length === 0);
  const [novoCartao, setNovoCartao] = useState({ numero: '', nome: '', validade: '', cvv: '' });
  const [carregando, setCarregando] = useState(false);

  // ESTADOS DE FIDELIDADE
  const [meusPontos, setMeusPontos] = useState(0);
  const [usarPontos, setUsarPontos] = useState(false);
  
  // Busca os pontos do usuário ao abrir a tela
  useEffect(() => {
    fetch(`http://localhost:8000/usuario/${username}`)
      .then(res => res.json())
      .then(data => { if(data.pontos) setMeusPontos(data.pontos); })
      .catch(err => console.log(err));
  }, [username]);

  // Cálculo do desconto (100 pontos = R$ 10,00)
  let desconto = 0;
  if (usarPontos && meusPontos >= 100) {
    const blocos = Math.floor(meusPontos / 100);
    desconto = blocos * 10.0;
    if (desconto > custo) desconto = custo; // Desconto não pode ser maior que o valor
  }
  
  const valorFinal = custo - desconto;
  const pontosEstimados = Math.floor(valorFinal / 2.30); // Pontos ganhos sobre o valor pago

  const handleSalvarNaHora = () => {
    if (novoCartao.numero.length < 16) return showAlert('Erro', 'O número do cartão precisa ter 16 dígitos.');
    if (!novoCartao.nome || !novoCartao.validade || !novoCartao.cvv) return showAlert('Erro', 'Preencha todos os campos.');
    
    adicionarCartao(novoCartao); 
    setNovoCartao({ numero: '', nome: '', validade: '', cvv: '' }); 
    setMostrarFormulario(false); 
    showAlert('Sucesso', 'Cartão cadastrado! Agora selecione-o.');
  };

  const handleConfirmar = async () => {
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
      // Envia usarPontos para o backend
      await realizarRecarga(username, energia, horaSimulada || 12, usarPontos); 
      navigation.navigate('SuccessScreen', { username, energia, custo: valorFinal, estacao, metodo, pontosGanhos: pontosEstimados });
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
        {/* VALOR TOTAL */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={{ color: theme.subtext }}>Valor Total</Text>
          {desconto > 0 && (
            <Text style={{ color: theme.subtext, textDecorationLine: 'line-through', fontSize: 16 }}>R$ {custo.toFixed(2)}</Text>
          )}
          <Text style={{ color: theme.primary, fontSize: 32, fontWeight: 'bold' }}>R$ {valorFinal.toFixed(2)}</Text>
          <Text style={{ color: theme.text, marginTop: 10 }}>{estacao} • {energia.toFixed(2)} KWh</Text>
        </View>

        {/* CARD DE USAR PONTOS */}
        {meusPontos >= 100 && (
          <TouchableOpacity 
            style={[styles.loyaltyCard, { backgroundColor: usarPontos ? '#D1FAE5' : theme.card, borderColor: '#10B981' }]}
            onPress={() => setUsarPontos(!usarPontos)}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name={usarPontos ? "checkbox" : "square-outline"} size={28} color="#10B981" style={{ marginRight: 10 }} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: usarPontos ? '#065F46' : theme.text, fontWeight: 'bold', fontSize: 16 }}>Usar Meus Pontos</Text>
                <Text style={{ color: usarPontos ? '#047857' : theme.subtext, fontSize: 14 }}>
                  Você tem {meusPontos} pontos. Usar 100 pontos = R$ 10,00 de desconto.
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}

        {/* CARD DE FIDELIDADE (GANHAR) */}
        <View style={[styles.loyaltyCard, { backgroundColor: '#FEF3C7', borderColor: '#F59E0B' }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: 24, marginRight: 10 }}>🌟</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#92400E', fontWeight: 'bold', fontSize: 16 }}>Programa de Fidelidade</Text>
              <Text style={{ color: '#B45309', fontSize: 14 }}>Você ganhará <Text style={{fontWeight: 'bold'}}>{pontosEstimados} pontos</Text> com esta recarga.</Text>
            </View>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>Forma de Pagamento</Text>
        
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
                    <Text style={styles.mainButtonText}>Salvar Cartão</Text>
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
                  <TouchableOpacity 
                    key={index} 
                    style={[styles.cardItem, { borderColor: cartaoSelecionado === index ? theme.primary : theme.border, backgroundColor: cartaoSelecionado === index ? theme.bg : 'transparent' }]}
                    onPress={() => setCartaoSelecionado(index)}
                  >
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
  loyaltyCard: { padding: 15, borderRadius: 12, borderWidth: 2, marginBottom: 20, flexDirection: 'row', alignItems: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  tabButton: { flex: 1, padding: 12, borderRadius: 10, borderWidth: 2, alignItems: 'center' },
  mainButton: { padding: 18, borderRadius: 12, alignItems: 'center' },
  mainButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  cardItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 2, borderRadius: 10, padding: 15, marginBottom: 10 },
  input: { borderWidth: 2, borderRadius: 10, padding: 12, marginBottom: 10, fontSize: 16 }
});