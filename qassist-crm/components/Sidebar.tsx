'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Calendar,
  Settings, 
  BarChart3,
  MessageSquare,
  Bed,
  UtensilsCrossed,
  Sparkles,
  Ticket,
  ClipboardList,
  Home,
  X,
  ChevronRight,
  History,
  FileText
} from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
  onToggle?: () => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { 
    id: 'reservations', 
    label: 'Rezervasyonlar', 
    icon: Calendar, 
    hasSubmenu: true,
    href: '/reservations'
  },
  { id: 'room-reservations', label: 'Oda Rezervasyonları', icon: Bed, parent: 'reservations', href: '/reservations/room' },
  { id: 'restaurant-reservations', label: 'Restoran Rezervasyonları', icon: UtensilsCrossed, parent: 'reservations', href: '/reservations/restaurant' },
  { id: 'spa-reservations', label: 'Spa Rezervasyonları', icon: Sparkles, parent: 'reservations', href: '/reservations/spa' },
  { id: 'event-reservations', label: 'Etkinlik Rezervasyonları', icon: Ticket, parent: 'reservations', href: '/reservations/event' },
  { id: 'tasks', label: 'Talepler & Görevler', icon: ClipboardList, href: '/tasks' },
  { 
    id: 'customers', 
    label: 'Müşteriler', 
    icon: Users, 
    hasSubmenu: true,
    href: '/customers'
  },
  { id: 'active-customers', label: 'Aktif Konuklar', icon: Users, parent: 'customers', href: '/customers' },
  { id: 'former-customers', label: 'Eski Misafirler', icon: History, parent: 'customers', href: '/customers/former' },
  { id: 'rooms', label: 'Oda Durumu', icon: Home, href: '/rooms' },
  { id: 'personnel', label: 'Personel', icon: Users, href: '/personnel' },
  { id: 'messages', label: 'Mesajlar', icon: MessageSquare, href: '/messages' },
  { id: 'info', label: 'Bilgiler', icon: FileText, href: '/info' },
  { id: 'reports', label: 'Raporlar', icon: BarChart3, href: '/reports' },
  { id: 'settings', label: 'Ayarlar', icon: Settings, href: '/settings' },
];

export default function Sidebar({ isOpen = true, onToggle }: SidebarProps) {
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['reservations']);
  const pathname = usePathname();

  const toggleSubmenu = (menuId: string) => {
    setExpandedMenus(prev => 
      prev.includes(menuId) 
        ? prev.filter(id => id !== menuId)
        : [...prev, menuId]
    );
  };

  const mainMenuItems = menuItems.filter(item => !item.parent);
  const subMenuItems = menuItems.filter(item => item.parent);

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/' || pathname === '/dashboard';
    }
    return pathname === href || pathname?.startsWith(href + '/');
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={onToggle}
        />
      )}

      <aside className={`
        fixed top-0 left-0 h-screen bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl
        border-r border-slate-200/50 dark:border-slate-800/50
        transition-transform duration-300 z-50 overflow-y-auto
        shadow-xl lg:shadow-2xl
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        w-64
      `}>
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-slate-100 flex items-center justify-center shadow-lg">
                <span className="text-white dark:text-slate-900 font-bold text-lg">Q</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900 dark:text-slate-50">
                  QAssist CRM
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">Otel Yönetim</p>
              </div>
            </div>
            <button
              onClick={onToggle}
              className="lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </button>
          </div>
          
          <nav className="space-y-1.5">
            {mainMenuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href || '');
              const hasActiveChild = subMenuItems.some(subItem => 
                subItem.parent === item.id && isActive(subItem.href || '')
              );
              const isExpanded = expandedMenus.includes(item.id);
              
              return (
                <div key={item.id}>
                  {item.hasSubmenu ? (
                    <button
                      onClick={() => toggleSubmenu(item.id)}
                      className={`
                        w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all
                        ${active || hasActiveChild
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-50 shadow-sm' 
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                        }
                      `}
                    >
                      <Icon className={`w-5 h-5 flex-shrink-0 ${active || hasActiveChild ? 'text-slate-900 dark:text-slate-50' : ''}`} />
                      <span className={`font-medium flex-1 ${active || hasActiveChild ? 'text-slate-900 dark:text-slate-50' : ''}`}>
                        {item.label}
                      </span>
                      <ChevronRight className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''} ${active || hasActiveChild ? 'text-slate-900 dark:text-slate-50' : 'text-slate-400'}`} />
                    </button>
                  ) : (
                    <Link
                      href={item.href || '#'}
                      className={`
                        w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all
                        ${active
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-50 shadow-sm' 
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                        }
                      `}
                    >
                      <Icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-slate-900 dark:text-slate-50' : ''}`} />
                      <span className={`font-medium ${active ? 'text-slate-900 dark:text-slate-50' : ''}`}>
                        {item.label}
                      </span>
                    </Link>
                  )}
                  
                  {/* Submenu */}
                  {item.hasSubmenu && isExpanded && (
                    <div className="ml-4 mt-1.5 space-y-1 border-l-2 border-slate-200 dark:border-slate-800 pl-4">
                      {subMenuItems
                        .filter(subItem => subItem.parent === item.id)
                        .map((subItem) => {
                          const SubIcon = subItem.icon;
                          const subActive = isActive(subItem.href || '');
                          
                          return (
                            <Link
                              key={subItem.id}
                              href={subItem.href || '#'}
                              className={`
                                w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-left transition-all text-sm
                                ${subActive
                                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-50 font-medium' 
                                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                                }
                              `}
                            >
                              <SubIcon className={`w-4 h-4 flex-shrink-0 ${subActive ? 'text-slate-900 dark:text-slate-50' : ''}`} />
                              <span>{subItem.label}</span>
                            </Link>
                          );
                        })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}
