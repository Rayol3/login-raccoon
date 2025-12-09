import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/presentation/theme/components/ThemedText';
import { AuthService } from '@/presentation/auth/services/auth.service';

const HomeScreen = () => {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    // In a real app, you might fetch user profile here or get it from a global state/context
    // For now, we'll just show a generic welcome
  }, []);

  const handleLogout = async () => {
    try {
      await AuthService.logout();
      router.replace('/auth/login');
    } catch (error) {
      Alert.alert('Error', 'Failed to logout');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Login Raccoon</ThemedText>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color="#2E7D32" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Ionicons name="cube-outline" size={80} color="#2E7D32" />
        <ThemedText style={styles.welcomeText}>Welcome to the Products App!</ThemedText>
        <ThemedText style={styles.subtitleText}>You are successfully logged in.</ThemedText>

        <TouchableOpacity
          style={styles.gameButton}
          onPress={() => router.push('/(login-raccoon)/snake')}
        >
          <Ionicons name="game-controller-outline" size={24} color="white" style={{ marginRight: 10 }} />
          <ThemedText style={styles.gameButtonText}>Play Snake</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  logoutButton: {
    padding: 10,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -100, // Adjust to center visually
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginTop: 20,
    textAlign: 'center',
  },
  subtitleText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
    textAlign: 'center',
  },
  gameButton: {
    flexDirection: 'row',
    backgroundColor: '#FF5722',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 30,
    alignItems: 'center',
    shadowColor: '#FF5722',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  gameButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
