import React, { useContext } from 'react';
// import { TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import LoginScreen from './LoginScreen';
import RegisterScreen from './RegisterScreen';
import ForgotPasswordScreen from './ForgotPasswordScreen';
import HomeScreen from './HomeScreen';
// import ProdutosScreen from './src/screens/ProdutosScreen';
import { UserProvider, UserContext } from './UserContext';  // Importar o contexto
import { SafeAreaView } from 'react-native-safe-area-context';
// https://oblador.github.io/react-native-vector-icons/
// import { MaterialCommunityIcons } from 'react-native-vector-icons';

// Atividade
import ProductScreen from './ProductScreen';
import ProfileScreen from './ProfileScreen';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

// Inserir "Sair" no Drawer
function CustomDrawerContent(props) {
  const { setUser } = useContext(UserContext);

  const handleLogout = () => {
    setUser({ name: '', photo_url: '' }); // Limpar o contexto do usuário
    props.navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <DrawerItemList {...props} />
      <DrawerItem
        label="Sair"
        onPress={handleLogout}
      />
      {/* Exemplo de como acrescentar itens no Menu do Drawer */}
      {/* <DrawerItem 
        label="Entrar"
      /> */}
    </SafeAreaView>
  );
}

// Drawer Navigator para HomeScreen
function HomeDrawer() {
  return (
    <Drawer.Navigator initialRouteName="Home" drawerContent={(props) => <CustomDrawerContent {...props} />}>
      {/* <Drawer.Navigator initialRouteName="Home"> */}
      <Drawer.Screen
        name="Home"
        component={HomeScreen}
        // options={({ navigation }) => ({
        //   title: 'Home',
        //   headerRight: () => (
        //     <TouchableOpacity
        //       onPress={() => {
        //         // Aqui você pode implementar a função de logout
        //         navigation.reset({
        //           index: 0,
        //           routes: [{ name: 'Login' }],
        //         });
        //       }}
        //       style={{ marginRight: 15 }} // Margem para afastar do canto
        //     >
        //       <MaterialCommunityIcons name="logout" size={24} color="black" />
        //     </TouchableOpacity>
        //   ),
        // })}
      />
      <Drawer.Screen name="Produtos" component={ProductScreen} />
      <Drawer.Screen name="Perfil" component={ProfileScreen} />
    </Drawer.Navigator>
  );
}

// Stack Navigator contendo o Drawer
export default function App() {
  return (
    <UserProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Cadastrar" component={RegisterScreen} />
          <Stack.Screen name="Esqueci a senha" component={ForgotPasswordScreen} />
          <Stack.Screen name="HomeDrawer" component={HomeDrawer} options={{ headerShown: false }} />
        </Stack.Navigator>
        <StatusBar style="auto" />
      </NavigationContainer>
    </UserProvider>
  );
}

