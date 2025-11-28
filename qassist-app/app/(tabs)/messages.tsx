import { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

interface Message {
  id: number;
  senderId: number;
  senderName: string;
  senderType: 'admin' | 'personnel' | 'department';
  message: string;
  timestamp: number;
  isRead: boolean;
}

interface Chat {
  id: number;
  name: string;
  type: 'admin' | 'department';
  lastMessage: string;
  lastMessageTime: number;
  unreadCount: number;
}

// Mock user data
const currentUser = {
  id: 1,
  name: 'Ayşe Yılmaz',
  department: 'Temizlik',
};

export default function MessagesScreen() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const router = useRouter();
  
  const backgroundColor = useThemeColor({}, 'background');
  const borderColor = useThemeColor({ light: '#e2e8f0', dark: '#1e293b' }, 'background');
  const textColor = useThemeColor({}, 'text');
  const cardBg = useThemeColor({ light: '#ffffff', dark: '#1e293b' }, 'background');

  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = () => {
    // TODO: API call
    const mockChats: Chat[] = [
      {
        id: 1,
        name: 'Yönetici',
        type: 'admin',
        lastMessage: 'Merhaba, bugün çok yoğunuz.',
        lastMessageTime: Date.now() - 1800000,
        unreadCount: 2,
      },
      {
        id: 2,
        name: 'Resepsiyon',
        type: 'department',
        lastMessage: 'Oda 201 için bilgi',
        lastMessageTime: Date.now() - 3600000,
        unreadCount: 0,
      },
      {
        id: 3,
        name: 'Mutfak',
        type: 'department',
        lastMessage: 'Oda servisi talebi',
        lastMessageTime: Date.now() - 7200000,
        unreadCount: 1,
      },
    ];
    setChats(mockChats);
  };

  const loadMessages = (chatId: number) => {
    // TODO: API call
    const mockMessages: Message[] = [
      {
        id: 1,
        senderId: 0,
        senderName: 'Yönetici',
        senderType: 'admin',
        message: 'Merhaba, nasılsın?',
        timestamp: Date.now() - 3600000,
        isRead: true,
      },
      {
        id: 2,
        senderId: currentUser.id,
        senderName: currentUser.name,
        senderType: 'personnel',
        message: 'İyiyim teşekkürler, bugün çok yoğunuz.',
        timestamp: Date.now() - 3300000,
        isRead: true,
      },
      {
        id: 3,
        senderId: 0,
        senderName: 'Yönetici',
        senderType: 'admin',
        message: 'Anladım, güçlerinizle devam edin.',
        timestamp: Date.now() - 3000000,
        isRead: true,
      },
    ];
    setMessages(mockMessages);
  };

  const handleSelectChat = (chat: Chat) => {
    setSelectedChat(chat);
    loadMessages(chat.id);
    // Unread count'u sıfırla
    setChats(chats.map(c => c.id === chat.id ? { ...c, unreadCount: 0 } : c));
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedChat) return;

    const message: Message = {
      id: messages.length + 1,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderType: 'personnel',
      message: newMessage,
      timestamp: Date.now(),
      isRead: false,
    };

    setMessages([...messages, message]);
    setNewMessage('');
    // TODO: API call - mesaj gönder
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - timestamp;
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return 'Şimdi';
    if (minutes < 60) return `${minutes} dk`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} sa`;
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
  };

  if (selectedChat) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={[styles.container, { backgroundColor }]}
          keyboardVerticalOffset={0}
        >
          <View style={[styles.chatHeader, { backgroundColor: cardBg }]}>
            <TouchableOpacity onPress={() => setSelectedChat(null)} style={styles.backButton}>
              <MaterialIcons name="arrow-back" size={24} color={textColor} />
            </TouchableOpacity>
            <ThemedText style={styles.chatTitle}>{selectedChat.name}</ThemedText>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView style={styles.messagesContainer} contentContainerStyle={styles.messagesContent}>
          {messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageContainer,
                message.senderType === 'personnel'
                  ? styles.myMessage
                  : styles.otherMessage,
              ]}
            >
              <View
                style={[
                  styles.messageBubble,
                  message.senderType === 'personnel'
                    ? { backgroundColor: '#0f172a' }
                    : { backgroundColor: borderColor },
                ]}
              >
                <ThemedText
                  style={[
                    styles.messageText,
                    message.senderType === 'personnel' && { color: '#fff' },
                  ]}
                >
                  {message.message}
                </ThemedText>
                <ThemedText
                  style={[
                    styles.messageTime,
                    message.senderType === 'personnel'
                      ? { color: 'rgba(255,255,255,0.7)' }
                      : { opacity: 0.6 },
                  ]}
                >
                  {formatTime(message.timestamp)}
                </ThemedText>
              </View>
            </View>
          ))}
        </ScrollView>

        <View style={[styles.inputContainer, { borderColor, backgroundColor: cardBg }]}>
          <TextInput
            style={[styles.input, { color: textColor, borderColor }]}
            placeholder="Mesaj yazın..."
            placeholderTextColor="#94a3b8"
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
          />
          <TouchableOpacity
            style={[styles.sendButton, { backgroundColor: '#0f172a' }]}
            onPress={handleSendMessage}
          >
            <ThemedText style={styles.sendButtonText}>Gönder</ThemedText>
          </TouchableOpacity>
        </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
      <ThemedView style={[styles.container, { backgroundColor }]}>
        <View style={[styles.header, { backgroundColor: cardBg }]}>
          <ThemedText type="title" style={styles.headerTitle}>Mesajlar</ThemedText>
          <ThemedText style={styles.headerSubtitle}>
            {chats.reduce((sum, chat) => sum + chat.unreadCount, 0)} okunmamış mesaj
          </ThemedText>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {chats.map((chat) => (
            <TouchableOpacity
              key={chat.id}
              style={[styles.chatCard, { borderColor, backgroundColor: cardBg }]}
              onPress={() => handleSelectChat(chat)}
              activeOpacity={0.7}
            >
              <View style={styles.chatInfo}>
                <View
                  style={[
                    styles.avatar,
                    { backgroundColor: chat.type === 'admin' ? '#0f172a' : '#475569' },
                  ]}
                >
                  <ThemedText style={styles.avatarText}>
                    {chat.name.charAt(0)}
                  </ThemedText>
                </View>
                <View style={styles.chatDetails}>
                  <View style={styles.chatHeaderRow}>
                    <ThemedText style={styles.chatName}>{chat.name}</ThemedText>
                    <ThemedText style={styles.chatTime}>
                      {formatTime(chat.lastMessageTime)}
                    </ThemedText>
                  </View>
                  <ThemedText style={styles.lastMessage} numberOfLines={1}>
                    {chat.lastMessage}
                  </ThemedText>
                </View>
              </View>
              {chat.unreadCount > 0 && (
                <View style={styles.unreadBadge}>
                  <ThemedText style={styles.unreadText}>{chat.unreadCount}</ThemedText>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 12,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    opacity: 0.6,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 80,
  },
  chatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  chatInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  chatDetails: {
    flex: 1,
  },
  chatHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatName: {
    fontSize: 16,
    fontWeight: '600',
  },
  chatTime: {
    fontSize: 12,
    opacity: 0.6,
  },
  lastMessage: {
    fontSize: 14,
    opacity: 0.7,
  },
  unreadBadge: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  unreadText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  chatTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
  },
  messageContainer: {
    marginBottom: 12,
  },
  myMessage: {
    alignItems: 'flex-end',
  },
  otherMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 14,
    borderRadius: 16,
  },
  messageText: {
    fontSize: 16,
    marginBottom: 4,
  },
  messageTime: {
    fontSize: 11,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: 20,
    padding: 14,
    paddingHorizontal: 18,
    maxHeight: 100,
    marginRight: 10,
  },
  sendButton: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

