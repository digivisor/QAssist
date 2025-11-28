'use client';

import {
  Search,
  Bed,
  Users,
  Phone,
  AlertCircle,
  MessageSquare,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  MoreVertical,
  X,
  Filter,
  LayoutGrid,
  List
} from 'lucide-react';
import { useState } from 'react';

interface Complaint {
  id: number;
  topic: string;
  description: string;
  date: string;
  status: 'pending' | 'resolved' | 'in-progress';
  priority: 'low' | 'medium' | 'high';
}

interface Guest {
  id: number;
  name: string;
  phone: string;
  checkIn: string;
  checkOut: string;
  nights: number;
}

interface Room {
  id: number;
  number: string;
  type: string;
  floor: number;
  status: 'occupied' | 'vacant' | 'maintenance' | 'cleaning';
  capacity: number;
  currentGuests: number;
  guests: Guest[];
  complaints: Complaint[];
  lastCleaned?: string;
  nextCleaning?: string;
}

function RoomDetailModal({ room, isOpen, onClose }: { room: Room | null; isOpen: boolean; onClose: () => void }) {
  if (!isOpen || !room) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'occupied':
        return 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-50';
      case 'vacant':
        return 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400';
      case 'maintenance':
        return 'bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400';
      case 'cleaning':
        return 'bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'occupied':
        return 'Dolu';
      case 'vacant':
        return 'Boş';
      case 'maintenance':
        return 'Bakımda';
      case 'cleaning':
        return 'Temizlik';
      default:
        return status;
    }
  };

  const getComplaintPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400';
      case 'medium':
        return 'bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400';
      case 'low':
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300';
    }
  };

  const getComplaintStatusColor = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400';
      case 'in-progress':
        return 'bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400';
      case 'pending':
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            Oda {room.number} Detayları
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Room Info */}
          <div className="mb-6">
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Oda Numarası</p>
                  <p className="text-lg font-semibold text-slate-900 dark:text-slate-50">{room.number}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Oda Tipi</p>
                  <p className="text-lg font-semibold text-slate-900 dark:text-slate-50">{room.type}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Kat</p>
                  <p className="text-lg font-semibold text-slate-900 dark:text-slate-50">{room.floor}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Durum</p>
                  <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(room.status)}`}>
                    {getStatusText(room.status)}
                  </span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <Users className="w-4 h-4" />
                  <span className="text-sm">
                    {room.currentGuests} / {room.capacity} kişi
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Guests */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-4">Konuklar</h3>
            {room.guests.length === 0 ? (
              <p className="text-slate-600 dark:text-slate-400 text-sm">Bu odada konuk bulunmuyor.</p>
            ) : (
              <div className="space-y-3">
                {room.guests.map((guest) => (
                  <div
                    key={guest.id}
                    className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-800"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900 dark:text-slate-50 mb-1">{guest.name}</p>
                        <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            <span>{guest.phone}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>{guest.checkIn} - {guest.checkOut}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{guest.nights} gece</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Complaints */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-4">Şikayetler</h3>
            {room.complaints.length === 0 ? (
              <p className="text-slate-600 dark:text-slate-400 text-sm">Bu oda için şikayet bulunmuyor.</p>
            ) : (
              <div className="space-y-3">
                {room.complaints.map((complaint) => (
                  <div
                    key={complaint.id}
                    className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-800"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900 dark:text-slate-50 mb-1">{complaint.topic}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{complaint.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getComplaintPriorityColor(complaint.priority)}`}>
                        {complaint.priority === 'high' ? 'Yüksek' : complaint.priority === 'medium' ? 'Orta' : 'Düşük'} Öncelik
                      </span>
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getComplaintStatusColor(complaint.status)}`}>
                        {complaint.status === 'resolved' ? 'Çözüldü' : complaint.status === 'in-progress' ? 'Devam Ediyor' : 'Bekliyor'}
                      </span>
                      <span className="text-xs text-slate-600 dark:text-slate-400">
                        {complaint.date}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Rooms() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const [rooms] = useState<Room[]>([
    {
      id: 1,
      number: '101',
      type: 'Standart',
      floor: 1,
      status: 'occupied',
      capacity: 2,
      currentGuests: 2,
      guests: [
        {
          id: 1,
          name: 'Ahmet Yılmaz',
          phone: '+90 555 123 4567',
          checkIn: '13.11.2025',
          checkOut: '16.11.2025',
          nights: 3,
        },
        {
          id: 2,
          name: 'Ayşe Yılmaz',
          phone: '+90 555 123 4567',
          checkIn: '13.11.2025',
          checkOut: '16.11.2025',
          nights: 3,
        },
      ],
      complaints: [
        {
          id: 1,
          topic: 'Klima Çalışmıyor',
          description: 'Oda kliması çalışmıyor, çok sıcak.',
          date: '14.11.2025 10:30',
          status: 'in-progress',
          priority: 'high',
        },
      ],
      lastCleaned: '13.11.2025 08:00',
      nextCleaning: '16.11.2025 12:00',
    },
    {
      id: 2,
      number: '102',
      type: 'Deluxe',
      floor: 1,
      status: 'occupied',
      capacity: 3,
      currentGuests: 1,
      guests: [
        {
          id: 3,
          name: 'Mehmet Demir',
          phone: '+90 555 234 5678',
          checkIn: '12.11.2025',
          checkOut: '18.11.2025',
          nights: 6,
        },
      ],
      complaints: [],
      lastCleaned: '12.11.2025 08:00',
      nextCleaning: '18.11.2025 12:00',
    },
    {
      id: 3,
      number: '201',
      type: 'Suite',
      floor: 2,
      status: 'occupied',
      capacity: 4,
      currentGuests: 4,
      guests: [
        {
          id: 4,
          name: 'Ali Kaya',
          phone: '+90 555 345 6789',
          checkIn: '14.11.2025',
          checkOut: '17.11.2025',
          nights: 3,
        },
        {
          id: 5,
          name: 'Fatma Kaya',
          phone: '+90 555 345 6789',
          checkIn: '14.11.2025',
          checkOut: '17.11.2025',
          nights: 3,
        },
        {
          id: 6,
          name: 'Can Kaya',
          phone: '+90 555 345 6789',
          checkIn: '14.11.2025',
          checkOut: '17.11.2025',
          nights: 3,
        },
        {
          id: 7,
          name: 'Zeynep Kaya',
          phone: '+90 555 345 6789',
          checkIn: '14.11.2025',
          checkOut: '17.11.2025',
          nights: 3,
        },
      ],
      complaints: [
        {
          id: 2,
          topic: 'Gürültü',
          description: 'Üst kattan gelen gürültü rahatsız ediyor.',
          date: '15.11.2025 14:20',
          status: 'pending',
          priority: 'medium',
        },
        {
          id: 3,
          topic: 'WiFi Sorunu',
          description: 'WiFi bağlantısı çok yavaş.',
          date: '15.11.2025 09:15',
          status: 'resolved',
          priority: 'low',
        },
      ],
      lastCleaned: '14.11.2025 08:00',
      nextCleaning: '17.11.2025 12:00',
    },
    {
      id: 4,
      number: '202',
      type: 'Standart',
      floor: 2,
      status: 'vacant',
      capacity: 2,
      currentGuests: 0,
      guests: [],
      complaints: [],
      lastCleaned: '15.11.2025 10:00',
      nextCleaning: '16.11.2025 12:00',
    },
    {
      id: 5,
      number: '301',
      type: 'Deluxe',
      floor: 3,
      status: 'cleaning',
      capacity: 3,
      currentGuests: 0,
      guests: [],
      complaints: [],
      lastCleaned: '15.11.2025 11:00',
      nextCleaning: '15.11.2025 15:00',
    },
    {
      id: 6,
      number: '302',
      type: 'Standart',
      floor: 3,
      status: 'maintenance',
      capacity: 2,
      currentGuests: 0,
      guests: [],
      complaints: [],
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'occupied':
        return 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-50';
      case 'vacant':
        return 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400';
      case 'maintenance':
        return 'bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400';
      case 'cleaning':
        return 'bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'occupied':
        return 'Dolu';
      case 'vacant':
        return 'Boş';
      case 'maintenance':
        return 'Bakımda';
      case 'cleaning':
        return 'Temizlik';
      default:
        return status;
    }
  };

  const filteredRooms = rooms.filter((room) => {
    const matchesSearch = room.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || room.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: rooms.length,
    occupied: rooms.filter((r) => r.status === 'occupied').length,
    vacant: rooms.filter((r) => r.status === 'vacant').length,
    maintenance: rooms.filter((r) => r.status === 'maintenance').length,
    cleaning: rooms.filter((r) => r.status === 'cleaning').length,
    totalGuests: rooms.reduce((sum, r) => sum + r.currentGuests, 0),
    totalComplaints: rooms.reduce((sum, r) => sum + r.complaints.length, 0),
  };

  const handleRoomClick = (room: Room) => {
    setSelectedRoom(room);
    setIsDetailModalOpen(true);
  };

  return (
    <div className="p-6 lg:p-8 min-h-screen">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Toplam Oda</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">{stats.total}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Dolu</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">{stats.occupied}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Boş</p>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.vacant}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Temizlik</p>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.cleaning}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Bakımda</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.maintenance}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Toplam Konuk</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">{stats.totalGuests}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Şikayetler</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.totalComplaints}</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Oda numarası veya tip ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-4 py-3 rounded-xl font-medium transition-colors ${
              statusFilter === 'all'
                ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
            }`}
          >
            Tümü
          </button>
          <button
            onClick={() => setStatusFilter('occupied')}
            className={`px-4 py-3 rounded-xl font-medium transition-colors ${
              statusFilter === 'occupied'
                ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
            }`}
          >
            Dolu
          </button>
          <button
            onClick={() => setStatusFilter('vacant')}
            className={`px-4 py-3 rounded-xl font-medium transition-colors ${
              statusFilter === 'vacant'
                ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
            }`}
          >
            Boş
          </button>
          <button
            onClick={() => setStatusFilter('cleaning')}
            className={`px-4 py-3 rounded-xl font-medium transition-colors ${
              statusFilter === 'cleaning'
                ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
            }`}
          >
            Temizlik
          </button>
          <button
            onClick={() => setStatusFilter('maintenance')}
            className={`px-4 py-3 rounded-xl font-medium transition-colors ${
              statusFilter === 'maintenance'
                ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
            }`}
          >
            Bakımda
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-3 rounded-xl transition-colors ${
              viewMode === 'grid'
                ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
            }`}
          >
            <LayoutGrid className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-3 rounded-xl transition-colors ${
              viewMode === 'list'
                ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
            }`}
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Rooms List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredRooms.map((room) => (
            <div
              key={room.id}
              onClick={() => handleRoomClick(room)}
              className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 cursor-pointer hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-1">Oda {room.number}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{room.type}</p>
                </div>
                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(room.status)}`}>
                  {getStatusText(room.status)}
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <Users className="w-4 h-4" />
                  <span className="text-sm">{room.currentGuests} / {room.capacity} kişi</span>
                </div>
                {room.complaints.length > 0 && (
                  <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">{room.complaints.length} şikayet</span>
                  </div>
                )}
                {room.lastCleaned && (
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">Son temizlik: {room.lastCleaned}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRooms.map((room) => (
            <div
              key={room.id}
              onClick={() => handleRoomClick(room)}
              className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 cursor-pointer hover:shadow-lg transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6 flex-1">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50 mb-1">Oda {room.number}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{room.type} • Kat {room.floor}</p>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">{room.currentGuests} / {room.capacity} kişi</span>
                  </div>
                  {room.complaints.length > 0 && (
                    <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm">{room.complaints.length} şikayet</span>
                    </div>
                  )}
                </div>
                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(room.status)}`}>
                  {getStatusText(room.status)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <RoomDetailModal
        room={selectedRoom}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
      />
    </div>
  );
}




