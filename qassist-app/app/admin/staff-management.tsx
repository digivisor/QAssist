import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';

// Mock personel verisi
const mockStaff = [
  { id: 1, name: 'Ahmet Yılmaz', department: 'Kat Hizmetleri', role: 'staff', rating: 4.8, tasks: 45, status: 'active' },
  { id: 2, name: 'Ayşe Demir', department: 'Resepsiyon', role: 'manager', rating: 4.9, tasks: 32, status: 'active' },
  { id: 3, name: 'Mehmet Kaya', department: 'Teknik Servis', role: 'staff', rating: 4.5, tasks: 28, status: 'active' },
  { id: 4, name: 'Fatma Öz', department: 'F&B', role: 'staff', rating: 4.7, tasks: 51, status: 'active' },
  { id: 5, name: 'Ali Çelik', department: 'Güvenlik', role: 'manager', rating: 4.6, tasks: 19, status: 'inactive' },
];

export default function StaffManagementScreen() {
  const insets = useSafeAreaInsets();

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'manager': return { text: 'Müdür', color: '#8b5cf6' };
      case 'staff': return { text: 'Personel', color: '#3b82f6' };
      default: return { text: 'Personel', color: '#3b82f6' };
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Personel Yönetimi</Text>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="person-add" size={22} color="#2563EB" />
        </TouchableOpacity>
      </View>

      {/* Arama ve Filtre */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color="#94a3b8" />
          <Text style={styles.searchPlaceholder}>Personel ara...</Text>
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="filter" size={20} color="#64748b" />
        </TouchableOpacity>
      </View>

      {/* İstatistikler */}
      <View style={styles.statsRow}>
        <View style={[styles.statBox, { backgroundColor: '#dbeafe' }]}>
          <Text style={[styles.statNumber, { color: '#3b82f6' }]}>24</Text>
          <Text style={styles.statText}>Toplam</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: '#dcfce7' }]}>
          <Text style={[styles.statNumber, { color: '#22c55e' }]}>21</Text>
          <Text style={styles.statText}>Aktif</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: '#fee2e2' }]}>
          <Text style={[styles.statNumber, { color: '#ef4444' }]}>3</Text>
          <Text style={styles.statText}>Pasif</Text>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {mockStaff.map((staff) => {
          const badge = getRoleBadge(staff.role);
          return (
            <TouchableOpacity 
              key={staff.id} 
              style={styles.staffCard}
              onPress={() => router.push(`/admin/staff/${staff.id}`)}
            >
              <View style={styles.staffAvatar}>
                <Ionicons name="person" size={24} color="#2563EB" />
              </View>
              <View style={styles.staffInfo}>
                <View style={styles.staffNameRow}>
                  <Text style={styles.staffName}>{staff.name}</Text>
                  {staff.status === 'inactive' && (
                    <View style={styles.inactiveBadge}>
                      <Text style={styles.inactiveBadgeText}>Pasif</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.staffDepartment}>{staff.department}</Text>
                <View style={styles.staffMeta}>
                  <View style={[styles.roleBadge, { backgroundColor: badge.color + '20' }]}>
                    <Text style={[styles.roleBadgeText, { color: badge.color }]}>{badge.text}</Text>
                  </View>
                  <View style={styles.ratingContainer}>
                    <Ionicons name="star" size={14} color="#f59e0b" />
                    <Text style={styles.ratingText}>{staff.rating}</Text>
                  </View>
                  <Text style={styles.taskCount}>{staff.tasks} görev</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
            </TouchableOpacity>
          );
        })}
      </ScrollView>
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
  searchPlaceholder: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#94a3b8',
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
});

