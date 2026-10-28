import Constants from 'expo-constants';
import { Platform } from 'react-native';

const API_PORT = 8000;

const getApiUrl = () => {
  const hostUri = Constants.expoConfig?.hostUri;
  const devHost = hostUri?.split(':')[0];
  if (devHost && devHost !== 'localhost' && devHost !== '127.0.0.1') {
    return `http://${devHost}:${API_PORT}`;
  }
  if (Platform.OS === 'android') {
    return `http://10.0.2.2:${API_PORT}`; 
  }
  return `http://localhost:${API_PORT}`;
};

const BASE_URL = getApiUrl();

export const fazerLogin = async (username, senha) => {
  const resposta = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, senha }),
  });
  const dados = await resposta.json();
  if (!resposta.ok) throw new Error(dados.detail || 'Erro no login');
  return dados;
};

export const realizarRecarga = async (username, kwh_desejado, hora_simulada) => {
  const resposta = await fetch(`${BASE_URL}/realizar_recarga`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, kwh_desejado, hora_simulada }),
  });
  return await resposta.json();
};

export const buscarHistorico = async (username) => {
  const resposta = await fetch(`${BASE_URL}/historico/${username}`);
  if (!resposta.ok) throw new Error('Erro ao buscar histórico');
  return await resposta.json();
};

// FUNÇÃO DE AGENDAR ATUALIZADA
export const agendarRecarga = async (username, estacao, data, hora, kwh, custo, status_pagamento) => {
  const resposta = await fetch(`${BASE_URL}/agendar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, estacao, data, hora, kwh, custo, status_pagamento }),
  });
  return await resposta.json();
};