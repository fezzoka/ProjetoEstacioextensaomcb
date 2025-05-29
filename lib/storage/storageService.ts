import AsyncStorage from '@react-native-async-storage/async-storage';

const PRODUTOS_KEY = '@produtos';
const VENDAS_KEY = '@vendas';

// Produto
export async function salvarProdutos(produtos: any[]) {
  await AsyncStorage.setItem(PRODUTOS_KEY, JSON.stringify(produtos));
}

export async function obterProdutos(): Promise<any[]> {
  const json = await AsyncStorage.getItem(PRODUTOS_KEY);
  return json ? JSON.parse(json) : [];
}

// Venda
export async function salvarVendas(vendas: any[]) {
  await AsyncStorage.setItem(VENDAS_KEY, JSON.stringify(vendas));
}

export async function obterVendas(): Promise<any[]> {
  const json = await AsyncStorage.getItem(VENDAS_KEY);
  return json ? JSON.parse(json) : [];
}

const MOVIMENTACOES_KEY = '@movimentacoes';

export async function salvarMovimentacoes(movimentacoes: any[]) {
  await AsyncStorage.setItem(MOVIMENTACOES_KEY, JSON.stringify(movimentacoes));
}

export async function obterMovimentacoes(): Promise<any[]> {
  const json = await AsyncStorage.getItem(MOVIMENTACOES_KEY);
  return json ? JSON.parse(json) : [];
}