import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  Alert,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {
  obterProdutos,
  salvarProdutos,
  obterMovimentacoes,
  salvarMovimentacoes,
} from '@/lib/storage/storageService';

export default function EstoqueScreen() {
  const [produtos, setProdutos] = useState<any[]>([]);
  const [filtro, setFiltro] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [formAberto, setFormAberto] = useState(false);

  const [nome, setNome] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [preco, setPreco] = useState('');
  const [categoria, setCategoria] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    const prods = await obterProdutos();
    const prodsSanitizados = prods.map(p => ({
      ...p,
      nome: p.nome ?? '',
      categoria: p.categoria ?? '',
      quantidade: p.quantidade ?? 0,
      preco: p.preco ?? 0,
      id: p.id ?? new Date().toISOString(),
    }));
    setProdutos(prodsSanitizados);
  }

  async function handleSalvar() {
    if (!nome || !quantidade || !preco || !categoria) {
      Alert.alert('Erro', 'Preencha todos os campos.');
      return;
    }

    const qty = parseInt(quantidade);
    const val = parseFloat(preco);
    const agora = new Date().toISOString();

    let novaLista;
    if (editingId) {
      novaLista = produtos.map(p =>
        p.id === editingId
          ? { ...p, nome, quantidade: qty, preco: val, categoria }
          : p
      );
    } else {
      const novo = {
        id: agora,
        nome,
        quantidade: qty,
        preco: val,
        dataEntrada: agora,
        categoria,
      };
      novaLista = [novo, ...produtos];

      const mov = await obterMovimentacoes();
      await salvarMovimentacoes([
        {
          id: agora,
          tipo: 'entrada',
          produtoId: novo.id,
          nome: novo.nome,
          quantidade: novo.quantidade,
          valorTotal: novo.quantidade * novo.preco,
          data: agora,
        },
        ...mov,
      ]);
    }

    await salvarProdutos(novaLista);
    setProdutos(novaLista);
    resetForm();
    setFormAberto(false);
  }

  function resetForm() {
    setNome('');
    setQuantidade('');
    setPreco('');
    setCategoria('');
    setEditingId(null);
  }

  function iniciarEdicao(p: any) {
    setEditingId(p.id);
    setNome(p.nome);
    setQuantidade(p.quantidade.toString());
    setPreco(p.preco.toString());
    setCategoria(p.categoria || '');
    setFormAberto(true);
  }

  const categoriasUnicas = Array.from(
    new Set(produtos.map(p => p.categoria || '').filter(cat => cat.trim() !== ''))
  );

  const listaFiltrada = produtos.filter(p =>
    (p.nome ?? '').toLowerCase().includes(filtro.toLowerCase()) &&
    (p.categoria ?? '').toLowerCase().includes(filtroCategoria.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>MCB Instrumentos - Estoque</Text>

      <TextInput
        placeholder="🔍 Buscar produto"
        placeholderTextColor="#888"
        value={filtro}
        onChangeText={setFiltro}
        style={[styles.input, { marginBottom: 10 }]}
      />

      <View style={styles.categoriasWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriasContainer}
          snapToAlignment="center"
          decelerationRate="fast"
          snapToInterval={90} // largura estimada do botão + margem
        >
          <TouchableOpacity
            style={[
              styles.btnCategoria,
              filtroCategoria === '' && styles.btnCategoriaAtivo,
            ]}
            onPress={() => setFiltroCategoria('')}
          >
            <Text style={styles.textoBtnCategoria}>Todas</Text>
          </TouchableOpacity>
          {categoriasUnicas.map(cat => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.btnCategoria,
                filtroCategoria === cat && styles.btnCategoriaAtivo,
              ]}
              onPress={() => setFiltroCategoria(cat)}
            >
              <Text style={styles.textoBtnCategoria}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <TouchableOpacity
        style={[styles.btnAdicionar, formAberto && styles.btnAdicionarFechar]}
        onPress={() => {
          if (formAberto) {
            resetForm();
          }
          setFormAberto(!formAberto);
        }}
      >
        <Text style={styles.textoBtnAdicionar}>
          {formAberto ? 'Fechar formulário' : 'Adicionar ou Remover'}
        </Text>
      </TouchableOpacity>

      {formAberto && (
        <View style={styles.formulario}>
          <TextInput
            placeholder="Nome do produto"
            placeholderTextColor="#bfa449"
            value={nome}
            onChangeText={setNome}
            style={styles.input}
          />
          <TextInput
            placeholder="Quantidade"
            placeholderTextColor="#bfa449"
            value={quantidade}
            onChangeText={setQuantidade}
            keyboardType="numeric"
            style={styles.input}
          />
          <TextInput
            placeholder="Preço"
            placeholderTextColor="#bfa449"
            value={preco}
            onChangeText={setPreco}
            keyboardType="decimal-pad"
            style={styles.input}
          />
          <TextInput
            placeholder="Categoria (ex: violão, cordas)"
            placeholderTextColor="#bfa449"
            value={categoria}
            onChangeText={setCategoria}
            style={styles.input}
          />
          <View style={{ marginTop: 10 }}>
            <Button
              title={editingId ? 'Salvar Alteração' : 'Adicionar Produto'}
              color="#bfa449"
              onPress={handleSalvar}
            />
          </View>
        </View>
      )}

      <FlatList
        data={listaFiltrada}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() => iniciarEdicao(item)}
          >
            <Text style={styles.textoItem}>
              ID: {item.id.slice(-5)} | {item.nome} | Cat: {item.categoria} | Qtd: {item.quantidade} | R$ {item.preco.toFixed(2)}
            </Text>
          </TouchableOpacity>
        )}
        style={styles.lista}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#000' },
  titulo: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#bfa449',
    color: '#bfa449',
    padding: 10,
    borderRadius: 6,
  },
  formulario: { marginTop: 15 },
  lista: { flex: 1 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111',
    padding: 10,
    borderRadius: 6,
    marginBottom: 8,
  },
  textoItem: { color: '#bfa449', fontSize: 16 },

  categoriasWrapper: {
    alignItems: 'center',
    marginBottom: 12,
  },
  categoriasContainer: {
    paddingHorizontal: 10,
  },
  btnCategoria: {
    backgroundColor: '#1c1c1c',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#bfa449',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    maxHeight: 28,
    flexShrink: 1,
  },
  btnCategoriaAtivo: {
    backgroundColor: '#bfa449',
  },
  textoBtnCategoria: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },

  btnAdicionar: {
    backgroundColor: '#bfa449',
    paddingVertical: 12,
    borderRadius: 24,
    marginBottom: 15,
    alignItems: 'center',
  },
  btnAdicionarFechar: {
    backgroundColor: '#a18e32',
  },
  textoBtnAdicionar: {
    color: '#121212',
    fontWeight: '700',
    fontSize: 16,
  },
});
