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
  TrendingUp,
  Bed,
  Clock,
  LayoutGrid,
  List,
  Plus,
  UtensilsCrossed,
  Ticket
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

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

interface RoomGuest {
  id: number;
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
  relationship?: string;
}

interface EventReservation {
  id: number;
  eventName: string;
  eventType: string;
  eventDate: string;
  eventTime?: string;
  numberOfGuests: number;
  status: string;
  notes?: string;
}

interface RestaurantReservation {
  id: number;
  restaurantName: string;
  reservationDate: string;
  reservationTime: string;
  numberOfGuests: number;
  tableNumber?: string;
  status: string;
  specialRequests?: string;
}

interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  name: string; // firstName + lastName (backward compatibility)
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
  roomGuests?: RoomGuest[];
  requests: Request[];
  issues: Complaint[]; // complaints renamed to issues
  eventReservations?: EventReservation[];
  restaurantReservations?: RestaurantReservation[];
  aiAnalysis: AIAnalysis;
}

function CustomerDetailModal({ customer, isOpen, onClose }: { customer: Customer | null; isOpen: boolean; onClose: () => void }) {
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
              {customer.status === 'active' && customer.checkOut && new Date(customer.checkOut.split('.').reverse().join('-')) >= new Date() && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400">
                  Aktif Konaklama
                </span>
              )}
              {customer.status === 'inactive' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  Pasif
                </span>
              )}
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

            {/* Konaklama Bilgileri */}
            {customer.roomNumber && (
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-2">
                  <Bed className="w-4 h-4" />
                  {customer.status === 'active' ? 'Aktif Konaklama' : 'Konaklama Bilgileri'}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Oda Numarası</p>
                    <p className="text-xl font-bold text-slate-900 dark:text-slate-50">{customer.roomNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Oda Tipi</p>
                    <p className="text-lg font-semibold text-slate-900 dark:text-slate-50">{customer.roomType || 'Belirtilmemiş'}</p>
                  </div>
                  {customer.checkIn && (
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Check-in</p>
                      <p className="text-base text-slate-900 dark:text-slate-50">{customer.checkIn}</p>
                    </div>
                  )}
                  {customer.checkOut && (
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Check-out</p>
                      <p className="text-base text-slate-900 dark:text-slate-50">{customer.checkOut}</p>
                    </div>
                  )}
                  {customer.nights && (
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Gece Sayısı</p>
                      <p className="text-base text-slate-900 dark:text-slate-50">{customer.nights} gece</p>
                    </div>
                  )}
                  {customer.totalGuests && (
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Toplam Misafir</p>
                      <p className="text-base text-slate-900 dark:text-slate-50">{customer.totalGuests} kişi</p>
                    </div>
                  )}
                </div>
                
                {/* Aynı odada kalan diğer misafirler */}
                {customer.roomGuests && customer.roomGuests.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Aynı Odada Kalan Diğer Misafirler</p>
                    <div className="space-y-2">
                      {customer.roomGuests.map((guest) => (
                        <div key={guest.id} className="flex items-center justify-between text-sm">
                          <span className="text-slate-900 dark:text-slate-50">
                            {guest.firstName} {guest.lastName}
                            {guest.relationship && (
                              <span className="text-xs text-slate-500 dark:text-slate-400 ml-2">({guest.relationship})</span>
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
            <div className="bg-slate-50 dark:bg-slate-800/50  p-4 border border-slate-200 dark:border-slate-700">
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

            {/* Etkinlik Rezervasyonları */}
            {customer.eventReservations && customer.eventReservations.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Etkinlik Rezervasyonları ({customer.eventReservations.length})
                </h3>
                <div className="space-y-3">
                  {customer.eventReservations.map((event) => (
                    <div key={event.id} className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="text-base font-semibold text-slate-900 dark:text-slate-50">{event.eventName}</h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{event.eventType}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            {event.eventDate} {event.eventTime && `- ${event.eventTime}`}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          event.status === 'confirmed' 
                            ? 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400'
                            : event.status === 'completed'
                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                            : 'bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400'
                        }`}>
                          {event.status === 'confirmed' ? 'Onaylandı' : event.status === 'completed' ? 'Tamamlandı' : 'İptal Edildi'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Restoran Rezervasyonları */}
            {customer.restaurantReservations && customer.restaurantReservations.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-2">
                  <UtensilsCrossed className="w-4 h-4" />
                  Restoran Rezervasyonları ({customer.restaurantReservations.length})
                </h3>
                <div className="space-y-3">
                  {customer.restaurantReservations.map((reservation) => (
                    <div key={reservation.id} className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="text-base font-semibold text-slate-900 dark:text-slate-50">{reservation.restaurantName}</h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                            {reservation.reservationDate} - {reservation.reservationTime}
                          </p>
                          {reservation.tableNumber && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Masa: {reservation.tableNumber}</p>
                          )}
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          reservation.status === 'confirmed' 
                            ? 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400'
                            : reservation.status === 'completed'
                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                            : 'bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400'
                        }`}>
                          {reservation.status === 'confirmed' ? 'Onaylandı' : reservation.status === 'completed' ? 'Tamamlandı' : 'İptal Edildi'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sorunlar/Şikayetler */}
            {customer.issues.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Sorunlar ({customer.issues.length})
                </h3>
                <div className="space-y-3">
                  {customer.issues.map((issue) => (
                    <div key={issue.id} className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="text-base font-semibold text-slate-900 dark:text-slate-50">{issue.topic}</h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{issue.description}</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          issue.resolved 
                            ? 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400'
                            : 'bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400'
                        }`}>
                          {issue.resolved ? 'Çözüldü' : 'Açık'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">{issue.date}</p>
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

function AddGuestModal({ isOpen, onClose, onAdd }: { isOpen: boolean; onClose: () => void; onAdd: (guest: Customer) => void }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    roomNumber: '',
    roomType: '',
    checkIn: '',
    checkOut: '',
    guests: '1'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone || !formData.roomNumber || !formData.checkIn || !formData.checkOut) {
      alert('Lütfen zorunlu alanları doldurun (Ad, Telefon, Oda Numarası, Check-in, Check-out)');
      return;
    }

    const checkInDate = new Date(formData.checkIn);
    const checkOutDate = new Date(formData.checkOut);
    const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));

    if (nights <= 0) {
      alert('Check-out tarihi check-in tarihinden sonra olmalıdır');
      return;
    }

    // Ad ve soyadı ayır
    const nameParts = formData.name.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    const newGuest: Customer = {
      id: Date.now(), // Geçici ID, Supabase'den gerçek ID gelecek
      firstName: firstName,
      lastName: lastName,
      name: formData.name,
      phone: formData.phone,
      email: formData.email || undefined,
      address: formData.address || undefined,
      roomNumber: formData.roomNumber,
      roomType: formData.roomType || 'Standart Oda',
      checkIn: checkInDate.toLocaleDateString('tr-TR'),
      checkOut: checkOutDate.toLocaleDateString('tr-TR'),
      nights: nights,
      totalGuests: parseInt(formData.guests) || 1,
      status: checkOutDate >= new Date() ? 'active' : 'inactive',
      totalReservations: 1,
      requests: [],
      issues: [],
      aiAnalysis: {
        behavior: 'Yeni eklenen konuk. Henüz davranış analizi yapılmadı.',
        preferences: [],
        suggestions: [
          'Konuk bilgilerini detaylandırın',
          'Tercihlerini öğrenin',
          'Memnuniyet seviyesini takip edin'
        ],
        satisfaction: 'medium',
        riskLevel: 'low'
      }
    };

    onAdd(newGuest);
    
    // Reset form
    setFormData({
      name: '',
      phone: '',
      email: '',
      address: '',
      roomNumber: '',
      roomType: '',
      checkIn: '',
      checkOut: '',
      guests: '1'
    });
    
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-start justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
              Yeni Konuk Ekle
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Ad Soyad <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Telefon <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                E-posta
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Adres
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Oda Numarası <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.roomNumber}
                  onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Oda Tipi
                </label>
                <input
                  type="text"
                  value={formData.roomType}
                  onChange={(e) => setFormData({ ...formData, roomType: e.target.value })}
                  placeholder="Standart Oda"
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Check-in <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.checkIn}
                  onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Check-out <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.checkOut}
                  onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Misafir Sayısı
              </label>
              <input
                type="number"
                min="1"
                value={formData.guests}
                onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                İptal
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-3 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl font-semibold hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors"
              >
                Konuk Ekle
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function Customers() {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddGuestModalOpen, setIsAddGuestModalOpen] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Supabase'den müşterileri yükle
  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      setError(null);

      // Müşterileri yükle (yeni yapıda tüm bilgiler customers tablosunda)
      const { data: customersData, error: customersError } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (customersError) throw customersError;

      // İlişkili verileri yükle
      const customerIds = (customersData || []).map((c: any) => c.id);

      // Oda misafirlerini yükle
      const { data: roomGuestsData, error: roomGuestsError } = await supabase
        .from('room_guests')
        .select('*')
        .in('customer_id', customerIds);

      if (roomGuestsError) throw roomGuestsError;

      // Talepleri yükle
      const { data: requestsData, error: requestsError } = await supabase
        .from('customer_requests')
        .select('*')
        .in('customer_id', customerIds);

      if (requestsError) throw requestsError;

      // Sorunları yükle
      const { data: issuesData, error: issuesError } = await supabase
        .from('customer_issues')
        .select('*')
        .in('customer_id', customerIds);

      if (issuesError) throw issuesError;

      // AI Analizlerini yükle
      const { data: aiAnalysisData, error: aiError } = await supabase
        .from('customer_ai_analysis')
        .select('*')
        .in('customer_id', customerIds);

      if (aiError) throw aiError;

      // Etkinlik rezervasyonlarını yükle
      const { data: eventReservationsData, error: eventReservationsError } = await supabase
        .from('event_reservations')
        .select('*')
        .in('customer_id', customerIds);

      if (eventReservationsError) throw eventReservationsError;

      // Restoran rezervasyonlarını yükle
      const { data: restaurantReservationsData, error: restaurantReservationsError } = await supabase
        .from('restaurant_reservations')
        .select('*')
        .in('customer_id', customerIds);

      if (restaurantReservationsError) throw restaurantReservationsError;

      // Verileri birleştir
      const customersWithRelations: Customer[] = (customersData || []).map((customer: any) => {
        const roomGuests = roomGuestsData?.filter((rg: any) => rg.customer_id === customer.id) || [];
        const requests = requestsData?.filter((req: any) => req.customer_id === customer.id) || [];
        const issues = issuesData?.filter((issue: any) => issue.customer_id === customer.id) || [];
        const aiAnalysis = aiAnalysisData?.find((ai: any) => ai.customer_id === customer.id);
        const eventReservations = eventReservationsData?.filter((er: any) => er.customer_id === customer.id) || [];
        const restaurantReservations = restaurantReservationsData?.filter((rr: any) => rr.customer_id === customer.id) || [];

        // Tarihleri formatla
        const checkInFormatted = customer.check_in ? new Date(customer.check_in).toLocaleDateString('tr-TR') : undefined;
        const checkOutFormatted = customer.check_out ? new Date(customer.check_out).toLocaleDateString('tr-TR') : undefined;

        return {
          id: customer.id,
          firstName: customer.first_name,
          lastName: customer.last_name,
          name: `${customer.first_name} ${customer.last_name}`,
          phone: customer.phone,
          email: customer.email || undefined,
          address: customer.address || undefined,
          roomNumber: customer.room_number || undefined,
          roomType: customer.room_type || undefined,
          checkIn: checkInFormatted,
          checkOut: checkOutFormatted,
          nights: customer.nights || undefined,
          totalGuests: customer.total_guests || undefined,
          status: customer.status as 'active' | 'inactive',
          totalReservations: customer.total_reservations || 0,
          roomGuests: roomGuests.map((rg: any) => ({
            id: rg.id,
            firstName: rg.first_name,
            lastName: rg.last_name,
            phone: rg.phone || undefined,
            email: rg.email || undefined,
            relationship: rg.relationship || undefined
          })),
          requests: requests.map((req: any) => ({
            id: req.id,
            type: req.type,
            description: req.description,
            date: req.date,
            status: req.status as 'completed' | 'pending' | 'in-progress'
          })),
          issues: issues.map((issue: any) => ({
            id: issue.id,
            topic: issue.topic,
            description: issue.description,
            date: issue.date,
            resolved: issue.resolved
          })),
          eventReservations: eventReservations.map((er: any) => ({
            id: er.id,
            eventName: er.event_name,
            eventType: er.event_type,
            eventDate: new Date(er.event_date).toLocaleDateString('tr-TR'),
            eventTime: er.event_time || undefined,
            numberOfGuests: er.number_of_guests,
            status: er.status,
            notes: er.notes || undefined
          })),
          restaurantReservations: restaurantReservations.map((rr: any) => ({
            id: rr.id,
            restaurantName: rr.restaurant_name,
            reservationDate: new Date(rr.reservation_date).toLocaleDateString('tr-TR'),
            reservationTime: rr.reservation_time,
            numberOfGuests: rr.number_of_guests,
            tableNumber: rr.table_number || undefined,
            status: rr.status,
            specialRequests: rr.special_requests || undefined
          })),
          aiAnalysis: aiAnalysis ? {
            behavior: aiAnalysis.behavior,
            preferences: aiAnalysis.preferences || [],
            suggestions: aiAnalysis.suggestions || [],
            satisfaction: aiAnalysis.satisfaction as 'high' | 'medium' | 'low',
            riskLevel: aiAnalysis.risk_level as 'low' | 'medium' | 'high'
          } : {
            behavior: 'Henüz analiz yapılmadı.',
            preferences: [],
            suggestions: [],
            satisfaction: 'medium',
            riskLevel: 'low'
          }
        };
      });

      setCustomers(customersWithRelations);
    } catch (err: any) {
      console.error('Müşteriler yüklenirken hata:', err);
      setError(err.message || 'Müşteriler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleAddGuest = async (newGuest: Customer) => {
    try {
      setError(null);

      // Ad ve soyadı ayır
      const nameParts = newGuest.name.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      if (!firstName || !lastName) {
        alert('Lütfen ad ve soyad bilgilerini girin');
        return;
      }

      // Tarihleri formatla
      const checkInDate = newGuest.checkIn ? new Date(newGuest.checkIn.split('.').reverse().join('-')) : null;
      const checkOutDate = newGuest.checkOut ? new Date(newGuest.checkOut.split('.').reverse().join('-')) : null;

      // Status'u belirle (check-out tarihine göre)
      let status = 'active';
      if (checkOutDate && checkOutDate < new Date()) {
        status = 'inactive';
      }

      // Müşteriyi ekle (yeni yapıda tüm bilgiler customers tablosunda)
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .insert({
          first_name: newGuest.firstName,
          last_name: newGuest.lastName,
          phone: newGuest.phone,
          email: newGuest.email || null,
          address: newGuest.address || null,
          room_number: newGuest.roomNumber || null,
          room_type: newGuest.roomType || null,
          check_in: checkInDate ? checkInDate.toISOString().split('T')[0] : null,
          check_out: checkOutDate ? checkOutDate.toISOString().split('T')[0] : null,
          nights: newGuest.nights || null,
          total_guests: newGuest.totalGuests || 1,
          status: status,
          total_reservations: newGuest.totalReservations || 1
        })
        .select()
        .single();

      if (customerError) throw customerError;

      const customerId = customerData.id;

      // AI Analizini ekle
      const { error: aiError } = await supabase
        .from('customer_ai_analysis')
        .insert({
          customer_id: customerId,
          behavior: newGuest.aiAnalysis.behavior,
          preferences: newGuest.aiAnalysis.preferences,
          suggestions: newGuest.aiAnalysis.suggestions,
          satisfaction: newGuest.aiAnalysis.satisfaction,
          risk_level: newGuest.aiAnalysis.riskLevel
        });

      if (aiError) throw aiError;

      // Müşterileri yeniden yükle
      await loadCustomers();
      setIsAddGuestModalOpen(false);
    } catch (err: any) {
      console.error('Müşteri eklenirken hata:', err);
      setError(err.message || 'Müşteri eklenirken bir hata oluştu');
      alert('Müşteri eklenirken bir hata oluştu: ' + (err.message || 'Bilinmeyen hata'));
    }
  };



  // Aktif müşterileri göster (status='active' ve check-out tarihi geçmemiş)
  const activeCustomers = customers.filter(c => {
    if (c.status === 'inactive') return false;
    if (c.checkOut) {
      const checkOutDate = new Date(c.checkOut.split('.').reverse().join('-'));
      return checkOutDate >= new Date();
    }
    return c.status === 'active';
  });

  const filteredCustomers = activeCustomers.filter(customer => {
    const matchesSearch = searchQuery === '' || 
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone.includes(searchQuery) ||
      (customer.email && customer.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (customer.roomNumber && customer.roomNumber.includes(searchQuery));
    return matchesSearch;
  });

  const stats = {
    total: activeCustomers.length,
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 dark:border-slate-100 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Müşteriler yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 lg:p-8 min-h-screen flex items-center justify-center">
        <div className="text-center bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl p-6 max-w-md">
          <AlertCircle className="w-12 h-12 text-red-600 dark:text-red-400 mx-auto mb-4" />
          <p className="text-red-700 dark:text-red-400 font-semibold mb-2">Hata</p>
          <p className="text-red-600 dark:text-red-500 text-sm">{error}</p>
          <button
            onClick={loadCustomers}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 min-h-screen">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-xl border border-slate-200/50 dark:border-slate-800/50 p-5 shadow-lg hover:shadow-xl transition-all">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2 font-medium">Aktif Konaklayan Müşteri</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-slate-50">{stats.total}</p>
        </div>
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-xl border border-slate-200/50 dark:border-slate-800/50 p-5 shadow-lg hover:shadow-xl transition-all">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2 font-medium">Toplam Oda</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-slate-50">{stats.total}</p>
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
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddGuestModalOpen(true)}
              className="flex items-center gap-2 px-4 py-3 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl font-semibold hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Yeni Konuk Ekle
            </button>
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
                    {customer.status === 'active' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold mt-1 bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400">
                        Aktif
                      </span>
                    )}
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

              {customer.roomNumber && (
                <div className="mb-4 p-3 bg-slate-900 dark:bg-slate-100 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Bed className="w-4 h-4 text-white dark:text-slate-900" />
                    <span className="text-sm font-semibold text-white dark:text-slate-900">Oda {customer.roomNumber}</span>
                  </div>
                  {customer.roomType && (
                    <p className="text-xs text-white/80 dark:text-slate-700">{customer.roomType}</p>
                  )}
                  {customer.checkIn && customer.checkOut && (
                    <p className="text-xs text-white/80 dark:text-slate-700 mt-1">
                      {customer.checkIn} - {customer.checkOut} {customer.nights && `(${customer.nights} gece)`}
                    </p>
                  )}
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
                <div className="w-12 h-12  bg-slate-900 dark:bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <User className="w-6 h-6 text-white dark:text-slate-900" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50">{customer.name}</h3>
                      {customer.status === 'active' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400">
                          Aktif
                        </span>
                      )}
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
                    {customer.roomNumber && (
                      <div className="flex items-center gap-2">
                        <Bed className="w-4 h-4" />
                        <span className="font-semibold text-slate-900 dark:text-slate-50">Oda {customer.roomNumber}</span>
                        {customer.roomType && (
                          <span className="text-xs">({customer.roomType})</span>
                        )}
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
          <User className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400 text-lg font-medium">Müşteri bulunamadı</p>
        </div>
      )}

      <CustomerDetailModal 
        customer={selectedCustomer} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />

      <AddGuestModal 
        isOpen={isAddGuestModalOpen}
        onClose={() => setIsAddGuestModalOpen(false)}
        onAdd={handleAddGuest}
      />
    </div>
  );
}
