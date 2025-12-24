import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image, RefreshControl, ActivityIndicator, Modal, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { supabase } from '../../lib/supabase';
import { useTheme } from '../../context/ThemeContext';
import { Skeleton, SkeletonCircle } from '../../components/ui/Skeleton';
import { useAuth } from '../../context/AuthContext';

type Country = {
  code: string;
  dialCode: string;
  flag: string;
  name: string;
};

const countries: Country[] = [
  { code: 'TR', dialCode: '+90', flag: '🇹🇷', name: 'Türkiye' },
  { code: 'RU', dialCode: '+7', flag: '🇷🇺', name: 'Rusya' },
  { code: 'UZ', dialCode: '+998', flag: '🇺🇿', name: 'Özbekistan' },
  { code: 'UA', dialCode: '+380', flag: '🇺🇦', name: 'Ukrayna' },
  { code: 'KG', dialCode: '+996', flag: '🇰🇬', name: 'Kırgızistan' },
  { code: 'KZ', dialCode: '+7', flag: '🇰🇿', name: 'Kazakistan' },
  { code: 'AZ', dialCode: '+994', flag: '🇦🇿', name: 'Azerbaycan' },
  { code: 'US', dialCode: '+1', flag: '🇺🇸', name: 'United States' },
  { code: 'GB', dialCode: '+44', flag: '🇬🇧', name: 'United Kingdom' },
  { code: 'DE', dialCode: '+49', flag: '🇩🇪', name: 'Germany' },
  { code: 'FR', dialCode: '+33', flag: '🇫🇷', name: 'France' },
  { code: 'IT', dialCode: '+39', flag: '🇮🇹', name: 'Italy' },
  { code: 'ES', dialCode: '+34', flag: '🇪🇸', name: 'Spain' },
  { code: 'NL', dialCode: '+31', flag: '🇳🇱', name: 'Netherlands' },
  { code: 'BE', dialCode: '+32', flag: '🇧🇪', name: 'Belgium' },
  { code: 'CH', dialCode: '+41', flag: '🇨🇭', name: 'Switzerland' },
  { code: 'AT', dialCode: '+43', flag: '🇦🇹', name: 'Austria' },
  { code: 'GR', dialCode: '+30', flag: '🇬🇷', name: 'Greece' },
];

