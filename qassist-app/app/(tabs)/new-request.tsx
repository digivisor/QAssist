import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, TextInput, Modal, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAuth } from '../../context/AuthContext';

const REQUEST_TYPES = [
  { id: 'cleaning', label: 'Temizlik', icon: 'sparkles-outline', color: '#22c55e' },
  { id: 'maintenance', label: 'Bakım/Onarım', icon: 'construct-outline', color: '#f59e0b' },
  { id: 'room_service', label: 'Oda Servisi', icon: 'restaurant-outline', color: '#ef4444' },
  { id: 'laundry', label: 'Çamaşırhane', icon: 'shirt-outline', color: '#8b5cf6' },
  { id: 'concierge', label: 'Resepsiyon', icon: 'person-outline', color: '#3b82f6' },
  { id: 'other', label: 'Diğer', icon: 'ellipsis-horizontal-outline', color: '#64748b' },
];

const PRIORITY_OPTIONS = [
  { id: 'low', label: 'Düşük', color: '#22c55e' },
  { id: 'medium', label: 'Normal', color: '#f59e0b' },
  { id: 'high', label: 'Yüksek', color: '#ef4444' },
];

export default function NewRequestScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedPriority, setSelectedPriority] = useState('medium');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);

  const handleSubmit = async () => {
    if (!selectedType || !title) {
      return;
    }

    setLoading(true);
    // TODO: API çağrısı
    await new Promise(resolve => setTimeout(resolve, 1500));
    setLoading(false);
    setSuccessVisible(true);
  };

  const handleSuccessClose = () => {
    setSuccessVisible(false);
    setSelectedType(null);
    setTitle('');
    setDescription('');
    router.push('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Yeni Talep</Text>
        <Text style={styles.headerSubtitle}>Talep oluşturmak için bilgileri doldurun</Text>
      </View>

      <ScrollView 
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Talep Türü */}
        <Text style={styles.sectionTitle}>Talep Türü</Text>
        <View style={styles.typeGrid}>
          {REQUEST_TYPES.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.typeCard,
                selectedType === type.id && { borderColor: type.color, borderWidth: 2 }
              ]}
              onPress={() => setSelectedType(type.id)}
            >
              <View style={[styles.typeIcon, { backgroundColor: type.color + '20' }]}>
                <Ionicons name={type.icon as any} size={24} color={type.color} />
              </View>
              <Text style={styles.typeLabel}>{type.label}</Text>
              {selectedType === type.id && (
                <View style={[styles.checkmark, { backgroundColor: type.color }]}>
                  <Ionicons name="checkmark" size={14} color="white" />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Başlık */}
        <Text style={styles.sectionTitle}>Başlık</Text>
        <TextInput
          style={styles.input}
          placeholder="Talep başlığını girin"
          placeholderTextColor="#94a3b8"
          value={title}
          onChangeText={setTitle}
        />

        {/* Açıklama */}
        <Text style={styles.sectionTitle}>Açıklama</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Detaylı açıklama yazın..."
          placeholderTextColor="#94a3b8"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        {/* Öncelik */}
        <Text style={styles.sectionTitle}>Öncelik</Text>
        <View style={styles.priorityRow}>
          {PRIORITY_OPTIONS.map((priority) => (
            <TouchableOpacity
              key={priority.id}
              style={[
                styles.priorityOption,
                selectedPriority === priority.id && { backgroundColor: priority.color, borderColor: priority.color }
              ]}
              onPress={() => setSelectedPriority(priority.id)}
            >
              <Text style={[
                styles.priorityText,
                selectedPriority === priority.id && { color: 'white' }
              ]}>
                {priority.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Gönder Butonu */}
        <TouchableOpacity
          style={[styles.submitButton, (!selectedType || !title) && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={!selectedType || !title || loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Ionicons name="send" size={20} color="white" />
              <Text style={styles.submitButtonText}>Talep Oluştur</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Başarı Modalı */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={successVisible}
        onRequestClose={handleSuccessClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={[styles.modalIconContainer, { backgroundColor: '#ecfdf5' }]}>
              <Ionicons name="checkmark-circle" size={48} color="#22c55e" />
            </View>
            <Text style={styles.modalTitle}>Talep Oluşturuldu!</Text>
            <Text style={styles.modalMessage}>
              Talebiniz başarıyla oluşturuldu. İlgili departman en kısa sürede işleme alacaktır.
            </Text>
            <TouchableOpacity 
              style={styles.modalButton}
              onPress={handleSuccessClose}
            >
              <Text style={styles.modalButtonText}>Tamam</Text>
            </TouchableOpacity>
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
    padding: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'Poppins_700Bold',
    color: '#0f172a',
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#64748b',
    marginTop: 4,
  },
  content: {
    padding: 20,
    paddingTop: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: '#0f172a',
    marginBottom: 12,
    marginTop: 8,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  typeCard: {
    width: '30%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    position: 'relative',
  },
  typeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  typeLabel: {
    fontSize: 12,
    fontFamily: 'Poppins_500Medium',
    color: '#334155',
    textAlign: 'center',
  },
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    fontFamily: 'Poppins_400Regular',
    color: '#0f172a',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
  },
  textArea: {
    height: 120,
    paddingTop: 16,
  },
  priorityRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  priorityOption: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  priorityText: {
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
    color: '#64748b',
  },
  submitButton: {
    backgroundColor: '#2563EB',
    padding: 18,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    backgroundColor: '#93c5fd',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
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
  modalIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
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
