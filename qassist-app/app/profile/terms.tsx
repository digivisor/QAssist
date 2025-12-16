import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function TermsScreen() {
  const sections = [
    {
      title: '1. Kabul',
      content: 'QHotelier uygulamasını kullanarak bu kullanım koşullarını kabul etmiş sayılırsınız. Koşulları kabul etmiyorsanız, lütfen uygulamayı kullanmayınız.'
    },
    {
      title: '2. Hizmet Tanımı',
      content: 'QHotelier, otel personelinin görev yönetimi, iç iletişim ve performans takibi için tasarlanmış bir mobil uygulamadır. Hizmetlerimiz, kayıtlı otel müşterilerine ve onların personeline sunulmaktadır.'
    },
    {
      title: '3. Hesap Sorumluluğu',
      content: 'Kullanıcılar olarak:\n\n• Hesap bilgilerinizi güvende tutmakla yükümlüsünüz\n• Şifrenizi kimseyle paylaşmamalısınız\n• Hesabınızda gerçekleşen tüm aktivitelerden sorumlusunuz\n• Yetkisiz erişimleri derhal bildirmelisiniz'
    },
    {
      title: '4. Kabul Edilebilir Kullanım',
      content: 'Uygulamayı kullanırken:\n\n• Yasalara uygun davranmalısınız\n• Diğer kullanıcılara saygılı olmalısınız\n• Yanıltıcı bilgi paylaşmamalısınız\n• Sistemi kötüye kullanmamalısınız\n• Güvenlik açıklarını bildirmelisiniz'
    },
    {
      title: '5. Fikri Mülkiyet',
      content: 'QHotelier markası, logoları, tasarımları ve içerikleri Digivisor\'a aittir. Yazılı izin olmadan kopyalanamaz, dağıtılamaz veya ticari amaçla kullanılamaz.'
    },
    {
      title: '6. Gizlilik',
      content: 'Kişisel verilerinizin işlenmesi hakkında detaylı bilgi için Gizlilik Politikamızı inceleyiniz. Uygulamayı kullanarak veri işleme pratiklerimizi kabul etmiş olursunuz.'
    },
    {
      title: '7. Hizmet Değişiklikleri',
      content: 'QHotelier, herhangi bir zamanda:\n\n• Hizmetleri değiştirebilir veya güncelleyebilir\n• Özellikleri ekleyebilir veya kaldırabilir\n• Fiyatlandırmayı değiştirebilir\n• Hizmeti geçici veya kalıcı olarak durdurabilir'
    },
    {
      title: '8. Sorumluluk Sınırı',
      content: 'QHotelier, uygulama kullanımından kaynaklanan dolaylı, arızi veya sonuç olarak ortaya çıkan zararlardan sorumlu tutulamaz. Uygulama "olduğu gibi" sunulmaktadır.'
    },
    {
      title: '9. Anlaşmazlık Çözümü',
      content: 'Bu koşullardan doğan anlaşmazlıklar Türkiye Cumhuriyeti yasalarına tabi olacak ve İstanbul mahkemeleri yetkili olacaktır.'
    },
    {
      title: '10. İletişim',
      content: 'Bu koşullarla ilgili sorularınız için:\n\nE-posta: legal@qhotelier.com\nAdres: İstanbul, Türkiye\n\nSon güncelleme: 16 Ocak 2025'
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Kullanım Koşulları</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.iconContainer}>
          <Ionicons name="document-text" size={48} color="#2563EB" />
        </View>
        <Text style={styles.intro}>
          Lütfen uygulamayı kullanmadan önce bu koşulları dikkatlice okuyunuz.
        </Text>

        {sections.map((section, index) => (
          <View key={index} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionContent}>{section.content}</Text>
          </View>
        ))}

        <View style={styles.acceptanceBox}>
          <Ionicons name="checkmark-circle" size={24} color="#22c55e" />
          <Text style={styles.acceptanceText}>
            Uygulamayı kullanarak bu koşulları kabul etmiş sayılırsınız.
          </Text>
        </View>
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
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  intro: {
    fontSize: 16,
    fontFamily: 'Poppins_500Medium',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: '#0f172a',
    marginBottom: 12,
  },
  sectionContent: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#475569',
    lineHeight: 22,
  },
  acceptanceBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    marginTop: 8,
  },
  acceptanceText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
    color: '#166534',
  },
});

