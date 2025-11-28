'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Search, Bell, User, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

interface Notification {
  id: number;
  title: string;
  message: string;
  time: string;
  type: 'success' | 'info' | 'warning';
  read: boolean;
}

const getPageTitle = (pathname: string): string => {
  const titles: { [key: string]: string } = {
    '/dashboard': 'Dashboard',
    '/tasks': 'Talepler & Görevler',
    '/reservations': 'Rezervasyonlar',
    '/reservations/room': 'Oda Rezervasyonları',
    '/reservations/restaurant': 'Restoran Rezervasyonları',
    '/reservations/spa': 'Spa Rezervasyonları',
    '/reservations/event': 'Etkinlik Rezervasyonları',
    '/customers': 'Müşteriler',
    '/customers/former': 'Eski Misafirler',
    '/rooms': 'Oda Durumu',
    '/personnel': 'Personel',
    '/messages': 'Mesajlar',
    '/info': 'Bilgiler',
    '/reports': 'Raporlar',
    '/settings': 'Ayarlar',
  };
  
  return titles[pathname] || 'Dashboard';
};

export default function Header() {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      title: 'Yeni Rezervasyon',
      message: 'Ahmet Yılmaz oda rezervasyonu yaptı',
      time: '5 dakika önce',
      type: 'success',
      read: false,
    },
    {
      id: 2,
      title: 'Talep Bekliyor',
      message: 'Oda 201 için havlu talebi bekliyor',
      time: '12 dakika önce',
      type: 'warning',
      read: false,
    },
    {
      id: 3,
      title: 'Rezervasyon Onaylandı',
      message: 'Restoran rezervasyonu onaylandı',
      time: '1 saat önce',
      type: 'info',
      read: true,
    },
  ]);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    };

    if (notificationsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [notificationsOpen]);

  const unreadCount = notifications.filter(n => !n.read).length;
  const pageTitle = getPageTitle(pathname || '/dashboard');

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-amber-500" />;
      default:
        return <Bell className="w-5 h-5 text-slate-600 dark:text-slate-400" />;
    }
  };

  const markAsRead = (id: number) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Left Side - Page Title */}
          <div className="flex-shrink-0">
            <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
              {pageTitle}
            </h1>
          </div>

          {/* Center - Search */}
          <div className="flex-1 max-w-md ml-auto mr-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Notifications */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <Bell className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Modal */}
              {notificationsOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl z-50">
                  <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-50">Bildirimler</h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 font-medium"
                      >
                        Tümünü okundu işaretle
                      </button>
                    )}
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center">
                        <Bell className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                        <p className="text-slate-600 dark:text-slate-400">Bildirim yok</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-200 dark:divide-slate-800">
                        {notifications.map((notification) => (
                          <div
                            key={notification.id}
                            onClick={() => markAsRead(notification.id)}
                            className={`p-4 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors ${
                              !notification.read ? 'bg-slate-100/50 dark:bg-slate-800/50' : ''
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="mt-0.5">
                                {getNotificationIcon(notification.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="font-semibold text-sm text-slate-900 dark:text-slate-50">
                                    {notification.title}
                                  </p>
                                  {!notification.read && (
                                    <span className="w-2 h-2 bg-slate-900 dark:bg-slate-100 rounded-full"></span>
                                  )}
                                </div>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-500">
                                  {notification.time}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile */}
            <div className="flex items-center gap-3 pl-3 border-l border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-900 dark:bg-slate-100 flex items-center justify-center">
                  <User className="w-5 h-5 text-white dark:text-slate-900" />
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                    Admin Kullanıcı
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    admin@qassist.com
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
