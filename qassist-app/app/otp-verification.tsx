import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Modal, Platform, ActivityIndicator, KeyboardAvoidingView, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function OTPVerificationScreen() {
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const [otp, setOtp] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [errorVisible, setErrorVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [resendTimer, setResendTimer] = useState(60);
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    // Geri sayım timer'ı
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleOtpChange = (value: string, index: number) => {
    if (value.length > 1) return; // Sadece tek karakter
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Otomatik sonraki input'a geç
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join('');
    
    if (otpCode.length !== 4) {
      setErrorMessage('Lütfen 4 haneli kodu giriniz.');
      setErrorVisible(true);
      return;
    }

    setLoading(true);
    
    // Backend bağlanana kadar 0000 geçerli
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (otpCode === '0000') {
      setLoading(false);
      // Şifre değiştirme ekranına yönlendir
      router.replace({ pathname: '/reset-password', params: { phone } });
    } else {
      setLoading(false);
      setErrorMessage('Geçersiz kod. Lütfen tekrar deneyin.');
      setErrorVisible(true);
      setOtp(['', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    
    setResendTimer(60);
    // TODO: SMS tekrar gönderme API'si
    setErrorMessage('Kod tekrar gönderildi.');
    setErrorVisible(true);
  };

  return (
    <View style={[styles.mainContainer, { paddingTop: insets.top }]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color="#0f172a" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Kod Doğrulama</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.iconContainer}>
            <MaterialIcons name="sms" size={64} color="#2563EB" />
          </View>

          <Text style={styles.title}>Doğrulama Kodu</Text>
          <Text style={styles.subtitle}>
            {phone} numarasına gönderilen 4 haneli kodu giriniz.
          </Text>

          {/* OTP Inputs */}
          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => (inputRefs.current[index] = ref)}
                style={[styles.otpInput, digit && styles.otpInputFilled]}
                value={digit}
                onChangeText={(value) => handleOtpChange(value, index)}
                onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
              />
            ))}
          </View>

          {/* Info Text */}
          <Text style={styles.infoText}>
            Kod gelmedi mi? {resendTimer > 0 ? (
              <Text style={styles.timerText}>{resendTimer} saniye sonra tekrar gönder</Text>
            ) : (
              <TouchableOpacity onPress={handleResend}>
                <Text style={styles.resendLink}>Tekrar Gönder</Text>
              </TouchableOpacity>
            )}
          </Text>

          {/* Verify Button */}
          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]} 
            onPress={handleVerify}
            disabled={loading || otp.join('').length !== 4}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>Doğrula</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.backToLogin}
            onPress={() => router.back()}
          >
            <MaterialIcons name="arrow-back" size={18} color="#2563EB" />
            <Text style={styles.backToLoginText}>Geri Dön</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

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
            <Text style={styles.modalTitle}>Hata</Text>
            <Text style={styles.modalMessage}>{errorMessage}</Text>
            <TouchableOpacity 
              style={styles.modalButton}
              onPress={() => setErrorVisible(false)}
            >
              <Text style={styles.modalButtonText}>Tamam</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
    color: '#0f172a',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Poppins_700Bold',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: 'Poppins_400Regular',
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    paddingHorizontal: 10,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  otpInput: {
    flex: 1,
    height: 64,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    fontSize: 24,
    fontFamily: 'Poppins_700Bold',
    color: '#0f172a',
    textAlign: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  otpInputFilled: {
    borderColor: '#2563EB',
    backgroundColor: '#eff6ff',
  },
  infoText: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 32,
  },
  timerText: {
    fontFamily: 'Poppins_500Medium',
    color: '#2563EB',
  },
  resendLink: {
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
    marginBottom: 24,
  },
  buttonDisabled: {
    backgroundColor: '#93c5fd',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
  },
  backToLogin: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  backToLoginText: {
    fontSize: 15,
    fontFamily: 'Poppins_600SemiBold',
    color: '#2563EB',
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

