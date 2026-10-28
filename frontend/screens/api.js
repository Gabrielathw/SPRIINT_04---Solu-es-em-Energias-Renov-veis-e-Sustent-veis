const BASE_URL = 'http://localhost:8000';

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

export const realizarRecarga = async (username, kwh_desejado, hora_simulada, usar_pontos = false) => {
  const resposta = await fetch(`${BASE_URL}/realizar_recarga`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, kwh_desejado, hora_simulada, usar_pontos }),
  });
  return await resposta.json();
};

export const buscarHistorico = async (username) => {
  const resposta = await fetch(`${BASE_URL}/historico/${username}`);
  if (!resposta.ok) throw new Error('Erro ao buscar histórico');
  return await resposta.json();
};

export const buscarAgendamentos = async (username) => {
  const resposta = await fetch(`${BASE_URL}/agendamentos/${username}`);
  if (!resposta.ok) throw new Error('Erro ao buscar agendamentos');
  return await resposta.json();
};

export const agendarRecarga = async (username, estacao, data, hora, kwh, custo, status_pagamento) => {
  const resposta = await fetch(`${BASE_URL}/agendar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, estacao, data, hora, kwh, custo, status_pagamento }),
  });
  return await resposta.json();
};

export const buscarPontos = async (username) => {
  const resposta = await fetch(`${BASE_URL}/pontos/${username}`);
  return await resposta.json();
};