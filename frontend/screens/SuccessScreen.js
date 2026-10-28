import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from './context/ThemeContext';

export default function SuccessScreen({ route, navigation }) {
  const { username, energia, custo, estacao } = route.params;
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <Text style={{ fontSize: 80, marginBottom: 20 }}>✅</Text>
      <Text style={[styles.title, { color: theme.text }]}>Pagamento Confirmado!</Text>
      <Text style={{ color: theme.subtext, textAlign: 'center', marginBottom: 30 }}>Sua recarga já pode ser iniciada na estação.</Text>

      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border, width: '100%' }]}>
        <View style={styles.row}><Text style={{ color: theme.subtext }}>Estação:</Text><Text style={{ color: theme.text, fontWeight: 'bold' }}>{estacao}</Text></View>
        <View style={styles.row}><Text style={{ color: theme.subtext }}>Energia:</Text><Text style={{ color: theme.text, fontWeight: 'bold' }}>{energia.toFixed(2)} KWh</Text></View>
        <View style={styles.row}><Text style={{ color: theme.subtext }}>Valor Pago:</Text><Text style={{ color: theme.primary, fontWeight: 'bold', fontSize: 18 }}>R$ {custo.toFixed(2)}</Text></View>
      </View>

      <TouchableOpacity style={[styles.button, { backgroundColor: theme.primary }]} onPress={() => navigation.navigate('MainTabs', { username })}>
        <Text style={styles.buttonText}>Voltar ao Início</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 10 },
  card: { padding: 20, borderRadius: 16, borderWidth: 2, marginBottom: 30 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  button: { width: '100%', padding: 18, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' }
});