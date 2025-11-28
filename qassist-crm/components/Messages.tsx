'use client';

import { 
  Search,
  MessageSquare,
  Phone,
  User,
  Clock,
  CheckCircle2,
  CheckCircle,
  Send,
  ArrowLeft,
  Bot
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface ChatMessage {
  id: number;
  message: string;
  timestamp: string;
  direction: 'incoming' | 'outgoing';
  status: 'sent' | 'delivered' | 'read';
  sender: 'customer' | 'ai';
}

interface Conversation {
  id: number;
  customerName: string;
  customerPhone: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: ChatMessage[];
}

export default function Messages() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [conversations] = useState<Conversation[]>([
    {
      id: 1,
      customerName: 'Ahmet Yılmaz',
      customerPhone: '+90 532 123 4567',
      lastMessage: 'Teşekkürler, rezervasyonu onayladım.',
      lastMessageTime: '2 saat önce',
      unreadCount: 0,
      messages: [
        {
          id: 1,
          message: 'Merhaba, oda rezervasyonu yapmak istiyorum. 15 Kasım için müsait mi?',
          timestamp: '13:45',
          direction: 'incoming',
          status: 'read',
          sender: 'customer'
        },
        {
          id: 2,
          message: 'Merhaba Ahmet Bey! 15 Kasım için müsaitlik kontrolü yapıyorum. Birkaç saniye bekleyin lütfen.',
          timestamp: '13:46',
          direction: 'outgoing',
          status: 'read',
          sender: 'ai'
        },
        {
          id: 3,
          message: '15 Kasım için müsait odalarımız var. Hangi tip oda tercih edersiniz? Deniz manzaralı veya şehir manzaralı?',
          timestamp: '13:46',
          direction: 'outgoing',
          status: 'read',
          sender: 'ai'
        },
        {
          id: 4,
          message: 'Deniz manzaralı oda istiyorum.',
          timestamp: '13:47',
          direction: 'incoming',
          status: 'read',
          sender: 'customer'
        },
        {
          id: 5,
          message: 'Harika! Deniz manzaralı odalarımız için 2 gece konaklama fiyatı 3.500 TL. Rezervasyonu onaylamak ister misiniz?',
          timestamp: '13:47',
          direction: 'outgoing',
          status: 'read',
          sender: 'ai'
        },
        {
          id: 6,
          message: 'Evet, onaylıyorum.',
          timestamp: '13:48',
          direction: 'incoming',
          status: 'read',
          sender: 'customer'
        },
        {
          id: 7,
          message: 'Rezervasyonunuz onaylandı! Rezervasyon numaranız: RES-2025-001. Detaylar WhatsApp üzerinden gönderildi. İyi günler dileriz!',
          timestamp: '13:48',
          direction: 'outgoing',
          status: 'read',
          sender: 'ai'
        },
        {
          id: 8,
          message: 'Teşekkürler, rezervasyonu onayladım.',
          timestamp: '13:49',
          direction: 'incoming',
          status: 'read',
          sender: 'customer'
        }
      ]
    },
    {
      id: 2,
      customerName: 'Ayşe Demir',
      customerPhone: '+90 533 234 5678',
      lastMessage: 'Tamam, bekliyorum.',
      lastMessageTime: '5 saat önce',
      unreadCount: 0,
      messages: [
        {
          id: 1,
          message: 'Odaya havlu gönderebilir misiniz?',
          timestamp: '09:30',
          direction: 'incoming',
          status: 'read',
          sender: 'customer'
        },
        {
          id: 2,
          message: 'Tabii ki Ayşe Hanım! Hemen oda servisine iletiyorum. 5-10 dakika içinde havlu gönderilecek.',
          timestamp: '09:30',
          direction: 'outgoing',
          status: 'read',
          sender: 'ai'
        },
        {
          id: 3,
          message: 'Tamam, bekliyorum.',
          timestamp: '09:31',
          direction: 'incoming',
          status: 'read',
          sender: 'customer'
        }
      ]
    },
    {
      id: 3,
      customerName: 'Mehmet Kaya',
      customerPhone: '+90 534 345 6789',
      lastMessage: 'Kahvaltı saatleri nedir?',
      lastMessageTime: '1 gün önce',
      unreadCount: 1,
      messages: [
        {
          id: 1,
          message: 'Kahvaltı saatleri nedir?',
          timestamp: 'Dün 14:20',
          direction: 'incoming',
          status: 'delivered',
          sender: 'customer'
        },
        {
          id: 2,
          message: 'Kahvaltı servisimiz 07:00 - 11:00 saatleri arasında sunulmaktadır. Restoran veya oda servisi olarak tercih edebilirsiniz.',
          timestamp: 'Dün 14:21',
          direction: 'outgoing',
          status: 'read',
          sender: 'ai'
        }
      ]
    },
    {
      id: 4,
      customerName: 'Zeynep Şahin',
      customerPhone: '+90 535 456 7890',
      lastMessage: 'WiFi şifresi nedir?',
      lastMessageTime: '2 gün önce',
      unreadCount: 0,
      messages: [
        {
          id: 1,
          message: 'WiFi şifresi nedir?',
          timestamp: '2 gün önce 16:45',
          direction: 'incoming',
          status: 'read',
          sender: 'customer'
        },
        {
          id: 2,
          message: 'WiFi şifreniz: Hotel2025! Ağ adı: Hotel_Guest. İyi kullanımlar!',
          timestamp: '2 gün önce 16:45',
          direction: 'outgoing',
          status: 'read',
          sender: 'ai'
        }
      ]
    },
    {
      id: 5,
      customerName: 'Can Özkan',
      customerPhone: '+90 536 567 8901',
      lastMessage: 'Spa rezervasyonu yapmak istiyorum.',
      lastMessageTime: '3 gün önce',
      unreadCount: 0,
      messages: [
        {
          id: 1,
          message: 'Spa rezervasyonu yapmak istiyorum.',
          timestamp: '3 gün önce 10:15',
          direction: 'incoming',
          status: 'read',
          sender: 'customer'
        },
        {
          id: 2,
          message: 'Tabii ki! Spa hizmetlerimiz için hangi gün ve saat uygun?',
          timestamp: '3 gün önce 10:16',
          direction: 'outgoing',
          status: 'read',
          sender: 'ai'
        }
      ]
    },
  ]);

  const filteredConversations = conversations.filter(conv => 
    searchQuery === '' || 
    conv.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.customerPhone.includes(searchQuery)
  );

  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedConversation) return;

    const newMessage: ChatMessage = {
      id: selectedConversation.messages.length + 1,
      message: messageText,
      timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      direction: 'outgoing',
      status: 'sent',
      sender: 'ai'
    };

    const updatedConversations = conversations.map(conv => {
      if (conv.id === selectedConversation.id) {
        return {
          ...conv,
          messages: [...conv.messages, newMessage],
          lastMessage: messageText,
          lastMessageTime: 'Az önce'
        };
      }
      return conv;
    });

    setSelectedConversation({
      ...selectedConversation,
      messages: [...selectedConversation.messages, newMessage],
      lastMessage: messageText,
      lastMessageTime: 'Az önce'
    });

    setMessageText('');
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedConversation?.messages]);

  const stats = {
    total: conversations.length,
    unread: conversations.reduce((sum, conv) => sum + conv.unreadCount, 0),
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-4 p-6 lg:p-8">
      {/* Conversations List */}
      <div className={`w-full md:w-96 flex flex-col border border-slate-200/50 dark:border-slate-800/50 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-lg transition-all ${
        selectedConversation ? 'hidden md:flex' : 'flex'
      }`}>
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-slate-900 dark:bg-slate-100 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white dark:text-slate-900" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50">QAssist</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">AI Asistan</p>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Müşteri ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-400">Toplam: {stats.total}</span>
            <span className="text-amber-600 dark:text-amber-400 font-semibold">Okunmamış: {stats.unread}</span>
          </div>
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.map((conversation) => (
            <div
              key={conversation.id}
              className={`p-4 border-b border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                selectedConversation?.id === conversation.id ? 'bg-slate-100 dark:bg-slate-800' : ''
              }`}
              onClick={() => setSelectedConversation(conversation)}
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full bg-slate-900 dark:bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <User className="w-6 h-6 text-white dark:text-slate-900" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-50 truncate">
                      {conversation.customerName}
                    </h3>
                    <span className="text-xs text-slate-500 dark:text-slate-400 flex-shrink-0 ml-2">
                      {conversation.lastMessageTime}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
                      {conversation.lastMessage}
                    </p>
                    {conversation.unreadCount > 0 && (
                      <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 ml-2">
                        {conversation.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`flex-1 flex flex-col border border-slate-200/50 dark:border-slate-800/50 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-lg transition-all ${
        selectedConversation ? 'flex' : 'hidden md:flex'
      }`}>
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedConversation(null)}
                  className="md:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </button>
                <div className="w-10 h-10 rounded-full bg-slate-900 dark:bg-slate-100 flex items-center justify-center">
                  <User className="w-5 h-5 text-white dark:text-slate-900" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-50">
                    {selectedConversation.customerName}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {selectedConversation.customerPhone}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-950/50">
              {selectedConversation.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.direction === 'outgoing' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                    msg.direction === 'outgoing'
                      ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-br-sm'
                      : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 rounded-bl-sm border border-slate-200 dark:border-slate-700'
                  }`}>
                    {msg.direction === 'outgoing' && msg.sender === 'ai' && (
                      <div className="flex items-center gap-1 mb-1">
                        <Bot className="w-3 h-3 opacity-70" />
                        <span className="text-xs opacity-70 font-semibold">QAssist</span>
                      </div>
                    )}
                    <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                    <div className={`flex items-center justify-end gap-1 mt-1 text-xs ${
                      msg.direction === 'outgoing' ? 'opacity-70' : 'text-slate-500 dark:text-slate-400'
                    }`}>
                      <span>{msg.timestamp}</span>
                      {msg.direction === 'outgoing' && (
                        <div className="ml-1">
                          {msg.status === 'read' ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : msg.status === 'delivered' ? (
                            <CheckCircle className="w-3 h-3" />
                          ) : (
                            <CheckCircle className="w-3 h-3 opacity-50" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Mesaj yazın..."
                  className="flex-1 px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!messageText.trim()}
                  className="px-6 py-3 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl font-semibold hover:bg-slate-800 dark:hover:bg-slate-200 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-400 text-lg font-medium">
                Bir konuşma seçin
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
