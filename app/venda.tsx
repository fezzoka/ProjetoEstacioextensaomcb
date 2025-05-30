import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
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
  const [produtoSelecionado, setProdutoSelecionado] = useState<any | null>(null);
  const [quantidade, setQuantidade] = useState('1');
  const [dropdownAberto, setDropdownAberto] = useState(false);

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
    if (!produtoSelecionado) {
      Alert.alert('Erro', 'Selecione um produto válido.');
      return;
    }
    const qtd = parseInt(quantidade);
    if (isNaN(qtd) || qtd <= 0) {
      Alert.alert('Erro', 'Informe uma quantidade válida.');
      return;
    }
    if (qtd > produtoSelecionado.quantidade) {
      Alert.alert('Erro', 'Estoque insuficiente.');
      return;
    }

    // Atualizar estoque
    const produtosAtualizados = produtos.map(p =>
      p.id === produtoSelecionado.id ? { ...p, quantidade: p.quantidade - qtd } : p
    );
    await salvarProdutos(produtosAtualizados);
    setProdutos(produtosAtualizados);

    // Salvar venda
    const novaVenda = {
      id: Date.now().toString(),
      produtoId: produtoSelecionado.id,
      nome: produtoSelecionado.nome,
      quantidade: qtd,
      valorTotal: qtd * produtoSelecionado.preco,
      data: new Date().toISOString(),
    };
    const novasVendas = [...vendas, novaVenda];
    await salvarVendas(novasVendas);
    setVendas(novasVendas);

    // Registrar movimentação
    const movimentacoes = await obterMovimentacoes();
    const novaMovimentacao = {
      id: Date.now().toString(),
      tipo: 'saida',
      produtoId: produtoSelecionado.id,
      nome: produtoSelecionado.nome,
      quantidade: qtd,
      valorTotal: qtd * produtoSelecionado.preco,
      data: new Date().toISOString(),
    };
    await salvarMovimentacoes([...movimentacoes, novaMovimentacao]);

    Alert.alert('Sucesso', 'Venda registrada com sucesso!');
    setQuantidade('1');
    setProdutoSelecionado(null);
    setDropdownAberto(false);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Registrar Venda</Text>

      <Text style={styles.label}>Produto:</Text>
      <TouchableOpacity
        style={styles.dropdown}
        onPress={() => setDropdownAberto(!dropdownAberto)}
      >
        <Text style={styles.dropdownTexto}>
          {produtoSelecionado
            ? `${produtoSelecionado.nome} (Estoque: ${produtoSelecionado.quantidade})`
            : 'Selecione um produto'}
        </Text>
      </TouchableOpacity>

      {dropdownAberto && (
        <ScrollView style={styles.dropdownLista}>
          {produtos.map(p => (
            <TouchableOpacity
              key={p.id}
              style={styles.dropdownItem}
              onPress={() => {
                setProdutoSelecionado(p);
                setDropdownAberto(false);
              }}
            >
              <Text style={styles.dropdownItemTexto}>
                {p.nome} (Estoque: {p.quantidade})
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <Text style={styles.label}>Quantidade:</Text>
      <TextInput
        value={quantidade}
        onChangeText={setQuantidade}
        keyboardType="numeric"
        style={styles.input}
      />

      <TouchableOpacity style={styles.btn} onPress={registrarVenda}>
        <Text style={styles.btnTexto}>Registrar Venda</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#000' },
  titulo: {
    fontSize: 24,
    color: '#FFD700',
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  label: {
    color: '#bfa449',
    marginBottom: 6,
    marginTop: 10,
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#bfa449',
    color: '#bfa449',
    padding: 10,
    borderRadius: 6,
    marginBottom: 15,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#bfa449',
    padding: 10,
    borderRadius: 6,
    marginBottom: 10,
  },
  dropdownTexto: {
    color: '#bfa449',
  },
  dropdownLista: {
    maxHeight: 150,
    borderWidth: 1,
    borderColor: '#bfa449',
    borderRadius: 6,
    marginBottom: 10,
  },
  dropdownItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    backgroundColor: '#111',
  },
  dropdownItemTexto: {
    color: '#bfa449',
  },
  btn: {
    backgroundColor: '#bfa449',
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: 'center',
    marginTop: 20,
  },
  btnTexto: {
    color: '#121212',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
