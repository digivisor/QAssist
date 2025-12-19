import React, { useMemo, useState, useRef, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Pressable,
  Image, 
  TextInput, 
  KeyboardAvoidingView, 
  Platform,
  Modal,
  Keyboard
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

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
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  
  const [message, setMessage] = useState('');
  const [selectedAssignee, setSelectedAssignee] = useState<Assignee | null>(null);
  const [assigneeModalVisible, setAssigneeModalVisible] = useState(false);
  const [manageAssigneesVisible, setManageAssigneesVisible] = useState(false);
  const [assigneeSearch, setAssigneeSearch] = useState('');
  const [assigneeDeptFilter, setAssigneeDeptFilter] = useState<'all' | string>('all');
  const [completeModalVisible, setCompleteModalVisible] = useState(false);
  const [completionStatus, setCompletionStatus] = useState<'positive' | 'negative' | null>(null);
  const [completionNote, setCompletionNote] = useState('');
  const [completionPhotos, setCompletionPhotos] = useState<string[]>([]);
  const [mediaModalVisible, setMediaModalVisible] = useState(false);
  const [attachedMedia, setAttachedMedia] = useState<string[]>([]);
  const [permissionDeniedModalVisible, setPermissionDeniedModalVisible] = useState(false);
  const [permissionType, setPermissionType] = useState<'camera' | 'gallery' | null>(null);

  // Kamera izni ve açma
  const openCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        setPermissionType('camera');
        setPermissionDeniedModalVisible(true);
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setAttachedMedia([...attachedMedia, result.assets[0].uri]);
      }
    } catch (error) {
      console.error('Kamera hatası:', error);
      setPermissionType('camera');
      setPermissionDeniedModalVisible(true);
    }
  };

  // Galeri izni ve açma
  const openGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        setPermissionType('gallery');
        setPermissionDeniedModalVisible(true);
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
        allowsMultipleSelection: false,
      });

      if (!result.canceled && result.assets[0]) {
        setAttachedMedia([...attachedMedia, result.assets[0].uri]);
      }
    } catch (error) {
      console.error('Galeri hatası:', error);
      setPermissionType('gallery');
      setPermissionDeniedModalVisible(true);
    }
  };
  
  // Dummy Data
  const initialTask = {
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
      { id: 1, text: 'Havlular hazır mı?', sender: 'Müdür', time: '16:30', isMe: false, avatar: 'https://i.pravatar.cc/150?u=manager', media: undefined },
      { id: 2, text: 'Evet, odaya götürüyorum.', sender: 'Selin', time: '16:32', isMe: true, avatar: 'https://i.pravatar.cc/150?u=1', media: undefined },
      { id: 3, text: 'Tamam, misafir 14:00\'te dönecek.', sender: 'Müdür', time: '16:33', isMe: false, avatar: 'https://i.pravatar.cc/150?u=manager', media: undefined },
    ],
  };

  const [task, setTask] = useState(initialTask);
  const [assignees, setAssignees] = useState<Assignee[]>(task.assignees);
  const chatScrollViewRef = useRef<ScrollView>(null);
  const textInputRef = useRef<TextInput>(null);

  const handleSendMessage = () => {
    const messageText = message.trim();
    if (!messageText && attachedMedia.length === 0) return;
    if (!user) return;

    const newMessage = {
      id: task.messages.length + 1,
      text: messageText || '',
      sender: user.first_name || 'Ben',
      time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
      avatar: user.avatar_url || 'https://i.pravatar.cc/150?u=user',
      media: attachedMedia.length > 0 ? attachedMedia : undefined,
    };

    // Clear input and media first (before state update to prevent keyboard issues)
    setMessage('');
    setAttachedMedia([]);

    // Update state
    setTask({
      ...task,
      messages: [...task.messages, newMessage as any],
    });
    
    // Scroll to bottom
    setTimeout(() => {
      chatScrollViewRef.current?.scrollToEnd({ animated: true });
    }, 50);
  };

  // Auto scroll when messages change
  useEffect(() => {
    if (task.messages.length > 0) {
      setTimeout(() => {
        chatScrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [task.messages.length]);

  // Bu görev için atanabilecek örnek personel listesi (mock)
  const allStaff: Assignee[] = [
    { id: 1, name: 'Selin Yılmaz', avatar: 'https://i.pravatar.cc/150?u=1', department: 'Kat Hizmetleri', phone: '+90 532 123 45 67' },
    { id: 2, name: 'Ahmet Demir', avatar: 'https://i.pravatar.cc/150?u=2', department: 'Kat Hizmetleri', phone: '+90 533 234 56 78' },
    { id: 3, name: 'Fatma Öz', avatar: 'https://i.pravatar.cc/150?u=3', department: 'Resepsiyon', phone: '+90 534 345 67 89' },
    { id: 4, name: 'Ali Çelik', avatar: 'https://i.pravatar.cc/150?u=4', department: 'Teknik Servis', phone: '+90 535 456 78 90' },
    { id: 5, name: 'Zeynep Korkmaz', avatar: 'https://i.pravatar.cc/150?u=5', department: 'F&B', phone: '+90 536 567 89 01' },
  ];

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

  const toggleAssignee = (staff: Assignee) => {
    const isAlreadyAssigned = assignees.some(a => a.id === staff.id);
    if (isAlreadyAssigned) {
      setAssignees(prev => prev.filter(a => a.id !== staff.id));
    } else {
      setAssignees(prev => [...prev, staff]);
    }
  };

  const filteredStaff = useMemo(() => {
    const search = assigneeSearch.trim().toLowerCase();
    let list = allStaff;

    if (assigneeDeptFilter !== 'all') {
      list = list.filter(s => s.department === assigneeDeptFilter);
    }

    if (search) {
      list = list.filter(s =>
        s.name.toLowerCase().includes(search) ||
        s.department.toLowerCase().includes(search)
      );
    }

    // Görev departmanına ait olanlar üstte, diğer departmanlar altta
    const primary = list.filter(s => s.department === task.department);
    const others = list.filter(s => s.department !== task.department);
    return [...primary, ...others];
  }, [allStaff, assigneeSearch, assigneeDeptFilter, task.department]);

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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Görev Detay</Text>
        <TouchableOpacity style={styles.menuButton}>
          <Ionicons name="ellipsis-vertical" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Görev Bilgileri */}
        <View style={[styles.taskCard, { backgroundColor: colors.card }]}>
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

          <Text style={[styles.taskTitle, { color: colors.text }]}>{task.title}</Text>
          <Text style={[styles.taskDesc, { color: colors.textSecondary }]}>{task.desc}</Text>

          <View style={styles.taskInfoGrid}>
            <View style={styles.taskInfoItem}>
              <Ionicons name="business-outline" size={18} color={colors.textSecondary} />
              <Text style={[styles.taskInfoText, { color: colors.textSecondary }]}>{task.department}</Text>
            </View>
            <View style={styles.taskInfoItem}>
              <Ionicons name="calendar-outline" size={18} color={colors.textSecondary} />
              <Text style={[styles.taskInfoText, { color: colors.textSecondary }]}>{task.createdAt}</Text>
            </View>
            <View style={styles.taskInfoItem}>
              <Ionicons name="alarm-outline" size={18} color="#ef4444" />
              <Text style={[styles.taskInfoText, { color: '#ef4444' }]}>Bitiş: {task.dueDate}</Text>
            </View>
          </View>
        </View>

        {/* Atanan Kişiler */}
        <View style={[styles.sectionCard, { backgroundColor: colors.card }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Atanan Kişiler</Text>
            {isManager && (
              <TouchableOpacity 
                style={styles.addPersonButton}
                onPress={() => setManageAssigneesVisible(true)}
              >
                <Ionicons name="add" size={20} color="#2563EB" />
              </TouchableOpacity>
            )}
          </View>
          
          <View style={styles.assigneesList}>
            {assignees.map((assignee) => (
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
        <View style={[styles.sectionCard, { backgroundColor: colors.card, marginBottom: 0 }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Görev Sohbeti</Text>
          
          <ScrollView 
            ref={chatScrollViewRef}
            style={styles.chatScrollView}
            contentContainerStyle={styles.chatContainer}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled={true}
          >
            {task.messages.map((msg) => (
              <View 
                key={msg.id} 
                style={[styles.messageRow, msg.isMe ? styles.messageRowMe : styles.messageRowOther]}
              >
                {!msg.isMe && (
                  <Image source={{ uri: msg.avatar }} style={styles.messageAvatar} />
                )}
                <View style={[
                  styles.messageBubble, 
                  msg.isMe 
                    ? styles.myMessage 
                    : styles.otherMessage
                ]}>
                  {!msg.isMe && <Text style={styles.messageSender}>{msg.sender}</Text>}
                  
                  {/* Fotoğraflar */}
                  {(msg as any).media && (msg as any).media.length > 0 && (
                    <View style={styles.messageMediaContainer}>
                      {(msg as any).media.map((mediaUri: string, index: number) => (
                        <Image 
                          key={index}
                          source={{ uri: mediaUri }} 
                          style={styles.messageMediaImage}
                        />
                      ))}
                    </View>
                  )}
                  
                  {/* Mesaj Metni */}
                  {msg.text ? (
                    <Text style={[
                      styles.messageText, 
                      msg.isMe ? styles.messageTextMe : styles.messageTextOther
                    ]}>{msg.text}</Text>
                  ) : null}
                  
                  <Text style={[
                    styles.messageTime, 
                    msg.isMe ? styles.messageTimeMe : styles.messageTimeOther
                  ]}>{msg.time}</Text>
        </View>
          </View>
            ))}
          </ScrollView>

          {/* Seçilen Medyalar */}
          {attachedMedia.length > 0 && (
            <View style={styles.attachedMediaContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {attachedMedia.map((media, index) => (
                  <View key={index} style={styles.attachedMediaItem}>
                    <Image source={{ uri: media }} style={styles.attachedMediaImage} />
                    <TouchableOpacity 
                      style={styles.removeMediaButton}
                      onPress={() => setAttachedMedia(attachedMedia.filter((_, i) => i !== index))}
                    >
                      <Ionicons name="close-circle" size={20} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Mesaj Yazma - Görev Sohbeti İçinde */}
          <View style={styles.chatInputContainer}>
            <TouchableOpacity 
              style={styles.attachButton}
              onPress={() => setMediaModalVisible(true)}
            >
              <Ionicons name="attach" size={22} color="#64748b" />
            </TouchableOpacity>
            <TextInput 
              ref={textInputRef}
              style={styles.chatInput} 
              placeholder="Mesaj yaz..." 
              placeholderTextColor="#94a3b8"
              value={message}
              onChangeText={setMessage}
              multiline
              blurOnSubmit={false}
              returnKeyType="default"
              onSubmitEditing={() => {
                // Prevent keyboard from closing
                textInputRef.current?.focus();
              }}
            />
            <TouchableOpacity 
              style={[styles.chatSendButton, (!message.trim() && attachedMedia.length === 0) && styles.chatSendButtonDisabled]}
              disabled={!message.trim() && attachedMedia.length === 0}
              onPress={handleSendMessage}
              activeOpacity={0.7}
            >
              <Ionicons name="send" size={18} color={(message.trim() || attachedMedia.length > 0) ? 'white' : '#94a3b8'} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Görev Tamamlama - En Altta */}
      {task.status !== 'completed' && (
        <View style={[styles.completeButtonContainer, { paddingBottom: insets.bottom > 0 ? insets.bottom + 8 : 16 }]}>
          <TouchableOpacity
            style={styles.completeButton}
            onPress={() => setCompleteModalVisible(true)}
          >
            <Ionicons name="checkmark-circle" size={24} color="white" />
            <Text style={styles.completeButtonText}>Görevi Tamamla</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Kişi Detay Modalı */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={assigneeModalVisible}
        onRequestClose={() => setAssigneeModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.personModalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHandle} />
            
            {selectedAssignee && (
              <>
                <Image source={{ uri: selectedAssignee.avatar }} style={styles.personModalAvatar} />
                <Text style={[styles.personModalName, { color: colors.text }]}>{selectedAssignee.name}</Text>
                
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

      {/* Atanan Kişiler Yönetim Modalı (Sadece Yönetici / Müdür) */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={manageAssigneesVisible}
        onRequestClose={() => setManageAssigneesVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.manageModalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHandle} />
            <Text style={[styles.manageModalTitle, { color: colors.text }]}>Göreve Personel Ata</Text>
            <Text style={[styles.manageModalSubtitle, { color: colors.textSecondary }]}>
              Bu görev için atanan personelleri ekleyebilir veya çıkarabilirsiniz.
            </Text>

            {/* Arama ve Departman Filtre */}
            <View style={styles.manageFilters}>
              <View style={[styles.manageSearchBar, { backgroundColor: colors.input, borderColor: colors.inputBorder }]}>
                <Ionicons name="search-outline" size={18} color={colors.placeholder} />
                <TextInput
                  style={[styles.manageSearchInput, { color: colors.text }]}
                  placeholder="İsim veya departman ara..."
                  placeholderTextColor={colors.placeholder}
                  value={assigneeSearch}
                  onChangeText={setAssigneeSearch}
                />
              </View>
              <View style={styles.manageDeptChips}>
                {['all', task.department, 'Resepsiyon', 'Teknik Servis', 'F&B'].map((dept) => {
                  const label =
                    dept === 'all'
                      ? 'Tüm Departmanlar'
                      : dept;
                  // Aynı departmanı iki kez göstermemek için
                  if (dept !== 'all' && dept !== task.department && !allStaff.some(s => s.department === dept)) {
                    return null;
                  }
                  return (
                    <TouchableOpacity
                      key={dept}
                      style={[
                        styles.manageDeptChip,
                        { backgroundColor: colors.input, borderColor: colors.inputBorder },
                        assigneeDeptFilter === dept && styles.manageDeptChipActive,
                      ]}
                      onPress={() => setAssigneeDeptFilter(dept as any)}
                    >
                      <Text
                        style={[
                          styles.manageDeptChipText,
                          { color: colors.textSecondary },
                          assigneeDeptFilter === dept && styles.manageDeptChipTextActive,
                        ]}
                      >
                        {label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <ScrollView style={styles.manageList}>
              {filteredStaff.map((staff) => {
                const isAssigned = assignees.some(a => a.id === staff.id);
                return (
                  <TouchableOpacity
                    key={staff.id}
                    style={[styles.manageItem, { borderBottomColor: colors.border }]}
                    onPress={() => toggleAssignee(staff)}
                  >
                    <View style={styles.manageLeft}>
                      <Image source={{ uri: staff.avatar }} style={styles.manageAvatar} />
                      <View>
                        <Text style={[styles.manageName, { color: colors.text }]}>{staff.name}</Text>
                        <Text style={[styles.manageDept, { color: colors.textSecondary }]}>{staff.department}</Text>
                      </View>
                    </View>
                    <View style={[
                      styles.manageToggle,
                      isAssigned ? styles.manageToggleOn : styles.manageToggleOff
                    ]}>
                      <Ionicons 
                        name={isAssigned ? 'checkmark' : 'add'} 
                        size={18} 
                        color={isAssigned ? '#16a34a' : colors.textSecondary} 
                      />
                      <Text style={[
                        styles.manageToggleText,
                        { color: colors.textSecondary },
                        isAssigned && styles.manageToggleTextOn
                      ]}>
                        {isAssigned ? 'Çıkar' : 'Ekle'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <TouchableOpacity 
              style={styles.manageCloseButton}
              onPress={() => setManageAssigneesVisible(false)}
            >
              <Text style={styles.manageCloseText}>Tamam</Text>
            </TouchableOpacity>
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
          <View style={[styles.completeModalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHandle} />
            <Text style={[styles.completeModalTitle, { color: colors.text }]}>Görevi Tamamla</Text>

            {/* Durum Seçimi */}
            <Text style={[styles.completeLabel, { color: colors.text }]}>Görev Durumu</Text>
            <View style={styles.statusOptions}>
              <TouchableOpacity 
                style={[
                  styles.statusOption,
                  { backgroundColor: colors.input, borderColor: colors.inputBorder },
                  completionStatus === 'positive' && styles.statusOptionPositive
                ]}
                onPress={() => setCompletionStatus('positive')}
              >
                <Ionicons 
                  name="checkmark-circle" 
                  size={28} 
                  color={completionStatus === 'positive' ? '#22c55e' : colors.textSecondary} 
                />
                <Text style={[
                  styles.statusOptionText,
                  { color: colors.text },
                  completionStatus === 'positive' && styles.statusOptionTextActive
                ]}>Olumlu Tamamlandı</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.statusOption,
                  { backgroundColor: colors.input, borderColor: colors.inputBorder },
                  completionStatus === 'negative' && styles.statusOptionNegative
                ]}
                onPress={() => setCompletionStatus('negative')}
              >
                <Ionicons 
                  name="alert-circle" 
                  size={28} 
                  color={completionStatus === 'negative' ? '#ef4444' : colors.textSecondary} 
                />
                <Text style={[
                  styles.statusOptionText,
                  { color: colors.text },
                  completionStatus === 'negative' && styles.statusOptionTextNegative
                ]}>Olumsuz Tamamlandı</Text>
              </TouchableOpacity>
            </View>

            {/* Fotoğraf Ekleme */}
            <Text style={[styles.completeLabel, { color: colors.text }]}>Kanıt Fotoğrafları</Text>
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
              <TouchableOpacity style={[styles.addPhotoButton, { backgroundColor: colors.input, borderColor: colors.inputBorder }]} onPress={addPhoto}>
                <Ionicons name="camera" size={24} color={colors.textSecondary} />
                <Text style={[styles.addPhotoText, { color: colors.textSecondary }]}>Ekle</Text>
              </TouchableOpacity>
            </View>

            {/* Açıklama */}
            <Text style={[styles.completeLabel, { color: colors.text }]}>Açıklama</Text>
            <TextInput
              style={[styles.completeInput, { backgroundColor: colors.input, color: colors.text, borderColor: colors.inputBorder }]}
              placeholder="Görev hakkında açıklama yazın..."
              placeholderTextColor={colors.placeholder}
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

      {/* Medya Seçme Modalı */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={mediaModalVisible}
        onRequestClose={() => setMediaModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setMediaModalVisible(false)}
        >
          <View style={[styles.mediaModalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHandle} />
            <Text style={[styles.mediaModalTitle, { color: colors.text }]}>Medya Seç</Text>
            
            <TouchableOpacity 
              style={[styles.mediaOption, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={async () => {
                setMediaModalVisible(false);
                setTimeout(() => {
                  openCamera();
                }, 300);
              }}
            >
              <View style={[styles.mediaOptionIcon, { backgroundColor: '#dbeafe' }]}>
                <Ionicons name="camera" size={28} color="#2563EB" />
              </View>
              <View style={styles.mediaOptionText}>
                <Text style={[styles.mediaOptionTitle, { color: colors.text }]}>Kamera</Text>
                <Text style={[styles.mediaOptionDesc, { color: colors.textSecondary }]}>Fotoğraf çek</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.mediaOption, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={async () => {
                setMediaModalVisible(false);
                setTimeout(() => {
                  openGallery();
                }, 300);
              }}
            >
              <View style={[styles.mediaOptionIcon, { backgroundColor: '#dcfce7' }]}>
                <Ionicons name="images" size={28} color="#22c55e" />
              </View>
              <View style={styles.mediaOptionText}>
                <Text style={[styles.mediaOptionTitle, { color: colors.text }]}>Galeri</Text>
                <Text style={[styles.mediaOptionDesc, { color: colors.textSecondary }]}>Fotoğraf seç</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.mediaCancelButton, { backgroundColor: colors.input }]}
              onPress={() => setMediaModalVisible(false)}
            >
              <Text style={[styles.mediaCancelText, { color: colors.text }]}>İptal</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* İzin Reddedildi Modalı */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={permissionDeniedModalVisible}
        onRequestClose={() => setPermissionDeniedModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.permissionModalContent, { backgroundColor: colors.card }]}>
            <View style={[styles.permissionIconContainer, { backgroundColor: '#fef2f2' }]}>
              <Ionicons 
                name={permissionType === 'camera' ? 'camera-outline' : 'images-outline'} 
                size={48} 
                color="#ef4444" 
              />
            </View>
            <Text style={[styles.permissionModalTitle, { color: colors.text }]}>
              {permissionType === 'camera' ? 'Kamera İzni Gerekli' : 'Galeri İzni Gerekli'}
            </Text>
            <Text style={[styles.permissionModalDesc, { color: colors.textSecondary }]}>
              {permissionType === 'camera' 
                ? 'Fotoğraf çekmek için kamera iznine ihtiyacımız var. Lütfen ayarlardan kamera iznini etkinleştirin.'
                : 'Fotoğraf seçmek için galeri iznine ihtiyacımız var. Lütfen ayarlardan galeri iznini etkinleştirin.'}
            </Text>
            <View style={styles.permissionModalButtons}>
              <TouchableOpacity 
                style={[styles.permissionCancelButton, { backgroundColor: colors.input }]}
                onPress={() => setPermissionDeniedModalVisible(false)}
              >
                <Text style={[styles.permissionCancelText, { color: colors.text }]}>Tamam</Text>
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
  },
  menuButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  taskCard: {
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
    marginBottom: 8,
  },
  taskDesc: {
    fontSize: 15,
    fontFamily: 'Poppins_400Regular',
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
  },
  sectionCard: {
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
  chatScrollView: {
    maxHeight: 350,
  },
  chatContainer: {
    paddingTop: 8,
    paddingBottom: 8,
  },
  chatInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingTop: 13,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    gap: 8,
  },
  attachButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  chatInput: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    paddingLeft: 15,
    paddingRight: 16,
    paddingTop: 10,
    paddingBottom: 9,
    borderRadius: 20,
    fontFamily: 'Poppins_400Regular',
    fontSize: 15,
    maxHeight: 100,
    minHeight: 40,
  },
  chatSendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  chatSendButtonDisabled: {
    backgroundColor: '#e2e8f0',
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
    borderRadius: 16,
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
  messageTextOther: {
    color: '#0f172a',
  },
  messageTime: {
    fontSize: 10,
    fontFamily: 'Poppins_400Regular',
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  messageTimeMe: {
    color: 'rgba(255,255,255,0.7)',
  },
  messageTimeOther: {
    color: '#94a3b8',
  },
  messageMediaContainer: {
    marginBottom: 8,
    gap: 8,
  },
  messageMediaImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  completeButtonContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#22c55e',
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
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 40,
    maxHeight: '90%',
  },
  completeModalTitle: {
    fontSize: 20,
    fontFamily: 'Poppins_700Bold',
    textAlign: 'center',
    marginBottom: 24,
  },
  completeLabel: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
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
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  addPhotoText: {
    fontSize: 11,
    fontFamily: 'Poppins_500Medium',
    marginTop: 4,
  },
  completeInput: {
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    fontFamily: 'Poppins_400Regular',
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 24,
    borderWidth: 1,
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
  // Manage Assignees Modal
  manageModalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 24,
    maxHeight: '80%',
  },
  manageModalTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_700Bold',
    marginBottom: 4,
  },
  manageModalSubtitle: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    marginBottom: 16,
  },
  manageList: {
    marginBottom: 16,
  },
  manageFilters: {
    marginBottom: 12,
    gap: 8,
  },
  manageSearchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 6,
  },
  manageSearchInput: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
  },
  manageDeptChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  manageDeptChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  manageDeptChipActive: {
    backgroundColor: '#2563EB',
  },
  manageDeptChipText: {
    fontSize: 11,
    fontFamily: 'Poppins_500Medium',
  },
  manageDeptChipTextActive: {
    color: 'white',
  },
  manageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    paddingVertical: 10,
  },
  manageLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  manageAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  manageName: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
  },
  manageDept: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
  },
  manageToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  manageToggleOn: {
    borderColor: '#16a34a',
    backgroundColor: '#dcfce7',
  },
  manageToggleOff: {
    borderColor: '#cbd5e1',
    backgroundColor: '#f8fafc',
  },
  manageToggleText: {
    fontSize: 12,
    fontFamily: 'Poppins_500Medium',
    marginLeft: 4,
  },
  manageToggleTextOn: {
    color: '#166534',
  },
  manageCloseButton: {
    marginTop: 4,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#0f172a',
    alignItems: 'center',
  },
  manageCloseText: {
    fontSize: 15,
    fontFamily: 'Poppins_600SemiBold',
    color: 'white',
  },
  // Media Modal
  mediaModalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 40,
    maxHeight: '50%',
  },
  mediaModalTitle: {
    fontSize: 20,
    fontFamily: 'Poppins_700Bold',
    textAlign: 'center',
    marginBottom: 24,
  },
  mediaOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  mediaOptionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  mediaOptionText: {
    flex: 1,
  },
  mediaOptionTitle: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    marginBottom: 4,
  },
  mediaOptionDesc: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
  },
  mediaCancelButton: {
    marginTop: 8,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  mediaCancelText: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
  },
  attachedMediaContainer: {
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  attachedMediaItem: {
    position: 'relative',
    marginRight: 12,
  },
  attachedMediaImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  removeMediaButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  // Permission Denied Modal
  permissionModalContent: {
    width: '85%',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  permissionIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  permissionModalTitle: {
    fontSize: 20,
    fontFamily: 'Poppins_700Bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  permissionModalDesc: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  permissionModalButtons: {
    width: '100%',
    gap: 12,
  },
  permissionCancelButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  permissionCancelText: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
  },
});
