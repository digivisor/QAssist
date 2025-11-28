import { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function LoginScreen() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({ light: '#e2e8f0', dark: '#1e293b' }, 'background');

  const handleLogin = () => {
    if (!phone || !password) {
      Alert.alert('Hata', 'Lütfen telefon numarası ve şifre giriniz');
      return;
    }

    // TODO: API call ile giriş yapılacak
    // Telefon numarasından personel bilgisi çekilecek
    // Şifre kontrolü yapılacak
    
    // Mock login - başarılı
    router.replace('/(tabs)/tasks');
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor }]}
    >
      <ThemedView style={styles.content}>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.logo}>Q</ThemedText>
          <ThemedText type="title" style={styles.title}>QAssist</ThemedText>
          <ThemedText style={styles.subtitle}>Personel Girişi</ThemedText>
        </View>

        <View style={styles.form}>
          <View style={[styles.inputContainer, { borderColor }]}>
            <ThemedText style={styles.label}>Telefon Numarası</ThemedText>
            <TextInput
              style={[styles.input, { color: textColor }]}
              placeholder="+90 555 123 4567"
              placeholderTextColor="#94a3b8"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              autoCapitalize="none"
            />
          </View>

          <View style={[styles.inputContainer, { borderColor }]}>
            <ThemedText style={styles.label}>Şifre</ThemedText>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.input, styles.passwordInput, { color: textColor }]}
                placeholder="Şifrenizi giriniz"
                placeholderTextColor="#94a3b8"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
              >
                <ThemedText>{showPassword ? '👁️' : '👁️‍🗨️'}</ThemedText>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.loginButton, { backgroundColor: '#0f172a' }]}
            onPress={handleLogin}
          >
            <ThemedText style={styles.loginButtonText}>Giriş Yap</ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logo: {
    fontSize: 64,
    fontWeight: 'bold',
    marginBottom: 20,
    backgroundColor: '#0f172a',
    color: '#fff',
    width: 100,
    height: 100,
    borderRadius: 24,
    textAlign: 'center',
    lineHeight: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.6,
    marginTop: 4,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    opacity: 0.8,
  },
  input: {
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 18,
    fontSize: 16,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 14,
  },
  passwordInput: {
    flex: 1,
    borderWidth: 0,
    padding: 16,
  },
  eyeButton: {
    padding: 16,
  },
  loginButton: {
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

