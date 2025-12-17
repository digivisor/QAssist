import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Modal, Platform, ActivityIndicator, KeyboardAvoidingView, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

type Country = {
  code: string;
  dialCode: string;
  flag: string;
  name: string;
};

const countries: Country[] = [
  { code: 'TR', dialCode: '+90', flag: '🇹🇷', name: 'Türkiye' },
  { code: 'RU', dialCode: '+7', flag: '🇷🇺', name: 'Rusya' },
  { code: 'UZ', dialCode: '+998', flag: '🇺🇿', name: 'Özbekistan' },
  { code: 'UA', dialCode: '+380', flag: '🇺🇦', name: 'Ukrayna' },
  { code: 'KG', dialCode: '+996', flag: '🇰🇬', name: 'Kırgızistan' },
  { code: 'KZ', dialCode: '+7', flag: '🇰🇿', name: 'Kazakistan' },
  { code: 'AZ', dialCode: '+994', flag: '🇦🇿', name: 'Azerbaycan' },
  { code: 'US', dialCode: '+1', flag: '🇺🇸', name: 'United States' },
  { code: 'GB', dialCode: '+44', flag: '🇬🇧', name: 'United Kingdom' },
  { code: 'DE', dialCode: '+49', flag: '🇩🇪', name: 'Germany' },
  { code: 'FR', dialCode: '+33', flag: '🇫🇷', name: 'France' },
  { code: 'IT', dialCode: '+39', flag: '🇮🇹', name: 'Italy' },
  { code: 'ES', dialCode: '+34', flag: '🇪🇸', name: 'Spain' },
  { code: 'NL', dialCode: '+31', flag: '🇳🇱', name: 'Netherlands' },
  { code: 'BE', dialCode: '+32', flag: '🇧🇪', name: 'Belgium' },
  { code: 'CH', dialCode: '+41', flag: '🇨🇭', name: 'Switzerland' },
  { code: 'AT', dialCode: '+43', flag: '🇦🇹', name: 'Austria' },
  { code: 'GR', dialCode: '+30', flag: '🇬🇷', name: 'Greece' },
];

