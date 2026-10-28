import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { fazerLogin } from './api';
import Constants from 'expo-constants';

const getApiUrl = () => {
  const hostUri = Constants.expoConfig?.hostUri;
  const devHost = hostUri?.split(':')[0];
  return devHost && devHost !== 'localhost' ? `http://${devHost}:8000` : `http://localhost:8000`;
};

// Função que mostra alerta no celular e no navegador
const showAlert = (titulo, mensagem) => {
  if (Platform.OS === 'web') {
    window.alert(`${titulo}\n\n${mensagem}`);
  } else {
    Alert.alert(titulo, mensagem);
  }
};

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [senha, setSenha] = useState('');

  const handleLogin = async () => {
    if (!username || !senha) {
      showAlert('Aviso', 'Preencha usuário e senha.');
      return;
    }
    try {
      await fazerLogin(username, senha);
      navigation.navigate('MainTabs', { username });
    } catch (erro) {
      showAlert('Erro', erro.message);
    }
  };

  const handleForgotPassword = async () => {
    if (!username) {
      showAlert('Aviso', 'Digite seu usuário primeiro.');
      return;
    }
    try {
      const res = await fetch(`${getApiUrl()}/reset_senha`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });
      const data = await res.json();
      if (res.ok) showAlert('Sucesso', data.mensagem);
      else showAlert('Erro', data.detail);
    } catch (e) {
      showAlert('Erro', 'Falha na conexão com o servidor.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>⚡ ChargeVolt</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Usuário</Text>
        <TextInput style={styles.input} value={username} onChangeText={setUsername} autoCapitalize="none" />
        <Text style={styles.label}>Senha</Text>
        <TextInput style={styles.input} value={senha} onChangeText={setSenha} secureTextEntry />
        
        <TouchableOpacity style={styles.botao} onPress={handleLogin}>
          <Text style={styles.textoBotao}>Entrar</Text>
        </TouchableOpacity>
        
        <View style={styles.linksContainer}>
          <TouchableOpacity onPress={handleForgotPassword}>
            <Text style={styles.link}>Esqueci a senha</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.link}>Criar conta</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// ... (mantenha os mesmos styles de antes)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#2E86AB', justifyContent: 'center', padding: 24 },
  titulo: { fontSize: 36, fontWeight: 'bold', color: '#FFF', textAlign: 'center', marginBottom: 40 },
  card: { backgroundColor: '#FFF', padding: 24, borderRadius: 16 },
  label: { fontSize: 14, fontWeight: 'bold', marginBottom: 8, marginTop: 12 },
  input: { borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 10, padding: 12 },
  botao: { backgroundColor: '#2E86AB', padding: 16, borderRadius: 12, marginTop: 24, alignItems: 'center' },
  textoBotao: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  linksContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 },
  link: { color: '#2E86AB', fontSize: 14, fontWeight: 'bold' }
});