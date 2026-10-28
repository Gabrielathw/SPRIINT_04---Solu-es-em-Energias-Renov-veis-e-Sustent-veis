import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Platform, Alert } from 'react-native';
import { useTheme, themes } from './context/ThemeContext';
import { useCard } from './context/CardContext'; // <-- Importando
import Constants from 'expo-constants';

const getApiUrl = () => {
  const hostUri = Constants.expoConfig?.hostUri;
  const devHost = hostUri?.split(':')[0];
  return devHost && devHost !== 'localhost' ? `http://${devHost}:8000` : `http://localhost:8000`;
};

const showAlert = (titulo, mensagem) => {
  if (Platform.OS === 'web') window.alert(`${titulo}\n\n${mensagem}`);
  else Alert.alert(titulo, mensagem);
};

export default function SettingsScreen({ route, navigation }) {
  const { username } = route.params;
  const { theme, themeName, changeTheme } = useTheme();
  
  // Usando o contexto global de cartões
  const { cartoes, adicionarCartao, removerCartao } = useCard();
  
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [novoCartao, setNovoCartao] = useState({ numero: '', nome: '', validade: '', cvv: '' });

  const handleMudarSenha = async () => {
    if (!senhaAtual || !novaSenha) return showAlert('Aviso', 'Preencha as duas senhas.');
    try {
      const res = await fetch(`${getApiUrl()}/mudar_senha`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, senha_atual: senhaAtual, nova_senha: novaSenha }),
      });
      const data = await res.json();
      if (res.ok) {
        showAlert('Sucesso', data.mensagem);
        setSenhaAtual(''); setNovaSenha('');
      } else {
        showAlert('Erro', data.detail);
      }
    } catch (e) {
      showAlert('Erro', 'Falha na conexão.');
    }
  };

  const handleSalvarCartao = () => {
    if (novoCartao.numero.length < 16) return showAlert('Erro', 'Número de cartão inválido.');
    adicionarCartao(novoCartao); // Adiciona na lista global
    setNovoCartao({ numero: '', nome: '', validade: '', cvv: '' });
    setMostrarFormulario(false);
    showAlert('Sucesso', 'Cartão adicionado com sucesso!');
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.bg }]} contentContainerStyle={{ paddingBottom: 100 }}>
      <View style={[styles.headerCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.title, { color: theme.text }]}>Meu Perfil</Text>
        <Text style={[styles.subtext, { color: theme.subtext }]}>Usuário: {username}</Text>
      </View>

      <Text style={[styles.sectionTitle, { color: theme.text }]}>Aparência</Text>
      <View style={styles.themeRow}>
        {Object.keys(themes).map((key) => (
          <TouchableOpacity key={key} style={[styles.themeButton, { backgroundColor: themes[key].primary, borderColor: themeName === key ? theme.text : 'transparent', borderWidth: 3 }]} onPress={() => changeTheme(key)}>
            <Text style={{ color: '#FFF', fontSize: 12, fontWeight: 'bold', textAlign: 'center' }}>{themes[key].name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.sectionTitle, { color: theme.text }]}>Segurança</Text>
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <TextInput style={[styles.input, { borderColor: theme.primary, color: theme.text }]} placeholder="Senha Atual" placeholderTextColor={theme.subtext} secureTextEntry value={senhaAtual} onChangeText={setSenhaAtual} />
        <TextInput style={[styles.input, { borderColor: theme.primary, color: theme.text }]} placeholder="Nova Senha" placeholderTextColor={theme.subtext} secureTextEntry value={novaSenha} onChangeText={setNovaSenha} />
        <TouchableOpacity style={[styles.button, { backgroundColor: theme.primary }]} onPress={handleMudarSenha}>
          <Text style={styles.buttonText}>Atualizar Senha</Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.sectionTitle, { color: theme.text }]}>Pagamento</Text>
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        {cartoes.map((cartao, index) => (
          <View key={index} style={[styles.cardItem, { borderColor: theme.subtext }]}>
            <View>
              <Text style={{ fontSize: 20 }}>💳</Text>
              <Text style={{ color: theme.text, fontWeight: 'bold', marginTop: 5 }}>Final {cartao.numero.slice(-4)}</Text>
            </View>
            <TouchableOpacity onPress={() => removerCartao(index)} style={styles.botaoRemover}>
              <Text style={{ color: '#EF4444', fontWeight: 'bold' }}>Remover</Text>
            </TouchableOpacity>
          </View>
        ))}

        {mostrarFormulario ? (
          <View style={{ marginTop: 10 }}>
            <TextInput style={[styles.input, { borderColor: theme.primary, color: theme.text }]} placeholder="Número do Cartão" placeholderTextColor={theme.subtext} keyboardType="numeric" maxLength={16} value={novoCartao.numero} onChangeText={(t) => setNovoCartao({...novoCartao, numero: t})} />
            <TextInput style={[styles.input, { borderColor: theme.primary, color: theme.text }]} placeholder="Nome no Cartão" placeholderTextColor={theme.subtext} value={novoCartao.nome} onChangeText={(t) => setNovoCartao({...novoCartao, nome: t})} />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TextInput style={[styles.input, { flex: 1, borderColor: theme.primary, color: theme.text }]} placeholder="MM/AA" placeholderTextColor={theme.subtext} value={novoCartao.validade} onChangeText={(t) => setNovoCartao({...novoCartao, validade: t})} />
              <TextInput style={[styles.input, { flex: 1, borderColor: theme.primary, color: theme.text }]} placeholder="CVV" placeholderTextColor={theme.subtext} maxLength={3} secureTextEntry value={novoCartao.cvv} onChangeText={(t) => setNovoCartao({...novoCartao, cvv: t})} />
            </View>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
              <TouchableOpacity style={[styles.button, { flex: 1, backgroundColor: theme.primary }]} onPress={handleSalvarCartao}><Text style={styles.buttonText}>Salvar</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.button, { flex: 1, backgroundColor: '#EF4444' }]} onPress={() => setMostrarFormulario(false)}><Text style={styles.buttonText}>Cancelar</Text></TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity style={[styles.button, { backgroundColor: theme.primary, marginTop: 10 }]} onPress={() => setMostrarFormulario(true)}>
            <Text style={styles.buttonText}>+ Adicionar Novo Cartão</Text>
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity style={[styles.logoutButton, { borderColor: '#EF4444' }]} onPress={() => navigation.navigate('Login')}>
        <Text style={{ color: '#EF4444', fontWeight: 'bold', fontSize: 16 }}>Sair da Conta</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  headerCard: { padding: 20, borderRadius: 16, borderWidth: 2, marginBottom: 20, marginTop: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 5 },
  subtext: { fontSize: 14, marginBottom: 2 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, marginTop: 10 },
  themeRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  themeButton: { flex: 1, padding: 15, borderRadius: 12, marginHorizontal: 4, justifyContent: 'center' },
  card: { padding: 16, borderRadius: 16, borderWidth: 2, marginBottom: 20 },
  input: { borderWidth: 2, borderRadius: 10, padding: 12, marginBottom: 12, fontSize: 16 },
  button: { padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 5 },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  logoutButton: { padding: 15, borderRadius: 12, borderWidth: 2, alignItems: 'center', marginTop: 10 },
  cardItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderRadius: 10, padding: 15, marginBottom: 10 },
  botaoRemover: { padding: 8 }
});