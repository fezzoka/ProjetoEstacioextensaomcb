import { View, Text, StyleSheet } from 'react-native';

export default function EstoqueScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tela de Estoque</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 20 },
});
