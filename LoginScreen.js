import React, { useContext, useState } from 'react';
import { TextInput, TouchableOpacity, StyleSheet, Alert, Text, Image } from 'react-native';
import { CommonActions } from '@react-navigation/native';
import axios from 'axios';
import { UserContext } from './UserContext'; // Importar o contexto
import { SafeAreaView } from 'react-native-safe-area-context';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { setUser } = useContext(UserContext); // Acessar o setUser do contexto

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://10.90.108.201:3001/login', {
        email,
        password,
      });

      if (response.status === 200) {
        const { user } = response.data; // Adicionado para depuração
        console.log('Resposta do Login:', user); // Adicionado para depuração

        // Atualizar o UserContext com as informações do usuário vindas do backend
        setUser({
          userId: user.userId,
          name: user.name,
          email: user.email,
          photo: user.photo,
        });
        // Redirecionar para a HomeDrawer com os dados do usuário
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'HomeDrawer' }],
          })
        );
      } else {
        Alert.alert('Falha no login', 'Email ou senha incorretos.');
      }
    } catch (error) {
      console.error('Erro ao realizar o login: ', error);
      Alert.alert('Email ou senha incorretos.');
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      {/* Chamar imagem da web */}
      <Image
        style={styles.logo}
        source={{ uri: 'https://via.placeholder.com/150' }}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Cadastrar')}>
        <Text style={styles.buttonText}>Cadastre-se</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Esqueci a senha')}>
        <Text style={styles.buttonTextForgot}>Esqueci a senha</Text>
      </TouchableOpacity>
    
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 5,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonTextForgot: {
    color: '#000',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 30,
    alignSelf: 'center'
  },
  logo: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
    marginBottom: 20,
    alignSelf: 'center',
  }
});

export default LoginScreen;