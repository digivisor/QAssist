'use client';

import { 
  Users, 
  Calendar, 
  TrendingUp, 
  DollarSign,
  ArrowUpRight,
  ClipboardList,
  Bed,
  Clock,
  CheckCircle2,
  Activity
} from 'lucide-react';
import Link from 'next/link';

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: React.ElementType;
  color: string;
}

function StatCard({ title, value, change, trend, icon: Icon, color }: StatCardProps) {
  return (
    <div className="group relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-200/50 dark:border-slate-800/50 p-6 shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl ${color} shadow-lg`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          {trend === 'up' ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg">
              <ArrowUpRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{change}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-50 dark:bg-red-950/30 rounded-lg">
              <ArrowUpRight className="w-4 h-4 rotate-180 text-red-600 dark:text-red-400" />
              <span className="text-sm font-semibold text-red-600 dark:text-red-400">{change}</span>
            </div>
          )}
        </div>
        <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-1.5">
          {value}
        </h3>
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{title}</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const stats = [
    {
      title: 'Bugünkü Rezervasyonlar',
      value: '24',
      change: '+8%',
      trend: 'up' as const,
      icon: Calendar,
      color: 'bg-slate-700',
    },
    {
      title: 'Aktif Misafirler',
      value: '156',
      change: '+12%',
      trend: 'up' as const,
      icon: Users,
      color: 'bg-indigo-500',
    },
    {
      title: 'Bekleyen Talepler',
      value: '8',
      change: '-3%',
      trend: 'down' as const,
      icon: ClipboardList,
      color: 'bg-amber-500',
    },
    {
      title: 'Doluluk Oranı',
      value: '78%',
      change: '+5%',
      trend: 'up' as const,
      icon: Bed,
      color: 'bg-emerald-500',
    },
  ];

  const recentTasks = [
    { id: 1, room: '201', request: 'Odaya havlu istiyorum', time: '5 dakika önce', status: 'pending' },
    { id: 2, room: '305', request: 'Ekstra yastık', time: '12 dakika önce', status: 'in-progress' },
    { id: 3, room: '102', request: 'Oda servisi - Kahvaltı', time: '18 dakika önce', status: 'completed' },
    { id: 4, room: '408', request: 'WiFi şifresi', time: '25 dakika önce', status: 'pending' },
  ];

  const upcomingReservations = [
    { id: 1, guest: 'Ahmet Yılmaz', room: '201', checkIn: '14:00', checkOut: '12:00', type: 'Oda' },
    { id: 2, guest: 'Ayşe Demir', room: 'Restoran', time: '19:30', type: 'Restoran' },
    { id: 3, guest: 'Mehmet Kaya', room: 'Spa', time: '16:00', type: 'Spa' },
  ];

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800',
      'in-progress': 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
      completed: 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    };
    
    const icons = {
      pending: Clock,
      'in-progress': Activity,
      completed: CheckCircle2,
    };

    const Icon = icons[status as keyof typeof icons];
    
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${styles[status as keyof typeof styles]}`}>
        <Icon className="w-3.5 h-3.5" />
        {status === 'pending' ? 'Bekliyor' : status === 'in-progress' ? 'Devam Ediyor' : 'Tamamlandı'}
      </span>
    );
  };

  return (
    <div className="p-6 lg:p-8 min-h-screen">

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Son Talepler */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-200/50 dark:border-slate-800/50 p-6 shadow-lg hover:shadow-xl transition-all">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-1">
                Son Talepler
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">Yakın zamandaki müşteri talepleri</p>
            </div>
            <Link 
              href="/tasks"
              className="px-4 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl text-sm font-semibold hover:bg-slate-800 dark:hover:bg-slate-200 hover:shadow-lg transition-all"
            >
              Tümünü Gör
            </Link>
          </div>
          <div className="space-y-3">
            {recentTasks.map((task) => (
              <div 
                key={task.id} 
                className="group flex items-start justify-between gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl hover:shadow-md transition-all border border-slate-200/50 dark:border-slate-700/50"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-50">
                      Oda {task.room}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300 mb-2 font-medium">
                    {task.request}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-500 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {task.time}
                  </p>
                </div>
                {getStatusBadge(task.status)}
              </div>
            ))}
          </div>
        </div>

        {/* Yaklaşan Rezervasyonlar */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-200/50 dark:border-slate-800/50 p-6 shadow-lg hover:shadow-xl transition-all">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-1">
                Yaklaşan Rezervasyonlar
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">Bugün ve yarın için planlananlar</p>
            </div>
            <Link 
              href="/reservations"
              className="px-4 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl text-sm font-semibold hover:bg-slate-800 dark:hover:bg-slate-200 hover:shadow-lg transition-all"
            >
              Tümünü Gör
            </Link>
          </div>
          <div className="space-y-3">
            {upcomingReservations.map((reservation) => (
              <div 
                key={reservation.id} 
                className="group p-4 bg-gradient-to-r from-slate-50 to-slate-100/50 dark:from-slate-800/50 dark:to-slate-800/30 rounded-xl hover:shadow-md transition-all border border-slate-200/50 dark:border-slate-700/50"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-50 mb-1">
                      {reservation.guest}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-500 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {reservation.type} - {reservation.room}
                    </p>
                  </div>
                  <span className="text-xs px-3 py-1.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg font-semibold shadow-sm">
                    {reservation.checkIn || reservation.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
