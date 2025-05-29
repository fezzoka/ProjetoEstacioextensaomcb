import { useEffect, useState } from 'react';
import { View, Text, Button, Picker, TextInput, Alert } from 'react-native';
import {
  obterProdutos,
  salvarProdutos,
  obterVendas,
  salvarVendas,
  obterMovimentacoes,
  salvarMovimentacoes,
} from '@/lib/storage/storageService';

export default function VendaScreen() {
  const [produtos, setProdutos] = useState<any[]>([]);
  const [vendas, setVendas] = useState<any[]>([]);
  const [produtoSelecionado, setProdutoSelecionado] = useState('');
  const [quantidade, setQuantidade] = useState('1');

  useEffect(() => {
    async function carregar() {
      const listaProdutos = await obterProdutos();
      const listaVendas = await obterVendas();
      setProdutos(listaProdutos);
      setVendas(listaVendas);
    }
    carregar();
  }, []);

  async function registrarVenda() {
    const produto = produtos.find(p => p.id === produtoSelecionado);
    const qtd = parseInt(quantidade);

    if (!produto) {
      Alert.alert('Erro', 'Selecione um produto válido.');
      return;
    }
    if (isNaN(qtd) || qtd <= 0) {
      Alert.alert('Erro', 'Informe uma quantidade válida.');
      return;
    }
    if (qtd > produto.quantidade) {
      Alert.alert('Erro', 'Estoque insuficiente.');
      return;
    }

    // Atualizar estoque
    const produtosAtualizados = produtos.map(p =>
      p.id === produto.id ? { ...p, quantidade: p.quantidade - qtd } : p
    );
    await salvarProdutos(produtosAtualizados);
    setProdutos(produtosAtualizados);

    // Salvar venda
    const novaVenda = {
      id: Date.now().toString(),
      produtoId: produto.id,
      nome: produto.nome,
      quantidade: qtd,
      valorTotal: qtd * produto.preco,
      data: new Date().toISOString(),
    };
    const novasVendas = [...vendas, novaVenda];
    await salvarVendas(novasVendas);
    setVendas(novasVendas);

    // Registrar movimentação de saída no estoque
    const movimentacoes = await obterMovimentacoes();
    const novaMovimentacao = {
      id: Date.now().toString(),
      tipo: 'saida',
      produtoId: produto.id,
      nome: produto.nome,
      quantidade: qtd,
      valorTotal: qtd * produto.preco,
      data: new Date().toISOString(),
    };
    await salvarMovimentacoes([...movimentacoes, novaMovimentacao]);

    Alert.alert('Sucesso', 'Venda registrada com sucesso!');
    setQuantidade('1');
    setProdutoSelecionado('');
  }

  return (
    <View style={{ padding: 20 }}>
      <Text>Produto:</Text>
      <Picker
        selectedValue={produtoSelecionado}
        onValueChange={item => setProdutoSelecionado(item)}
      >
        <Picker.Item label="Selecione um produto" value="" />
        {produtos.map(p => (
          <Picker.Item
            key={p.id}
            label={`${p.nome} (Estoque: ${p.quantidade})`}
            value={p.id}
          />
        ))}
      </Picker>

      <Text>Quantidade:</Text>
      <TextInput
        value={quantidade}
        onChangeText={setQuantidade}
        keyboardType="numeric"
        style={{ borderWidth: 1, marginBottom: 10, padding: 5 }}
      />

      <Button title="Registrar Venda" onPress={registrarVenda} />
    </View>
  );
}
