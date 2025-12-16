import React, { useState, useRef, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

type Message = {
  id: number;
  text: string;
  isUser: boolean;
  time: string;
};

export default function LiveChatScreen() {
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: 'Merhaba! QHotelier Destek Hattına hoş geldiniz. Size nasıl yardımcı olabilirim?',
      isUser: false,
      time: '14:30',
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const quickReplies = [
    'Görev oluşturamıyorum',
    'Şifremi unuttum',
    'Uygulama çok yavaş',
    'Bildirim almıyorum',
  ];

  const sendMessage = (text?: string) => {
    const messageToSend = text || messageText.trim();
    if (!messageToSend) return;

    const newMessage: Message = {
      id: messages.length + 1,
      text: messageToSend,
      isUser: true,
      time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, newMessage]);
    setMessageText('');
    
    // Simulate typing
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const botResponse: Message = {
        id: messages.length + 2,
        text: getBotResponse(messageToSend),
        isUser: false,
        time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, botResponse]);
    }, 1500);
  };

  const getBotResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('görev') || lowerMessage.includes('oluştur')) {
      return 'Görev oluşturma konusunda yardımcı olabilirim. Ana sayfadaki + butonuna tıklayarak yeni görev oluşturabilirsiniz. Sorun devam ederse lütfen ekran görüntüsü paylaşın.';
    }
    if (lowerMessage.includes('şifre') || lowerMessage.includes('unuttum')) {
      return 'Şifrenizi sıfırlamak için giriş ekranındaki "Şifremi Unuttum" bağlantısına tıklayın. Telefonunuza SMS ile kod gönderilecektir.';
    }
    if (lowerMessage.includes('yavaş') || lowerMessage.includes('kasıyor')) {
      return 'Uygulama performans sorunları için: 1) Önbelleği temizleyin (Ayarlar > Önbelleği Temizle), 2) Uygulamayı yeniden başlatın, 3) İnternet bağlantınızı kontrol edin.';
    }
    if (lowerMessage.includes('bildirim')) {
      return 'Bildirim sorunu için: 1) Profil > Bildirim Ayarları\'nı kontrol edin, 2) Telefonunuzun uygulama bildirim izinlerini kontrol edin, 3) Uygulamayı yeniden yükleyin.';
    }
    
    return 'Mesajınız alındı. Destek ekibimiz en kısa sürede size dönüş yapacaktır. Çalışma saatlerimiz: Hafta içi 09:00 - 18:00';
  };

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages, isTyping]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Canlı Destek</Text>
          <View style={styles.onlineStatus}>
            <View style={styles.onlineDot} />
            <Text style={styles.onlineText}>Çevrimiçi</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-vertical" size={20} color="#64748b" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <ScrollView 
          ref={scrollViewRef}
          contentContainerStyle={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Tarih */}
          <View style={styles.dateContainer}>
            <Text style={styles.dateText}>Bugün</Text>
          </View>

          {messages.map((message) => (
            <View 
              key={message.id} 
              style={[
                styles.messageWrapper,
                message.isUser ? styles.messageWrapperUser : styles.messageWrapperBot
              ]}
            >
              {!message.isUser && (
                <View style={styles.botAvatar}>
                  <Ionicons name="headset" size={18} color="#2563EB" />
                </View>
              )}
              <View 
                style={[
                  styles.messageBubble,
                  message.isUser ? styles.messageBubbleUser : styles.messageBubbleBot
                ]}
              >
                <Text style={[
                  styles.messageText,
                  message.isUser ? styles.messageTextUser : styles.messageTextBot
                ]}>
                  {message.text}
                </Text>
                <Text style={[
                  styles.messageTime,
                  message.isUser ? styles.messageTimeUser : styles.messageTimeBot
                ]}>
                  {message.time}
                </Text>
              </View>
            </View>
          ))}

          {isTyping && (
            <View style={[styles.messageWrapper, styles.messageWrapperBot]}>
              <View style={styles.botAvatar}>
                <Ionicons name="headset" size={18} color="#2563EB" />
              </View>
              <View style={[styles.messageBubble, styles.messageBubbleBot, styles.typingBubble]}>
                <View style={styles.typingDots}>
                  <View style={[styles.typingDot, styles.typingDot1]} />
                  <View style={[styles.typingDot, styles.typingDot2]} />
                  <View style={[styles.typingDot, styles.typingDot3]} />
                </View>
              </View>
            </View>
          )}

          {/* Hızlı Yanıtlar */}
          {messages.length === 1 && (
            <View style={styles.quickRepliesContainer}>
              <Text style={styles.quickRepliesTitle}>Hızlı Konular</Text>
              <View style={styles.quickReplies}>
                {quickReplies.map((reply, index) => (
                  <TouchableOpacity 
                    key={index} 
                    style={styles.quickReplyButton}
                    onPress={() => sendMessage(reply)}
                  >
                    <Text style={styles.quickReplyText}>{reply}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input Area */}
        <View style={[styles.inputContainer, { paddingBottom: insets.bottom + 12 }]}>
          <TouchableOpacity style={styles.attachButton}>
            <Ionicons name="attach" size={24} color="#64748b" />
          </TouchableOpacity>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder="Mesajınızı yazın..."
              placeholderTextColor="#94a3b8"
              value={messageText}
              onChangeText={setMessageText}
              multiline
              maxLength={500}
            />
          </View>
          <TouchableOpacity 
            style={[
              styles.sendButton,
              messageText.trim() && styles.sendButtonActive
            ]}
            onPress={() => sendMessage()}
            disabled={!messageText.trim()}
          >
            <Ionicons 
              name="send" 
              size={20} 
              color={messageText.trim() ? 'white' : '#94a3b8'} 
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
    color: '#0f172a',
  },
  onlineStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22c55e',
  },
  onlineText: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: '#22c55e',
  },
  moreButton: {
    padding: 8,
  },
  chatContainer: {
    flex: 1,
  },
  messagesContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  dateContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  dateText: {
    fontSize: 12,
    fontFamily: 'Poppins_500Medium',
    color: '#94a3b8',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  messageWrapper: {
    flexDirection: 'row',
    marginBottom: 16,
    maxWidth: '85%',
  },
  messageWrapperUser: {
    alignSelf: 'flex-end',
  },
  messageWrapperBot: {
    alignSelf: 'flex-start',
  },
  botAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginTop: 4,
  },
  messageBubble: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxWidth: '100%',
  },
  messageBubbleUser: {
    backgroundColor: '#2563EB',
    borderBottomRightRadius: 4,
  },
  messageBubbleBot: {
    backgroundColor: 'white',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  messageText: {
    fontSize: 15,
    fontFamily: 'Poppins_400Regular',
    lineHeight: 22,
  },
  messageTextUser: {
    color: 'white',
  },
  messageTextBot: {
    color: '#0f172a',
  },
  messageTime: {
    fontSize: 11,
    fontFamily: 'Poppins_400Regular',
    marginTop: 6,
  },
  messageTimeUser: {
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'right',
  },
  messageTimeBot: {
    color: '#94a3b8',
  },
  typingBubble: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  typingDots: {
    flexDirection: 'row',
    gap: 4,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#94a3b8',
  },
  typingDot1: {
    opacity: 0.4,
  },
  typingDot2: {
    opacity: 0.6,
  },
  typingDot3: {
    opacity: 0.8,
  },
  quickRepliesContainer: {
    marginTop: 16,
  },
  quickRepliesTitle: {
    fontSize: 13,
    fontFamily: 'Poppins_500Medium',
    color: '#64748b',
    marginBottom: 12,
  },
  quickReplies: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickReplyButton: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  quickReplyText: {
    fontSize: 13,
    fontFamily: 'Poppins_500Medium',
    color: '#2563EB',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    gap: 8,
  },
  attachButton: {
    padding: 8,
    marginBottom: 4,
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 120,
  },
  textInput: {
    fontSize: 15,
    fontFamily: 'Poppins_400Regular',
    color: '#0f172a',
    maxHeight: 80,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonActive: {
    backgroundColor: '#2563EB',
  },
});

