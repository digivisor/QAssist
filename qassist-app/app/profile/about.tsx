import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function AboutScreen() {
  const appInfo = [
    { label: 'Versiyon', value: '1.0.0' },
    { label: 'Yapı Numarası', value: '2025.01.16' },
    { label: 'Son Güncelleme', value: '16 Ocak 2025' },
    { label: 'Platform', value: 'React Native / Expo' },
  ];

  const links = [
    { label: 'Web Sitemiz', icon: 'globe-outline', url: 'https://qhotelier.com' },
    { label: 'Instagram', icon: 'logo-instagram', url: 'https://instagram.com/qhotelier' },
    { label: 'LinkedIn', icon: 'logo-linkedin', url: 'https://linkedin.com/company/qhotelier' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Uygulama Hakkında</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Logo ve İsim */}
        <View style={styles.logoSection}>
          <View style={styles.logoContainer}>
            <Ionicons name="business" size={48} color="#2563EB" />
          </View>
          <Text style={styles.appName}>QHotelier</Text>
          <Text style={styles.appSlogan}>Otel Personel Yönetim Sistemi</Text>
        </View>

        {/* Uygulama Bilgileri */}
        <View style={styles.card}>
          {appInfo.map((info, index) => (
            <View 
              key={info.label}
              style={[
                styles.infoItem,
                index === appInfo.length - 1 && { borderBottomWidth: 0 }
              ]}
            >
              <Text style={styles.infoLabel}>{info.label}</Text>
              <Text style={styles.infoValue}>{info.value}</Text>
            </View>
          ))}
        </View>

        {/* Hakkımızda */}
        <Text style={styles.sectionTitle}>Hakkımızda</Text>
        <View style={styles.card}>
          <Text style={styles.aboutText}>
            QHotelier, otellerin personel yönetimini kolaylaştırmak için tasarlanmış modern bir mobil uygulamadır. 
            Görev takibi, departman yönetimi ve personel iletişimi tek bir platformda birleştirilmiştir.
          </Text>
          <Text style={styles.aboutText}>
            Amacımız, otel operasyonlarını daha verimli ve şeffaf hale getirmektir. 
            Müşteri memnuniyetini artırmak için personel performansını optimize ediyoruz.
          </Text>
        </View>

        {/* Sosyal Medya */}
        <Text style={styles.sectionTitle}>Bizi Takip Edin</Text>
        <View style={styles.card}>
          {links.map((link, index) => (
            <TouchableOpacity 
              key={link.label}
              style={[
                styles.linkItem,
                index === links.length - 1 && { borderBottomWidth: 0 }
              ]}
              onPress={() => Linking.openURL(link.url)}
            >
              <View style={[styles.linkIcon, { backgroundColor: '#eff6ff' }]}>
                <Ionicons name={link.icon as any} size={22} color="#2563EB" />
              </View>
              <Text style={styles.linkText}>{link.label}</Text>
              <Ionicons name="open-outline" size={18} color="#94a3b8" />
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.copyright}>© 2025 QHotelier. Tüm hakları saklıdır.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
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
  logoSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 24,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  appName: {
    fontSize: 28,
    fontFamily: 'Poppins_700Bold',
    color: '#0f172a',
  },
  appSlogan: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#64748b',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: '#64748b',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  infoLabel: {
    fontSize: 15,
    fontFamily: 'Poppins_400Regular',
    color: '#64748b',
  },
  infoValue: {
    fontSize: 15,
    fontFamily: 'Poppins_600SemiBold',
    color: '#0f172a',
  },
  aboutText: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#475569',
    lineHeight: 22,
    padding: 16,
    paddingBottom: 0,
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  linkIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  linkText: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Poppins_500Medium',
    color: '#0f172a',
  },
  copyright: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: '#94a3b8',
    textAlign: 'center',
  },
});

