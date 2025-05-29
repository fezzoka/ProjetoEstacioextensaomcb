import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, FlatList, Alert, StyleSheet } from 'react-native';
import { obterProdutos, salvarProdutos } from '@/lib/storage/storageService';

export default function EstoqueScreen() {
  const [produtos, setProdutos] = useState<any[]>([]);
  const [nome, setNome] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [preco, setPreco] = useState('');

  useEffect(() => {
    carregarProdutos();
  }, []);

  const carregarProdutos = async () => {
    const lista = await obterProdutos();
    setProdutos(lista);
  };

  const adicionarProduto = async () => {
    if (!nome || !quantidade || !preco) {
      Alert.alert('Erro', 'Preencha todos os campos.');
      return;
    }

    const novoProduto = {
      id: Date.now().toString(),
      nome,
      quantidade: parseInt(quantidade),
      preco: parseFloat(preco),
      dataEntrada: new Date().toISOString(),  // <-- Adiciona a data atual na entrada do produto
    };

    const novaLista = [...produtos, novoProduto];
    await salvarProdutos(novaLista);
    setProdutos(novaLista);
    setNome('');
    setQuantidade('');
    setPreco('');
  };

  const removerProduto = async (id: string) => {
    const novaLista = produtos.filter((p) => p.id !== id);
    await salvarProdutos(novaLista);
    setProdutos(novaLista);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>MCB Instrumentos - Estoque</Text>

      <TextInput
        placeholder="Nome do produto"
        placeholderTextColor="#FFD700"
        value={nome}
        onChangeText={setNome}
        style={styles.input}
      />
      <TextInput
        placeholder="Quantidade"
        placeholderTextColor="#FFD700"
        value={quantidade}
        onChangeText={setQuantidade}
        keyboardType="numeric"
        style={styles.input}
      />
      <TextInput
        placeholder="Preço"
        placeholderTextColor="#FFD700"
        value={preco}
        onChangeText={setPreco}
        keyboardType="decimal-pad"
        style={styles.input}
      />
      <View style={styles.botaoAdicionar}>
        <Button color="#FFD700" title="Adicionar Produto" onPress={adicionarProduto} />
      </View>

      <FlatList
        data={produtos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.textoItem}>
              {item.nome} | Qtd: {item.quantidade} | R$ {item.preco.toFixed(2)}
            </Text>
            <Button color="#FF4500" title="Remover" onPress={() => removerProduto(item.id)} />
          </View>
        )}
        style={styles.lista}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#000000', // Fundo preto
  },
  titulo: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#FFD700', // Amarelo ouro
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#FFD700',
    color: '#FFD700',
    padding: 10,
    marginBottom: 12,
    borderRadius: 6,
  },
  botaoAdicionar: {
    marginBottom: 20,
  },
  item: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textoItem: {
    color: '#FFD700',
    fontSize: 16,
  },
  lista: {
    marginTop: 10,
  },
});
