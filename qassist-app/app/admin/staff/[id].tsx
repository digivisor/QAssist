import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Modal, TextInput, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';

// Mock personel verisi
const mockStaffData: Record<string, any> = {
  '1': { 
    id: 1, 
    name: 'Ahmet Yılmaz', 
    phone: '+90 532 123 4567',
    email: 'ahmet.yilmaz@otel.com',
    department: 'Kat Hizmetleri',
    role: 'staff', 
    jobTitle: 'Kat Görevlisi',
    rating: 4.8, 
    totalCompleted: 145,
    positiveCount: 138,
    negativeCount: 7,
    startDate: '15 Ocak 2023',
  },
  '2': { 
    id: 2, 
    name: 'Fatma Öz', 
    phone: '+90 533 234 5678',
    email: 'fatma.oz@otel.com',
    department: 'Kat Hizmetleri',
    role: 'staff', 
    jobTitle: 'Kat Görevlisi',
    rating: 4.7, 
    totalCompleted: 128,
    positiveCount: 120,
    negativeCount: 8,
    startDate: '1 Mart 2023',
  },
  '3': { 
    id: 3, 
    name: 'Ayşe Demir', 
    phone: '+90 534 345 6789',
    email: 'ayse.demir@otel.com',
    department: 'Kat Hizmetleri',
    role: 'manager', 
    jobTitle: 'Kat Hizmetleri Müdürü',
    rating: 4.9, 
    totalCompleted: 89,
    positiveCount: 87,
    negativeCount: 2,
    startDate: '10 Haziran 2022',
  },
};

// Mock görev verisi
const mockTasks = {
  active: [
    { id: 1, title: 'Oda 304 Temizlik', room: '304', priority: 'high', time: '10:30' },
    { id: 2, title: 'Oda 412 Havlu Değişimi', room: '412', priority: 'medium', time: '11:00' },
    { id: 3, title: 'Koridor Temizliği', room: '3. Kat', priority: 'low', time: '11:30' },
  ],
  completed: [
    { id: 4, title: 'Oda 102 Temizlik', room: '102', completedAt: '09:45', status: 'positive' },
    { id: 5, title: 'Oda 203 Temizlik', room: '203', completedAt: '09:30', status: 'positive' },
    { id: 6, title: 'Oda 118 Temizlik', room: '118', completedAt: '08:50', status: 'negative', issue: 'Misafir odada olduğu için temizlik yapılamadı' },
    { id: 7, title: 'Oda 305 Temizlik', room: '305', completedAt: '08:15', status: 'positive' },
    { id: 8, title: 'Oda 401 Check-out', room: '401', completedAt: '07:45', status: 'positive' },
  ],
};

