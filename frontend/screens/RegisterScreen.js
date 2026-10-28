import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import Constants from 'expo-constants';

const getApiUrl = () => {
  const hostUri = Constants.expoConfig?.hostUri;
  const devHost = hostUri?.split(':')[0];
  return devHost && devHost !== 'localhost' ? `http://${devHost}:8000` : `http://localhost:8000`;
};

const showAlert = (titulo, mensagem) => {
  if (Platform.OS === 'web') {
    window.alert(`${titulo}\n\n${mensagem}`);
  } else {
    Alert.alert(titulo, mensagem);
  }
};

export default function RegisterScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [senha, setSenha] = useState('');
  const [nome, setNome] = useState('');

  const handleRegister = async () => {
    if (!username || !senha || !nome) {
      showAlert('Aviso', 'Preencha todos os campos.');
      return;
    }
    try {
      const res = await fetch(`${getApiUrl()}/cadastro`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, senha, nome }),
      });
      const data = await res.json();
      if (res.ok) {
        showAlert('Sucesso', 'Conta criada! Faça login.');
        navigation.goBack();
      } else {
        showAlert('Erro', data.detail);
      }
    } catch (e) {
      showAlert('Erro', 'Falha na conexão com o servidor.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Criar Conta</Text>
      <TextInput style={styles.input} placeholder="Nome Completo" value={nome} onChangeText={setNome} />
      <TextInput style={styles.input} placeholder="Usuário" value={username} onChangeText={setUsername} autoCapitalize="none" />
      <TextInput style={styles.input} placeholder="Senha" value={senha} onChangeText={setSenha} secureTextEntry />
      <TouchableOpacity style={styles.botao} onPress={handleRegister}>
        <Text style={styles.textoBotao}>Cadastrar</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 15 }}>
        <Text style={{ color: '#FFF', textAlign: 'center' }}>Voltar para o Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#2E86AB', justifyContent: 'center', padding: 24 },
  titulo: { fontSize: 32, fontWeight: 'bold', color: '#FFF', textAlign: 'center', marginBottom: 30 },
  input: { backgroundColor: '#FFF', borderRadius: 10, padding: 15, marginBottom: 15, fontSize: 16 },
  botao: { backgroundColor: '#1A1A1A', padding: 15, borderRadius: 10, alignItems: 'center' },
  textoBotao: { color: '#FFF', fontSize: 18, fontWeight: 'bold' }
});