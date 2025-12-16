import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Modal, Platform, ActivityIndicator, Image, ScrollView, KeyboardAvoidingView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function LoginScreen() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorVisible, setErrorVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { signInWithPhone, user } = useAuth();
  const insets = useSafeAreaInsets();

  // Eğer kullanıcı zaten giriş yapmışsa, ana sayfaya yönlendir
  React.useEffect(() => {
    if (user) {
      router.replace('/(tabs)');
    }
  }, [user]);

  async function handleSignIn() {
    if (!phone || !password) {
      setErrorMessage('Lütfen telefon numarası ve şifrenizi giriniz.');
      setErrorVisible(true);
      return;
    }

    setLoading(true);
    
    const result = await signInWithPhone(phone.trim(), password, rememberMe);

    if (result.success) {
      router.replace('/(tabs)');
    } else {
      setErrorMessage(result.error || 'Bilinmeyen bir hata oluştu.');
      setErrorVisible(true);
    }
    
    setLoading(false);
  }

  function handleForgotPassword() {
    router.push('/forgot-password');
  }

  return (
    <View style={[styles.mainContainer, { paddingBottom: insets.bottom }]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Image 
              source={require('../assets/images/qassistant.png')} 
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Telefon Numarası</Text>
              <TextInput
                style={styles.input}
                onChangeText={(text) => setPhone(text)}
                value={phone}
                placeholder="5XX XXX XX XX"
                placeholderTextColor="#94a3b8"
                keyboardType="phone-pad"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Şifre</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  onChangeText={(text) => setPassword(text)}
                  value={password}
                  placeholder="******"
                  placeholderTextColor="#94a3b8"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity 
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <MaterialIcons 
                    name={showPassword ? 'visibility' : 'visibility-off'} 
                    size={22} 
                    color="#64748b" 
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Beni Hatırla & Şifremi Unuttum */}
            <View style={styles.optionsRow}>
              <TouchableOpacity 
                style={styles.rememberMe}
                onPress={() => setRememberMe(!rememberMe)}
              >
                <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                  {rememberMe && <MaterialIcons name="check" size={16} color="white" />}
                </View>
                <Text style={styles.rememberText}>Beni Hatırla</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleForgotPassword}>
                <Text style={styles.forgotText}>Şifremi Unuttum</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={[styles.button, loading && styles.buttonDisabled]} 
              onPress={handleSignIn}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.buttonText}>Giriş Yap</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.footerSpacer} />
        </ScrollView>
      </KeyboardAvoidingView>
      
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <Text style={styles.footerText}>QHotelier 2025</Text>
      </View>

      {/* Hata Modalı */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={errorVisible}
        onRequestClose={() => setErrorVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setErrorVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalIconContainer}>
              <MaterialIcons name="error-outline" size={32} color="#ef4444" />
            </View>
            <Text style={styles.modalTitle}>Giriş Başarısız</Text>
            <Text style={styles.modalMessage}>{errorMessage}</Text>
            <TouchableOpacity 
              style={styles.modalButton}
              onPress={() => setErrorVisible(false)}
            >
              <Text style={styles.modalButtonText}>Tekrar Dene</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoImage: {
    width: 280,
    height: 100,
    marginBottom: 24,
  },
  title: {
    fontSize: 36,
    fontFamily: 'Poppins_700Bold',
    color: '#0f172a',
  },
  form: {
    paddingHorizontal: 10,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: '#334155',
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: 'Poppins_400Regular',
    color: '#0f172a',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  passwordInput: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    fontFamily: 'Poppins_400Regular',
    color: '#0f172a',
  },
  eyeButton: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 4,
  },
  rememberMe: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  checkboxChecked: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  rememberText: {
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
    color: '#475569',
  },
  forgotText: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: '#2563EB',
  },
  button: {
    backgroundColor: '#2563EB',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: '#93c5fd',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
  },
  footerSpacer: {
    height: 80,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingTop: 10,
  },
  footerText: {
    color: '#94a3b8',
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  modalIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fef2f2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Poppins_700Bold',
    color: '#0f172a',
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 15,
    fontFamily: 'Poppins_400Regular',
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  modalButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
  },
});
