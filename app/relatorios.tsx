import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Button,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { obterVendas, obterProdutos } from '@/lib/storage/storageService';

export default function RelatoriosScreen() {
  const [vendas, setVendas] = useState<any[]>([]);
  const [produtos, setProdutos] = useState<any[]>([]);

  // Datas de filtro (usar direto, sem temp)
  const [dataInicio, setDataInicio] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });
  const [dataFim, setDataFim] = useState(new Date());

  // Controle de exibição dos pickers
  const [showInicio, setShowInicio] = useState(false);
  const [showFim, setShowFim] = useState(false);

  useEffect(() => {
    (async () => {
      setVendas(await obterVendas());
      setProdutos(await obterProdutos());
    })();
  }, []);

  // Ajusta o fim do dia
  const fimDoDia = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59);

  // Vendas filtradas
  const vendasFiltradas = vendas.filter(v => {
    const dv = new Date(v.data).getTime();
    return dv >= dataInicio.getTime() && dv <= fimDoDia(dataFim).getTime();
  });

  // Cálculos
  const totalVendido = vendasFiltradas.reduce((sum, v) => sum + v.valorTotal, 0);
  const qtdVendida = vendasFiltradas.reduce((sum, v) => sum + v.quantidade, 0);

  const entradasFiltradas = produtos.filter(p => {
    if (!p.dataEntrada) return false;
    const de = new Date(p.dataEntrada).getTime();
    return de >= dataInicio.getTime() && de <= fimDoDia(dataFim).getTime();
  });
  const totalEntradas = entradasFiltradas.reduce((sum, p) => sum + p.quantidade, 0);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.titulo}>Relatórios</Text>

      <View style={styles.filtroContainer}>
        <Button
          title={`Início: ${dataInicio.toLocaleDateString()}`}
          onPress={() => setShowInicio(true)}
          color="#FFD700"
        />
        <Button
          title={`Fim: ${dataFim.toLocaleDateString()}`}
          onPress={() => setShowFim(true)}
          color="#FFD700"
        />
      </View>

      {showInicio && (
        <DateTimePicker
          value={dataInicio}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'calendar'}
          maximumDate={dataFim}
          onChange={(_e, date) => {
            setShowInicio(false);
            if (date) setDataInicio(date);
          }}
        />
      )}
      {showFim && (
        <DateTimePicker
          value={dataFim}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'calendar'}
          minimumDate={dataInicio}
          maximumDate={new Date()}
          onChange={(_e, date) => {
            setShowFim(false);
            if (date) setDataFim(date);
          }}
        />
      )}

      <Text style={styles.subtitulo}>Resumo de {dataInicio.toLocaleDateString()} até {dataFim.toLocaleDateString()}</Text>
      <Text style={styles.resumo}>Total vendas: R$ {totalVendido.toFixed(2)}</Text>
      <Text style={styles.resumo}>Itens vendidos: {qtdVendida}</Text>
      <Text style={styles.resumo}>Itens adicionados: {totalEntradas}</Text>

      <Text style={[styles.subtitulo, { marginTop: 20 }]}>Detalhes das vendas:</Text>
      {vendasFiltradas.length === 0 && <Text style={styles.semDados}>Nenhuma venda nesse período.</Text>}
      {vendasFiltradas.map(v => (
        <View key={v.id} style={styles.item}>
          <Text style={styles.itemText}>
            {v.nome} — Qtd: {v.quantidade} — R$ {v.valorTotal.toFixed(2)}
          </Text>
          <Text style={styles.itemDate}>{new Date(v.data).toLocaleDateString()}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#000' },
  titulo: { fontSize: 28, fontWeight: 'bold', color: '#FFD700', textAlign: 'center', marginBottom: 15 },
  filtroContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  subtitulo: { fontSize: 18, fontWeight: 'bold', color: '#FFD700', marginBottom: 10 },
  resumo: { fontSize: 16, color: '#fff', marginBottom: 5 },
  semDados: { color: '#ccc', fontStyle: 'italic' },
  item: { backgroundColor: '#111', padding: 10, borderRadius: 6, marginBottom: 10 },
  itemText: { color: '#FFD700', fontWeight: '600' },
  itemDate: { color: '#aaa', fontSize: 12, marginTop: 4 },
});