export default function StaffDetailScreen() {
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState('active');

  const staff = mockStaffData[id as string] || mockStaffData['1'];

  const tabs = [
    { id: 'active', label: 'Aktif Görevler', count: mockTasks.active.length },
    { id: 'completed', label: 'Tamamlanan', count: mockTasks.completed.length },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#22c55e';
      default: return '#64748b';
    }
  };

  const handleCall = () => {
    Linking.openURL(`tel:${staff.phone.replace(/\s/g, '')}`);
  };

  const handleOpenMessagesChat = () => {
    // Mesajlar sekmesine, bu personelle sohbeti açık şekilde git
    router.push({
      pathname: '/(tabs)/messages',
      params: {
        employeeId: staff.id.toString(),
        employeeName: staff.name,
      },
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Personel Detayı</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Profil Kartı */}
        <View style={styles.profileCard}>
          <View style={styles.avatarLarge}>
            <Ionicons name="person" size={40} color="#2563EB" />
          </View>
          <Text style={styles.staffName}>{staff.name}</Text>
          <Text style={styles.jobTitle}>{staff.jobTitle}</Text>
          
          <View style={styles.badgeRow}>
            <View style={[styles.badge, { backgroundColor: '#dbeafe' }]}>
              <Ionicons name="business-outline" size={14} color="#3b82f6" />
              <Text style={[styles.badgeText, { color: '#3b82f6' }]}>{staff.department}</Text>
            </View>
            {staff.role === 'manager' && (
              <View style={[styles.badge, { backgroundColor: '#f3e8ff' }]}>
                <Ionicons name="shield-checkmark-outline" size={14} color="#8b5cf6" />
                <Text style={[styles.badgeText, { color: '#8b5cf6' }]}>Müdür</Text>
              </View>
            )}
          </View>

          {/* İletişim Butonları */}
          <View style={styles.contactButtons}>
            <TouchableOpacity style={styles.callButton} onPress={handleCall}>
              <Ionicons name="call" size={20} color="white" />
              <Text style={styles.callButtonText}>Ara</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.messageButton} 
              onPress={handleOpenMessagesChat}
            >
              <Ionicons name="chatbubble" size={20} color="#2563EB" />
              <Text style={styles.messageButtonText}>Mesaj</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* İletişim Bilgileri */}
        <View style={styles.infoCard}>
          <View style={styles.infoItem}>
            <View style={[styles.infoIcon, { backgroundColor: '#dbeafe' }]}>
              <Ionicons name="call" size={18} color="#3b82f6" />
            </View>
            <View>
              <Text style={styles.infoLabel}>Telefon</Text>
              <Text style={styles.infoValue}>{staff.phone}</Text>
            </View>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoItem}>
            <View style={[styles.infoIcon, { backgroundColor: '#fef3c7' }]}>
              <Ionicons name="mail" size={18} color="#f59e0b" />
            </View>
            <View>
              <Text style={styles.infoLabel}>E-posta</Text>
              <Text style={styles.infoValue}>{staff.email}</Text>
            </View>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoItem}>
            <View style={[styles.infoIcon, { backgroundColor: '#dcfce7' }]}>
              <Ionicons name="calendar" size={18} color="#22c55e" />
            </View>
            <View>
              <Text style={styles.infoLabel}>İşe Başlama</Text>
              <Text style={styles.infoValue}>{staff.startDate}</Text>
            </View>
          </View>
        </View>

        {/* İstatistikler */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{staff.totalCompleted}</Text>
            <Text style={styles.statLabel}>Toplam</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#22c55e' }]}>{staff.positiveCount}</Text>
            <Text style={styles.statLabel}>Olumlu</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#ef4444' }]}>{staff.negativeCount}</Text>
            <Text style={styles.statLabel}>Olumsuz</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={18} color="#f59e0b" />
              <Text style={[styles.statValue, { color: '#f59e0b' }]}>{staff.rating}</Text>
            </View>
            <Text style={styles.statLabel}>Puan</Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, activeTab === tab.id && styles.tabActive]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Text style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}>
                {tab.label}
              </Text>
              <View style={[styles.tabBadge, activeTab === tab.id && styles.tabBadgeActive]}>
                <Text style={[styles.tabBadgeText, activeTab === tab.id && styles.tabBadgeTextActive]}>
                  {tab.count}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Aktif Görevler */}
        {activeTab === 'active' && (
          <>
            {mockTasks.active.map((task) => (
              <TouchableOpacity 
                key={task.id} 
                style={styles.taskCard}
                onPress={() => router.push(`/task-detail/${task.id}`)}
              >
                <View style={[styles.priorityIndicator, { backgroundColor: getPriorityColor(task.priority) }]} />
                <View style={styles.taskInfo}>
                  <Text style={styles.taskTitle}>{task.title}</Text>
                  <View style={styles.taskMeta}>
                    <View style={styles.taskMetaItem}>
                      <Ionicons name="location-outline" size={14} color="#64748b" />
                      <Text style={styles.taskMetaText}>{task.room}</Text>
                    </View>
                    <View style={styles.taskMetaItem}>
                      <Ionicons name="time-outline" size={14} color="#64748b" />
                      <Text style={styles.taskMetaText}>{task.time}</Text>
                    </View>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
              </TouchableOpacity>
            ))}
            {mockTasks.active.length === 0 && (
              <View style={styles.emptyState}>
                <Ionicons name="checkmark-circle-outline" size={48} color="#22c55e" />
                <Text style={styles.emptyStateText}>Aktif görev yok</Text>
              </View>
            )}
          </>
        )}

        {/* Tamamlanan Görevler */}
        {activeTab === 'completed' && (
          <>
            {mockTasks.completed.map((task) => (
              <TouchableOpacity 
                key={task.id} 
                style={styles.taskCard}
                onPress={() => router.push(`/task-detail/${task.id}`)}
              >
                <View style={[
                  styles.statusIndicator, 
                  { backgroundColor: task.status === 'positive' ? '#22c55e' : '#ef4444' }
                ]}>
                  <Ionicons 
                    name={task.status === 'positive' ? 'checkmark' : 'close'} 
                    size={14} 
                    color="white" 
                  />
                </View>
                <View style={styles.taskInfo}>
                  <Text style={styles.taskTitle}>{task.title}</Text>
                  <View style={styles.taskMeta}>
                    <View style={styles.taskMetaItem}>
                      <Ionicons name="location-outline" size={14} color="#64748b" />
                      <Text style={styles.taskMetaText}>{task.room}</Text>
                    </View>
                    <View style={styles.taskMetaItem}>
                      <Ionicons name="checkmark-done-outline" size={14} color="#22c55e" />
                      <Text style={styles.taskMetaText}>{task.completedAt}</Text>
                    </View>
                  </View>
                  {task.status === 'negative' && task.issue && (
                    <View style={styles.issueContainer}>
                      <Text style={styles.issueText}>{task.issue}</Text>
                    </View>
                  )}
                </View>
                <View style={[
                  styles.statusBadge, 
                  { backgroundColor: task.status === 'positive' ? '#dcfce7' : '#fee2e2' }
                ]}>
                  <Text style={[
                    styles.statusBadgeText, 
                    { color: task.status === 'positive' ? '#22c55e' : '#ef4444' }
                  ]}>
                    {task.status === 'positive' ? 'Olumlu' : 'Olumsuz'}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}
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
  content: {
    paddingHorizontal: 20,
  },
  // Profil Kartı
  profileCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  staffName: {
    fontSize: 22,
    fontFamily: 'Poppins_700Bold',
    color: '#0f172a',
    marginBottom: 4,
  },
  jobTitle: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#64748b',
    marginBottom: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  badgeText: {
    fontSize: 12,
    fontFamily: 'Poppins_500Medium',
  },
  contactButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  callButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#22c55e',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  callButtonText: {
    fontSize: 15,
    fontFamily: 'Poppins_600SemiBold',
    color: 'white',
  },
  messageButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eff6ff',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  messageButtonText: {
    fontSize: 15,
    fontFamily: 'Poppins_600SemiBold',
    color: '#2563EB',
  },
  // Info Card
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 4,
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 14,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoLabel: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: '#94a3b8',
  },
  infoValue: {
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
    color: '#0f172a',
  },
  infoDivider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginHorizontal: 14,
  },
  // İstatistikler
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontFamily: 'Poppins_700Bold',
    color: '#0f172a',
  },
  statLabel: {
    fontSize: 11,
    fontFamily: 'Poppins_400Regular',
    color: '#64748b',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#e2e8f0',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  // Tabs
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 10,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'white',
    gap: 8,
  },
  tabActive: {
    backgroundColor: '#2563EB',
  },
  tabText: {
    fontSize: 13,
    fontFamily: 'Poppins_500Medium',
    color: '#64748b',
  },
  tabTextActive: {
    color: 'white',
  },
  tabBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  tabBadgeActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  tabBadgeText: {
    fontSize: 12,
    fontFamily: 'Poppins_600SemiBold',
    color: '#64748b',
  },
  tabBadgeTextActive: {
    color: 'white',
  },
  // Task Card
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  priorityIndicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: 14,
  },
  statusIndicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 15,
    fontFamily: 'Poppins_600SemiBold',
    color: '#0f172a',
    marginBottom: 6,
  },
  taskMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  taskMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  taskMetaText: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: '#64748b',
  },
  issueContainer: {
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    padding: 8,
    marginTop: 8,
  },
  issueText: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: '#ef4444',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 11,
    fontFamily: 'Poppins_600SemiBold',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 15,
    fontFamily: 'Poppins_500Medium',
    color: '#64748b',
    marginTop: 12,
  },
});

