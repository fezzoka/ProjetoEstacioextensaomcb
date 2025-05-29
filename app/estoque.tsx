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
// ... importações do storage permanecem

export default function EstoqueScreen() {
  // estados permanecem iguais...
  const [produtos, setProdutos] = useState<any[]>([]);
  const [filtro, setFiltro] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [formAberto, setFormAberto] = useState(false);
  // estados do formulário...

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

  // handleSalvar, resetForm, iniciarEdicao permanecem iguais...

  // Extrair categorias únicas para os botões:
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

      {/* Botões de categoria */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
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

      <Button
        title={formAberto ? 'Fechar formulário' : 'Adicionar ou Remover'}
        color="#FFD700"
        onPress={() => {
          if (formAberto) {
            resetForm();
          }
          setFormAberto(!formAberto);
        }}
      />

      {formAberto && (
        // formulário permanece igual
        <View style={styles.formulario}>
          {/* inputs */}
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
  titulo: { fontSize: 26, fontWeight: 'bold', color: '#FFD700', marginBottom: 20, textAlign: 'center' },
  input: {
    borderWidth: 1,
    borderColor: '#FFD700',
    color: '#FFD700',
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
  textoItem: { color: '#FFD700', fontSize: 16 },

  // Estilos para os botões de categoria
  btnCategoria: {
    backgroundColor: '#222',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  btnCategoriaAtivo: {
    backgroundColor: '#FFD700',
  },
  textoBtnCategoria: {
    color: '#FFD700',
    fontWeight: 'bold',
  },
});