export default function StaffManagementScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { user, isAdmin } = useAuth();

  const [staffList, setStaffList] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal States
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<Country>(countries[0]);
  const [countryModalVisible, setCountryModalVisible] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [newStaff, setNewStaff] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    app_password: '',
    department_id: '',
    role: 'staff',
    job_title: ''
  });

  const fetchData = async () => {
    try {
      let query = supabase
        .from('employees')
        .select('*, hotel_departments(name)')
        .order('first_name');

      // Eğer müdürse sadece kendi departmanını görsün
      if (!isAdmin && user?.role === 'manager' && user?.department_id) {
        query = query.eq('department_id', user.department_id);
      }

      const { data: staffData, error: staffError } = await query;

      if (staffError) throw staffError;

      const { data: deptData } = await supabase.from('hotel_departments').select('*').order('name');
      setDepartments(deptData || []);
      setStaffList(staffData || []);
    } catch (e) {
      console.error('Personel çekme hatası:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    if (!isAdmin && user?.role === 'manager' && user?.department_id) {
      setNewStaff(prev => ({ ...prev, department_id: user.department_id!.toString() }));
    }
  }, [user?.id]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleAddStaff = async () => {
    if (!newStaff.first_name || !newStaff.last_name || !newStaff.phone || !newStaff.app_password) {
      Alert.alert('Hata', 'Lütfen tüm zorunlu alanları doldurun.');
      return;
    }

    try {
      const cleanedPhone = newStaff.phone.replace(/\D/g, '');
      const fullPhoneNumber = `${selectedCountry.dialCode}${cleanedPhone}`;

      const { error } = await supabase
        .from('employees')
        .insert([{
          ...newStaff,
          phone: fullPhoneNumber,
          department_id: newStaff.department_id ? parseInt(newStaff.department_id) : null,
          status: 'active'
        }]);

      if (error) throw error;

      setIsAddModalVisible(false);
      setIsSuccessModalVisible(true);
      setNewStaff({
        first_name: '',
        last_name: '',
        phone: '',
        email: '',
        app_password: '',
        department_id: '',
        role: 'staff',
        job_title: ''
      });
      fetchData();
    } catch (e: any) {
      Alert.alert('Hata', e.message);
    }
  };

  const filteredStaff = staffList.filter(s =>
    `${s.first_name} ${s.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.phone.includes(searchQuery)
  );

  const stats = {
    total: staffList.length,
    active: staffList.filter(s => s.status === 'active').length,
    inactive: staffList.filter(s => s.status === 'inactive').length,
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'manager': return { text: 'Müdür', color: '#8b5cf6' };
      case 'staff': return { text: 'Personel', color: '#3b82f6' };
      default: return { text: 'Personel', color: '#3b82f6' };
    }
  };

  const renderSkeleton = () => {
    return (
      <View style={{ paddingBottom: 20 }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <View key={i} style={styles.staffCard}>
            <SkeletonCircle size={50} style={{ marginRight: 12 }} />
            <View style={{ flex: 1 }}>
              <Skeleton width="60%" height={18} style={{ marginBottom: 8 }} />
              <Skeleton width="40%" height={14} style={{ marginBottom: 12 }} />
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Skeleton width={60} height={20} borderRadius={6} />
                <Skeleton width={40} height={20} borderRadius={6} />
              </View>
            </View>
          </View>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {!isAdmin && user?.role === 'manager' ? 'Departman Personeli' : 'Personel Yönetimi'}
        </Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setIsAddModalVisible(true)}>
          <Ionicons name="person-add" size={22} color="#2563EB" />
        </TouchableOpacity>
      </View>

      {/* Arama ve Filtre */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color="#94a3b8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Personel ara..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#94a3b8"
          />
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="filter" size={20} color="#64748b" />
        </TouchableOpacity>
      </View>

      {/* İstatistikler */}
      <View style={styles.statsRow}>
        <View style={[styles.statBox, { backgroundColor: '#dbeafe' }]}>
          <Text style={[styles.statNumber, { color: '#3b82f6' }]}>{stats.total}</Text>
          <Text style={styles.statText}>Toplam</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: '#dcfce7' }]}>
          <Text style={[styles.statNumber, { color: '#22c55e' }]}>{stats.active}</Text>
          <Text style={styles.statText}>Aktif</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: '#fee2e2' }]}>
          <Text style={[styles.statNumber, { color: '#ef4444' }]}>{stats.inactive}</Text>
          <Text style={styles.statText}>Pasif</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {loading && !refreshing ? (
          renderSkeleton()
        ) : (
          filteredStaff.map((staff) => {
            const badge = getRoleBadge(staff.role);
            return (
              <TouchableOpacity
                key={staff.id}
                style={styles.staffCard}
                onPress={() => router.push(`/admin/staff/${staff.id}`)}
              >
                <View style={styles.staffAvatar}>
                  {staff.avatar_url ? (
                    <Image source={{ uri: staff.avatar_url }} style={{ width: 50, height: 50, borderRadius: 25 }} />
                  ) : (
                    <Ionicons name="person" size={24} color="#2563EB" />
                  )}
                </View>
                <View style={styles.staffInfo}>
                  <View style={styles.staffNameRow}>
                    <Text style={styles.staffName}>{staff.first_name} {staff.last_name}</Text>
                    {staff.status === 'inactive' && (
                      <View style={styles.inactiveBadge}>
                        <Text style={styles.inactiveBadgeText}>Pasif</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.staffDepartment}>{staff.hotel_departments?.name || 'Departman Yok'}</Text>
                  <View style={styles.staffMeta}>
                    <View style={[styles.roleBadge, { backgroundColor: badge.color + '20' }]}>
                      <Text style={[styles.roleBadgeText, { color: badge.color }]}>{badge.text}</Text>
                    </View>
                    <View style={styles.ratingContainer}>
                      <Ionicons name="star" size={14} color="#f59e0b" />
                      <Text style={styles.ratingText}>{staff.rating || '5.0'}</Text>
                    </View>
                    <Text style={styles.taskCount}>{staff.completed_tasks_count || 0} görev</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* Add Staff Modal */}
      <Modal
        visible={isAddModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsAddModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Yeni Personel Ekle</Text>
              <TouchableOpacity onPress={() => setIsAddModalVisible(false)}>
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Ad *</Text>
                <TextInput
                  style={styles.input}
                  value={newStaff.first_name}
                  onChangeText={(v) => setNewStaff({ ...newStaff, first_name: v })}
                  placeholder="Ahmet"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Soyad *</Text>
                <TextInput
                  style={styles.input}
                  value={newStaff.last_name}
                  onChangeText={(v) => setNewStaff({ ...newStaff, last_name: v })}
                  placeholder="Yılmaz"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Telefon *</Text>
                <View style={styles.phoneInputContainer}>
                  <TouchableOpacity
                    style={styles.countrySelector}
                    onPress={() => setCountryModalVisible(true)}
                  >
                    <Text style={styles.flagText}>{selectedCountry.flag}</Text>
                    <Text style={styles.dialCodeText}>{selectedCountry.dialCode}</Text>
                    <MaterialIcons name="arrow-drop-down" size={20} color="#64748b" />
                  </TouchableOpacity>
                  <TextInput
                    style={styles.flexInput}
                    value={newStaff.phone}
                    onChangeText={(v) => setNewStaff({ ...newStaff, phone: v })}
                    placeholder="5XX XXX XX XX"
                    keyboardType="phone-pad"
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>E-posta</Text>
                <TextInput
                  style={styles.input}
                  value={newStaff.email}
                  onChangeText={(v) => setNewStaff({ ...newStaff, email: v })}
                  placeholder="ahmet@otel.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Giriş Şifresi *</Text>
                <TextInput
                  style={styles.input}
                  value={newStaff.app_password}
                  onChangeText={(v) => setNewStaff({ ...newStaff, app_password: v })}
                  placeholder="6 Haneli Şifre"
                  secureTextEntry
                />
              </View>

              {isAdmin && (
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Rol</Text>
                  <View style={styles.roleOptions}>
                    {['staff', 'manager', 'admin'].map((r) => (
                      <TouchableOpacity
                        key={r}
                        style={[styles.roleOption, newStaff.role === r && styles.roleOptionActive]}
                        onPress={() => setNewStaff({ ...newStaff, role: r })}
                      >
                        <Text style={[styles.roleOptionText, newStaff.role === r && styles.roleOptionTextActive]}>
                          {r === 'staff' ? 'Personel' : r === 'manager' ? 'Müdür' : 'Admin'}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {isAdmin && (
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Departman</Text>
                  <View style={styles.deptChips}>
                    {departments.map((d) => (
                      <TouchableOpacity
                        key={d.id}
                        style={[styles.deptChip, newStaff.department_id === d.id.toString() && styles.deptChipActive]}
                        onPress={() => setNewStaff({ ...newStaff, department_id: d.id.toString() })}
                      >
                        <Text style={[styles.deptChipText, newStaff.department_id === d.id.toString() && styles.deptChipTextActive]}>
                          {d.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              <TouchableOpacity style={styles.saveButton} onPress={handleAddStaff}>
                <Text style={styles.saveButtonText}>Kaydet</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Success Modal */}
      <Modal
        visible={isSuccessModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsSuccessModalVisible(false)}
      >
        <View style={styles.successOverlay}>
          <View style={styles.successContent}>
            <View style={styles.successIconContainer}>
              <Ionicons name="checkmark-circle" size={80} color="#22c55e" />
            </View>
            <Text style={styles.successTitle}>Başarılı!</Text>
            <Text style={styles.successMessage}>
              Yeni personel sisteme başarıyla kaydedildi.
            </Text>
            <TouchableOpacity
              style={styles.successButton}
              onPress={() => setIsSuccessModalVisible(false)}
            >
              <Text style={styles.successButtonText}>Tamam</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Ülke Seçici Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={countryModalVisible}
        onRequestClose={() => setCountryModalVisible(false)}
      >
        <View style={styles.countryModalOverlay}>
          <View style={styles.countryModalContent}>
            <View style={styles.countryModalHeader}>
              <Text style={styles.countryModalTitle}>Ülke Seç</Text>
              <TouchableOpacity onPress={() => setCountryModalVisible(false)}>
                <MaterialIcons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>
            <View style={styles.countrySearchContainer}>
              <MaterialIcons name="search" size={20} color="#94a3b8" />
              <TextInput
                style={styles.countrySearchInput}
                placeholder="Ülke ara..."
                placeholderTextColor="#94a3b8"
                value={countrySearch}
                onChangeText={setCountrySearch}
                autoCapitalize="none"
              />
            </View>
            <ScrollView style={styles.countryList}>
              {countries
                .filter(c => c.name.toLowerCase().includes(countrySearch.toLowerCase()) || c.dialCode.includes(countrySearch))
                .map((country) => (
                  <TouchableOpacity
                    key={country.code}
                    style={[
                      styles.countryItem,
                      selectedCountry.code === country.code && styles.countryItemSelected
                    ]}
                    onPress={() => {
                      setSelectedCountry(country);
                      setCountryModalVisible(false);
                    }}
                  >
                    <Text style={styles.countryFlag}>{country.flag}</Text>
                    <View style={styles.countryInfo}>
                      <Text style={styles.countryName}>{country.name}</Text>
                      <Text style={styles.countryDialCode}>{country.dialCode}</Text>
                    </View>
                    {selectedCountry.code === country.code && (
                      <MaterialIcons name="check" size={20} color="#2563EB" />
                    )}
                  </TouchableOpacity>
                ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
    color: '#0f172a',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#0f172a',
    padding: 0,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  statBox: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontFamily: 'Poppins_700Bold',
  },
  statText: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: '#64748b',
  },
  content: {
    paddingHorizontal: 20,
  },
  staffCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  staffAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  staffInfo: {
    flex: 1,
  },
  staffNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  staffName: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: '#0f172a',
  },
  inactiveBadge: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  inactiveBadgeText: {
    fontSize: 10,
    fontFamily: 'Poppins_500Medium',
    color: '#ef4444',
  },
  staffDepartment: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: '#64748b',
    marginBottom: 8,
  },
  staffMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  roleBadgeText: {
    fontSize: 11,
    fontFamily: 'Poppins_500Medium',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    fontFamily: 'Poppins_500Medium',
    color: '#64748b',
  },
  taskCount: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: '#94a3b8',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Poppins_600SemiBold',
    color: '#0f172a',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
    color: '#64748b',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    fontFamily: 'Poppins_400Regular',
    color: '#0f172a',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
  },
  countrySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderRightWidth: 1,
    borderRightColor: '#e2e8f0',
    gap: 4,
    backgroundColor: '#f1f5f9',
  },
  flagText: {
    fontSize: 18,
  },
  dialCodeText: {
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
    color: '#0f172a',
  },
  flexInput: {
    flex: 1,
    paddingHorizontal: 14,
    height: '100%',
    fontSize: 15,
    fontFamily: 'Poppins_400Regular',
    color: '#0f172a',
  },
  roleOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  roleOption: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  roleOptionActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  roleOptionText: {
    fontSize: 13,
    fontFamily: 'Poppins_500Medium',
    color: '#64748b',
  },
  roleOptionTextActive: {
    color: 'white',
  },
  deptChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  deptChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  deptChipActive: {
    backgroundColor: '#eff6ff',
    borderColor: '#3b82f6',
  },
  deptChipText: {
    fontSize: 12,
    fontFamily: 'Poppins_500Medium',
    color: '#64748b',
  },
  deptChipTextActive: {
    color: '#3b82f6',
  },
  saveButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 24,
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: 'white',
  },
  successOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  successContent: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 32,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  successIconContainer: {
    marginBottom: 20,
    transform: [{ scale: 1.1 }],
  },
  successTitle: {
    fontSize: 24,
    fontFamily: 'Poppins_700Bold',
    color: '#0f172a',
    marginBottom: 8,
  },
  successMessage: {
    fontSize: 16,
    fontFamily: 'Poppins_400Regular',
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  successButton: {
    backgroundColor: '#0f172a',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
  },
  successButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: 'white',
  },
  countryModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  countryModalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '70%',
    paddingBottom: 20,
  },
  countryModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  countryModalTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
    color: '#0f172a',
  },
  countrySearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginVertical: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    gap: 10,
  },
  countrySearchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Poppins_400Regular',
    color: '#0f172a',
  },
  countryList: {
    maxHeight: 400,
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingHorizontal: 20,
    gap: 12,
  },
  countryItemSelected: {
    backgroundColor: '#eff6ff',
  },
  countryFlag: {
    fontSize: 24,
  },
  countryInfo: {
    flex: 1,
  },
  countryName: {
    fontSize: 15,
    fontFamily: 'Poppins_500Medium',
    color: '#0f172a',
    marginBottom: 2,
  },
  countryDialCode: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: '#64748b',
  },
});
