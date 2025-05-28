import { View, Text, StyleSheet } from 'react-native';

type Props = {
  nome: string;
  preco: number;
  quantidade: number;
};

export default function InstrumentoCard({ nome, preco, quantidade }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{nome}</Text>
      <Text>Preço: R${preco}</Text>
      <Text>Estoque: {quantidade}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 12,
    margin: 10,
    backgroundColor: '#f4f4f4',
    borderRadius: 10,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
  },
});
