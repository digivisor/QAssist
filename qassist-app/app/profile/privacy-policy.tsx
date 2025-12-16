import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function PrivacyPolicyScreen() {
  const sections = [
    {
      title: '1. Giriş',
      content: 'QHotelier ("biz", "bizim" veya "uygulama") olarak gizliliğinize önem veriyoruz. Bu Gizlilik Politikası, uygulamamızı kullanırken topladığımız, kullandığımız ve koruduğumuz kişisel bilgileri açıklamaktadır.'
    },
    {
      title: '2. Topladığımız Bilgiler',
      content: 'Uygulamamız aşağıdaki bilgileri toplayabilir:\n\n• Ad ve soyadı\n• Telefon numarası\n• E-posta adresi\n• Çalıştığınız departman bilgisi\n• Görev tamamlama verileri\n• Cihaz bilgileri ve konum verileri'
    },
    {
      title: '3. Bilgilerin Kullanımı',
      content: 'Topladığımız bilgileri şu amaçlarla kullanıyoruz:\n\n• Hizmetlerimizi sunmak ve iyileştirmek\n• Görev atama ve takibi\n• İç iletişimi sağlamak\n• Performans analizleri yapmak\n• Bildirimler göndermek'
    },
    {
      title: '4. Bilgi Güvenliği',
      content: 'Kişisel bilgilerinizi korumak için endüstri standardı güvenlik önlemleri uyguluyoruz. Verileriniz şifrelenmiş bağlantılar üzerinden iletilir ve güvenli sunucularda saklanır.'
    },
    {
      title: '5. Bilgi Paylaşımı',
      content: 'Kişisel bilgilerinizi üçüncü taraflarla paylaşmıyoruz, ancak:\n\n• Yasal zorunluluklar durumunda\n• Hizmet sağlayıcılarımızla (veri işleme amaçlı)\n• Şirket birleşme veya devralmaları durumunda paylaşılabilir.'
    },
    {
      title: '6. Çerezler ve Takip',
      content: 'Uygulamamız, kullanıcı deneyimini iyileştirmek için çerezler ve benzer teknolojiler kullanabilir. Bu teknolojileri uygulama ayarlarından yönetebilirsiniz.'
    },
    {
      title: '7. Haklarınız',
      content: 'KVKK kapsamında aşağıdaki haklara sahipsiniz:\n\n• Verilerinize erişim hakkı\n• Verilerin düzeltilmesini talep etme\n• Verilerin silinmesini talep etme\n• İşlemeye itiraz etme\n• Veri taşınabilirliği'
    },
    {
      title: '8. İletişim',
      content: 'Gizlilik politikamızla ilgili sorularınız için bizimle iletişime geçebilirsiniz:\n\nE-posta: privacy@qhotelier.com\nTelefon: 0850 123 45 67'
    },
    {
      title: '9. Güncelllemeler',
      content: 'Bu gizlilik politikası zaman zaman güncellenebilir. Değişiklikler uygulama içinden ve web sitemizden duyurulacaktır.\n\nSon güncelleme: 16 Ocak 2025'
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gizlilik Politikası</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.iconContainer}>
          <Ionicons name="shield-checkmark" size={48} color="#2563EB" />
        </View>
        <Text style={styles.intro}>
          QHotelier olarak kişisel verilerinizin güvenliği bizim için önemlidir.
        </Text>

        {sections.map((section, index) => (
          <View key={index} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionContent}>{section.content}</Text>
          </View>
        ))}
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
});

