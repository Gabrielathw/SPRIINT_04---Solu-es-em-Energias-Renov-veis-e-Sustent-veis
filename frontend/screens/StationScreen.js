import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from './context/ThemeContext';
import QRCode from 'react-native-qrcode-svg'; // <-- Importando a biblioteca

const ESTACOES = [
  { id: 1, nome: 'Shopping Central', endereco: 'Av. Paulista, 1000', vagas: '3 disponíveis · CCS / CHAdeMO' },
  { id: 2, nome: 'Business Center', endereco: 'Rua das Flores, 250', vagas: '2 disponíveis · CCS Combo' },
  { id: 3, nome: 'Parque Office', endereco: 'Al. Santos, 700', vagas: '1 disponível · Type 2 AC' },
];

export default function StationScreen({ route, navigation }) {
  const { username, energia, custo, duracao } = route.params;
  const { theme } = useTheme();

  const selecionarEstacao = (estacaoNome) => {
    navigation.navigate('PaymentScreen', { username, energia, custo, duracao, estacao: estacaoNome });
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={[styles.header, { backgroundColor: theme.primary }]}>
        <Text style={styles.headerTitle}>Identificar Estação</Text>
      </View>

      <View style={styles.content}>
        <Text style={{ color: theme.subtext, textAlign: 'center', marginBottom: 20 }}>
          Apresente o QR Code na estação de carregamento ou selecione uma estação manualmente.
        </Text>

        {/* QR CODE DE VERDADE */}
        <View style={[styles.qrCodeBox, { borderColor: theme.primary, backgroundColor: theme.card }]}>
          <QRCode
            value="EVC-LMDI9SEW"
            size={180}
            color={theme.text}
            backgroundColor={theme.card}
          />
          <Text style={{ color: theme.text, marginTop: 15, fontSize: 14, fontWeight: 'bold' }}>Código: EVC-LMDI9SEW</Text>
        </View>

        <TouchableOpacity style={[styles.mainButton, { backgroundColor: theme.primary, marginBottom: 20 }]} onPress={() => selecionarEstacao(ESTACOES[0].nome)}>
          <Text style={styles.mainButtonText}>📷 Escanear QR Code</Text>
        </TouchableOpacity>

        <Text style={{ color: theme.subtext, marginBottom: 15, fontWeight: 'bold' }}>Ou selecione uma estação:</Text>

        {ESTACOES.map((est) => (
          <TouchableOpacity key={est.id} style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]} onPress={() => selecionarEstacao(est.nome)}>
            <Text style={{ color: theme.text, fontWeight: 'bold', fontSize: 16 }}>{est.nome}</Text>
            <Text style={{ color: theme.subtext, marginTop: 4 }}>{est.endereco}</Text>
            <Text style={{ color: '#10B981', marginTop: 6, fontSize: 12, fontWeight: 'bold' }}>{est.vagas}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, paddingTop: 60 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#FFF' },
  content: { padding: 20 },
  qrCodeBox: { alignItems: 'center', padding: 30, borderWidth: 2, borderRadius: 16, marginBottom: 20 },
  mainButton: { padding: 16, borderRadius: 12, alignItems: 'center' },
  mainButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  card: { padding: 15, borderRadius: 12, borderWidth: 2, marginBottom: 10 }
});