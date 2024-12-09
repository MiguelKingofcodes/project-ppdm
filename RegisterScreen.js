import React, { useState } from 'react';
import { TextInput, StyleSheet, Alert, Text, TouchableOpacity, Image, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');


  // Recuperação de senha
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');

  // Lidando com fotos
  const [photo, setPhoto] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password || !question || !answer) {
      Alert.alert('Por favor, preencha todos os campos.');
      return;
    }

    try {
      setUploading(true);

      const data = {
        name: name,
        email: email,
        password: password,
        question: question,
        answer: answer,
      };

      // Registro do usuário
      const response = await axios.post('http://10.90.108.201:3001/register', data, {
        headers: { 'Content-Type': 'application/json' },
      });

      const userId = response.data.userId; // Certifique-se de que o backend retorne o ID do usuário

      // Se uma foto foi selecionada, faça o upload
      if (photo) {
        
        const formData = new FormData();
        formData.append('userId', userId);
        const filename = photo.split('/').pop();
        // Define uma expressão regular para extrair a extensão do arquivo.
        // \.: Procura por um ponto literal.
        // (\w+): Captura um ou mais caracteres de palavra (\w) e coloca o resultado em um grupo de captura (()) para poder acessá-lo depois.
        // $: Procura o final da string.
        const match = /\.(\w+)$/.exec(filename);
        // exec(filename): Executa a expressão regular na string filename
        // e tenta encontrar uma correspondência. Se encontrar, o resultado é armazenado na variável match.
        const type = match ? `image/${match[1]}` : `image`;

        formData.append('profile_image', {
          uri: photo,
          name: filename,
          type: type,
        });

        await axios.post('http://10.90.108.201:3001/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }

      Alert.alert('Sucesso', 'Registro realizado com sucesso');
      navigation.navigate('Login');
    } catch (error) {
      console.error(error);
      Alert.alert('Falha no registro', error.response?.data?.error || 'Ocorreu um erro durante o registro.');
    } finally {
      setUploading(false);
    }
  };

  // Lidando com a imagem
  const pickImage = async () => {
    // Solicitar permissões
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão negada', 'Precisamos de permissão para acessar a galeria de fotos.');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1], // Imagem quadrada
      quality: 0.7,
    });

    if (!result.canceled) {
      setPhoto(result.assets[0].uri);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Image
          style={styles.logo}
          source={{ uri: 'https://via.placeholder.com/150' }}
        />
        <Text style={styles.title}>Crie a sua Conta</Text>
        <TextInput
          style={styles.input}
          placeholder="Nome"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Senha"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        {/* Recuperação de senha */}
        <Text style={styles.infoText}>
          Os campos para criar pergunta e resposta serão usados para recuperação de senha!
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Crie uma pergunta (Ex.: Qual o nome da sua mãe?)"
          value={question}
          onChangeText={setQuestion}
        />
        <TextInput
          style={styles.input}
          placeholder="Responda a pergunta"
          value={answer}
          onChangeText={setAnswer}
          secureTextEntry={true} // Marcar como campo sensível
        />
        {photo && (
          <Image
            source={{ uri: photo }}
            style={styles.photoPreview}
          />
        )}
        <TouchableOpacity style={styles.photoButton} onPress={pickImage}>
          <Text style={styles.photoButtonText}>
            {photo ? "Alterar Foto" : "Escolher Foto"}
          </Text>
        </TouchableOpacity>
        {uploading ? (
          <ActivityIndicator size="large" color="#2196F3" />
        ) : (
          <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
            <Text style={styles.registerButtonText}>Salvar</Text>
          </TouchableOpacity>
        )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
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
  infoText: {
    width: '100%',
    marginBottom: 15,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  photoButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    marginBottom: 15,
  },
  photoButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  registerButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    marginTop: 10,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    marginBottom: 20,
    alignSelf: 'center',
  },
  photoPreview: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
  },
});