import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  useWindowDimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/presentation/theme/components/ThemedText';
import { AuthService } from '@/presentation/auth/services/auth.service';

const RegisterScreen = () => {
  const router = useRouter();
  const { height } = useWindowDimensions();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    try {
      const { user } = await AuthService.register(name, email, password);
      console.log('Registration successful:', user);
      router.replace('/(login-raccoon)/(home)');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={[styles.headerContainer, { height: height * 0.35 }]}>
          <Ionicons name="person-add" size={100} color="white" />
          <ThemedText style={styles.title}>Create Account</ThemedText>
          <ThemedText style={styles.subtitle}>Sign up to get started</ThemedText>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={24} color="#2E7D32" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              placeholderTextColor="#888"
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={24} color="#2E7D32" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#888"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={24} color="#2E7D32" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#888"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity style={styles.loginButton} onPress={handleRegister}>
            <ThemedText style={styles.loginButtonText}>REGISTER</ThemedText>
          </TouchableOpacity>

          <View style={styles.registerContainer}>
            <ThemedText style={styles.registerText}>Already have an account? </ThemedText>
            <TouchableOpacity onPress={() => router.push('/auth/login')}>
              <ThemedText style={styles.registerLink}>Sign In</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  headerContainer: {
    backgroundColor: '#2E7D32',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#E8F5E9',
    marginTop: 5,
  },
  formContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F8E9',
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 15,
    height: 50,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: '#333',
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: '#2E7D32',
    borderRadius: 10,
    height: 55,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2E7D32',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
    marginBottom: 20,
    marginTop: 10,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  registerText: {
    color: '#666',
  },
  registerLink: {
    color: '#2E7D32',
    fontWeight: 'bold',
  },
});

export default RegisterScreen;
