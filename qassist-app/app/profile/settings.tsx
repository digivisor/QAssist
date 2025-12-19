import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Switch, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme } from '../../context/ThemeContext';

export default function SettingsScreen() {
  const { isDark, toggleTheme, colors } = useTheme();
  const [autoUpdate, setAutoUpdate] = useState(true);
  const [dataSaver, setDataSaver] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('tr');
  const [clearCacheModalVisible, setClearCacheModalVisible] = useState(false);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);

  const languages = [
    { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
  ];

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem('language');
      if (savedLanguage !== null) setSelectedLanguage(savedLanguage);
    } catch (e) {
      console.error('Ayarlar yüklenemedi:', e);
    }
  };

  const handleDarkModeChange = async (value: boolean) => {
    if (value !== isDark) {
      await toggleTheme();
    }
  };

  const handleLanguageChange = async (langCode: string) => {
    setSelectedLanguage(langCode);
    setLanguageModalVisible(false);
    try {
      await AsyncStorage.setItem('language', langCode);
    } catch (e) {
      console.error('Dil kaydedilemedi:', e);
    }
  };

  const getLanguageName = () => {
    return languages.find(l => l.code === selectedLanguage)?.name || 'Türkçe';
  };

  const toggleSettings = [
    {
      id: 'darkMode',
      label: 'Karanlık Mod',
      description: 'Koyu tema kullan',
      icon: 'moon',
      color: '#6366f1',
      value: isDark,
      onValueChange: handleDarkModeChange,
    },
    {
      id: 'autoUpdate',
      label: 'Otomatik Güncelleme',
      description: 'Uygulamayı otomatik güncelle',
      icon: 'refresh',
      color: '#22c55e',
      value: autoUpdate,
      onValueChange: setAutoUpdate,
    },
    {
      id: 'dataSaver',
      label: 'Veri Tasarrufu',
      description: 'Düşük kaliteli medya indir',
      icon: 'cellular',
      color: '#f59e0b',
      value: dataSaver,
      onValueChange: setDataSaver,
    },
  ];

  const actionSettings = [
    {
      id: 'language',
      label: 'Dil',
      value: getLanguageName(),
      icon: 'language',
      color: '#3b82f6',
      onPress: () => setLanguageModalVisible(true),
    },
    {
      id: 'cache',
      label: 'Önbelleği Temizle',
      value: '24.5 MB',
      icon: 'trash',
      color: '#ef4444',
      onPress: () => setClearCacheModalVisible(true),
    },
    {
      id: 'about',
      label: 'Uygulama Hakkında',
      value: 'v1.0.0',
      icon: 'information-circle',
      color: '#64748b',
      onPress: () => router.push('/profile/about'),
    },
  ];

  const containerStyle = isDark ? styles.containerDark : styles.container;
  const headerStyle = isDark ? styles.headerDark : styles.header;
  const cardStyle = isDark ? styles.cardDark : styles.card;
  const textColor = colors.text;
  const subTextColor = colors.textSecondary;

  return (
    <SafeAreaView style={containerStyle} edges={['top']}>
      <View style={headerStyle}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>Uygulama Ayarları</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Toggle Ayarları */}
        <Text style={[styles.sectionTitle, { color: subTextColor }]}>Genel Ayarlar</Text>
        <View style={cardStyle}>
          {toggleSettings.map((setting, index) => (
            <View 
              key={setting.id}
              style={[
                styles.settingItem,
                isDark && styles.settingItemDark,
                index === toggleSettings.length - 1 && { borderBottomWidth: 0 }
              ]}
            >
              <View style={[styles.settingIcon, { backgroundColor: setting.color + '20' }]}>
                <Ionicons name={setting.icon as any} size={22} color={setting.color} />
              </View>
              <View style={styles.settingContent}>
                <Text style={[styles.settingLabel, { color: textColor }]}>{setting.label}</Text>
                <Text style={[styles.settingDescription, { color: subTextColor }]}>{setting.description}</Text>
              </View>
              <Switch
                value={setting.value}
                onValueChange={setting.onValueChange}
                trackColor={{ false: isDark ? '#374151' : '#e2e8f0', true: '#2563EB' }}
                thumbColor="white"
              />
            </View>
          ))}
        </View>

        {/* Action Ayarları */}
        <Text style={[styles.sectionTitle, { color: subTextColor }]}>Diğer</Text>
        <View style={cardStyle}>
          {actionSettings.map((setting, index) => (
            <TouchableOpacity 
              key={setting.id}
              style={[
                styles.settingItem,
                isDark && styles.settingItemDark,
                index === actionSettings.length - 1 && { borderBottomWidth: 0 }
              ]}
              onPress={setting.onPress}
            >
              <View style={[styles.settingIcon, { backgroundColor: setting.color + '20' }]}>
                <Ionicons name={setting.icon as any} size={22} color={setting.color} />
              </View>
              <View style={styles.settingContent}>
                <Text style={[styles.settingLabel, { color: textColor }]}>{setting.label}</Text>
              </View>
              <View style={styles.settingRight}>
                <Text style={[styles.settingValue, { color: subTextColor }]}>{setting.value}</Text>
                <Ionicons name="chevron-forward" size={20} color={subTextColor} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Hukuki Bağlantılar */}
        <Text style={[styles.sectionTitle, { color: subTextColor }]}>Hukuki</Text>
        <View style={cardStyle}>
          <TouchableOpacity 
            style={[styles.linkItem, isDark && styles.linkItemDark]}
            onPress={() => router.push('/profile/privacy-policy')}
          >
            <Text style={[styles.linkText, { color: textColor }]}>Gizlilik Politikası</Text>
            <Ionicons name="chevron-forward" size={18} color={subTextColor} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.linkItem, isDark && styles.linkItemDark, { borderBottomWidth: 0 }]}
            onPress={() => router.push('/profile/terms')}
          >
            <Text style={[styles.linkText, { color: textColor }]}>Kullanım Koşulları</Text>
            <Ionicons name="chevron-forward" size={18} color={subTextColor} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Dil Seçimi Modalı */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={languageModalVisible}
        onRequestClose={() => setLanguageModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.languageModalContent, isDark && styles.modalContentDark]}>
            <View style={styles.modalHandle} />
            <Text style={[styles.languageModalTitle, { color: textColor }]}>Dil Seçin</Text>
            {languages.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={[
                  styles.languageOption,
                  isDark && styles.languageOptionDark,
                  selectedLanguage === lang.code && styles.languageOptionSelected
                ]}
                onPress={() => handleLanguageChange(lang.code)}
              >
                <Text style={styles.languageFlag}>{lang.flag}</Text>
                <Text style={[styles.languageName, { color: textColor }]}>{lang.name}</Text>
                {selectedLanguage === lang.code && (
                  <Ionicons name="checkmark-circle" size={24} color="#2563EB" />
                )}
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.languageCancelButton}
              onPress={() => setLanguageModalVisible(false)}
            >
              <Text style={styles.languageCancelText}>İptal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Önbellek Temizleme Modalı */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={clearCacheModalVisible}
        onRequestClose={() => setClearCacheModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, isDark && styles.modalContentDark]}>
            <View style={[styles.modalIconContainer, { backgroundColor: '#fef2f2' }]}>
              <Ionicons name="trash-outline" size={32} color="#ef4444" />
            </View>
            <Text style={[styles.modalTitle, { color: textColor }]}>Önbelleği Temizle</Text>
            <Text style={[styles.modalMessage, { color: subTextColor }]}>
              24.5 MB önbellek verisi silinecek. Uygulamayı tekrar kullanırken bazı veriler yeniden indirilecektir.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalCancelButton, isDark && styles.modalCancelButtonDark]}
                onPress={() => setClearCacheModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.modalConfirmButton}
                onPress={() => setClearCacheModalVisible(false)}
              >
                <Text style={styles.modalConfirmText}>Temizle</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  containerDark: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerDark: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1e293b',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
    color: '#0f172a',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: '#64748b',
    marginBottom: 12,
    marginTop: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 20,
  },
  cardDark: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    marginBottom: 20,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  settingItemDark: {
    borderBottomColor: '#334155',
  },
  settingIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  settingContent: {
    flex: 1,
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 15,
    fontFamily: 'Poppins_600SemiBold',
    color: '#0f172a',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: '#64748b',
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingValue: {
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
    color: '#64748b',
  },
  linkItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  linkItemDark: {
    borderBottomColor: '#334155',
  },
  linkText: {
    fontSize: 15,
    fontFamily: 'Poppins_500Medium',
    color: '#0f172a',
  },
  // Modal
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
  },
  modalContentDark: {
    backgroundColor: '#1e293b',
  },
  modalIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
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
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
  },
  modalCancelButtonDark: {
    backgroundColor: '#334155',
  },
  modalCancelText: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: '#64748b',
  },
  modalConfirmButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#ef4444',
    alignItems: 'center',
  },
  modalConfirmText: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: 'white',
  },
  // Language Modal
  languageModalContent: {
    width: '100%',
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 40,
    position: 'absolute',
    bottom: 0,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#cbd5e1',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  languageModalTitle: {
    fontSize: 20,
    fontFamily: 'Poppins_700Bold',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 20,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#f8fafc',
  },
  languageOptionDark: {
    backgroundColor: '#334155',
  },
  languageOptionSelected: {
    backgroundColor: '#eff6ff',
    borderWidth: 2,
    borderColor: '#2563EB',
  },
  languageFlag: {
    fontSize: 28,
    marginRight: 14,
  },
  languageName: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Poppins_500Medium',
    color: '#0f172a',
  },
  languageCancelButton: {
    marginTop: 12,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
  },
  languageCancelText: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: '#64748b',
  },
});
