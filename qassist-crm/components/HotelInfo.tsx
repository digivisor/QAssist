'use client';

import { 
  Upload,
  FileText,
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Bed,
  Calendar,
  Wifi,
  Car,
  UtensilsCrossed,
  Sparkles,
  Dumbbell,
  Waves,
  Coffee,
  CreditCard,
  Clock,
  Star,
  Save,
  X,
  CheckCircle2,
  Plus,
  Trash2,
  Users,
  Music,
  Gamepad2,
  Sun,
  Moon
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from './Toast';

type TabType = 'basic' | 'contact' | 'rooms' | 'departments' | 'restaurants' | 'events' | 'facilities';

interface Department {
  id: number;
  name: string;
  description: string;
  manager?: string;
  employeeCount: number;
}

interface Restaurant {
  id: number;
  name: string;
  type: 'a-la-carte' | 'breakfast' | 'dinner' | 'buffet';
  breakfastHours?: { start: string; end: string };
  dinnerHours?: { start: string; end: string };
  menu?: string;
  capacity?: number;
}

interface Event {
  id: number;
  name: string;
  type: 'animation' | 'aquapark' | 'sports' | 'entertainment' | 'kids' | 'other';
  description: string;
  schedule?: string;
}

export default function HotelInfo() {
  const [activeTab, setActiveTab] = useState<TabType>('basic');
  const [factSheetFile, setFactSheetFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [hotelData, setHotelData] = useState({
    // Temel Bilgiler
    name: '',
    category: '',
    type: '',
    description: '',
    yearEstablished: 0,
    totalFloors: 0,
    totalEmployees: 0,
    
    // İletişim Bilgileri
    address: '',
    city: '',
    district: '',
    postalCode: '',
    country: '',
    phone: '',
    email: '',
    website: '',
    
    // Oda Bilgileri
    totalRooms: 0,
    singleRooms: 0,
    doubleRooms: 0,
    suiteRooms: 0,
    deluxeRooms: 0,
    checkInTime: '14:00',
    checkOutTime: '12:00',
    
    // Özellikler
    features: {
      wifi: false,
      parking: false,
      restaurant: false,
      spa: false,
      gym: false,
      pool: false,
      bar: false,
      roomService: false,
      laundry: false,
      concierge: false,
      businessCenter: false,
      meetingRooms: false,
      petFriendly: false,
      airportShuttle: false,
    },
    
    // Ödeme
    acceptedPayments: {
      cash: false,
      creditCard: false,
      debitCard: false,
      bankTransfer: false,
    },
    
    // Diğer
    languages: [] as string[],
    currency: 'TRY',
    timezone: 'Europe/Istanbul',
  });

  const [departments, setDepartments] = useState<Department[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [events, setEvents] = useState<Event[]>([]);

  // Verileri yükle
  useEffect(() => {
    loadHotelData();
  }, []);

  const loadHotelData = async () => {
    try {
      setLoading(true);

      // Otel bilgilerini yükle
      const { data: hotelInfoData, error: hotelError } = await supabase
        .from('hotel_info')
        .select('*')
        .eq('id', 1)
        .single();

      if (hotelError) {
        // PGRST116 = "The result contains 0 rows" - bu normal, ilk kez yükleniyor demektir
        if (hotelError.code !== 'PGRST116') {
          console.error('Hotel info yükleme hatası:', hotelError);
          throw hotelError;
        }
      }

      if (hotelInfoData) {
        setHotelData({
          name: hotelInfoData.name || '',
          category: hotelInfoData.category || '',
          type: hotelInfoData.type || '',
          description: hotelInfoData.description || '',
          yearEstablished: hotelInfoData.year_established || 0,
          totalFloors: hotelInfoData.total_floors || 0,
          totalEmployees: hotelInfoData.total_employees || 0,
          address: hotelInfoData.address || '',
          city: hotelInfoData.city || '',
          district: hotelInfoData.district || '',
          postalCode: hotelInfoData.postal_code || '',
          country: hotelInfoData.country || '',
          phone: hotelInfoData.phone || '',
          email: hotelInfoData.email || '',
          website: hotelInfoData.website || '',
          totalRooms: hotelInfoData.total_rooms || 0,
          singleRooms: hotelInfoData.single_rooms || 0,
          doubleRooms: hotelInfoData.double_rooms || 0,
          suiteRooms: hotelInfoData.suite_rooms || 0,
          deluxeRooms: hotelInfoData.deluxe_rooms || 0,
          checkInTime: hotelInfoData.check_in_time 
            ? (typeof hotelInfoData.check_in_time === 'string' 
                ? hotelInfoData.check_in_time.substring(0, 5) 
                : hotelInfoData.check_in_time) 
            : '14:00',
          checkOutTime: hotelInfoData.check_out_time 
            ? (typeof hotelInfoData.check_out_time === 'string' 
                ? hotelInfoData.check_out_time.substring(0, 5) 
                : hotelInfoData.check_out_time) 
            : '12:00',
          features: hotelInfoData.features || {
            wifi: false, parking: false, restaurant: false, spa: false,
            gym: false, pool: false, bar: false, roomService: false,
            laundry: false, concierge: false, businessCenter: false,
            meetingRooms: false, petFriendly: false, airportShuttle: false,
          },
          acceptedPayments: hotelInfoData.accepted_payments || {
            cash: false, creditCard: false, debitCard: false, bankTransfer: false,
          },
          languages: hotelInfoData.languages || [],
          currency: hotelInfoData.currency || 'TRY',
          timezone: hotelInfoData.timezone || 'Europe/Istanbul',
        });
      }

      // Departmanları yükle
      const { data: departmentsData, error: deptError } = await supabase
        .from('hotel_departments')
        .select('*')
        .order('id', { ascending: true });

      if (deptError) throw deptError;
      if (departmentsData) {
        setDepartments(departmentsData.map((d: any) => ({
          id: d.id,
          name: d.name,
          description: d.description || '',
          manager: d.manager || undefined,
          employeeCount: d.employee_count || 0,
        })));
      }

      // Restoranları yükle
      const { data: restaurantsData, error: restError } = await supabase
        .from('hotel_restaurants')
        .select('*')
        .order('id', { ascending: true });

      if (restError) throw restError;
      if (restaurantsData) {
        setRestaurants(restaurantsData.map((r: any) => ({
          id: r.id,
          name: r.name,
          type: r.type as 'a-la-carte' | 'breakfast' | 'dinner' | 'buffet',
          breakfastHours: r.breakfast_hours_start && r.breakfast_hours_end
            ? { 
                start: typeof r.breakfast_hours_start === 'string' ? r.breakfast_hours_start.substring(0, 5) : r.breakfast_hours_start,
                end: typeof r.breakfast_hours_end === 'string' ? r.breakfast_hours_end.substring(0, 5) : r.breakfast_hours_end
              }
            : undefined,
          dinnerHours: r.dinner_hours_start && r.dinner_hours_end
            ? { 
                start: typeof r.dinner_hours_start === 'string' ? r.dinner_hours_start.substring(0, 5) : r.dinner_hours_start,
                end: typeof r.dinner_hours_end === 'string' ? r.dinner_hours_end.substring(0, 5) : r.dinner_hours_end
              }
            : undefined,
          menu: r.menu || undefined,
          capacity: r.capacity || undefined,
        })));
      }

      // Etkinlikleri yükle
      const { data: eventsData, error: eventsError } = await supabase
        .from('hotel_events')
        .select('*')
        .order('id', { ascending: true });

      if (eventsError) throw eventsError;
      if (eventsData) {
        setEvents(eventsData.map((e: any) => ({
          id: e.id,
          name: e.name,
          type: e.type as 'animation' | 'aquapark' | 'sports' | 'entertainment' | 'kids' | 'other',
          description: e.description || '',
          schedule: e.schedule || undefined,
        })));
      }
    } catch (error: any) {
      console.error('Veri yüklenirken hata:', error);
      const errorMessage = error?.message || error?.details || error?.hint || JSON.stringify(error) || 'Bilinmeyen hata';
      console.error('Hata detayları:', {
        message: error?.message,
        details: error?.details,
        hint: error?.hint,
        code: error?.code,
        fullError: error
      });
      toast.error('Veri yüklenirken bir hata oluştu: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Otel bilgilerini kaydet
      const { error: hotelError } = await supabase
        .from('hotel_info')
        .upsert({
          id: 1,
          name: hotelData.name,
          category: hotelData.category,
          type: hotelData.type,
          description: hotelData.description,
          year_established: hotelData.yearEstablished || null,
          total_floors: hotelData.totalFloors || null,
          total_employees: hotelData.totalEmployees || null,
          address: hotelData.address || null,
          city: hotelData.city || null,
          district: hotelData.district || null,
          postal_code: hotelData.postalCode || null,
          country: hotelData.country || null,
          phone: hotelData.phone || null,
          email: hotelData.email || null,
          website: hotelData.website || null,
          total_rooms: hotelData.totalRooms || null,
          single_rooms: hotelData.singleRooms || null,
          double_rooms: hotelData.doubleRooms || null,
          suite_rooms: hotelData.suiteRooms || null,
          deluxe_rooms: hotelData.deluxeRooms || null,
          check_in_time: hotelData.checkInTime ? (hotelData.checkInTime.length === 5 ? hotelData.checkInTime + ':00' : hotelData.checkInTime) : null,
          check_out_time: hotelData.checkOutTime ? (hotelData.checkOutTime.length === 5 ? hotelData.checkOutTime + ':00' : hotelData.checkOutTime) : null,
          features: hotelData.features,
          accepted_payments: hotelData.acceptedPayments,
          languages: hotelData.languages,
          currency: hotelData.currency,
          timezone: hotelData.timezone,
        }, {
          onConflict: 'id'
        });

      if (hotelError) throw hotelError;

      // Departmanları kaydet
      const updatedDepartments = [...departments];
      for (let i = 0; i < updatedDepartments.length; i++) {
        const dept = updatedDepartments[i];
        
        // Eğer departman adı boşsa atla
        if (!dept.name || dept.name.trim() === '') {
          continue;
        }

        // Veritabanından gelen ID'ler genellikle 1'den başlar ve makul sayılardır
        // Yeni eklenen departmanlar için geçici ID'ler kullanılıyor olabilir
        // En iyi yaklaşım: ID'ye göre veritabanında var mı kontrol et
        if (dept.id > 0) {
          // Mevcut departmanı kontrol et
          const { data: existingDept, error: checkError } = await supabase
            .from('hotel_departments')
            .select('id')
            .eq('id', dept.id)
            .single();

          if (checkError && checkError.code !== 'PGRST116') {
            throw checkError;
          }

          if (existingDept) {
            // Güncelle
            const { error: deptError } = await supabase
              .from('hotel_departments')
              .update({
                name: dept.name,
                description: dept.description || null,
                manager: dept.manager || null,
                employee_count: dept.employeeCount || 0,
              })
              .eq('id', dept.id);

            if (deptError) throw deptError;
          } else {
            // ID var ama veritabanında yok, yeni ekle
            const { data: newDept, error: deptError } = await supabase
              .from('hotel_departments')
              .insert({
                name: dept.name,
                description: dept.description || null,
                manager: dept.manager || null,
                employee_count: dept.employeeCount || 0,
              })
              .select()
              .single();

            if (deptError) throw deptError;
            if (newDept) {
              updatedDepartments[i] = { ...dept, id: newDept.id };
            }
          }
        } else {
          // Yeni ekle
          const { data: newDept, error: deptError } = await supabase
            .from('hotel_departments')
            .insert({
              name: dept.name,
              description: dept.description || null,
              manager: dept.manager || null,
              employee_count: dept.employeeCount || 0,
            })
            .select()
            .single();

          if (deptError) throw deptError;
          if (newDept) {
            updatedDepartments[i] = { ...dept, id: newDept.id };
          }
        }
      }
      setDepartments(updatedDepartments);

      // Restoranları kaydet
      const updatedRestaurants = [...restaurants];
      for (let i = 0; i < updatedRestaurants.length; i++) {
        const rest = updatedRestaurants[i];
        
        // Eğer restoran adı boşsa atla
        if (!rest.name || rest.name.trim() === '') {
          continue;
        }

        if (rest.id > 0) {
          // Mevcut restoranı kontrol et
          const { data: existingRest, error: checkError } = await supabase
            .from('hotel_restaurants')
            .select('id')
            .eq('id', rest.id)
            .single();

          if (checkError && checkError.code !== 'PGRST116') {
            throw checkError;
          }

          if (existingRest) {
            // Güncelle
            const { error: restError } = await supabase
              .from('hotel_restaurants')
              .update({
                name: rest.name,
                type: rest.type,
                breakfast_hours_start: rest.breakfastHours?.start 
                  ? (rest.breakfastHours.start.length === 5 ? rest.breakfastHours.start + ':00' : rest.breakfastHours.start)
                  : null,
                breakfast_hours_end: rest.breakfastHours?.end 
                  ? (rest.breakfastHours.end.length === 5 ? rest.breakfastHours.end + ':00' : rest.breakfastHours.end)
                  : null,
                dinner_hours_start: rest.dinnerHours?.start 
                  ? (rest.dinnerHours.start.length === 5 ? rest.dinnerHours.start + ':00' : rest.dinnerHours.start)
                  : null,
                dinner_hours_end: rest.dinnerHours?.end 
                  ? (rest.dinnerHours.end.length === 5 ? rest.dinnerHours.end + ':00' : rest.dinnerHours.end)
                  : null,
                menu: rest.menu || null,
                capacity: rest.capacity || null,
              })
              .eq('id', rest.id);

            if (restError) throw restError;
          } else {
            // Yeni ekle
            const { data: newRest, error: restError } = await supabase
              .from('hotel_restaurants')
              .insert({
                name: rest.name,
                type: rest.type,
                breakfast_hours_start: rest.breakfastHours?.start 
                  ? (rest.breakfastHours.start.length === 5 ? rest.breakfastHours.start + ':00' : rest.breakfastHours.start)
                  : null,
                breakfast_hours_end: rest.breakfastHours?.end 
                  ? (rest.breakfastHours.end.length === 5 ? rest.breakfastHours.end + ':00' : rest.breakfastHours.end)
                  : null,
                dinner_hours_start: rest.dinnerHours?.start 
                  ? (rest.dinnerHours.start.length === 5 ? rest.dinnerHours.start + ':00' : rest.dinnerHours.start)
                  : null,
                dinner_hours_end: rest.dinnerHours?.end 
                  ? (rest.dinnerHours.end.length === 5 ? rest.dinnerHours.end + ':00' : rest.dinnerHours.end)
                  : null,
                menu: rest.menu || null,
                capacity: rest.capacity || null,
              })
              .select()
              .single();

            if (restError) throw restError;
            if (newRest) {
              updatedRestaurants[i] = { ...rest, id: newRest.id };
            }
          }
        }
      }
      setRestaurants(updatedRestaurants);

      // Etkinlikleri kaydet
      const updatedEvents = [...events];
      for (let i = 0; i < updatedEvents.length; i++) {
        const event = updatedEvents[i];
        
        // Eğer etkinlik adı boşsa atla
        if (!event.name || event.name.trim() === '') {
          continue;
        }

        if (event.id > 0) {
          // Mevcut etkinliği kontrol et
          const { data: existingEvent, error: checkError } = await supabase
            .from('hotel_events')
            .select('id')
            .eq('id', event.id)
            .single();

          if (checkError && checkError.code !== 'PGRST116') {
            throw checkError;
          }

          if (existingEvent) {
            // Güncelle
            const { error: eventError } = await supabase
              .from('hotel_events')
              .update({
                name: event.name,
                type: event.type,
                description: event.description || null,
                schedule: event.schedule || null,
              })
              .eq('id', event.id);

            if (eventError) throw eventError;
          } else {
            // ID var ama veritabanında yok, yeni ekle
            const { data: newEvent, error: eventError } = await supabase
              .from('hotel_events')
              .insert({
                name: event.name,
                type: event.type,
                description: event.description || null,
                schedule: event.schedule || null,
              })
              .select()
              .single();

            if (eventError) throw eventError;
            if (newEvent) {
              updatedEvents[i] = { ...event, id: newEvent.id };
            }
          }
        } else {
          // Yeni ekle
          const { data: newEvent, error: eventError } = await supabase
            .from('hotel_events')
            .insert({
              name: event.name,
              type: event.type,
              description: event.description || null,
              schedule: event.schedule || null,
            })
            .select()
            .single();

          if (eventError) throw eventError;
          if (newEvent) {
            updatedEvents[i] = { ...event, id: newEvent.id };
          }
        }
      }
      setEvents(updatedEvents);

      // Verileri yeniden yükle
      await loadHotelData();
      toast.success('Bilgiler başarıyla kaydedildi!');
    } catch (error: any) {
      console.error('Kaydetme hatası:', error);
      const errorMessage = error?.message || error?.details || error?.hint || JSON.stringify(error) || 'Bilinmeyen hata';
      console.error('Hata detayları:', {
        message: error?.message,
        details: error?.details,
        hint: error?.hint,
        code: error?.code,
        fullError: error
      });
      toast.error('Kaydetme sırasında bir hata oluştu: ' + errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'basic' as TabType, label: 'Temel Bilgiler', icon: Building2 },
    { id: 'contact' as TabType, label: 'İletişim', icon: Phone },
    { id: 'rooms' as TabType, label: 'Odalar', icon: Bed },
    { id: 'departments' as TabType, label: 'Departmanlar', icon: Users },
    { id: 'restaurants' as TabType, label: 'Restoranlar', icon: UtensilsCrossed },
    { id: 'events' as TabType, label: 'Etkinlikler', icon: Sparkles },
    { id: 'facilities' as TabType, label: 'İmkanlar', icon: Star },
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFactSheetFile(file);
      setIsUploading(true);
      setTimeout(() => {
        setIsUploading(false);
      }, 2000);
    }
  };

  const handleRemoveFile = () => {
    setFactSheetFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setHotelData(prev => ({ ...prev, [field]: value }));
  };

  const handleFeatureToggle = (feature: string) => {
    setHotelData(prev => ({
      ...prev,
      features: {
        ...prev.features,
        [feature]: !prev.features[feature as keyof typeof prev.features]
      }
    }));
  };

  const handleAddDepartment = () => {
    const newDept: Department = {
      id: departments.length > 0 ? Math.max(...departments.map(d => d.id), 0) + 1 : 1,
      name: '',
      description: '',
      employeeCount: 0
    };
    setDepartments([...departments, newDept]);
  };

  const handleUpdateDepartment = (id: number, field: string, value: any) => {
    setDepartments(departments.map(d => d.id === id ? { ...d, [field]: value } : d));
  };

  const handleDeleteDepartment = async (id: number) => {
    if (id > 0) {
      try {
        const { error } = await supabase
          .from('hotel_departments')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
      } catch (error: any) {
        console.error('Departman silme hatası:', error);
        toast.error('Departman silinirken bir hata oluştu: ' + (error.message || 'Bilinmeyen hata'));
        return;
      }
    }
    setDepartments(departments.filter(d => d.id !== id));
  };

  const handleAddRestaurant = () => {
    const newRest: Restaurant = {
      id: restaurants.length > 0 ? Math.max(...restaurants.map(r => r.id), 0) + 1 : 1,
      name: '',
      type: 'a-la-carte'
    };
    setRestaurants([...restaurants, newRest]);
  };

  const handleUpdateRestaurant = (id: number, field: string, value: any) => {
    setRestaurants(restaurants.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const handleDeleteRestaurant = async (id: number) => {
    if (id > 0) {
      try {
        const { error } = await supabase
          .from('hotel_restaurants')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
      } catch (error: any) {
        console.error('Restoran silme hatası:', error);
        toast.error('Restoran silinirken bir hata oluştu: ' + (error.message || 'Bilinmeyen hata'));
        return;
      }
    }
    setRestaurants(restaurants.filter(r => r.id !== id));
  };

  const handleAddEvent = () => {
    const newEvent: Event = {
      id: events.length > 0 ? Math.max(...events.map(e => e.id), 0) + 1 : 1,
      name: '',
      type: 'animation',
      description: ''
    };
    setEvents([...events, newEvent]);
  };

  const handleUpdateEvent = (id: number, field: string, value: any) => {
    setEvents(events.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const handleDeleteEvent = async (id: number) => {
    if (id > 0) {
      try {
        const { error } = await supabase
          .from('hotel_events')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
      } catch (error: any) {
        console.error('Etkinlik silme hatası:', error);
        toast.error('Etkinlik silinirken bir hata oluştu: ' + (error.message || 'Bilinmeyen hata'));
        return;
      }
    }
    setEvents(events.filter(e => e.id !== id));
  };

  return (
    <div className="p-6 lg:p-8 min-h-screen">
      {/* Fact Sheet Upload Section */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-200/50 dark:border-slate-800/50 p-6 shadow-lg mb-6">
        <div className="flex items-center gap-3 mb-4">
          <FileText className="w-6 h-6 text-slate-600 dark:text-slate-400" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">Fact Sheet Yükle</h2>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          Otel bilgilerinizi içeren Fact Sheet dosyasını yükleyin. Yapay zeka analizi ile bilgiler otomatik olarak doldurulacak.
        </p>
        
        {!factSheetFile ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-8 text-center cursor-pointer hover:border-slate-400 dark:hover:border-slate-600 transition-colors"
          >
            <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400 font-medium mb-2">
              Dosya seçmek için tıklayın veya sürükleyip bırakın
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-500">
              PDF, DOC, DOCX formatları desteklenir
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        ) : (
          <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-slate-600 dark:text-slate-400" />
              <div>
                <p className="font-medium text-slate-900 dark:text-slate-50">{factSheetFile.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {(factSheetFile.size / 1024).toFixed(2)} KB
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isUploading ? (
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm">Yükleniyor...</span>
                </div>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <button
                    onClick={handleRemoveFile}
                    className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-lg mb-6 overflow-hidden">
        <div className="flex overflow-x-auto border-b border-slate-200 dark:border-slate-800">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-semibold text-sm whitespace-nowrap transition-all border-b-2 ${
                  activeTab === tab.id
                    ? 'border-slate-900 dark:border-slate-100 text-slate-900 dark:text-slate-50 bg-slate-50 dark:bg-slate-800'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Temel Bilgiler */}
          {activeTab === 'basic' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Otel Adı *
                  </label>
                  <input
                    type="text"
                    value={hotelData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Kategori *
                  </label>
                  <input
                    type="text"
                    value={hotelData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Otel Tipi
                  </label>
                  <input
                    type="text"
                    value={hotelData.type}
                    onChange={(e) => handleInputChange('type', e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Kuruluş Yılı
                  </label>
                  <input
                    type="number"
                    value={hotelData.yearEstablished}
                    onChange={(e) => handleInputChange('yearEstablished', parseInt(e.target.value))}
                    className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Toplam Kat Sayısı
                  </label>
                  <input
                    type="number"
                    value={hotelData.totalFloors}
                    onChange={(e) => handleInputChange('totalFloors', parseInt(e.target.value))}
                    className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Toplam Çalışan Sayısı
                  </label>
                  <input
                    type="number"
                    value={hotelData.totalEmployees}
                    onChange={(e) => handleInputChange('totalEmployees', parseInt(e.target.value))}
                    className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 transition-all"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Açıklama
                </label>
                <textarea
                  value={hotelData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 transition-all resize-none"
                />
              </div>
            </div>
          )}

          {/* İletişim Bilgileri */}
          {activeTab === 'contact' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Adres *
                </label>
                <input
                  type="text"
                  value={hotelData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 transition-all"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Şehir *
                </label>
                <input
                  type="text"
                  value={hotelData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 transition-all"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  İlçe
                </label>
                <input
                  type="text"
                  value={hotelData.district}
                  onChange={(e) => handleInputChange('district', e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 transition-all"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Posta Kodu
                </label>
                <input
                  type="text"
                  value={hotelData.postalCode}
                  onChange={(e) => handleInputChange('postalCode', e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 transition-all"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Ülke *
                </label>
                <input
                  type="text"
                  value={hotelData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 transition-all"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Telefon *
                </label>
                <input
                  type="tel"
                  value={hotelData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 transition-all"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  E-posta *
                </label>
                <input
                  type="email"
                  value={hotelData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 transition-all"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Website
                </label>
                <input
                  type="text"
                  value={hotelData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 transition-all"
                />
              </div>
            </div>
          )}

          {/* Odalar */}
          {activeTab === 'rooms' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Toplam Oda Sayısı *
                  </label>
                  <input
                    type="number"
                    value={hotelData.totalRooms}
                    onChange={(e) => handleInputChange('totalRooms', parseInt(e.target.value))}
                    className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Tek Kişilik Oda
                  </label>
                  <input
                    type="number"
                    value={hotelData.singleRooms}
                    onChange={(e) => handleInputChange('singleRooms', parseInt(e.target.value))}
                    className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Çift Kişilik Oda
                  </label>
                  <input
                    type="number"
                    value={hotelData.doubleRooms}
                    onChange={(e) => handleInputChange('doubleRooms', parseInt(e.target.value))}
                    className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Süit Oda
                  </label>
                  <input
                    type="number"
                    value={hotelData.suiteRooms}
                    onChange={(e) => handleInputChange('suiteRooms', parseInt(e.target.value))}
                    className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Deluxe Oda
                  </label>
                  <input
                    type="number"
                    value={hotelData.deluxeRooms}
                    onChange={(e) => handleInputChange('deluxeRooms', parseInt(e.target.value))}
                    className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 transition-all"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Check-in Saati *
                  </label>
                  <input
                    type="time"
                    value={hotelData.checkInTime}
                    onChange={(e) => handleInputChange('checkInTime', e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Check-out Saati *
                  </label>
                  <input
                    type="time"
                    value={hotelData.checkOutTime}
                    onChange={(e) => handleInputChange('checkOutTime', e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Departmanlar */}
          {activeTab === 'departments' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Departmanlar</h3>
                <button
                  onClick={handleAddDepartment}
                  className="px-4 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl font-semibold hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Departman Ekle
                </button>
              </div>
              
              {departments.map((dept) => (
                <div key={dept.id} className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                        Departman Adı *
                      </label>
                      <input
                        type="text"
                        value={dept.name}
                        onChange={(e) => handleUpdateDepartment(dept.id, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 transition-all text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                        Açıklama
                      </label>
                      <input
                        type="text"
                        value={dept.description}
                        onChange={(e) => handleUpdateDepartment(dept.id, 'description', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 transition-all text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                        Çalışan Sayısı
                      </label>
                      <input
                        type="number"
                        value={dept.employeeCount}
                        onChange={(e) => handleUpdateDepartment(dept.id, 'employeeCount', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 transition-all text-sm"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteDepartment(dept.id)}
                    className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm font-medium flex items-center gap-1"
                  >
                    <Trash2 className="w-4 h-4" />
                    Sil
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Restoranlar */}
          {activeTab === 'restaurants' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Restoranlar</h3>
                <button
                  onClick={handleAddRestaurant}
                  className="px-4 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl font-semibold hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Restoran Ekle
                </button>
              </div>
              
              {restaurants.map((rest) => (
                <div key={rest.id} className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                        Restoran Adı *
                      </label>
                      <input
                        type="text"
                        value={rest.name}
                        onChange={(e) => handleUpdateRestaurant(rest.id, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 transition-all text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                        Tip *
                      </label>
                      <select
                        value={rest.type}
                        onChange={(e) => handleUpdateRestaurant(rest.id, 'type', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 transition-all text-sm"
                      >
                        <option value="a-la-carte">À La Carte</option>
                        <option value="breakfast">Kahvaltı</option>
                        <option value="dinner">Akşam Yemeği</option>
                        <option value="buffet">Büfe</option>
                      </select>
                    </div>
                    {rest.type === 'breakfast' && (
                      <div className="md:col-span-2 grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                            Kahvaltı Başlangıç
                          </label>
                          <input
                            type="time"
                            value={rest.breakfastHours?.start || ''}
                            onChange={(e) => handleUpdateRestaurant(rest.id, 'breakfastHours', { ...rest.breakfastHours, start: e.target.value, end: rest.breakfastHours?.end || '' })}
                            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 transition-all text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                            Kahvaltı Bitiş
                          </label>
                          <input
                            type="time"
                            value={rest.breakfastHours?.end || ''}
                            onChange={(e) => handleUpdateRestaurant(rest.id, 'breakfastHours', { ...rest.breakfastHours, start: rest.breakfastHours?.start || '', end: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 transition-all text-sm"
                          />
                        </div>
                      </div>
                    )}
                    {rest.type === 'dinner' && (
                      <div className="md:col-span-2 grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                            Akşam Yemeği Başlangıç
                          </label>
                          <input
                            type="time"
                            value={rest.dinnerHours?.start || ''}
                            onChange={(e) => handleUpdateRestaurant(rest.id, 'dinnerHours', { ...rest.dinnerHours, start: e.target.value, end: rest.dinnerHours?.end || '' })}
                            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 transition-all text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                            Akşam Yemeği Bitiş
                          </label>
                          <input
                            type="time"
                            value={rest.dinnerHours?.end || ''}
                            onChange={(e) => handleUpdateRestaurant(rest.id, 'dinnerHours', { ...rest.dinnerHours, start: rest.dinnerHours?.start || '', end: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 transition-all text-sm"
                          />
                        </div>
                      </div>
                    )}
                    <div>
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                        Kapasite
                      </label>
                      <input
                        type="number"
                        value={rest.capacity || ''}
                        onChange={(e) => handleUpdateRestaurant(rest.id, 'capacity', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 transition-all text-sm"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                        Menü (Açıklama)
                      </label>
                      <textarea
                        value={rest.menu || ''}
                        onChange={(e) => handleUpdateRestaurant(rest.id, 'menu', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 transition-all text-sm resize-none"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteRestaurant(rest.id)}
                    className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm font-medium flex items-center gap-1"
                  >
                    <Trash2 className="w-4 h-4" />
                    Sil
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Etkinlikler */}
          {activeTab === 'events' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Etkinlikler</h3>
                <button
                  onClick={handleAddEvent}
                  className="px-4 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl font-semibold hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Etkinlik Ekle
                </button>
              </div>
              
              {events.map((event) => (
                <div key={event.id} className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                        Etkinlik Adı *
                      </label>
                      <input
                        type="text"
                        value={event.name}
                        onChange={(e) => handleUpdateEvent(event.id, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 transition-all text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                        Tip *
                      </label>
                      <select
                        value={event.type}
                        onChange={(e) => handleUpdateEvent(event.id, 'type', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 transition-all text-sm"
                      >
                        <option value="animation">Animasyon</option>
                        <option value="aquapark">Aquapark</option>
                        <option value="sports">Spor Aktiviteleri</option>
                        <option value="entertainment">Eğlence</option>
                        <option value="kids">Çocuk Aktiviteleri</option>
                        <option value="other">Diğer</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                        Açıklama
                      </label>
                      <textarea
                        value={event.description}
                        onChange={(e) => handleUpdateEvent(event.id, 'description', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 transition-all text-sm resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                        Program/Saatler
                      </label>
                      <input
                        type="text"
                        value={event.schedule || ''}
                        onChange={(e) => handleUpdateEvent(event.id, 'schedule', e.target.value)}
                        placeholder="Örn: Her gün 14:00-16:00"
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 transition-all text-sm"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteEvent(event.id)}
                    className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm font-medium flex items-center gap-1"
                  >
                    <Trash2 className="w-4 h-4" />
                    Sil
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* İmkanlar */}
          {activeTab === 'facilities' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-4">Otel Özellikleri</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {Object.entries({
                    wifi: { label: 'WiFi', icon: Wifi },
                    parking: { label: 'Otopark', icon: Car },
                    restaurant: { label: 'Restoran', icon: UtensilsCrossed },
                    spa: { label: 'Spa', icon: Sparkles },
                    gym: { label: 'Spor Salonu', icon: Dumbbell },
                    pool: { label: 'Havuz', icon: Waves },
                    bar: { label: 'Bar', icon: Coffee },
                    roomService: { label: 'Oda Servisi', icon: UtensilsCrossed },
                    laundry: { label: 'Çamaşırhane', icon: Waves },
                    concierge: { label: 'Konsiyerj', icon: Building2 },
                    businessCenter: { label: 'İş Merkezi', icon: Building2 },
                    meetingRooms: { label: 'Toplantı Salonu', icon: Building2 },
                    petFriendly: { label: 'Evcil Hayvan Dostu', icon: Building2 },
                    airportShuttle: { label: 'Havalimanı Servisi', icon: Car },
                  }).map(([key, { label, icon: Icon }]) => (
                    <label
                      key={key}
                      className="flex items-center gap-3 p-4 border border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={hotelData.features[key as keyof typeof hotelData.features]}
                        onChange={() => handleFeatureToggle(key)}
                        className="w-5 h-5 rounded border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-50 focus:ring-slate-400 dark:focus:ring-slate-600"
                      />
                      <Icon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                      <span className="text-sm font-medium text-slate-900 dark:text-slate-50">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-4">Kabul Edilen Ödeme Yöntemleri</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries({
                    cash: 'Nakit',
                    creditCard: 'Kredi Kartı',
                    debitCard: 'Banka Kartı',
                    bankTransfer: 'Banka Havalesi',
                  }).map(([key, label]) => (
                    <label
                      key={key}
                      className="flex items-center gap-3 p-4 border border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={hotelData.acceptedPayments[key as keyof typeof hotelData.acceptedPayments]}
                        onChange={() => {
                          setHotelData(prev => ({
                            ...prev,
                            acceptedPayments: {
                              ...prev.acceptedPayments,
                              [key]: !prev.acceptedPayments[key as keyof typeof prev.acceptedPayments]
                            }
                          }));
                        }}
                        className="w-5 h-5 rounded border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-50 focus:ring-slate-400 dark:focus:ring-slate-600"
                      />
                      <span className="text-sm font-medium text-slate-900 dark:text-slate-50">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Para Birimi *
                  </label>
                  <input
                    type="text"
                    value={hotelData.currency}
                    onChange={(e) => handleInputChange('currency', e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Saat Dilimi
                  </label>
                  <input
                    type="text"
                    value={hotelData.timezone}
                    onChange={(e) => handleInputChange('timezone', e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 transition-all"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Konuşulan Diller (virgülle ayırın)
                  </label>
                  <input
                    type="text"
                    value={hotelData.languages.join(', ')}
                    onChange={(e) => handleInputChange('languages', e.target.value.split(',').map(l => l.trim()))}
                    className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 transition-all"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-4">
        <button 
          onClick={() => loadHotelData()}
          className="px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          İptal
        </button>
        <button 
          onClick={handleSave}
          disabled={saving || loading}
          className="px-6 py-3 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl font-semibold hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <div className="w-5 h-5 border-2 border-white dark:border-slate-900 border-t-transparent rounded-full animate-spin"></div>
              Kaydediliyor...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Kaydet
            </>
          )}
        </button>
      </div>

      {loading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 border-2 border-slate-900 dark:border-slate-100 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-slate-900 dark:text-slate-50 font-medium">Yükleniyor...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
