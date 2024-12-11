import React, { useContext } from 'react';
import { Text, Image, StyleSheet } from 'react-native';
import { UserContext } from './UserContext'; // Importar o contexto
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const { user } = useContext(UserContext); // Acessar o contexto

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.text}>Bem-vindo, {user.name}!</Text>
      {user.photo && (
        <Image
          source={{ uri: `http://10.90.108.201:3001${user.photo}` }}
          style={{ width: 100, height: 100, borderRadius: 50 }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
  },
  text: {
    fontSize: 18,
  },
});