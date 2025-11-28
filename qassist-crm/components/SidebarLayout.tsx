'use client';

import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import ToastContainer from './Toast';
import { Menu } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function SidebarLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    // Mobile'da sidebar'ı varsayılan olarak kapalı tut
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar 
        isOpen={sidebarOpen}
        onToggle={toggleSidebar}
      />
      
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'ml-0'}`}>
        {/* Header */}
        <Header />
        
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          {/* Mobile menu button */}
          {!sidebarOpen && (
            <button
              onClick={toggleSidebar}
              className="fixed top-20 left-4 z-30 p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg hover:shadow-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all lg:hidden"
            >
              <Menu className="w-5 h-5 text-slate-700 dark:text-slate-300" />
            </button>
          )}

          {children}
        </main>
      </div>
      <ToastContainer />
    </div>
  );
}
