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
  Bot,
  Loader2,
  X,
  Bed,
  UserCircle
} from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

interface ChatMessage {
  id: number;
  message: string;
  timestamp: string;
  direction: 'incoming' | 'outgoing';
  status: 'sent' | 'delivered' | 'read';
  sender: 'customer' | 'ai' | 'admin';
}

interface Conversation {
  id: number;
  customerId?: number;
  customerName: string;
  customerPhone: string;
  lastMessage: string | null;
  lastMessageTime: string | null;
  unreadCount: number;
  roomNumber?: string;
  messages: ChatMessage[];
}

interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  roomNumber?: string;
  roomType?: string;
  checkIn?: string;
  checkOut?: string;
  nights?: number;
  totalGuests?: number;
  status: 'active' | 'inactive';
  totalReservations: number;
}

export default function Messages() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [customerProfile, setCustomerProfile] = useState<Customer | null>(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);

  const formatTimeAgo = (dateString: string | null): string => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Az önce';
    if (diffMins < 60) return `${diffMins} dakika önce`;
    if (diffHours < 24) return `${diffHours} saat önce`;
    if (diffDays === 1) return 'Dün';
    if (diffDays < 7) return `${diffDays} gün önce`;
    
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
  };

  const loadConversations = useCallback(async () => {
    try {
      const url = searchQuery 
        ? `/api/conversations?search=${encodeURIComponent(searchQuery)}`
        : '/api/conversations';
      
      const response = await fetch(url);
      const result = await response.json();

      if (result.success) {
        // Customer bilgilerini çek (oda numarası için)
        const customerIds = result.data
          .filter((conv: any) => conv.customerId)
          .map((conv: any) => conv.customerId);
        
        let customerMap = new Map<number, any>();
        if (customerIds.length > 0) {
          const { data: customers } = await supabase
            .from('customers')
            .select('id, room_number')
            .in('id', customerIds);
          
          if (customers) {
            customerMap = new Map(customers.map((c: any) => [c.id, c]));
          }
        }

        setConversations((prevConversations) => {
          // Mevcut conversation'ları ID'ye göre map'e çevir (mesajları korumak için)
          const existingMap = new Map(prevConversations.map(conv => [conv.id, conv]));
          
          // Yeni conversation'ları formatla
          const formattedConversations = result.data.map((conv: any) => {
            const existingConv = existingMap.get(conv.id);
            const customer = conv.customerId ? customerMap.get(conv.customerId) : null;
            
            // Eğer lastMessage boşsa ama mesajlar varsa, son mesajı al
            let displayLastMessage = (conv.lastMessage && conv.lastMessage.trim()) ? conv.lastMessage : null;
            let displayLastMessageTime = formatTimeAgo(conv.lastMessageTime);
            
            // Eğer lastMessage boşsa ve mevcut conversation'da mesajlar varsa, son mesajı kullan
            if (!displayLastMessage && existingConv?.messages && existingConv.messages.length > 0) {
              const lastMsg = existingConv.messages[existingConv.messages.length - 1];
              displayLastMessage = lastMsg.message || null;
              displayLastMessageTime = lastMsg.timestamp ? formatTimeAgo(lastMsg.timestamp) : displayLastMessageTime;
            }
            
            return {
              id: conv.id,
              customerId: conv.customerId,
              customerName: conv.customerName,
              customerPhone: conv.customerPhone,
              lastMessage: displayLastMessage,
              lastMessageTime: displayLastMessageTime,
              unreadCount: conv.unreadCount || 0,
              roomNumber: customer?.room_number || null,
              // Mevcut conversation varsa mesajlarını koru, yoksa boş array
              messages: existingConv?.messages || [],
            };
          });
          
          return formattedConversations;
        });

        // Eğer seçili conversation varsa, bilgilerini güncelle (mesajları koruyarak)
        setSelectedConversation((prev) => {
          if (!prev) return prev;
          const customer = prev.customerId ? customerMap.get(prev.customerId) : null;
          const updatedConv = result.data.find((c: any) => c.id === prev.id);
          if (updatedConv) {
            return {
              ...prev,
              lastMessage: updatedConv.lastMessage || null,
              lastMessageTime: formatTimeAgo(updatedConv.lastMessageTime),
              unreadCount: updatedConv.unreadCount || 0,
              roomNumber: customer?.room_number || prev.roomNumber || null,
            };
          }
          return prev;
        });
      }
    } catch (error) {
      console.error('Konuşmalar yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  const loadMessages = useCallback(async (conversationId: number, showLoading: boolean = true) => {
    if (!conversationId) return;
    
    if (showLoading) {
      setLoadingMessages(true);
    }
    
    try {
      const response = await fetch(`/api/conversations/${conversationId}/messages`);
      const result = await response.json();

      if (!response.ok) {
        return;
      }

      if (result.success && result.data) {
        // Boş mesajları filtrele
        const formattedMessages = result.data
          .filter((msg: any) => msg.message && msg.message.trim().length > 0)
          .map((msg: any) => ({
            id: msg.id,
            message: msg.message,
            timestamp: msg.timestamp,
            direction: msg.direction,
            status: msg.status,
            sender: msg.sender,
          }));

        setSelectedConversation((prev) => {
          if (!prev || prev.id !== conversationId) return prev;
          // Mevcut mesajları koru, sadece güncelle
          return {
            ...prev,
            messages: formattedMessages,
          };
        });
      } else {
        // Hata durumunda mevcut mesajları koru
        setSelectedConversation((prev) => {
          if (!prev || prev.id !== conversationId) return prev;
          return prev; // Mesajları değiştirme
        });
      }
    } catch (error) {
      // Hata durumunda sessizce devam et
    } finally {
      if (showLoading) {
        setLoadingMessages(false);
      }
    }
  }, []);

  const markConversationAsRead = useCallback(async (conversationId: number) => {
    try {
      await fetch(`/api/conversations/${conversationId}/read`, {
        method: 'POST',
      });
      // Konuşma listesini güncelle
      loadConversations();
    } catch (error) {
      // Hata durumunda sessizce devam et
    }
  }, [loadConversations]);

  const loadCustomerProfile = useCallback(async (customerId: number) => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', customerId)
        .single();

      if (error) throw error;

      if (data) {
        setCustomerProfile({
          id: data.id,
          firstName: data.first_name,
          lastName: data.last_name,
          name: `${data.first_name} ${data.last_name}`,
          phone: data.phone,
          email: data.email,
          address: data.address,
          roomNumber: data.room_number,
          roomType: data.room_type,
          checkIn: data.check_in,
          checkOut: data.check_out,
          nights: data.nights,
          totalGuests: data.total_guests,
          status: data.status,
          totalReservations: data.total_reservations || 0,
        });
        setShowCustomerModal(true);
      }
    } catch (error) {
      // Hata durumunda sessizce devam et
    }
  }, []);

  // Konuşmaları yükle
  useEffect(() => {
    // İlk yüklemede loading state'i true olsun
    setLoading(true);
    loadConversations();
    // Her 30 saniyede bir konuşmaları yenile (loading state'i değiştirmeden)
    const interval = setInterval(() => {
      loadConversations();
    }, 30000);
    return () => clearInterval(interval);
  }, [loadConversations]);

  // Seçili konuşma değiştiğinde mesajları yükle
  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id);
      // Okunmamış sayısını sıfırla
      markConversationAsRead(selectedConversation.id);
    }
  }, [selectedConversation?.id, loadMessages, markConversationAsRead]);

  // Seçili konuşmanın mesajlarını periyodik olarak yenile (real-time için)
  useEffect(() => {
    if (!selectedConversation) return;

    // İlk yükleme hemen yapılır (yukarıdaki useEffect'ten)
    // Sonra her 5 saniyede bir yenile (loading gösterme)
    const interval = setInterval(() => {
      loadMessages(selectedConversation.id, false); // Loading gösterme
    }, 5000); // 5 saniyede bir

    return () => clearInterval(interval);
  }, [selectedConversation?.id, loadMessages]);

  // Arama sorgusu değiştiğinde konuşmaları yeniden yükle (debounce ile)
  useEffect(() => {
    // Boş arama için hemen yükle
    if (searchQuery.trim() === '') {
      loadConversations();
      return;
    }

    // Arama için 800ms bekle (kullanıcı yazmayı bitirsin)
    const timeoutId = setTimeout(() => {
      loadConversations();
    }, 800); // Debounce süresi - kullanıcı yazmayı bitirdikten sonra arama yap

    return () => clearTimeout(timeoutId);
  }, [searchQuery, loadConversations]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedConversation || sendingMessage) return;

    setSendingMessage(true);
    const messageToSend = messageText.trim();

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId: selectedConversation.id,
          message: messageToSend,
          sender: 'ai',
          direction: 'outgoing',
          status: 'sent',
        }),
      });

      const result = await response.json();

      if (result.success) {
        const newMessage: ChatMessage = {
          id: result.data.id,
          message: result.data.message,
          timestamp: result.data.timestamp,
          direction: result.data.direction,
          status: result.data.status,
          sender: result.data.sender,
        };

        setSelectedConversation((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            messages: [...prev.messages, newMessage],
            lastMessage: messageToSend,
            lastMessageTime: 'Az önce',
          };
        });

        setMessageText('');
        // Konuşma listesini güncelle
        loadConversations();
      }
    } catch (error) {
      // Hata durumunda sessizce devam et
    } finally {
      setSendingMessage(false);
    }
  };

  // Frontend'de filtreleme yapma, API'den zaten filtrelenmiş geliyor
  const filteredConversations = conversations;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedConversation?.messages]);

  const stats = {
    total: conversations.length,
    unread: conversations.reduce((sum, conv) => sum + conv.unreadCount, 0),
  };

  // Loading durumları
  if (loading && conversations.length === 0) {
    return (
      <div className="h-[calc(100vh-8rem)] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-slate-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Konuşmalar yükleniyor...</p>
        </div>
      </div>
    );
  }

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
          {loading && conversations.length === 0 ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="flex items-center justify-center p-8">
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                {searchQuery ? 'Arama sonucu bulunamadı' : 'Henüz konuşma yok'}
              </p>
            </div>
          ) : (
            filteredConversations.map((conversation) => (
            <div
              key={conversation.id}
              className={`p-4 border-b border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                selectedConversation?.id === conversation.id ? 'bg-slate-100 dark:bg-slate-800' : ''
              }`}
              onClick={() => {
                // Her tıklamada mesajları yükle (aynı conversation olsa bile)
                setSelectedConversation(conversation);
                loadMessages(conversation.id);
                markConversationAsRead(conversation.id);
              }}
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
                      {conversation.lastMessage ? conversation.lastMessage : 'Mesaj yok'}
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
          ))
          )}
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
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <button
                  onClick={() => setSelectedConversation(null)}
                  className="md:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors flex-shrink-0"
                >
                  <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </button>
                <div className="w-10 h-10 rounded-full bg-slate-900 dark:bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-white dark:text-slate-900" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-50 truncate">
                      {selectedConversation.customerName}
                    </h3>
                    {selectedConversation.customerId && (
                      <button
                        onClick={() => loadCustomerProfile(selectedConversation.customerId!)}
                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors flex-shrink-0"
                        title="Müşteri Profili"
                      >
                        <UserCircle className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span>{selectedConversation.customerPhone}</span>
                    {selectedConversation.roomNumber && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Bed className="w-3 h-3" />
                          Oda {selectedConversation.roomNumber}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedConversation(null)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors flex-shrink-0 ml-2"
                title="Kapat"
              >
                <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-950/50">
              {loadingMessages ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
                </div>
              ) : selectedConversation.messages.length === 0 ? (
                <div className="flex items-center justify-center p-8">
                  <p className="text-slate-500 dark:text-slate-400 text-sm">
                    Henüz mesaj yok
                  </p>
                </div>
              ) : (
                selectedConversation.messages.map((msg) => (
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
              ))
              )}
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
                  disabled={!messageText.trim() || sendingMessage}
                  className="px-6 py-3 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl font-semibold hover:bg-slate-800 dark:hover:bg-slate-200 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sendingMessage ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
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

      {/* Customer Profile Modal */}
      {showCustomerModal && customerProfile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">
                Müşteri Profili
              </h2>
              <button
                onClick={() => setShowCustomerModal(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto flex-1">
              {/* Temel Bilgiler */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-3">
                  Temel Bilgiler
                </h3>
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Ad Soyad</p>
                      <p className="text-base font-semibold text-slate-900 dark:text-slate-50">
                        {customerProfile.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Telefon</p>
                      <p className="text-base text-slate-900 dark:text-slate-50">
                        {customerProfile.phone}
                      </p>
                    </div>
                    {customerProfile.email && (
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">E-posta</p>
                        <p className="text-base text-slate-900 dark:text-slate-50">
                          {customerProfile.email}
                        </p>
                      </div>
                    )}
                    {customerProfile.address && (
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Adres</p>
                        <p className="text-base text-slate-900 dark:text-slate-50">
                          {customerProfile.address}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Konaklama Bilgileri */}
              {customerProfile.roomNumber && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-2">
                    <Bed className="w-4 h-4" />
                    {customerProfile.status === 'active' ? 'Aktif Konaklama' : 'Konaklama Bilgileri'}
                  </h3>
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Oda Numarası</p>
                        <p className="text-xl font-bold text-slate-900 dark:text-slate-50">
                          {customerProfile.roomNumber}
                        </p>
                      </div>
                      {customerProfile.roomType && (
                        <div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Oda Tipi</p>
                          <p className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                            {customerProfile.roomType}
                          </p>
                        </div>
                      )}
                      {customerProfile.checkIn && (
                        <div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Check-in</p>
                          <p className="text-base text-slate-900 dark:text-slate-50">
                            {customerProfile.checkIn}
                          </p>
                        </div>
                      )}
                      {customerProfile.checkOut && (
                        <div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Check-out</p>
                          <p className="text-base text-slate-900 dark:text-slate-50">
                            {customerProfile.checkOut}
                          </p>
                        </div>
                      )}
                      {customerProfile.nights && (
                        <div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Gece Sayısı</p>
                          <p className="text-base text-slate-900 dark:text-slate-50">
                            {customerProfile.nights} gece
                          </p>
                        </div>
                      )}
                      {customerProfile.totalGuests && (
                        <div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Toplam Misafir</p>
                          <p className="text-base text-slate-900 dark:text-slate-50">
                            {customerProfile.totalGuests} kişi
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* İstatistikler */}
              <div>
                <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-3">
                  İstatistikler
                </h3>
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Toplam Rezervasyon</p>
                      <p className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                        {customerProfile.totalReservations}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Durum</p>
                      <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                        customerProfile.status === 'active' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        {customerProfile.status === 'active' ? 'Aktif' : 'Pasif'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
