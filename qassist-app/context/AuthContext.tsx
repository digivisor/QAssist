import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';

type UserRole = 'admin' | 'manager' | 'staff';

export type EmployeeProfile = {
  id: number;
  first_name: string;
  last_name: string;
  role: UserRole;
  avatar_url: string | null;
  department_id: number | null;
  department_name: string | null;
  job_title: string | null;
  email: string | null;
  phone: string | null;
  completed_tasks_count: number | null;
  rating: number | null;
};

type AuthContextType = {
  user: EmployeeProfile | null;
  loading: boolean;
  isAdmin: boolean;
  isManager: boolean;
  signInWithPhone: (phone: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAdmin: false,
  isManager: false,
  signInWithPhone: async () => ({ success: false }),
  signOut: async () => { },
  refreshProfile: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<EmployeeProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (id: number): Promise<EmployeeProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select(`
          *,
          hotel_departments (
            name
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.warn('Profil bulunamadı:', error.message);
        return null;
      }

      const profileData: EmployeeProfile = {
        ...data,
        department_name: data.hotel_departments?.name || null,
      };

      setUser(profileData);
      return profileData;
    } catch (e) {
      console.error('Profil getirme hatası:', e);
      return null;
    }
  };

  // Uygulama açılışında oturum kontrolü
  useEffect(() => {
    const checkSession = async () => {
      try {
        // Kalıcı oturum kontrolü
        const rememberMe = await AsyncStorage.getItem('remember_me');
        const storedId = await AsyncStorage.getItem('user_id');

        if (storedId && rememberMe === 'true') {
          const profile = await fetchProfile(parseInt(storedId));
          if (!profile) {
            // Profil bulunamazsa storage'ı temizle
            await AsyncStorage.multiRemove(['user_id', 'remember_me']);
          }
        } else if (storedId && rememberMe !== 'true') {
          // Beni hatırla işaretli değilse, önceki oturumu temizle
          await AsyncStorage.multiRemove(['user_id', 'remember_me']);
        }
      } catch (e) {
        console.error('Oturum kontrol hatası:', e);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  // Telefon ve Şifre ile Giriş (Custom Auth)
  const signInWithPhone = async (phone: string, password: string, rememberMe: boolean = false) => {
    try {
      // 1. Kullanıcıyı bul (departman bilgisiyle birlikte)
      const { data, error } = await supabase
        .from('employees')
        .select(`
          *,
          hotel_departments (
            name
          )
        `)
        .eq('phone', phone)
        .eq('app_password', password)
        .single();

      if (error || !data) {
        return { success: false, error: 'Telefon numarası veya şifre hatalı.' };
      }

      if (data.status !== 'active') {
        return { success: false, error: 'Hesabınız aktif değil. Lütfen yöneticinizle görüşün.' };
      }

      // 2. Oturumu kaydet
      await AsyncStorage.setItem('user_id', data.id.toString());

      // 3. Beni hatırla seçeneği
      if (rememberMe) {
        await AsyncStorage.setItem('remember_me', 'true');
      } else {
        await AsyncStorage.removeItem('remember_me');
      }

      // Departman adını düzleştir
      const profileData: EmployeeProfile = {
        ...data,
        department_name: data.hotel_departments?.name || null,
      };

      setUser(profileData);

      return { success: true };
    } catch (e) {
      console.error('Giriş hatası:', e);
      return { success: false, error: 'Bir hata oluştu.' };
    }
  };

  const signOut = async () => {
    try {
      await AsyncStorage.multiRemove(['user_id', 'remember_me']);
      setUser(null);
    } catch (e) {
      console.error('Çıkış hatası:', e);
    }
  };

  const refreshProfile = async () => {
    if (user?.id) {
      await fetchProfile(user.id);
    }
  };

  const value = {
    user,
    loading,
    isAdmin: user?.role === 'admin',
    isManager: user?.role === 'admin' || user?.role === 'manager',
    signInWithPhone,
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
