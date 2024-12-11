import React, { useEffect, useState, useContext } from 'react';
import { Text, Image, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import axios from 'axios';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UserContext } from './UserContext';

export default function ProfileScreen() {
  const { user } = useContext(UserContext);
  const { userId, name, email, photo } = user;
  const [profileImage, setProfileImage] = useState(photo || null); // Use photo diretamente se disponível
  const [loading, setLoading] = useState(!photo); // Carregar se não houver photo

  useEffect(() => {
    console.log('Usuário:', user); // Adicionado para depuração 
    if (!userId) {
      Alert.alert('Erro', 'ID do usuário não disponível.');
      return;
    }

    const fetchProfileImage = async () => {
      try {
        const response = await axios.get(`http://10.90.108.201:3001/image/${userId}`, {
          responseType: 'arraybuffer',
        });

        // Converter a imagem para base64
        const base64 = Buffer.from(response.data, 'binary').toString('base64');
        const imageUri = `data:image/jpeg;base64,${base64}`; // Ajuste o tipo conforme necessário
        setProfileImage(imageUri);
      } catch (error) {
        console.error('Erro ao buscar a imagem de perfil:', error);
        Alert.alert('Erro', 'Não foi possível carregar a imagem de perfil.');
      } finally {
        setLoading(false);
      }
    };

    if (!photo) { // Apenas buscar se não houver photo
      fetchProfileImage();
    }
  }, [userId, photo]);

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {profileImage ? (
        <Image source={{ uri: profileImage }} style={styles.profileImage} />
      ) : (
        <Image source={{ uri: 'https://via.placeholder.com/150' }} style={styles.profileImage} />
      )}
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.email}>{email}</Text>
      {/* Outros detalhes do perfil */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  email: {
    fontSize: 18,
    color: '#666',
  },
});