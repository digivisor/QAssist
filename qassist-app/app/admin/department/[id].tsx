import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';

// Mock departman verisi
const mockDepartments: Record<string, any> = {
  '1': { 
    id: 1, 
    name: 'Kat Hizmetleri', 
    icon: 'bed-outline',
    color: '#3b82f6',
    manager: 'Ayşe Demir',
  },
  '2': { 
    id: 2, 
    name: 'Resepsiyon', 
    icon: 'desktop-outline',
    color: '#8b5cf6',
    manager: 'Mehmet Kaya',
  },
};

// Mock personel verisi
const mockStaff = [
  { id: 1, name: 'Ahmet Yılmaz', role: 'staff', rating: 4.8, activeTasks: 3, completedToday: 5 },
  { id: 2, name: 'Fatma Öz', role: 'staff', rating: 4.7, activeTasks: 2, completedToday: 4 },
  { id: 3, name: 'Ayşe Demir', role: 'manager', rating: 4.9, activeTasks: 1, completedToday: 2 },
];

// Mock görev verisi
const mockTasks = {
  active: [
    { id: 1, title: 'Oda 304 Temizlik', room: '304', priority: 'high', assignee: 'Ahmet Yılmaz', time: '10:30' },
    { id: 2, title: 'Oda 412 Havlu Değişimi', room: '412', priority: 'medium', assignee: 'Fatma Öz', time: '11:00' },
    { id: 3, title: 'Koridor Temizliği', room: '3. Kat', priority: 'low', assignee: 'Ahmet Yılmaz', time: '11:30' },
  ],
  pending: [
    { id: 4, title: 'Oda 501 Check-out Temizliği', room: '501', priority: 'high', time: '14:00' },
    { id: 5, title: 'Oda 215 Mini Bar', room: '215', priority: 'medium', time: '15:00' },
  ],
  completedToday: [
    { id: 6, title: 'Oda 102 Temizlik', room: '102', completedBy: 'Ahmet Yılmaz', completedAt: '09:45', status: 'positive' },
    { id: 7, title: 'Oda 203 Temizlik', room: '203', completedBy: 'Fatma Öz', completedAt: '09:30', status: 'positive' },
    { id: 8, title: 'Oda 118 Temizlik', room: '118', completedBy: 'Ahmet Yılmaz', completedAt: '08:50', status: 'negative' },
  ],
};

