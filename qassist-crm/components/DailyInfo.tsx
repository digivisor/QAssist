'use client';

import { 
  Calendar,
  Clock,
  UtensilsCrossed,
  Coffee,
  Sun,
  Moon,
  Plus,
  X,
  Edit,
  Trash2,
  Save,
  Building2,
  ChefHat
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import React from 'react';

interface Event {
  id: string;
  time: string; // "07:00-23:59" formatında
  name: string;
  location?: string;
  description?: string;
}

interface Restaurant {
  id: string;
  name: string;
  openTime: string; // "07:00" formatında
  closeTime: string; // "23:59" formatında
  isOpen: boolean;
  menuType?: string; // "breakfast", "lunch", "dinner", "snack"
}

interface Menu {
  type: string; // "breakfast", "lunch", "dinner", "snack"
  name: string;
  items: string[]; // Menü öğeleri array'i
}

interface DailyInfo {
  id?: number;
  date: string; // YYYY-MM-DD formatında
  events: Event[];
  restaurants: Restaurant[];
  menus: { [key: string]: Menu }; // type -> Menu mapping
  notes?: string;
}

function EventItem({ 
  event, 
  onEdit, 
  onDelete 
}: { 
  event: Event; 
  onEdit: (event: Event) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
      <div className="flex-1">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-50">
            <Clock className="w-4 h-4 text-slate-400" />
            <span>{event.time}</span>
          </div>
          <span className="text-base font-semibold text-slate-900 dark:text-slate-50">
            {event.name}
          </span>
          {event.location && (
            <span className="text-sm text-slate-500 dark:text-slate-400">
              - {event.location}
            </span>
          )}
        </div>
        {event.description && (
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 ml-7">
            {event.description}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onEdit(event)}
          className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
        >
          <Edit className="w-4 h-4 text-slate-400" />
        </button>
        <button
          onClick={() => onDelete(event.id)}
          className="p-1.5 hover:bg-red-100 dark:hover:bg-red-950/30 rounded transition-colors"
        >
          <Trash2 className="w-4 h-4 text-red-400" />
        </button>
      </div>
    </div>
  );
}

function RestaurantItem({ 
  restaurant, 
  onEdit, 
  onDelete 
}: { 
  restaurant: Restaurant; 
  onEdit: (restaurant: Restaurant) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
      <div className="flex-1">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${restaurant.isOpen ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
            <span className="text-base font-semibold text-slate-900 dark:text-slate-50">
              {restaurant.name}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <Clock className="w-3 h-3" />
            <span>{restaurant.openTime} - {restaurant.closeTime}</span>
          </div>
          {restaurant.menuType && (
            <span className="text-xs px-2 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-slate-600 dark:text-slate-300">
              {restaurant.menuType === 'breakfast' ? 'Kahvaltı' : 
               restaurant.menuType === 'lunch' ? 'Öğle Yemeği' :
               restaurant.menuType === 'dinner' ? 'Akşam Yemeği' :
               restaurant.menuType === 'snack' ? 'Atıştırmalık' : restaurant.menuType}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onEdit(restaurant)}
          className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
        >
          <Edit className="w-4 h-4 text-slate-400" />
        </button>
        <button
          onClick={() => onDelete(restaurant.id)}
          className="p-1.5 hover:bg-red-100 dark:hover:bg-red-950/30 rounded transition-colors"
        >
          <Trash2 className="w-4 h-4 text-red-400" />
        </button>
      </div>
    </div>
  );
}

function MenuItem({ 
  menu, 
  onEdit, 
  onDelete 
}: { 
  menu: Menu; 
  onEdit: (menu: Menu) => void;
  onDelete: (type: string) => void;
}) {
  const getMenuIcon = (type: string) => {
    switch (type) {
      case 'breakfast':
        return <Coffee className="w-4 h-4" />;
      case 'lunch':
        return <Sun className="w-4 h-4" />;
      case 'dinner':
        return <Moon className="w-4 h-4" />;
      default:
        return <ChefHat className="w-4 h-4" />;
    }
  };

  const getMenuName = (type: string) => {
    switch (type) {
      case 'breakfast':
        return 'Kahvaltı Menüsü';
      case 'lunch':
        return 'Öğle Yemeği Menüsü';
      case 'dinner':
        return 'Akşam Yemeği Menüsü';
      case 'snack':
        return 'Atıştırmalık Menüsü';
      default:
        return menu.name || 'Menü';
    }
  };

  return (
    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {getMenuIcon(menu.type)}
          <h4 className="font-semibold text-slate-900 dark:text-slate-50">
            {getMenuName(menu.type)}
          </h4>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(menu)}
            className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
          >
            <Edit className="w-4 h-4 text-slate-400" />
          </button>
          <button
            onClick={() => onDelete(menu.type)}
            className="p-1.5 hover:bg-red-100 dark:hover:bg-red-950/30 rounded transition-colors"
          >
            <Trash2 className="w-4 h-4 text-red-400" />
          </button>
        </div>
      </div>
      <ul className="space-y-1 ml-6">
        {menu.items.map((item, index) => (
          <li key={index} className="text-sm text-slate-600 dark:text-slate-400">
            • {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function EventModal({ 
  event, 
  isOpen, 
  onClose, 
  onSave 
}: { 
  event: Event | null; 
  isOpen: boolean; 
  onClose: () => void;
  onSave: (event: Event) => void;
}) {
  const [formData, setFormData] = useState({
    time: '',
    name: '',
    location: '',
    description: '',
  });

  useEffect(() => {
    if (event) {
      setFormData({
        time: event.time,
        name: event.name,
        location: event.location || '',
        description: event.description || '',
      });
    } else {
      setFormData({
        time: '',
        name: '',
        location: '',
        description: '',
      });
    }
  }, [event, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.time || !formData.name) {
      alert('Lütfen saat ve etkinlik adını girin');
      return;
    }

    onSave({
      id: event?.id || Date.now().toString(),
      time: formData.time,
      name: formData.name,
      location: formData.location || undefined,
      description: formData.description || undefined,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-4">
            {event ? 'Etkinlik Düzenle' : 'Yeni Etkinlik Ekle'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Saat Aralığı * (örn: 07:00-23:59)
              </label>
              <input
                type="text"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                placeholder="07:00-23:59"
                className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Etkinlik Adı *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Konum
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Açıklama
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600"
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                İptal
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg font-semibold hover:bg-slate-800 dark:hover:bg-slate-200"
              >
                Kaydet
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function RestaurantModal({ 
  restaurant, 
  isOpen, 
  onClose, 
  onSave 
}: { 
  restaurant: Restaurant | null; 
  isOpen: boolean; 
  onClose: () => void;
  onSave: (restaurant: Restaurant) => void;
}) {
  const [formData, setFormData] = useState({
    name: '',
    openTime: '',
    closeTime: '',
    isOpen: true,
    menuType: '',
  });

  useEffect(() => {
    if (restaurant) {
      setFormData({
        name: restaurant.name,
        openTime: restaurant.openTime,
        closeTime: restaurant.closeTime,
        isOpen: restaurant.isOpen,
        menuType: restaurant.menuType || '',
      });
    } else {
      setFormData({
        name: '',
        openTime: '',
        closeTime: '',
        isOpen: true,
        menuType: '',
      });
    }
  }, [restaurant, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.openTime || !formData.closeTime) {
      alert('Lütfen zorunlu alanları doldurun');
      return;
    }

    onSave({
      id: restaurant?.id || Date.now().toString(),
      name: formData.name,
      openTime: formData.openTime,
      closeTime: formData.closeTime,
      isOpen: formData.isOpen,
      menuType: formData.menuType || undefined,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-4">
            {restaurant ? 'Restoran Düzenle' : 'Yeni Restoran Ekle'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Restoran Adı *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Açılış Saati * (örn: 07:00)
                </label>
                <input
                  type="text"
                  value={formData.openTime}
                  onChange={(e) => setFormData({ ...formData, openTime: e.target.value })}
                  placeholder="07:00"
                  className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Kapanış Saati * (örn: 23:59)
                </label>
                <input
                  type="text"
                  value={formData.closeTime}
                  onChange={(e) => setFormData({ ...formData, closeTime: e.target.value })}
                  placeholder="23:59"
                  className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Menü Tipi
              </label>
              <select
                value={formData.menuType}
                onChange={(e) => setFormData({ ...formData, menuType: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600"
              >
                <option value="">Seçiniz</option>
                <option value="breakfast">Kahvaltı</option>
                <option value="lunch">Öğle Yemeği</option>
                <option value="dinner">Akşam Yemeği</option>
                <option value="snack">Atıştırmalık</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isOpen"
                checked={formData.isOpen}
                onChange={(e) => setFormData({ ...formData, isOpen: e.target.checked })}
                className="w-4 h-4 rounded border-slate-300 dark:border-slate-700"
              />
              <label htmlFor="isOpen" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Açık
              </label>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                İptal
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg font-semibold hover:bg-slate-800 dark:hover:bg-slate-200"
              >
                Kaydet
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function MenuModal({ 
  menu, 
  isOpen, 
  onClose, 
  onSave 
}: { 
  menu: Menu | null; 
  isOpen: boolean; 
  onClose: () => void;
  onSave: (menu: Menu) => void;
}) {
  const [formData, setFormData] = useState({
    type: '',
    name: '',
    items: [''],
  });

  useEffect(() => {
    if (menu) {
      setFormData({
        type: menu.type,
        name: menu.name || '',
        items: menu.items.length > 0 ? menu.items : [''],
      });
    } else {
      setFormData({
        type: '',
        name: '',
        items: [''],
      });
    }
  }, [menu, isOpen]);

  const handleAddItem = () => {
    setFormData({ ...formData, items: [...formData.items, ''] });
  };

  const handleItemChange = (index: number, value: string) => {
    const newItems = [...formData.items];
    newItems[index] = value;
    setFormData({ ...formData, items: newItems });
  };

  const handleRemoveItem = (index: number) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems.length > 0 ? newItems : [''] });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.type) {
      alert('Lütfen menü tipini seçin');
      return;
    }

    const filteredItems = formData.items.filter(item => item.trim() !== '');
    if (filteredItems.length === 0) {
      alert('Lütfen en az bir menü öğesi ekleyin');
      return;
    }

    onSave({
      type: formData.type,
      name: formData.name || formData.type,
      items: filteredItems,
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
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-4">
            {menu ? 'Menü Düzenle' : 'Yeni Menü Ekle'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Menü Tipi *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600"
                required
              >
                <option value="">Seçiniz</option>
                <option value="breakfast">Kahvaltı</option>
                <option value="lunch">Öğle Yemeği</option>
                <option value="dinner">Akşam Yemeği</option>
                <option value="snack">Atıştırmalık</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Menü Adı
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Menü Öğeleri *
                </label>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Öğe Ekle
                </button>
              </div>
              <div className="space-y-2">
                {formData.items.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => handleItemChange(index, e.target.value)}
                      placeholder={`Menü öğesi ${index + 1}`}
                      className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600"
                    />
                    {formData.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="p-2 hover:bg-red-100 dark:hover:bg-red-950/30 rounded transition-colors"
                      >
                        <X className="w-4 h-4 text-red-400" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                İptal
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg font-semibold hover:bg-slate-800 dark:hover:bg-slate-200"
              >
                Kaydet
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function DailyInfo() {
  const [dailyInfo, setDailyInfo] = useState<DailyInfo>({
    date: new Date().toISOString().split('T')[0],
    events: [],
    restaurants: [],
    menus: {},
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Modal states
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isRestaurantModalOpen, setIsRestaurantModalOpen] = useState(false);
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null);
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null);

  useEffect(() => {
    loadDailyInfo();
  }, [selectedDate]);

  const loadDailyInfo = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('daily_info')
        .select('*')
        .eq('date', selectedDate)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setDailyInfo({
          id: data.id,
          date: data.date,
          events: data.events || [],
          restaurants: data.restaurants || [],
          menus: data.menus || {},
          notes: data.notes || undefined,
        });
      } else {
        // Yeni kayıt oluştur
        setDailyInfo({
          date: selectedDate,
          events: [],
          restaurants: [],
          menus: {},
        });
      }
    } catch (error) {
      console.error('Daily info yükleme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const dataToSave = {
        date: selectedDate,
        events: dailyInfo.events,
        restaurants: dailyInfo.restaurants,
        menus: dailyInfo.menus,
        notes: dailyInfo.notes || null,
      };

      if (dailyInfo.id) {
        // Güncelle
        const { error } = await supabase
          .from('daily_info')
          .update(dataToSave)
          .eq('id', dailyInfo.id);

        if (error) throw error;
      } else {
        // Yeni ekle
        const { data, error } = await supabase
          .from('daily_info')
          .insert(dataToSave)
          .select()
          .single();

        if (error) throw error;
        if (data) {
          setDailyInfo({ ...dailyInfo, id: data.id });
        }
      }

      alert('Bilgiler kaydedildi!');
    } catch (error) {
      console.error('Daily info kaydetme hatası:', error);
      alert('Bilgiler kaydedilirken bir hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  const handleAddEvent = (event: Event) => {
    if (editingEvent) {
      setDailyInfo({
        ...dailyInfo,
        events: dailyInfo.events.map(e => e.id === event.id ? event : e),
      });
      setEditingEvent(null);
    } else {
      setDailyInfo({
        ...dailyInfo,
        events: [...dailyInfo.events, event],
      });
    }
    setIsEventModalOpen(false);
  };

  const handleDeleteEvent = (id: string) => {
    setDailyInfo({
      ...dailyInfo,
      events: dailyInfo.events.filter(e => e.id !== id),
    });
  };

  const handleAddRestaurant = (restaurant: Restaurant) => {
    if (editingRestaurant) {
      setDailyInfo({
        ...dailyInfo,
        restaurants: dailyInfo.restaurants.map(r => r.id === restaurant.id ? restaurant : r),
      });
      setEditingRestaurant(null);
    } else {
      setDailyInfo({
        ...dailyInfo,
        restaurants: [...dailyInfo.restaurants, restaurant],
      });
    }
    setIsRestaurantModalOpen(false);
  };

  const handleDeleteRestaurant = (id: string) => {
    setDailyInfo({
      ...dailyInfo,
      restaurants: dailyInfo.restaurants.filter(r => r.id !== id),
    });
  };

  const handleAddMenu = (menu: Menu) => {
    if (editingMenu) {
      setDailyInfo({
        ...dailyInfo,
        menus: { ...dailyInfo.menus, [menu.type]: menu },
      });
      setEditingMenu(null);
    } else {
      setDailyInfo({
        ...dailyInfo,
        menus: { ...dailyInfo.menus, [menu.type]: menu },
      });
    }
    setIsMenuModalOpen(false);
  };

  const handleDeleteMenu = (type: string) => {
    const newMenus = { ...dailyInfo.menus };
    delete newMenus[type];
    setDailyInfo({
      ...dailyInfo,
      menus: newMenus,
    });
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8 min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-slate-300 dark:border-slate-700 border-t-slate-900 dark:border-t-slate-100 rounded-full animate-spin"></div>
          <p className="text-slate-600 dark:text-slate-400 font-medium">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">Bugün</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-slate-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600"
              />
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg font-semibold hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Etkinlikler */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Etkinlikler
            </h2>
            <button
              onClick={() => {
                setEditingEvent(null);
                setIsEventModalOpen(true);
              }}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4 text-slate-400" />
            </button>
          </div>
          <div className="space-y-2">
            {dailyInfo.events.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
                Henüz etkinlik eklenmemiş
              </p>
            ) : (
              dailyInfo.events.map((event) => (
                <EventItem
                  key={event.id}
                  event={event}
                  onEdit={(e) => {
                    setEditingEvent(e);
                    setIsEventModalOpen(true);
                  }}
                  onDelete={handleDeleteEvent}
                />
              ))
            )}
          </div>
        </div>

        {/* Restoranlar */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
              <UtensilsCrossed className="w-5 h-5" />
              Restoranlar
            </h2>
            <button
              onClick={() => {
                setEditingRestaurant(null);
                setIsRestaurantModalOpen(true);
              }}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4 text-slate-400" />
            </button>
          </div>
          <div className="space-y-2">
            {dailyInfo.restaurants.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
                Henüz restoran eklenmemiş
              </p>
            ) : (
              dailyInfo.restaurants.map((restaurant) => (
                <RestaurantItem
                  key={restaurant.id}
                  restaurant={restaurant}
                  onEdit={(r) => {
                    setEditingRestaurant(r);
                    setIsRestaurantModalOpen(true);
                  }}
                  onDelete={handleDeleteRestaurant}
                />
              ))
            )}
          </div>
        </div>

        {/* Menüler */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
              <ChefHat className="w-5 h-5" />
              Menüler
            </h2>
            <button
              onClick={() => {
                setEditingMenu(null);
                setIsMenuModalOpen(true);
              }}
              className="px-4 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg font-semibold hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Menü Ekle
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.values(dailyInfo.menus).length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4 col-span-2">
                Henüz menü eklenmemiş
              </p>
            ) : (
              Object.values(dailyInfo.menus).map((menu) => (
                <MenuItem
                  key={menu.type}
                  menu={menu}
                  onEdit={(m) => {
                    setEditingMenu(m);
                    setIsMenuModalOpen(true);
                  }}
                  onDelete={handleDeleteMenu}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <EventModal
        event={editingEvent}
        isOpen={isEventModalOpen}
        onClose={() => {
          setIsEventModalOpen(false);
          setEditingEvent(null);
        }}
        onSave={handleAddEvent}
      />

      <RestaurantModal
        restaurant={editingRestaurant}
        isOpen={isRestaurantModalOpen}
        onClose={() => {
          setIsRestaurantModalOpen(false);
          setEditingRestaurant(null);
        }}
        onSave={handleAddRestaurant}
      />

      <MenuModal
        menu={editingMenu}
        isOpen={isMenuModalOpen}
        onClose={() => {
          setIsMenuModalOpen(false);
          setEditingMenu(null);
        }}
        onSave={handleAddMenu}
      />
    </div>
  );
}

