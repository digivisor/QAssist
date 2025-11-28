'use client';

import { 
  Search,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  MessageSquare,
  MoreVertical,
  X,
  Bot,
  AlertCircle,
  Lightbulb,
  ClipboardList,
  Bed,
  Clock,
  History,
  LayoutGrid,
  List
} from 'lucide-react';
import { useState } from 'react';

interface Request {
  id: number;
  type: string;
  description: string;
  date: string;
  status: 'completed' | 'pending' | 'in-progress';
}

interface Complaint {
  id: number;
  topic: string;
  description: string;
  date: string;
  resolved: boolean;
}

interface AIAnalysis {
  behavior: string;
  preferences: string[];
  suggestions: string[];
  satisfaction: 'high' | 'medium' | 'low';
  riskLevel: 'low' | 'medium' | 'high';
}

interface PastStay {
  roomNumber: string;
  roomType: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: number;
}

interface FormerCustomer {
  id: number;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  totalReservations: number;
  lastStay?: PastStay;
  requests: Request[];
  complaints: Complaint[];
  aiAnalysis: AIAnalysis;
}

function FormerCustomerDetailModal({ customer, isOpen, onClose }: { customer: FormerCustomer | null; isOpen: boolean; onClose: () => void }) {
  if (!isOpen || !customer) return null;

  const getSatisfactionColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400';
      case 'medium':
        return 'bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400';
      case 'low':
        return 'bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300';
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low':
        return 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400';
      case 'medium':
        return 'bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400';
      case 'high':
        return 'bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-2">
                {customer.name}
              </h2>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                Eski Misafir
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          <div className="space-y-6">
            {/* İletişim Bilgileri */}
            <div>
              <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-3">İletişim Bilgileri</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span className="text-base text-slate-900 dark:text-slate-50">{customer.phone}</span>
                </div>
                {customer.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span className="text-base text-slate-900 dark:text-slate-50">{customer.email}</span>
                  </div>
                )}
                {customer.address && (
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span className="text-base text-slate-900 dark:text-slate-50">{customer.address}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Son Konaklama */}
            {customer.lastStay && (
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-2">
                  <History className="w-4 h-4" />
                  Son Konaklama
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Oda Numarası</p>
                    <p className="text-xl font-bold text-slate-900 dark:text-slate-50">{customer.lastStay.roomNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Oda Tipi</p>
                    <p className="text-lg font-semibold text-slate-900 dark:text-slate-50">{customer.lastStay.roomType}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Check-in</p>
                    <p className="text-base text-slate-900 dark:text-slate-50">{customer.lastStay.checkIn}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Check-out</p>
                    <p className="text-base text-slate-900 dark:text-slate-50">{customer.lastStay.checkOut}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Gece Sayısı</p>
                    <p className="text-base text-slate-900 dark:text-slate-50">{customer.lastStay.nights} gece</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Misafir Sayısı</p>
                    <p className="text-base text-slate-900 dark:text-slate-50">{customer.lastStay.guests} kişi</p>
                  </div>
                </div>
              </div>
            )}

            {/* İstatistikler */}
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Toplam Rezervasyon</span>
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">{customer.totalReservations}</p>
            </div>

            {/* AI Analizi */}
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 mb-4">
                <Bot className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50">AI Analizi</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">Davranış Analizi</h4>
                  <p className="text-base text-slate-900 dark:text-slate-50">{customer.aiAnalysis.behavior}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">Memnuniyet Seviyesi</h4>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${getSatisfactionColor(customer.aiAnalysis.satisfaction)}`}>
                      {customer.aiAnalysis.satisfaction === 'high' ? 'Yüksek' : customer.aiAnalysis.satisfaction === 'medium' ? 'Orta' : 'Düşük'}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">Risk Seviyesi</h4>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${getRiskColor(customer.aiAnalysis.riskLevel)}`}>
                      {customer.aiAnalysis.riskLevel === 'low' ? 'Düşük' : customer.aiAnalysis.riskLevel === 'medium' ? 'Orta' : 'Yüksek'}
                    </span>
                  </div>
                </div>

                {customer.aiAnalysis.preferences.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">Tespit Edilen Tercihler</h4>
                    <div className="flex flex-wrap gap-2">
                      {customer.aiAnalysis.preferences.map((pref, index) => (
                        <span key={index} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm">
                          {pref}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {customer.aiAnalysis.suggestions.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2 flex items-center gap-2">
                      <Lightbulb className="w-4 h-4" />
                      Öneriler
                    </h4>
                    <ul className="space-y-2">
                      {customer.aiAnalysis.suggestions.map((suggestion, index) => (
                        <li key={index} className="text-base text-slate-900 dark:text-slate-50 flex items-start gap-2">
                          <span className="text-slate-400 mt-1">•</span>
                          <span>{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Talepler */}
            {customer.requests.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-2">
                  <ClipboardList className="w-4 h-4" />
                  Talepler ({customer.requests.length})
                </h3>
                <div className="space-y-3">
                  {customer.requests.map((request) => (
                    <div key={request.id} className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="text-base font-semibold text-slate-900 dark:text-slate-50">{request.type}</h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{request.description}</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          request.status === 'completed' 
                            ? 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400'
                            : request.status === 'in-progress'
                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                            : 'bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400'
                        }`}>
                          {request.status === 'completed' ? 'Tamamlandı' : request.status === 'in-progress' ? 'Devam Ediyor' : 'Bekliyor'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">{request.date}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Şikayetler */}
            {customer.complaints.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Şikayetler ({customer.complaints.length})
                </h3>
                <div className="space-y-3">
                  {customer.complaints.map((complaint) => (
                    <div key={complaint.id} className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="text-base font-semibold text-slate-900 dark:text-slate-50">{complaint.topic}</h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{complaint.description}</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          complaint.resolved 
                            ? 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400'
                            : 'bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400'
                        }`}>
                          {complaint.resolved ? 'Çözüldü' : 'Açık'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">{complaint.date}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

type ViewMode = 'grid' | 'list';

export default function FormerCustomers() {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedCustomer, setSelectedCustomer] = useState<FormerCustomer | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [customers] = useState<FormerCustomer[]>([
    {
      id: 1,
      name: 'Zeynep Şahin',
      phone: '+90 535 456 7890',
      totalReservations: 1,
      lastStay: {
        roomNumber: '215',
        roomType: 'Standart Oda',
        checkIn: '01.10.2025',
        checkOut: '03.10.2025',
        nights: 2,
        guests: 1
      },
      requests: [
        {
          id: 1,
          type: 'WiFi Şifresi',
          description: 'WiFi şifresi hakkında bilgi istedi',
          date: '2 ay önce',
          status: 'completed'
        }
      ],
      complaints: [
        {
          id: 1,
          topic: 'WiFi Hızı',
          description: 'WiFi bağlantısı çok yavaş, çalışamıyorum',
          date: '2 ay önce',
          resolved: true
        }
      ],
      aiAnalysis: {
        behavior: 'Müşteri uzun süredir gelmiyor. WiFi sorunu yaşamış ve çözülmüş. Tekrar rezervasyon yapmamış.',
        preferences: ['Hızlı internet', 'Çalışma ortamı'],
        suggestions: [
          'Özel teklif gönderilebilir',
          'WiFi iyileştirmeleri hakkında bilgi verilebilir',
          'İş seyahati paketleri önerilebilir'
        ],
        satisfaction: 'low',
        riskLevel: 'medium'
      }
    },
    {
      id: 2,
      name: 'Fatma Yıldırım',
      phone: '+90 537 678 9012',
      email: 'fatma.yildirim@example.com',
      totalReservations: 2,
      lastStay: {
        roomNumber: '312',
        roomType: 'Deluxe Oda',
        checkIn: '15.09.2025',
        checkOut: '18.09.2025',
        nights: 3,
        guests: 2
      },
      requests: [],
      complaints: [],
      aiAnalysis: {
        behavior: 'Müşteri memnun kalmış görünüyor. Tekrar rezervasyon yapmamış ama olumlu geri bildirimler vermiş.',
        preferences: ['Sessiz oda', 'Temizlik'],
        suggestions: [
          'Yeniden rezervasyon için özel teklif gönderilebilir',
          'Sadakat programına dahil edilebilir'
        ],
        satisfaction: 'high',
        riskLevel: 'low'
      }
    },
  ]);

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = searchQuery === '' || 
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone.includes(searchQuery) ||
      (customer.email && customer.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (customer.lastStay && customer.lastStay.roomNumber.includes(searchQuery));
    return matchesSearch;
  });

  const stats = {
    total: customers.length,
  };

  return (
    <div className="p-6 lg:p-8 min-h-screen">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-xl border border-slate-200/50 dark:border-slate-800/50 p-5 shadow-lg hover:shadow-xl transition-all">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2 font-medium">Toplam Eski Misafir</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-slate-50">{stats.total}</p>
        </div>
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-xl border border-slate-200/50 dark:border-slate-800/50 p-5 shadow-lg hover:shadow-xl transition-all">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2 font-medium">Toplam Rezervasyon</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-slate-50">{customers.reduce((sum, c) => sum + c.totalReservations, 0)}</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-200/50 dark:border-slate-800/50 p-5 shadow-lg mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Müşteri adı, telefon, email veya oda numarası ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 transition-all"
            />
          </div>
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded transition-all ${
                viewMode === 'grid' 
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 shadow-sm' 
                  : 'text-slate-600 dark:text-slate-400'
              }`}
              title="Kart Görünümü"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded transition-all ${
                viewMode === 'list' 
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 shadow-sm' 
                  : 'text-slate-600 dark:text-slate-400'
              }`}
              title="Liste Görünümü"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Customers List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCustomers.map((customer) => (
            <div
              key={customer.id}
              className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-xl border border-slate-200/50 dark:border-slate-800/50 p-5 shadow-lg hover:shadow-xl transition-all cursor-pointer"
              onClick={() => {
                setSelectedCustomer(customer);
                setIsModalOpen(true);
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-slate-900 dark:bg-slate-100 flex items-center justify-center">
                    <User className="w-6 h-6 text-white dark:text-slate-900" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50">{customer.name}</h3>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold mt-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      Eski Misafir
                    </span>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedCustomer(customer);
                    setIsModalOpen(true);
                  }}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                >
                  <MoreVertical className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <Phone className="w-4 h-4" />
                  <span>{customer.phone}</span>
                </div>
                {customer.email && (
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <Mail className="w-4 h-4" />
                    <span>{customer.email}</span>
                  </div>
                )}
              </div>

              {customer.lastStay && (
                <div className="mb-4 p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <History className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                    <span className="text-sm font-semibold text-slate-900 dark:text-slate-50">Son: Oda {customer.lastStay.roomNumber}</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">{customer.lastStay.checkOut}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Rezervasyon</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-slate-50">{customer.totalReservations}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Talepler</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-slate-50">{customer.requests.length}</p>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-end">
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    customer.aiAnalysis.satisfaction === 'high' 
                      ? 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400'
                      : customer.aiAnalysis.satisfaction === 'medium'
                      ? 'bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400'
                      : 'bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400'
                  }`}>
                    {customer.aiAnalysis.satisfaction === 'high' ? 'Yüksek Memnuniyet' : customer.aiAnalysis.satisfaction === 'medium' ? 'Orta' : 'Düşük'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredCustomers.map((customer) => (
            <div
              key={customer.id}
              className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-xl border border-slate-200/50 dark:border-slate-800/50 p-5 shadow-lg hover:shadow-xl transition-all cursor-pointer"
              onClick={() => {
                setSelectedCustomer(customer);
                setIsModalOpen(true);
              }}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-900 dark:bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <User className="w-6 h-6 text-white dark:text-slate-900" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50">{customer.name}</h3>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        Eski Misafir
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCustomer(customer);
                        setIsModalOpen(true);
                      }}
                      className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                    >
                      <MoreVertical className="w-4 h-4 text-slate-400" />
                    </button>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-400 mb-2">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      <span>{customer.phone}</span>
                    </div>
                    {customer.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        <span>{customer.email}</span>
                      </div>
                    )}
                    {customer.lastStay && (
                      <div className="flex items-center gap-2">
                        <History className="w-4 h-4" />
                        <span className="font-semibold text-slate-900 dark:text-slate-50">Son: Oda {customer.lastStay.roomNumber}</span>
                        <span className="text-xs">({customer.lastStay.roomType})</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                    <span>Rezervasyon: {customer.totalReservations}</span>
                    <span>Talepler: {customer.requests.length}</span>
                    <span className={`px-2 py-0.5 rounded ${
                      customer.aiAnalysis.satisfaction === 'high' 
                        ? 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400'
                        : customer.aiAnalysis.satisfaction === 'medium'
                        ? 'bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400'
                        : 'bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400'
                    }`}>
                      {customer.aiAnalysis.satisfaction === 'high' ? 'Yüksek Memnuniyet' : customer.aiAnalysis.satisfaction === 'medium' ? 'Orta' : 'Düşük'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredCustomers.length === 0 && (
        <div className="text-center py-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-lg">
          <History className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400 text-lg font-medium">Eski misafir bulunamadı</p>
        </div>
      )}

      <FormerCustomerDetailModal 
        customer={selectedCustomer} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
}

