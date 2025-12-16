import { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet, TextInput, KeyboardAvoidingView, Platform, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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

  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = () => {
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
      <SafeAreaView style={styles.container} edges={['top']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
          keyboardVerticalOffset={0}
        >
          <View style={styles.chatHeader}>
            <TouchableOpacity onPress={() => setSelectedChat(null)} style={styles.backButton}>
              <MaterialIcons name="arrow-back" size={24} color="#0f172a" />
            </TouchableOpacity>
            <Text style={styles.chatTitle}>{selectedChat.name}</Text>
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
                    ? { backgroundColor: '#2563EB' }
                    : { backgroundColor: '#e2e8f0' },
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    message.senderType === 'personnel' && { color: '#fff' },
                  ]}
                >
                  {message.message}
                </Text>
                <Text
                  style={[
                    styles.messageTime,
                    message.senderType === 'personnel'
                      ? { color: 'rgba(255,255,255,0.7)' }
                      : { color: '#64748b' },
                  ]}
                >
                  {formatTime(message.timestamp)}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Mesaj yazın..."
            placeholderTextColor="#94a3b8"
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
          />
          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleSendMessage}
          >
            <MaterialIcons name="send" size={22} color="white" />
          </TouchableOpacity>
        </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Mesajlar</Text>
          <Text style={styles.headerSubtitle}>
            {chats.reduce((sum, chat) => sum + chat.unreadCount, 0)} okunmamış mesaj
          </Text>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {chats.map((chat) => (
            <TouchableOpacity
              key={chat.id}
              style={styles.chatCard}
              onPress={() => handleSelectChat(chat)}
              activeOpacity={0.7}
            >
              <View style={styles.chatInfo}>
                <View
                  style={[
                    styles.avatar,
                    { backgroundColor: chat.type === 'admin' ? '#2563EB' : '#475569' },
                  ]}
                >
                  <Text style={styles.avatarText}>
                    {chat.name.charAt(0)}
                  </Text>
                </View>
                <View style={styles.chatDetails}>
                  <View style={styles.chatHeaderRow}>
                    <Text style={styles.chatName}>{chat.name}</Text>
                    <Text style={styles.chatTime}>
                      {formatTime(chat.lastMessageTime)}
                    </Text>
                  </View>
                  <Text style={styles.lastMessage} numberOfLines={1}>
                    {chat.lastMessage}
                  </Text>
                </View>
              </View>
              {chat.unreadCount > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadText}>{chat.unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
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
    paddingTop: 12,
    paddingBottom: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'Poppins_700Bold',
    color: '#0f172a',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#64748b',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 80,
    paddingTop: 16,
  },
  chatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
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
    fontFamily: 'Poppins_700Bold',
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
    fontFamily: 'Poppins_600SemiBold',
    color: '#0f172a',
  },
  chatTime: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: '#94a3b8',
  },
  lastMessage: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#64748b',
  },
  unreadBadge: {
    backgroundColor: '#2563EB',
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
    fontFamily: 'Poppins_600SemiBold',
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  chatTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
    color: '#0f172a',
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
    fontFamily: 'Poppins_400Regular',
    color: '#0f172a',
    marginBottom: 4,
  },
  messageTime: {
    fontSize: 11,
    fontFamily: 'Poppins_400Regular',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    alignItems: 'flex-end',
    backgroundColor: 'white',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 20,
    padding: 14,
    paddingHorizontal: 18,
    maxHeight: 100,
    marginRight: 10,
    fontFamily: 'Poppins_400Regular',
    fontSize: 15,
  },
  sendButton: {
    backgroundColor: '#2563EB',
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
});
