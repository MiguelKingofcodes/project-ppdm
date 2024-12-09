import React, { useState } from 'react';
import axios from 'axios';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';

// Após realizar a redefinição da senha, o usuário será redirecionado para a tela loggin
import { useNavigation } from '@react-navigation/native';  // Importando a navegação

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [step, setStep] = useState(1);  // Controla a etapa do fluxo

  // Verificar o email
  const handleEmailSubmit = async () => {
    try {
      const response = await axios.post('http://10.90.108.201:3001/check-email', { email });
      setStep(2);  // Avança para a próxima etapa
    } catch (error) {
      setMessage(error.response.data.error);
    }
  };

  // Verificar a resposta da pergunta de segurança
  const handleSecurityQuestionAnswerSubmit = async () => {
    try {
      const response = await axios.post('http://10.90.108.201:3001/check-security-question-answer', {
        email,
        securityQuestion,
        securityAnswer,
      });
      setMessage(response.data.message);
      setStep(3);  // Avança para a etapa de redefinição de senha
    } catch (error) {
      setMessage(error.response.data.error);
    }
  };

  // Redefinir a senha
  const handlePasswordResetSubmit = async () => {
    try {
      const response = await axios.post('http://10.90.108.201:3001/reset-password', {
        email,
        newPassword,
      });
      setMessage(response.data.message);

      // Verifique se o backend respondeu com sucesso e redirecione
      if (response.data.success) {
        navigation.navigate('Login');  // Redireciona para a tela de login
        Alert.alert("Senha redefinida com sucesso!")
      }
    } catch (error) {
      setMessage(error.response?.data?.error || 'Erro ao redefinir senha');
    }
  };

  // Certifique-se de chamar o hook de navegação
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {step === 1 && (
        <>
          <Text style={styles.labelText}>Email:</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Digite seu e-mail"
            keyboardType="email-address"
          />
          <TouchableOpacity style={styles.button} onPress={handleEmailSubmit}>
            <Text style={styles.buttonText}>Enviar Email</Text>
          </TouchableOpacity>
        </>
      )}

      {step === 2 && (
        <>
          <Text style={styles.labelText}>Insira a pergunta e a resposta corretamente para redefinir a sua senha</Text>
          <TextInput
            style={styles.input}
            value={securityQuestion}
            onChangeText={setSecurityQuestion}
            placeholder="Digite a pergunta de segurança"
          />
          <TextInput
            style={styles.input}
            value={securityAnswer}
            onChangeText={setSecurityAnswer}
            placeholder="Digite a resposta da pergunta de segurança"
          />
          <TouchableOpacity style={styles.button} onPress={handleSecurityQuestionAnswerSubmit}>
            <Text style={styles.buttonText}>Enviar Resposta</Text>
          </TouchableOpacity>
        </>
      )}

      {step === 3 && (
        <>
          <Text style={styles.labelText}>Nova Senha:</Text>
          <TextInput
            style={styles.input}
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="Digite sua nova senha"
            secureTextEntry
          />
          <TouchableOpacity style={styles.button} onPress={handlePasswordResetSubmit}>
            <Text style={styles.buttonText}>Redefinir Senha</Text>
          </TouchableOpacity>
        </>
      )}

      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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
  labelText: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  message: {
    marginTop: 20,
    fontWeight: 'bold',
    color: 'red',
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
});

export default ForgotPassword;