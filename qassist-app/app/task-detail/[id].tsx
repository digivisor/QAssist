import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  TextInput, 
  KeyboardAvoidingView, 
  Platform,
  Modal
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAuth } from '../../context/AuthContext';

type Assignee = {
  id: number;
  name: string;
  avatar: string;
  department: string;
  phone: string;
};

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams();
  const { user, isManager } = useAuth();
  const insets = useSafeAreaInsets();
  
  const [message, setMessage] = useState('');
  const [selectedAssignee, setSelectedAssignee] = useState<Assignee | null>(null);
  const [assigneeModalVisible, setAssigneeModalVisible] = useState(false);
  const [completeModalVisible, setCompleteModalVisible] = useState(false);
  const [completionStatus, setCompletionStatus] = useState<'positive' | 'negative' | null>(null);
  const [completionNote, setCompletionNote] = useState('');
  const [completionPhotos, setCompletionPhotos] = useState<string[]>([]);
  
  // Dummy Data
  const task = {
    id,
    title: 'Havlu Değişimi',
    desc: '305 No\'lu odanın havlu değişimi yapılacak. Misafir saat 14:00\'te dönecek.',
    priority: 'high',
    status: 'in_progress',
    department: 'Kat Hizmetleri',
    createdAt: '10.02.2024 09:00',
    dueDate: '10.02.2024 13:00',
    assignees: [
      { id: 1, name: 'Selin Yılmaz', avatar: 'https://i.pravatar.cc/150?u=1', department: 'Kat Hizmetleri', phone: '+90 532 123 45 67' },
      { id: 2, name: 'Ahmet Demir', avatar: 'https://i.pravatar.cc/150?u=2', department: 'Kat Hizmetleri', phone: '+90 533 234 56 78' },
    ],
    messages: [
      { id: 1, text: 'Havlular hazır mı?', sender: 'Müdür', time: '16:30', isMe: false, avatar: 'https://i.pravatar.cc/150?u=manager' },
      { id: 2, text: 'Evet, odaya götürüyorum.', sender: 'Selin', time: '16:32', isMe: true, avatar: 'https://i.pravatar.cc/150?u=1' },
      { id: 3, text: 'Tamam, misafir 14:00\'te dönecek.', sender: 'Müdür', time: '16:33', isMe: false, avatar: 'https://i.pravatar.cc/150?u=manager' },
    ]
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#22c55e';
      default: return '#64748b';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'Yüksek';
      case 'medium': return 'Orta';
      case 'low': return 'Düşük';
      default: return priority;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#22c55e';
      case 'in_progress': return '#3b82f6';
      case 'pending': return '#f59e0b';
      default: return '#64748b';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Tamamlandı';
      case 'in_progress': return 'Devam Ediyor';
      case 'pending': return 'Bekliyor';
      default: return status;
    }
  };

  const handleAssigneePress = (assignee: Assignee) => {
    setSelectedAssignee(assignee);
    setAssigneeModalVisible(true);
  };

  const handleCompleteTask = () => {
    if (!completionStatus) return;
    // Görev tamamlama işlemi
    console.log('Görev tamamlandı:', { status: completionStatus, note: completionNote, photos: completionPhotos });
    setCompleteModalVisible(false);
    router.back();
  };

  const addPhoto = () => {
    // Fotoğraf ekleme simülasyonu
    setCompletionPhotos([...completionPhotos, `https://picsum.photos/200?random=${Date.now()}`]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Görev Detay</Text>
        <TouchableOpacity style={styles.menuButton}>
          <Ionicons name="ellipsis-vertical" size={20} color="#64748b" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Görev Bilgileri */}
        <View style={styles.taskCard}>
          <View style={styles.taskHeader}>
            <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(task.priority) + '20' }]}>
              <View style={[styles.priorityDot, { backgroundColor: getPriorityColor(task.priority) }]} />
              <Text style={[styles.priorityText, { color: getPriorityColor(task.priority) }]}>
                {getPriorityLabel(task.priority)}
              </Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(task.status) + '20' }]}>
              <Text style={[styles.statusText, { color: getStatusColor(task.status) }]}>
                {getStatusLabel(task.status)}
              </Text>
            </View>
          </View>

          <Text style={styles.taskTitle}>{task.title}</Text>
          <Text style={styles.taskDesc}>{task.desc}</Text>

          <View style={styles.taskInfoGrid}>
            <View style={styles.taskInfoItem}>
              <Ionicons name="business-outline" size={18} color="#64748b" />
              <Text style={styles.taskInfoText}>{task.department}</Text>
            </View>
            <View style={styles.taskInfoItem}>
              <Ionicons name="calendar-outline" size={18} color="#64748b" />
              <Text style={styles.taskInfoText}>{task.createdAt}</Text>
            </View>
            <View style={styles.taskInfoItem}>
              <Ionicons name="alarm-outline" size={18} color="#ef4444" />
              <Text style={[styles.taskInfoText, { color: '#ef4444' }]}>Bitiş: {task.dueDate}</Text>
            </View>
          </View>
        </View>

        {/* Atanan Kişiler */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Atanan Kişiler</Text>
            {isManager && (
              <TouchableOpacity style={styles.addPersonButton}>
                <Ionicons name="add" size={20} color="#2563EB" />
              </TouchableOpacity>
            )}
          </View>
          
          <View style={styles.assigneesList}>
            {task.assignees.map((assignee) => (
              <TouchableOpacity 
                key={assignee.id} 
                style={styles.assigneeItem}
                onPress={() => handleAssigneePress(assignee)}
              >
                <Image source={{ uri: assignee.avatar }} style={styles.assigneeAvatar} />
                <View style={styles.assigneeInfo}>
                  <Text style={styles.assigneeName}>{assignee.name}</Text>
                  <Text style={styles.assigneeDept}>{assignee.department}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#cbd5e1" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Görev Sohbeti */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Görev Sohbeti</Text>
          
          <View style={styles.chatContainer}>
            {task.messages.map((msg) => (
              <View 
                key={msg.id} 
                style={[styles.messageRow, msg.isMe ? styles.messageRowMe : styles.messageRowOther]}
              >
                {!msg.isMe && (
                  <Image source={{ uri: msg.avatar }} style={styles.messageAvatar} />
                )}
                <View style={[styles.messageBubble, msg.isMe ? styles.myMessage : styles.otherMessage]}>
                  {!msg.isMe && <Text style={styles.messageSender}>{msg.sender}</Text>}
                  <Text style={[styles.messageText, msg.isMe && styles.messageTextMe]}>{msg.text}</Text>
                  <Text style={[styles.messageTime, msg.isMe && styles.messageTimeMe]}>{msg.time}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Görev Tamamlama */}
        {task.status !== 'completed' && (
          <TouchableOpacity 
            style={styles.completeButton}
            onPress={() => setCompleteModalVisible(true)}
          >
            <Ionicons name="checkmark-circle" size={24} color="white" />
            <Text style={styles.completeButtonText}>Görevi Tamamla</Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Mesaj Yazma */}
      <View style={[styles.inputContainer, { paddingBottom: insets.bottom > 0 ? 0 : 12 }]}>
        <TextInput 
          style={styles.input} 
          placeholder="Mesaj yaz..." 
          placeholderTextColor="#94a3b8"
          value={message}
          onChangeText={setMessage}
        />
        <TouchableOpacity style={[styles.sendButton, !message.trim() && styles.sendButtonDisabled]}>
          <Ionicons name="send" size={20} color={message.trim() ? 'white' : '#94a3b8'} />
        </TouchableOpacity>
      </View>

      {/* Kişi Detay Modalı */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={assigneeModalVisible}
        onRequestClose={() => setAssigneeModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.personModalContent}>
            <View style={styles.modalHandle} />
            
            {selectedAssignee && (
              <>
                <Image source={{ uri: selectedAssignee.avatar }} style={styles.personModalAvatar} />
                <Text style={styles.personModalName}>{selectedAssignee.name}</Text>
                
                <View style={styles.personInfoCard}>
                  <View style={styles.personInfoItem}>
                    <View style={[styles.personInfoIcon, { backgroundColor: '#dbeafe' }]}>
                      <Ionicons name="business" size={20} color="#2563EB" />
                    </View>
                    <View>
                      <Text style={styles.personInfoLabel}>Departman</Text>
                      <Text style={styles.personInfoValue}>{selectedAssignee.department}</Text>
                    </View>
                  </View>
                  <View style={styles.personInfoDivider} />
                  <View style={styles.personInfoItem}>
                    <View style={[styles.personInfoIcon, { backgroundColor: '#dcfce7' }]}>
                      <Ionicons name="call" size={20} color="#22c55e" />
                    </View>
                    <View>
                      <Text style={styles.personInfoLabel}>Telefon</Text>
                      <Text style={styles.personInfoValue}>{selectedAssignee.phone}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.personModalActions}>
                  <TouchableOpacity style={styles.personActionButton}>
                    <Ionicons name="call" size={22} color="#22c55e" />
                    <Text style={styles.personActionText}>Ara</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.personActionButton}>
                    <Ionicons name="chatbubble" size={22} color="#2563EB" />
                    <Text style={styles.personActionText}>Mesaj</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity 
                  style={styles.modalCloseButton}
                  onPress={() => setAssigneeModalVisible(false)}
                >
                  <Text style={styles.modalCloseText}>Kapat</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Görev Tamamlama Modalı */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={completeModalVisible}
        onRequestClose={() => setCompleteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.completeModalContent}>
            <View style={styles.modalHandle} />
            <Text style={styles.completeModalTitle}>Görevi Tamamla</Text>

            {/* Durum Seçimi */}
            <Text style={styles.completeLabel}>Görev Durumu</Text>
            <View style={styles.statusOptions}>
              <TouchableOpacity 
                style={[
                  styles.statusOption,
                  completionStatus === 'positive' && styles.statusOptionPositive
                ]}
                onPress={() => setCompletionStatus('positive')}
              >
                <Ionicons 
                  name="checkmark-circle" 
                  size={28} 
                  color={completionStatus === 'positive' ? '#22c55e' : '#94a3b8'} 
                />
                <Text style={[
                  styles.statusOptionText,
                  completionStatus === 'positive' && styles.statusOptionTextActive
                ]}>Olumlu Tamamlandı</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.statusOption,
                  completionStatus === 'negative' && styles.statusOptionNegative
                ]}
                onPress={() => setCompletionStatus('negative')}
              >
                <Ionicons 
                  name="alert-circle" 
                  size={28} 
                  color={completionStatus === 'negative' ? '#ef4444' : '#94a3b8'} 
                />
                <Text style={[
                  styles.statusOptionText,
                  completionStatus === 'negative' && styles.statusOptionTextNegative
                ]}>Olumsuz Tamamlandı</Text>
              </TouchableOpacity>
            </View>

            {/* Fotoğraf Ekleme */}
            <Text style={styles.completeLabel}>Kanıt Fotoğrafları</Text>
            <View style={styles.photosContainer}>
              {completionPhotos.map((photo, index) => (
                <View key={index} style={styles.photoItem}>
                  <Image source={{ uri: photo }} style={styles.photoImage} />
                  <TouchableOpacity 
                    style={styles.photoRemove}
                    onPress={() => setCompletionPhotos(completionPhotos.filter((_, i) => i !== index))}
                  >
                    <Ionicons name="close" size={14} color="white" />
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity style={styles.addPhotoButton} onPress={addPhoto}>
                <Ionicons name="camera" size={24} color="#64748b" />
                <Text style={styles.addPhotoText}>Ekle</Text>
              </TouchableOpacity>
            </View>

            {/* Açıklama */}
            <Text style={styles.completeLabel}>Açıklama</Text>
            <TextInput
              style={styles.completeInput}
              placeholder="Görev hakkında açıklama yazın..."
              placeholderTextColor="#94a3b8"
              multiline
              numberOfLines={4}
              value={completionNote}
              onChangeText={setCompletionNote}
            />

            {/* Butonlar */}
            <View style={styles.completeModalButtons}>
              <TouchableOpacity 
                style={styles.completeCancelButton}
                onPress={() => setCompleteModalVisible(false)}
              >
                <Text style={styles.completeCancelText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.completeConfirmButton,
                  !completionStatus && styles.completeConfirmButtonDisabled
                ]}
                onPress={handleCompleteTask}
                disabled={!completionStatus}
              >
                <Text style={styles.completeConfirmText}>Tamamla</Text>
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
  menuButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  taskCard: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 12,
  },
  taskHeader: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 6,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: 12,
    fontFamily: 'Poppins_600SemiBold',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Poppins_600SemiBold',
  },
  taskTitle: {
    fontSize: 22,
    fontFamily: 'Poppins_700Bold',
    color: '#0f172a',
    marginBottom: 8,
  },
  taskDesc: {
    fontSize: 15,
    fontFamily: 'Poppins_400Regular',
    color: '#64748b',
    lineHeight: 22,
    marginBottom: 16,
  },
  taskInfoGrid: {
    gap: 10,
  },
  taskInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  taskInfoText: {
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
    color: '#475569',
  },
  sectionCard: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: '#0f172a',
  },
  addPersonButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#2563EB',
  },
  assigneesList: {
    gap: 12,
  },
  assigneeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
  },
  assigneeAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  assigneeInfo: {
    flex: 1,
  },
  assigneeName: {
    fontSize: 15,
    fontFamily: 'Poppins_600SemiBold',
    color: '#0f172a',
  },
  assigneeDept: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: '#64748b',
  },
  chatContainer: {
    marginTop: 8,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  messageRowMe: {
    justifyContent: 'flex-end',
  },
  messageRowOther: {
    justifyContent: 'flex-start',
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 16,
  },
  myMessage: {
    backgroundColor: '#2563EB',
    borderBottomRightRadius: 4,
  },
  otherMessage: {
    backgroundColor: '#f1f5f9',
    borderBottomLeftRadius: 4,
  },
  messageSender: {
    fontSize: 12,
    fontFamily: 'Poppins_600SemiBold',
    color: '#64748b',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#0f172a',
  },
  messageTextMe: {
    color: 'white',
  },
  messageTime: {
    fontSize: 10,
    fontFamily: 'Poppins_400Regular',
    color: '#94a3b8',
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  messageTimeMe: {
    color: 'rgba(255,255,255,0.7)',
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#22c55e',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  completeButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: 'white',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    paddingHorizontal: 16,
    backgroundColor: 'white',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    padding: 12,
    paddingHorizontal: 16,
    borderRadius: 24,
    fontFamily: 'Poppins_400Regular',
    fontSize: 15,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#e2e8f0',
  },
  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#cbd5e1',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  // Person Modal
  personModalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  personModalAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 16,
  },
  personModalName: {
    fontSize: 20,
    fontFamily: 'Poppins_700Bold',
    color: '#0f172a',
    marginBottom: 20,
  },
  personInfoCard: {
    width: '100%',
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 4,
    marginBottom: 20,
  },
  personInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 14,
  },
  personInfoIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  personInfoLabel: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: '#94a3b8',
  },
  personInfoValue: {
    fontSize: 15,
    fontFamily: 'Poppins_500Medium',
    color: '#0f172a',
  },
  personInfoDivider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 14,
  },
  personModalActions: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  personActionButton: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    width: 100,
    gap: 8,
  },
  personActionText: {
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
    color: '#0f172a',
  },
  modalCloseButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: '#64748b',
  },
  // Complete Modal
  completeModalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 40,
    maxHeight: '90%',
  },
  completeModalTitle: {
    fontSize: 20,
    fontFamily: 'Poppins_700Bold',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 24,
  },
  completeLabel: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: '#334155',
    marginBottom: 12,
  },
  statusOptions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statusOption: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    borderWidth: 2,
    borderColor: 'transparent',
    gap: 8,
  },
  statusOptionPositive: {
    borderColor: '#22c55e',
    backgroundColor: '#f0fdf4',
  },
  statusOptionNegative: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  statusOptionText: {
    fontSize: 13,
    fontFamily: 'Poppins_500Medium',
    color: '#64748b',
    textAlign: 'center',
  },
  statusOptionTextActive: {
    color: '#22c55e',
  },
  statusOptionTextNegative: {
    color: '#ef4444',
  },
  photosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  photoItem: {
    position: 'relative',
  },
  photoImage: {
    width: 70,
    height: 70,
    borderRadius: 12,
  },
  photoRemove: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPhotoButton: {
    width: 70,
    height: 70,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#cbd5e1',
  },
  addPhotoText: {
    fontSize: 11,
    fontFamily: 'Poppins_500Medium',
    color: '#64748b',
    marginTop: 4,
  },
  completeInput: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    fontFamily: 'Poppins_400Regular',
    color: '#0f172a',
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 24,
  },
  completeModalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  completeCancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
  },
  completeCancelText: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: '#64748b',
  },
  completeConfirmButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#22c55e',
    alignItems: 'center',
  },
  completeConfirmButtonDisabled: {
    backgroundColor: '#cbd5e1',
  },
  completeConfirmText: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: 'white',
  },
});
