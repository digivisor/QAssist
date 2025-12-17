import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';

// Mock departman verisi
const mockDepartments = [
  { 
    id: 1, 
    name: 'Kat Hizmetleri', 
    icon: 'bed-outline',
    color: '#3b82f6',
    staffCount: 8, 
    activeTasks: 12, 
    completedToday: 24,
    manager: 'Ayşe Demir'
  },
  { 
    id: 2, 
    name: 'Resepsiyon', 
    icon: 'desktop-outline',
    color: '#8b5cf6',
    staffCount: 5, 
    activeTasks: 4, 
    completedToday: 18,
    manager: 'Mehmet Kaya'
  },
  { 
    id: 3, 
    name: 'Teknik Servis', 
    icon: 'construct-outline',
    color: '#f59e0b',
    staffCount: 4, 
    activeTasks: 8, 
    completedToday: 15,
    manager: 'Ali Çelik'
  },
  { 
    id: 4, 
    name: 'F&B', 
    icon: 'restaurant-outline',
    color: '#22c55e',
    staffCount: 6, 
    activeTasks: 6, 
    completedToday: 32,
    manager: 'Fatma Öz'
  },
  { 
    id: 5, 
    name: 'Güvenlik', 
    icon: 'shield-checkmark-outline',
    color: '#ef4444',
    staffCount: 3, 
    activeTasks: 2, 
    completedToday: 8,
    manager: 'Hasan Yıldız'
  },
];

export default function DepartmentsScreen() {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Departman Takibi</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Genel Özet */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Ionicons name="people" size={28} color="#3b82f6" />
          <Text style={styles.summaryValue}>26</Text>
          <Text style={styles.summaryLabel}>Toplam Personel</Text>
        </View>
        <View style={styles.summaryCard}>
          <Ionicons name="layers" size={28} color="#8b5cf6" />
          <Text style={styles.summaryValue}>32</Text>
          <Text style={styles.summaryLabel}>Aktif Görev</Text>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Departmanlar</Text>
        
        {mockDepartments.map((dept) => (
          <TouchableOpacity 
            key={dept.id} 
            style={styles.deptCard}
            onPress={() => router.push(`/admin/department/${dept.id}`)}
          >
            <View style={styles.deptHeader}>
              <View style={[styles.deptIcon, { backgroundColor: dept.color + '20' }]}>
                <Ionicons name={dept.icon as any} size={24} color={dept.color} />
              </View>
              <View style={styles.deptInfo}>
                <Text style={styles.deptName}>{dept.name}</Text>
                <Text style={styles.deptManager}>Müdür: {dept.manager}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
            </View>
            
            <View style={styles.deptStats}>
              <View style={styles.deptStatItem}>
                <Ionicons name="people-outline" size={16} color="#64748b" />
                <Text style={styles.deptStatText}>{dept.staffCount} Personel</Text>
              </View>
              <View style={styles.deptStatDivider} />
              <View style={styles.deptStatItem}>
                <Ionicons name="time-outline" size={16} color="#f59e0b" />
                <Text style={styles.deptStatText}>{dept.activeTasks} Aktif</Text>
              </View>
              <View style={styles.deptStatDivider} />
              <View style={styles.deptStatItem}>
                <Ionicons name="checkmark-circle-outline" size={16} color="#22c55e" />
                <Text style={styles.deptStatText}>{dept.completedToday} Bugün</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
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
  summaryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 28,
    fontFamily: 'Poppins_700Bold',
    color: '#0f172a',
    marginTop: 8,
  },
  summaryLabel: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: '#64748b',
  },
  content: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: '#0f172a',
    marginBottom: 16,
  },
  deptCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  deptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  deptIcon: {
    width: 50,
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  deptInfo: {
    flex: 1,
  },
  deptName: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: '#0f172a',
    marginBottom: 2,
  },
  deptManager: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: '#64748b',
  },
  deptStats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
  },
  deptStatItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  deptStatText: {
    fontSize: 12,
    fontFamily: 'Poppins_500Medium',
    color: '#64748b',
  },
  deptStatDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#e2e8f0',
  },
});

