'use client';

import { 
  Users,
  UserPlus,
  Trash2,
  MoreVertical,
  X,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Key,
  MessageSquare,
  Send,
  Search,
  Building2,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useState } from 'react';

interface Personnel {
  id: number;
  name: string;
  phone: string;
  email?: string;
  department: string;
  position: string;
  hireDate: string;
  status: 'active' | 'inactive';
  avatar?: string;
}

interface Message {
  id: number;
  senderId: number;
  senderName: string;
  senderType: 'admin' | 'personnel';
  message: string;
  timestamp: number;
  isRead: boolean;
}

function PersonnelDetailModal({ 
  personnel, 
  isOpen, 
  onClose,
  onDelete 
}: { 
  personnel: Personnel | null; 
  isOpen: boolean; 
  onClose: () => void;
  onDelete: (id: number) => void;
}) {
  if (!isOpen || !personnel) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-2">
                {personnel.name}
              </h2>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                personnel.status === 'active' 
                  ? 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}>
                {personnel.status === 'active' ? 'Aktif' : 'Pasif'}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-3">İletişim Bilgileri</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span className="text-base text-slate-900 dark:text-slate-50">{personnel.phone}</span>
                </div>
                {personnel.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span className="text-base text-slate-900 dark:text-slate-50">{personnel.email}</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-3">İş Bilgileri</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Departman</p>
                  <p className="text-base font-semibold text-slate-900 dark:text-slate-50">{personnel.department}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Pozisyon</p>
                  <p className="text-base font-semibold text-slate-900 dark:text-slate-50">{personnel.position}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">İşe Başlama Tarihi</p>
                  <p className="text-base text-slate-900 dark:text-slate-50">{personnel.hireDate}</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => {
                  if (confirm(`${personnel.name} adlı personeli silmek istediğinize emin misiniz?`)) {
                    onDelete(personnel.id);
                    onClose();
                  }
                }}
                className="w-full px-4 py-2 bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400 rounded-xl font-semibold hover:bg-red-200 dark:hover:bg-red-950/50 transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Personeli Sil
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PersonnelChatModal({
  personnel,
  isOpen,
  onClose
}: {
  personnel: Personnel | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      senderId: 1,
      senderName: 'Admin',
      senderType: 'admin',
      message: 'Merhaba, nasılsın?',
      timestamp: Date.now() - 3600000,
      isRead: true
    },
    {
      id: 2,
      senderId: personnel?.id || 0,
      senderName: personnel?.name || '',
      senderType: 'personnel',
      message: 'İyiyim teşekkürler, bugün çok yoğunuz.',
      timestamp: Date.now() - 3300000,
      isRead: true
    },
    {
      id: 3,
      senderId: 1,
      senderName: 'Admin',
      senderType: 'admin',
      message: 'Anladım, güçlerinizle devam edin.',
      timestamp: Date.now() - 3000000,
      isRead: true
    }
  ]);
  const [newMessage, setNewMessage] = useState('');

  if (!isOpen || !personnel) return null;

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message: Message = {
        id: messages.length + 1,
        senderId: 1,
        senderName: 'Admin',
        senderType: 'admin',
        message: newMessage,
        timestamp: Date.now(),
        isRead: false
      };
      setMessages([...messages, message]);
      setNewMessage('');
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Şimdi';
    if (minutes < 60) return `${minutes} dakika önce`;
    if (hours < 24) return `${hours} saat önce`;
    if (days < 7) return `${days} gün önce`;
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-4xl w-full h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-900 dark:bg-slate-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-white dark:text-slate-900" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-50">{personnel.name}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">{personnel.department}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.senderType === 'admin' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[70%] ${message.senderType === 'admin' ? 'order-2' : 'order-1'}`}>
                <div className={`rounded-2xl p-3 ${
                  message.senderType === 'admin'
                    ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-50'
                }`}>
                  <p className="text-sm">{message.message}</p>
                  <p className={`text-xs mt-1 ${
                    message.senderType === 'admin'
                      ? 'text-white/70 dark:text-slate-700'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}>
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Mesaj yazın..."
              className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 transition-all"
            />
            <button
              onClick={handleSendMessage}
              className="p-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CreatePersonnelModal({
  isOpen,
  onClose,
  onCreate
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (personnel: Omit<Personnel, 'id'>) => void;
}) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    department: '',
    position: '',
    hireDate: new Date().toISOString().split('T')[0],
    status: 'active' as 'active' | 'inactive'
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate(formData);
    setFormData({
      name: '',
      phone: '',
      email: '',
      department: '',
      position: '',
      hireDate: new Date().toISOString().split('T')[0],
      status: 'active'
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Yeni Personel Ekle</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Ad Soyad *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Telefon Numarası *
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+90 555 123 4567"
                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                E-posta
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Departman *
                </label>
              <select
                  required
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 transition-all"
                >
                  <option value="">Seçiniz</option>
                  <option value="Temizlik">Temizlik</option>
                  <option value="Resepsiyon">Resepsiyon</option>
                  <option value="Mutfak">Mutfak</option>
                  <option value="Güvenlik">Güvenlik</option>
                  <option value="Teknik">Teknik</option>
                  <option value="Yönetim">Yönetim</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Pozisyon *
                </label>
                <input
                  type="text"
                  required
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  placeholder="Örn: Temizlik Görevlisi"
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                İşe Başlama Tarihi *
              </label>
              <input
                type="date"
                required
                value={formData.hireDate}
                onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Durum
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 transition-all"
              >
                <option value="active">Aktif</option>
                <option value="inactive">Pasif</option>
              </select>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                İptal
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl font-semibold hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors"
              >
                Personel Ekle
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function Personnel() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPersonnel, setSelectedPersonnel] = useState<Personnel | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [hotelPassword, setHotelPassword] = useState('otel2024');
  const [showPassword, setShowPassword] = useState(false);

  const [personnel, setPersonnel] = useState<Personnel[]>([
    {
      id: 1,
      name: 'Ayşe Yılmaz',
      phone: '+90 555 111 2233',
      email: 'ayse.yilmaz@hotel.com',
      department: 'Temizlik',
      position: 'Temizlik Görevlisi',
      hireDate: '2023-01-15',
      status: 'active'
    },
    {
      id: 2,
      name: 'Mehmet Demir',
      phone: '+90 555 222 3344',
      email: 'mehmet.demir@hotel.com',
      department: 'Resepsiyon',
      position: 'Resepsiyonist',
      hireDate: '2022-06-20',
      status: 'active'
    },
    {
      id: 3,
      name: 'Fatma Kaya',
      phone: '+90 555 333 4455',
      department: 'Mutfak',
      position: 'Aşçı',
      hireDate: '2023-03-10',
      status: 'active'
    },
    {
      id: 4,
      name: 'Ali Çelik',
      phone: '+90 555 444 5566',
      email: 'ali.celik@hotel.com',
      department: 'Güvenlik',
      position: 'Güvenlik Görevlisi',
      hireDate: '2022-11-05',
      status: 'active'
    }
  ]);

  const filteredPersonnel = personnel.filter(p => {
    const matchesSearch = searchQuery === '' || 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.phone.includes(searchQuery) ||
      (p.email && p.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      p.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.position.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const stats = {
    total: personnel.length,
    active: personnel.filter(p => p.status === 'active').length,
    inactive: personnel.filter(p => p.status === 'inactive').length,
  };

  const handleCreatePersonnel = (newPersonnel: Omit<Personnel, 'id'>) => {
    const personnelWithId: Personnel = {
      ...newPersonnel,
      id: Math.max(...personnel.map(p => p.id), 0) + 1
    };
    setPersonnel([...personnel, personnelWithId]);
  };

  const handleDeletePersonnel = (id: number) => {
    setPersonnel(personnel.filter(p => p.id !== id));
  };

  const handleSavePassword = () => {
    // TODO: Şifreyi kaydet
    alert('Şifre kaydedildi!');
  };

  return (
    <div className="p-6 lg:p-8 min-h-screen">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-xl border border-slate-200/50 dark:border-slate-800/50 p-5 shadow-lg hover:shadow-xl transition-all">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2 font-medium">Toplam Personel</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-slate-50">{stats.total}</p>
        </div>
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-xl border border-slate-200/50 dark:border-slate-800/50 p-5 shadow-lg hover:shadow-xl transition-all">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2 font-medium">Aktif</p>
          <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{stats.active}</p>
        </div>
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-xl border border-slate-200/50 dark:border-slate-800/50 p-5 shadow-lg hover:shadow-xl transition-all">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2 font-medium">Pasif</p>
          <p className="text-3xl font-bold text-slate-600 dark:text-slate-400">{stats.inactive}</p>
        </div>
      </div>

      {/* Password Section */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-200/50 dark:border-slate-800/50 p-6 shadow-lg mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Key className="w-6 h-6 text-slate-600 dark:text-slate-400" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">Ortak Giriş Şifresi</h2>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          Tüm personeller bu şifre ile mobil uygulamaya giriş yapacak. Telefon numarası kimlik doğrulama için kullanılacak.
        </p>
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={hotelPassword}
              onChange={(e) => setHotelPassword(e.target.value)}
              className="w-full px-4 py-3 pr-12 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 transition-all"
            />
            <button
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
          <button
            onClick={handleSavePassword}
            className="px-6 py-3 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl font-semibold hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors"
          >
            Kaydet
          </button>
        </div>
      </div>

      {/* Search and Add */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-200/50 dark:border-slate-800/50 p-5 shadow-lg mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Personel adı, telefon, email, departman veya pozisyon ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 transition-all"
            />
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-6 py-3 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl font-semibold hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
          >
            <UserPlus className="w-5 h-5" />
            Yeni Personel
          </button>
        </div>
      </div>

      {/* Personnel List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPersonnel.map((person) => (
          <div
            key={person.id}
            className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-xl border border-slate-200/50 dark:border-slate-800/50 p-5 shadow-lg hover:shadow-xl transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-slate-900 dark:bg-slate-100 flex items-center justify-center">
                  <Users className="w-6 h-6 text-white dark:text-slate-900" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50">{person.name}</h3>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold mt-1 ${
                    person.status === 'active' 
                      ? 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400' 
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}>
                    {person.status === 'active' ? 'Aktif' : 'Pasif'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedPersonnel(person);
                  setIsDetailModalOpen(true);
                }}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
              >
                <MoreVertical className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <Phone className="w-4 h-4" />
                <span>{person.phone}</span>
              </div>
              {person.email && (
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <Mail className="w-4 h-4" />
                  <span>{person.email}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <Building2 className="w-4 h-4" />
                <span>{person.department}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <span className="text-slate-900 dark:text-slate-50 font-semibold">{person.position}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => {
                  setSelectedPersonnel(person);
                  setIsChatModalOpen(true);
                }}
                className="w-full px-4 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl font-semibold hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                Mesaj Gönder
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredPersonnel.length === 0 && (
        <div className="text-center py-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-lg">
          <Users className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400 text-lg font-medium">Personel bulunamadı</p>
        </div>
      )}

      <PersonnelDetailModal 
        personnel={selectedPersonnel} 
        isOpen={isDetailModalOpen} 
        onClose={() => setIsDetailModalOpen(false)}
        onDelete={handleDeletePersonnel}
      />

      <PersonnelChatModal
        personnel={selectedPersonnel}
        isOpen={isChatModalOpen}
        onClose={() => setIsChatModalOpen(false)}
      />

      <CreatePersonnelModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreatePersonnel}
      />
    </div>
  );
}

