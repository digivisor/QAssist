'use client';

import { 
  Bed,
  UtensilsCrossed,
  Sparkles,
  Ticket,
  Search,
  Calendar,
  Phone,
  CheckCircle2,
  XCircle,
  Clock
} from 'lucide-react';
import { useState } from 'react';

interface Reservation {
  id: number;
  type: 'room' | 'restaurant' | 'spa' | 'event';
  guest: string;
  contact: string;
  date: string;
  time: string;
  details: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  room?: string;
  guests?: number;
}

export default function Reservations({ type }: { type?: string }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'confirmed' | 'pending' | 'cancelled'>('all');

  const reservations: Reservation[] = [
    {
      id: 1,
      type: 'room',
      guest: 'Ahmet Yılmaz',
      contact: '+90 555 123 4567',
      date: '2024-01-15',
      time: '14:00',
      details: '2 kişi, 2 gece',
      status: 'confirmed',
      room: '201',
      guests: 2,
    },
    {
      id: 2,
      type: 'restaurant',
      guest: 'Ayşe Demir',
      contact: '+90 555 234 5678',
      date: '2024-01-15',
      time: '19:30',
      details: '4 kişi, masa 12',
      status: 'confirmed',
      guests: 4,
    },
    {
      id: 3,
      type: 'spa',
      guest: 'Mehmet Kaya',
      contact: '+90 555 345 6789',
      date: '2024-01-15',
      time: '16:00',
      details: 'Masaj, 90 dakika',
      status: 'pending',
      guests: 1,
    },
    {
      id: 4,
      type: 'event',
      guest: 'Zeynep Şahin',
      contact: '+90 555 456 7890',
      date: '2024-01-20',
      time: '20:00',
      details: 'Doğum günü partisi, 30 kişi',
      status: 'confirmed',
      guests: 30,
    },
    {
      id: 5,
      type: 'room',
      guest: 'Can Özkan',
      contact: '+90 555 567 8901',
      date: '2024-01-16',
      time: '15:00',
      details: '1 kişi, 1 gece',
      status: 'pending',
      room: '305',
      guests: 1,
    },
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'room':
        return Bed;
      case 'restaurant':
        return UtensilsCrossed;
      case 'spa':
        return Sparkles;
      case 'event':
        return Ticket;
      default:
        return Calendar;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'room':
        return 'Oda';
      case 'restaurant':
        return 'Restoran';
      case 'spa':
        return 'Spa';
      case 'event':
        return 'Etkinlik';
      default:
        return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'room':
        return 'bg-slate-700';
      case 'restaurant':
        return 'bg-orange-500';
      case 'spa':
        return 'bg-purple-500';
      case 'event':
        return 'bg-pink-500';
      default:
        return 'bg-slate-500';
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      confirmed: 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
      pending: 'bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800',
      cancelled: 'bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
    };
    
    const icons = {
      confirmed: CheckCircle2,
      pending: Clock,
      cancelled: XCircle,
    };

    const Icon = icons[status as keyof typeof icons];
    
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${styles[status as keyof typeof styles]}`}>
        <Icon className="w-3.5 h-3.5" />
        {status === 'confirmed' ? 'Onaylandı' : status === 'pending' ? 'Bekliyor' : 'İptal'}
      </span>
    );
  };

  const filteredReservations = reservations.filter(reservation => {
    const matchesType = !type || reservation.type === type;
    const matchesStatus = statusFilter === 'all' || reservation.status === statusFilter;
    const matchesSearch = searchQuery === '' || 
      reservation.guest.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reservation.contact.includes(searchQuery) ||
      (reservation.room && reservation.room.includes(searchQuery));
    return matchesType && matchesStatus && matchesSearch;
  });

  const stats = {
    all: reservations.filter(r => !type || r.type === type).length,
    confirmed: reservations.filter(r => (!type || r.type === type) && r.status === 'confirmed').length,
    pending: reservations.filter(r => (!type || r.type === type) && r.status === 'pending').length,
    cancelled: reservations.filter(r => (!type || r.type === type) && r.status === 'cancelled').length,
  };

  const pageTitle = type 
    ? getTypeLabel(type) + ' Rezervasyonları'
    : 'Tüm Rezervasyonlar';

  return (
    <div className="p-6 lg:p-8 min-h-screen">

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-xl border border-slate-200/50 dark:border-slate-800/50 p-5 shadow-lg hover:shadow-xl transition-all">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2 font-medium">Toplam</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-slate-50">{stats.all}</p>
        </div>
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-xl border border-slate-200/50 dark:border-slate-800/50 p-5 shadow-lg hover:shadow-xl transition-all">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2 font-medium">Onaylandı</p>
          <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{stats.confirmed}</p>
        </div>
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-xl border border-slate-200/50 dark:border-slate-800/50 p-5 shadow-lg hover:shadow-xl transition-all">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2 font-medium">Bekleyen</p>
          <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">{stats.pending}</p>
        </div>
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-xl border border-slate-200/50 dark:border-slate-800/50 p-5 shadow-lg hover:shadow-xl transition-all">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2 font-medium">İptal</p>
          <p className="text-3xl font-bold text-red-600 dark:text-red-400">{stats.cancelled}</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-200/50 dark:border-slate-800/50 p-5 shadow-lg mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Misafir, oda veya telefon ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'confirmed', 'pending', 'cancelled'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-5 py-3 rounded-xl text-sm font-semibold transition-all ${
                  statusFilter === status
                    ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-lg hover:bg-slate-800 dark:hover:bg-slate-200'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {status === 'all' ? 'Tümü' : status === 'confirmed' ? 'Onaylandı' : status === 'pending' ? 'Bekleyen' : 'İptal'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Reservations List */}
      <div className="space-y-4">
        {filteredReservations.map((reservation) => {
          const TypeIcon = getTypeIcon(reservation.type);
          const color = getTypeColor(reservation.type);
          
          return (
            <div 
              key={reservation.id} 
              className="group bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-200/50 dark:border-slate-800/50 p-6 shadow-lg hover:shadow-xl transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className={`p-4 rounded-xl ${color} shadow-lg`}>
                    <TypeIcon className="w-6 h-6 text-white" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50">
                        {reservation.guest}
                      </h3>
                      <span className="text-xs px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full font-semibold">
                        {getTypeLabel(reservation.type)}
                      </span>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <Calendar className="w-4 h-4" />
                        <span className="font-medium">{reservation.date} - {reservation.time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <Phone className="w-4 h-4" />
                        <span className="font-medium">{reservation.contact}</span>
                      </div>
                      {reservation.room && (
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                          <Bed className="w-4 h-4" />
                          <span className="font-medium">Oda {reservation.room}</span>
                        </div>
                      )}
                      <p className="text-sm text-slate-700 dark:text-slate-300 mt-2 font-medium">
                        {reservation.details}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-3">
                  {getStatusBadge(reservation.status)}
                  <button className="px-4 py-2 text-sm bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl font-semibold hover:bg-slate-800 dark:hover:bg-slate-200 hover:shadow-lg transition-all">
                    Detay
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredReservations.length === 0 && (
        <div className="text-center py-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-lg">
          <Calendar className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400 text-lg font-medium">Rezervasyon bulunamadı</p>
        </div>
      )}
    </div>
  );
}
