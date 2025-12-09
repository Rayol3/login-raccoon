import React, { useState, useEffect } from 'react';
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
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSpring,
  Easing,
  withSequence,
} from 'react-native-reanimated';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';

import { Audio } from 'expo-av';

const LoginScreen = () => {
  const router = useRouter();
  const { height, width } = useWindowDimensions();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isDancing, setIsDancing] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);

  // Animation values
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);
  const pupilX = useSharedValue(0);
  const pupilY = useSharedValue(0);
  const rotation = useSharedValue(0);

  useEffect(() => {
    // Idle breathing animation
    scale.value = withRepeat(
      withTiming(1.05, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    // Idle head tilt (subtle)
    if (!isDancing) {
      rotation.value = withRepeat(
        withTiming(2, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
    }
  }, [isDancing]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const startAudioMonitoring = async () => {
      try {
        const { status } = await Audio.requestPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission needed', 'Microphone permission is required for dance mode!');
          setIsDancing(false);
          return;
        }

        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });

        const { recording } = await Audio.Recording.createAsync(
          Audio.RecordingOptionsPresets.LOW_QUALITY
        );

        setRecording(recording);

        // Poll for audio levels manually since onRecordingStatusUpdate can be slow for animations
        interval = setInterval(async () => {
          const status = await recording.getStatusAsync();
          if (status.isRecording && status.metering !== undefined) {
            // Metering is usually -160 (silence) to 0 (loud)
            // Normalize to 0-1 range roughly
            const level = Math.max(0, (status.metering + 60) / 60); // Focus on top 60dB

            // Drive animations with audio level
            // Scale: 1.0 to 1.3 based on loudness
            scale.value = withTiming(1 + level * 0.3, { duration: 50 });

            // Rotation: Random shake based on loudness
            if (level > 0.1) {
              rotation.value = withTiming((Math.random() - 0.5) * 20 * level, { duration: 50 });
            }
          }
        }, 100);

      } catch (err) {
        console.error('Failed to start recording', err);
      }
    };

    const stopAudioMonitoring = async () => {
      if (recording) {
        await recording.stopAndUnloadAsync();
        setRecording(null);
      }
      if (interval) clearInterval(interval);

      // Reset animations
      scale.value = withSpring(1);
      rotation.value = withSpring(0);
    };

    if (isDancing) {
      startAudioMonitoring();
    } else {
      stopAudioMonitoring();
    }

    return () => {
      stopAudioMonitoring();
    };
  }, [isDancing]);

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      // Calculate movement based on touch position relative to center
      const centerX = width / 2;
      const centerY = height * 0.2; // Approximate raccoon position

      const maxMovement = 15; // Max pixels pupils can move
      const maxRotation = 15; // Max degrees head can tilt

      const deltaX = (e.absoluteX - centerX) / 15;
      const deltaY = (e.absoluteY - centerY) / 15;

      pupilX.value = Math.max(Math.min(deltaX, maxMovement), -maxMovement);
      pupilY.value = Math.max(Math.min(deltaY, maxMovement), -maxMovement);

      // Rotate head towards touch
      rotation.value = Math.max(Math.min(deltaX, maxRotation), -maxRotation);
    })
    .onEnd(() => {
      pupilX.value = withSpring(0);
      pupilY.value = withSpring(0);
      rotation.value = withSpring(0);
    });

  const animatedFaceStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { translateY: translateY.value },
        { rotate: `${rotation.value}deg` },
      ],
    };
  });

  const animatedPupilStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: pupilX.value }, { translateY: pupilY.value }],
    };
  });

  const handleLogin = async () => {
    console.log('Attempting login with:', email, password);
    try {
      const { user, token } = await AuthService.login(email, password);
      console.log('Login successful:', user);
      router.replace('/(login-raccoon)/(home)');
    } catch (error: any) {
      console.error('Login error:', error);
      Alert.alert('Error', error.message || 'Something went wrong');
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GestureDetector gesture={panGesture}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={[styles.headerContainer, { height: height * 0.4 }]}>
              <View style={styles.raccoonContainer}>
                <Animated.Image
                  source={require('../../../assets/images/raccoon.png')}
                  style={[styles.raccoonFace, animatedFaceStyle, animatedPupilStyle]} // Apply all transforms to the single image
                  resizeMode="contain"
                />
              </View>

              <TouchableOpacity
                style={styles.danceButton}
                onPress={() => setIsDancing(!isDancing)}
              >
                <Ionicons name={isDancing ? "musical-notes" : "musical-notes-outline"} size={24} color="white" />
                <ThemedText style={styles.danceButtonText}>
                  {isDancing ? "Stop Dance" : "Dance Mode"}
                </ThemedText>
              </TouchableOpacity>

              <ThemedText style={styles.title}>Welcome Back</ThemedText>
              <ThemedText style={styles.subtitle}>Sign in to continue</ThemedText>
            </View>

            <View style={styles.formContainer}>
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

              <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                <ThemedText style={styles.loginButtonText}>LOGIN</ThemedText>
              </TouchableOpacity>

              <View style={styles.registerContainer}>
                <ThemedText style={styles.registerText}>Don't have an account? </ThemedText>
                <TouchableOpacity onPress={() => router.push('/auth/register')}>
                  <ThemedText style={styles.registerLink}>Sign Up</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </GestureDetector>
    </GestureHandlerRootView>
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
    overflow: 'hidden', // Keep raccoon inside
  },
  raccoonContainer: {
    width: 150,
    height: 150,
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  raccoonFace: {
    width: 150,
    height: 150,
    borderRadius: 75, // Make it circular
    borderWidth: 2,
    borderColor: 'white', // Optional: add a white border for better visibility
  },
  danceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 10,
  },
  danceButtonText: {
    color: 'white',
    marginLeft: 5,
    fontWeight: 'bold',
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

export default LoginScreen;