export default function DepartmentDetailScreen() {
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState('staff');

  const department = mockDepartments[id as string] || mockDepartments['1'];

  const tabs = [
    { id: 'staff', label: 'Personeller', count: mockStaff.length },
    { id: 'active', label: 'Aktif', count: mockTasks.active.length },
    { id: 'pending', label: 'Bekleyen', count: mockTasks.pending.length },
    { id: 'completed', label: 'Tamamlanan', count: mockTasks.completedToday.length },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#22c55e';
      default: return '#64748b';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'Acil';
      case 'medium': return 'Normal';
      case 'low': return 'Düşük';
      default: return 'Normal';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{department.name}</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Departman Özet */}
      <View style={styles.summaryCard}>
        <View style={[styles.deptIcon, { backgroundColor: department.color + '20' }]}>
          <Ionicons name={department.icon} size={32} color={department.color} />
        </View>
        <View style={styles.summaryInfo}>
          <Text style={styles.summaryTitle}>{department.name}</Text>
          <Text style={styles.summaryManager}>Müdür: {department.manager}</Text>
        </View>
      </View>

      {/* İstatistikler */}
      <View style={styles.statsRow}>
        <View style={[styles.statBox, { backgroundColor: '#dbeafe' }]}>
          <Text style={[styles.statNumber, { color: '#3b82f6' }]}>{mockStaff.length}</Text>
          <Text style={styles.statText}>Personel</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: '#fef3c7' }]}>
          <Text style={[styles.statNumber, { color: '#f59e0b' }]}>{mockTasks.active.length}</Text>
          <Text style={styles.statText}>Aktif</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: '#dcfce7' }]}>
          <Text style={[styles.statNumber, { color: '#22c55e' }]}>{mockTasks.completedToday.length}</Text>
          <Text style={styles.statText}>Bugün</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
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
        </ScrollView>
      </View>

      <ScrollView 
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Personeller Tab */}
        {activeTab === 'staff' && (
          <>
            {mockStaff.map((staff) => (
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
                    {staff.role === 'manager' && (
                      <View style={styles.managerBadge}>
                        <Text style={styles.managerBadgeText}>Müdür</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.staffMeta}>
                    <View style={styles.ratingContainer}>
                      <Ionicons name="star" size={14} color="#f59e0b" />
                      <Text style={styles.metaText}>{staff.rating}</Text>
                    </View>
                    <Text style={styles.metaText}>•</Text>
                    <Text style={styles.metaText}>{staff.activeTasks} aktif</Text>
                    <Text style={styles.metaText}>•</Text>
                    <Text style={[styles.metaText, { color: '#22c55e' }]}>{staff.completedToday} bugün</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
              </TouchableOpacity>
            ))}
          </>
        )}

        {/* Aktif Görevler Tab */}
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
                      <Ionicons name="person-outline" size={14} color="#64748b" />
                      <Text style={styles.taskMetaText}>{task.assignee}</Text>
                    </View>
                    <View style={styles.taskMetaItem}>
                      <Ionicons name="time-outline" size={14} color="#64748b" />
                      <Text style={styles.taskMetaText}>{task.time}</Text>
                    </View>
                  </View>
                </View>
                <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(task.priority) + '20' }]}>
                  <Text style={[styles.priorityBadgeText, { color: getPriorityColor(task.priority) }]}>
                    {getPriorityLabel(task.priority)}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}

        {/* Bekleyen Görevler Tab */}
        {activeTab === 'pending' && (
          <>
            {mockTasks.pending.map((task) => (
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
                <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(task.priority) + '20' }]}>
                  <Text style={[styles.priorityBadgeText, { color: getPriorityColor(task.priority) }]}>
                    {getPriorityLabel(task.priority)}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
            {mockTasks.pending.length === 0 && (
              <View style={styles.emptyState}>
                <Ionicons name="checkmark-circle-outline" size={48} color="#22c55e" />
                <Text style={styles.emptyStateText}>Bekleyen görev yok</Text>
              </View>
            )}
          </>
        )}

        {/* Tamamlanan Görevler Tab */}
        {activeTab === 'completed' && (
          <>
            {mockTasks.completedToday.map((task) => (
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
                      <Ionicons name="person-outline" size={14} color="#64748b" />
                      <Text style={styles.taskMetaText}>{task.completedBy}</Text>
                    </View>
                    <View style={styles.taskMetaItem}>
                      <Ionicons name="checkmark-done-outline" size={14} color="#22c55e" />
                      <Text style={styles.taskMetaText}>{task.completedAt}</Text>
                    </View>
                  </View>
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
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  deptIcon: {
    width: 60,
    height: 60,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  summaryInfo: {
    flex: 1,
  },
  summaryTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
    color: '#0f172a',
    marginBottom: 4,
  },
  summaryManager: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#64748b',
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
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
  tabsContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: 'white',
    gap: 8,
  },
  tabActive: {
    backgroundColor: '#2563EB',
  },
  tabText: {
    fontSize: 14,
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
  content: {
    paddingHorizontal: 20,
  },
  // Staff Card
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
    marginBottom: 6,
  },
  staffName: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: '#0f172a',
  },
  managerBadge: {
    backgroundColor: '#f3e8ff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  managerBadgeText: {
    fontSize: 10,
    fontFamily: 'Poppins_500Medium',
    color: '#8b5cf6',
  },
  staffMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: '#64748b',
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
    flexWrap: 'wrap',
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
  priorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priorityBadgeText: {
    fontSize: 11,
    fontFamily: 'Poppins_600SemiBold',
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

