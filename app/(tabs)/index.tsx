import { View, Text, Button, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>MCB Instrumentos</Text>
      <Button title="Controle de Vendas" onPress={() => router.push('/vendas')} />
      <Button title="Controle de Estoque" onPress={() => router.push('/estoque')} />
      <Button title="Relatórios" onPress={() => router.push('/relatorios')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 26, marginBottom: 20, fontWeight: 'bold' },
});
