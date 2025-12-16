import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, TextInput, Modal, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function HelpScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [videoModalVisible, setVideoModalVisible] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<{ title: string; duration: string } | null>(null);

  const faqItems = [
    {
      id: 1,
      question: 'Görev nasıl tamamlanır?',
      answer: 'Görev detay sayfasına gidin ve "Tamamla" butonuna basın. Gerekirse kanıt fotoğrafı ekleyin.',
    },
    {
      id: 2,
      question: 'Mesaj nasıl gönderilir?',
      answer: 'Mesajlar sekmesinden kişi seçin veya departman grubuna mesaj gönderin.',
    },
    {
      id: 3,
      question: 'Şifremi unuttum, ne yapmalıyım?',
      answer: 'Giriş ekranındaki "Şifremi Unuttum" bağlantısına tıklayın ve telefon numaranızla yeni şifre oluşturun.',
    },
    {
      id: 4,
      question: 'Bildirimleri nasıl kapatırım?',
      answer: 'Profil > Bildirim Ayarları bölümünden bildirim tercihlerinizi yönetebilirsiniz.',
    },
    {
      id: 5,
      question: 'Uygulama donuyor, ne yapmalıyım?',
      answer: 'Ayarlar > Önbelleği Temizle seçeneğini deneyin. Sorun devam ederse uygulamayı yeniden yükleyin.',
    },
  ];

  const supportOptions = [
    {
      id: 'call',
      label: 'Telefon Destek',
      description: 'Hafta içi 09:00 - 18:00',
      icon: 'call',
      color: '#22c55e',
      onPress: () => {},
    },
    {
      id: 'email',
      label: 'E-posta',
      description: 'destek@qhotelier.com',
      icon: 'mail',
      color: '#3b82f6',
      onPress: () => {},
    },
    {
      id: 'chat',
      label: 'Canlı Destek',
      description: 'Anlık mesajlaşma',
      icon: 'chatbubbles',
      color: '#8b5cf6',
      onPress: () => router.push('/profile/live-chat'),
    },
  ];

  const videoGuides = [
    { id: 1, title: 'Uygulamaya Başlarken', duration: '3:45', thumbnail: '#2563EB' },
    { id: 2, title: 'Görev Yönetimi', duration: '5:20', thumbnail: '#8b5cf6' },
    { id: 3, title: 'Mesajlaşma Özellikleri', duration: '4:10', thumbnail: '#22c55e' },
    { id: 4, title: 'Profil Ayarları', duration: '2:30', thumbnail: '#f59e0b' },
  ];

  const openVideoModal = (video: { title: string; duration: string }) => {
    setSelectedVideo(video);
    setVideoModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Yardım & Destek</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Arama */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#94a3b8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Sorularınızı arayın..."
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Destek Seçenekleri */}
        <Text style={styles.sectionTitle}>İletişim</Text>
        <View style={styles.supportGrid}>
          {supportOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={styles.supportCard}
              onPress={option.onPress}
            >
              <View style={[styles.supportIcon, { backgroundColor: option.color + '20' }]}>
                <Ionicons name={option.icon as any} size={24} color={option.color} />
              </View>
              <Text style={styles.supportLabel}>{option.label}</Text>
              <Text style={styles.supportDesc}>{option.description}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* SSS */}
        <Text style={styles.sectionTitle}>Sık Sorulan Sorular</Text>
        <View style={styles.faqContainer}>
          {faqItems.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.faqItem,
                index === faqItems.length - 1 && { borderBottomWidth: 0 }
              ]}
              onPress={() => setExpandedFaq(expandedFaq === item.id ? null : item.id)}
            >
              <View style={styles.faqQuestion}>
                <Text style={styles.faqQuestionText}>{item.question}</Text>
                <Ionicons 
                  name={expandedFaq === item.id ? 'chevron-up' : 'chevron-down'} 
                  size={20} 
                  color="#64748b" 
                />
              </View>
              {expandedFaq === item.id && (
                <Text style={styles.faqAnswer}>{item.answer}</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Video Rehberler */}
        <Text style={styles.sectionTitle}>Video Rehberler</Text>
        {videoGuides.map((video) => (
          <TouchableOpacity 
            key={video.id} 
            style={styles.videoCard}
            onPress={() => openVideoModal(video)}
          >
            <View style={[styles.videoThumbnail, { backgroundColor: video.thumbnail }]}>
              <Ionicons name="play-circle" size={48} color="white" />
            </View>
            <View style={styles.videoContent}>
              <Text style={styles.videoTitle}>{video.title}</Text>
              <View style={styles.videoDurationContainer}>
                <Ionicons name="time-outline" size={14} color="#64748b" />
                <Text style={styles.videoDuration}>{video.duration}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Video Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={videoModalVisible}
        onRequestClose={() => setVideoModalVisible(false)}
      >
        <View style={styles.videoModalOverlay}>
          <View style={styles.videoModalContent}>
            <TouchableOpacity 
              style={styles.videoModalClose}
              onPress={() => setVideoModalVisible(false)}
            >
              <Ionicons name="close" size={28} color="white" />
            </TouchableOpacity>

            {/* Video Player Placeholder */}
            <View style={styles.videoPlayerContainer}>
              <View style={styles.videoPlayer}>
                <View style={styles.videoPlayButton}>
                  <Ionicons name="play" size={48} color="white" />
                </View>
              </View>
              
              {/* Video Controls */}
              <View style={styles.videoControls}>
                <Text style={styles.videoCurrentTime}>0:00</Text>
                <View style={styles.videoProgressBar}>
                  <View style={styles.videoProgress} />
                </View>
                <Text style={styles.videoTotalTime}>{selectedVideo?.duration}</Text>
              </View>
            </View>

            <View style={styles.videoModalInfo}>
              <Text style={styles.videoModalTitle}>{selectedVideo?.title}</Text>
              <Text style={styles.videoModalDesc}>
                Bu eğitim videosunda QHotelier uygulamasının temel özelliklerini öğreneceksiniz.
              </Text>
            </View>

            <View style={styles.videoModalActions}>
              <TouchableOpacity style={styles.videoActionButton}>
                <Ionicons name="bookmark-outline" size={22} color="#64748b" />
                <Text style={styles.videoActionText}>Kaydet</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.videoActionButton}>
                <Ionicons name="share-outline" size={22} color="#64748b" />
                <Text style={styles.videoActionText}>Paylaş</Text>
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Poppins_400Regular',
    color: '#0f172a',
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: '#64748b',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  supportGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  supportCard: {
    width: '31%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  supportIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  supportLabel: {
    fontSize: 13,
    fontFamily: 'Poppins_600SemiBold',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 4,
  },
  supportDesc: {
    fontSize: 10,
    fontFamily: 'Poppins_400Regular',
    color: '#64748b',
    textAlign: 'center',
  },
  faqContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  faqItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  faqQuestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestionText: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Poppins_500Medium',
    color: '#0f172a',
    marginRight: 12,
  },
  faqAnswer: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#64748b',
    marginTop: 12,
    lineHeight: 22,
  },
  videoCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    padding: 12,
  },
  videoThumbnail: {
    width: 80,
    height: 60,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoContent: {
    flex: 1,
    paddingHorizontal: 14,
  },
  videoTitle: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: '#0f172a',
    marginBottom: 4,
  },
  videoDurationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  videoDuration: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: '#64748b',
  },
  // Video Modal
  videoModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
  },
  videoModalContent: {
    flex: 1,
    justifyContent: 'center',
  },
  videoModalClose: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 10,
    padding: 8,
  },
  videoPlayerContainer: {
    paddingHorizontal: 20,
  },
  videoPlayer: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#1e293b',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoPlayButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(37, 99, 235, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    gap: 12,
  },
  videoCurrentTime: {
    fontSize: 12,
    fontFamily: 'Poppins_500Medium',
    color: 'white',
  },
  videoProgressBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#334155',
    borderRadius: 2,
    overflow: 'hidden',
  },
  videoProgress: {
    width: '0%',
    height: '100%',
    backgroundColor: '#2563EB',
  },
  videoTotalTime: {
    fontSize: 12,
    fontFamily: 'Poppins_500Medium',
    color: 'white',
  },
  videoModalInfo: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  videoModalTitle: {
    fontSize: 20,
    fontFamily: 'Poppins_700Bold',
    color: 'white',
    marginBottom: 8,
  },
  videoModalDesc: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#94a3b8',
    lineHeight: 22,
  },
  videoModalActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 24,
    gap: 24,
  },
  videoActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  videoActionText: {
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
    color: '#94a3b8',
  },
});