export default function ForgotPasswordScreen() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorVisible, setErrorVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<Country>(countries[0]);
  const [countryModalVisible, setCountryModalVisible] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const insets = useSafeAreaInsets();

  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
    country.dialCode.includes(countrySearch)
  );

  async function handleSendCode() {
    if (!phone) {
      setErrorMessage('Lütfen telefon numaranızı giriniz.');
      setErrorVisible(true);
      return;
    }

    if (phone.length < 10) {
      setErrorMessage('Geçerli bir telefon numarası giriniz.');
      setErrorVisible(true);
      return;
    }

    setLoading(true);
    
    // Ülke kodunu telefon numarasının başına ekle
    const fullPhoneNumber = `${selectedCountry.dialCode}${phone.trim()}`;
    
    // TODO: SMS gönderme API'si buraya gelecek
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setLoading(false);
    // OTP ekranına yönlendir (tam telefon numarası ile)
    router.push({ pathname: '/otp-verification', params: { phone: fullPhoneNumber } });
  }

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
          <Text style={styles.headerTitle}>Şifremi Unuttum</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.iconContainer}>
            <MaterialIcons name="lock-reset" size={64} color="#2563EB" />
          </View>

          <Text style={styles.title}>Şifrenizi mi unuttunuz?</Text>
          <Text style={styles.subtitle}>
            Endişelenmeyin! Telefon numaranızı girin, size doğrulama kodu göndereceğiz.
          </Text>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Telefon Numarası</Text>
              <View style={styles.phoneContainer}>
                <TouchableOpacity 
                  style={styles.countryCodeContainer}
                  onPress={() => setCountryModalVisible(true)}
                >
                  <Text style={styles.flagEmoji}>{selectedCountry.flag}</Text>
                  <Text style={styles.countryCode}>{selectedCountry.dialCode}</Text>
                  <MaterialIcons name="arrow-drop-down" size={20} color="#64748b" />
                </TouchableOpacity>
                <TextInput
                  style={styles.phoneInput}
                  onChangeText={(text) => setPhone(text)}
                  value={phone}
                  placeholder="5XX XXX XX XX"
                  placeholderTextColor="#94a3b8"
                  keyboardType="phone-pad"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.button, loading && styles.buttonDisabled]} 
              onPress={handleSendCode}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.buttonText}>Kod Gönder</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.backToLogin}
              onPress={() => router.back()}
            >
              <MaterialIcons name="arrow-back" size={18} color="#2563EB" />
              <Text style={styles.backToLoginText}>Giriş ekranına dön</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>


      {/* Ülke Seçici Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={countryModalVisible}
        onRequestClose={() => setCountryModalVisible(false)}
      >
        <View style={styles.countryModalOverlay}>
          <View style={styles.countryModalContent}>
            <View style={styles.countryModalHeader}>
              <Text style={styles.countryModalTitle}>Ülke Seç</Text>
              <TouchableOpacity onPress={() => setCountryModalVisible(false)}>
                <MaterialIcons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>
            <View style={styles.countrySearchContainer}>
              <MaterialIcons name="search" size={20} color="#94a3b8" />
              <TextInput
                style={styles.countrySearchInput}
                placeholder="Ülke ara..."
                placeholderTextColor="#94a3b8"
                value={countrySearch}
                onChangeText={setCountrySearch}
                autoCapitalize="none"
              />
            </View>
            <ScrollView style={styles.countryList}>
              {filteredCountries.map((country) => (
                <TouchableOpacity
                  key={country.code}
                  style={[
                    styles.countryItem,
                    selectedCountry.code === country.code && styles.countryItemSelected
                  ]}
                  onPress={() => {
                    setSelectedCountry(country);
                    setCountryModalVisible(false);
                  }}
                >
                  <Text style={styles.countryFlag}>{country.flag}</Text>
                  <View style={styles.countryInfo}>
                    <Text style={styles.countryName}>{country.name}</Text>
                    <Text style={styles.countryDialCode}>{country.dialCode}</Text>
                  </View>
                  {selectedCountry.code === country.code && (
                    <MaterialIcons name="check" size={20} color="#2563EB" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

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
  form: {
    paddingHorizontal: 10,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: '#334155',
    marginBottom: 8,
    marginLeft: 4,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
  },
  countryCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 16,
    borderRightWidth: 1,
    borderRightColor: '#e2e8f0',
    gap: 6,
  },
  // Ülke Seçici Modal
  countryModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  countryModalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '70%',
    paddingBottom: 20,
  },
  countryModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  countryModalTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
    color: '#0f172a',
  },
  countrySearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    gap: 10,
  },
  countrySearchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Poppins_400Regular',
    color: '#0f172a',
    includeFontPadding: false,
  },
  countryList: {
    maxHeight: 400,
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingHorizontal: 20,
    gap: 12,
  },
  countryItemSelected: {
    backgroundColor: '#eff6ff',
  },
  countryFlag: {
    fontSize: 24,
  },
  countryInfo: {
    flex: 1,
  },
  countryName: {
    fontSize: 15,
    fontFamily: 'Poppins_500Medium',
    color: '#0f172a',
    marginBottom: 2,
  },
  countryDialCode: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: '#64748b',
  },
  flagEmoji: {
    fontSize: 20,
  },
  countryCode: {
    fontSize: 16,
    fontFamily: 'Poppins_500Medium',
    color: '#0f172a',
  },
  phoneInput: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
    fontSize: 16,
    fontFamily: 'Poppins_400Regular',
    color: '#0f172a',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: 'Poppins_400Regular',
    color: '#0f172a',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    includeFontPadding: false,
    textAlignVertical: 'center',
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
  backToLogin: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
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
