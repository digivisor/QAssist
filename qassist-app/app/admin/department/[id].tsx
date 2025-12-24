import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { supabase } from '../../../lib/supabase';
import { RefreshControl, ActivityIndicator, Image } from 'react-native';

const getDeptIcon = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes('kat') || n.includes('cleaning')) return 'bed-outline';
  if (n.includes('resepsiyon') || n.includes('reception')) return 'desktop-outline';
  if (n.includes('teknik') || n.includes('technical')) return 'construct-outline';
  if (n.includes('mutfak') || n.includes(' f&b') || n.includes('food')) return 'restaurant-outline';
  if (n.includes('güvenlik') || n.includes('security')) return 'shield-checkmark-outline';
  return 'business-outline';
};

const getDeptColor = (name: string) => {
  const colors: Record<string, string> = {
    'Kat Hizmetleri': '#3b82f6',
    'Resepsiyon': '#8b5cf6',
    'Teknik Servis': '#f59e0b',
    'F&B': '#22c55e',
    'Güvenlik': '#ef4444'
  };
  return colors[name] || '#64748b';
};

export default function DepartmentDetailScreen() {
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState('staff');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [department, setDepartment] = useState<any>(null);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [tasks, setTasks] = useState<{
    active: any[];
    pending: any[];
    completed: any[];
  }>({ active: [], pending: [], completed: [] });

  const fetchData = async () => {
    try {
      if (!id) return;

      // 1. Departman Bilgisi
      const { data: deptData, error: deptError } = await supabase
        .from('hotel_departments')
        .select('*')
        .eq('id', id)
        .single();

      if (deptError) throw deptError;

      // 2. Personeller ve Görevler
      const [staffRes, tasksRes] = await Promise.all([
        supabase.from('employees').select('*').eq('department_id', id),
        supabase.from('tasks')
          .select('*, customers(room_number), hotel_departments(name)')
          .eq('department', id)
      ]);

      if (staffRes.error) throw staffRes.error;
      if (tasksRes.error) throw tasksRes.error;

      const allTasks = tasksRes.data || [];
      const allStaff = staffRes.data || [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Görevleri kategorize et
      const pending = allTasks.filter(t => t.status === 'pending');
      const active = allTasks.filter(t => t.status === 'in_progress');
      const completed = allTasks.filter(t => t.status === 'completed');

      // Personel verisini isle
      const formattedStaff = allStaff.map(s => {
        // Bu personele atanmış görevleri bul (assigned_employee_ids array kolonuna göre)
        const staffTasks = allTasks.filter(t => t.assigned_employee_ids?.includes(s.id));
        const activeCount = staffTasks.filter(t => t.status !== 'completed').length;
        const completedToday = staffTasks.filter(t => t.status === 'completed' && new Date(t.created_at) >= today).length;

        return {
          id: s.id,
          name: `${s.first_name} ${s.last_name}`,
          role: s.role,
          rating: 4.8, // Mock rating (veritabanında henüz yok)
          activeTasks: activeCount,
          completedToday,
          avatar: s.avatar_url
        };
      });

      const manager = allStaff.find(s => s.role === 'manager');

      setDepartment({
        ...deptData,
        mgrName: manager ? `${manager.first_name} ${manager.last_name}` : 'Atanmamış',
        icon: getDeptIcon(deptData.name),
        color: getDeptColor(deptData.name)
      });
      setStaffList(formattedStaff);
      setTasks({ active, pending, completed });

    } catch (e) {
      console.error('Departman detay hatası:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, [id]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  if (loading || !department) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  const tabs = [
    { id: 'staff', label: 'Personeller', count: staffList.length },
    { id: 'active', label: 'Aktif', count: tasks.active.length },
    { id: 'pending', label: 'Bekleyen', count: tasks.pending.length },
    { id: 'completed', label: 'Tamamlanan', count: tasks.completed.length },
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
          <Text style={styles.summaryManager}>Müdür: {department.mgrName}</Text>
        </View>
      </View>

      {/* İstatistikler */}
      <View style={styles.statsRow}>
        <View style={[styles.statBox, { backgroundColor: '#dbeafe' }]}>
          <Text style={[styles.statNumber, { color: '#3b82f6' }]}>{staffList.length}</Text>
          <Text style={styles.statText}>Personel</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: '#fef3c7' }]}>
          <Text style={[styles.statNumber, { color: '#f59e0b' }]}>{tasks.active.length}</Text>
          <Text style={styles.statText}>Aktif</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: '#dcfce7' }]}>
          <Text style={[styles.statNumber, { color: '#22c55e' }]}>{tasks.completed.length}</Text>
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
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Personeller Tab */}
        {activeTab === 'staff' && (
          <>
            {staffList.map((staff) => (
              <TouchableOpacity
                key={staff.id}
                style={styles.staffCard}
                onPress={() => router.push(`/admin/staff/${staff.id}`)}
              >
                <View style={styles.staffAvatar}>
                  {staff.avatar ? (
                    <Image source={{ uri: staff.avatar }} style={{ width: '100%', height: '100%', borderRadius: 25 }} />
                  ) : (
                    <Ionicons name="person" size={24} color="#2563EB" />
                  )}
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
            {tasks.active.map((task) => (
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
                      <Text style={styles.taskMetaText}>Oda {task.customers?.room_number || '—'}</Text>
                    </View>
                    <View style={styles.taskMetaItem}>
                      <Ionicons name="time-outline" size={14} color="#64748b" />
                      <Text style={styles.taskMetaText}>
                        {new Date(task.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                      </Text>
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
            {tasks.active.length === 0 && (
              <View style={styles.emptyState}>
                <Ionicons name="checkmark-circle-outline" size={48} color="#22c55e" />
                <Text style={styles.emptyStateText}>Aktif görev yok</Text>
              </View>
            )}
          </>
        )}

        {/* Bekleyen Görevler Tab */}
        {activeTab === 'pending' && (
          <>
            {tasks.pending.map((task) => (
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
                      <Text style={styles.taskMetaText}>Oda {task.customers?.room_number || '—'}</Text>
                    </View>
                    <View style={styles.taskMetaItem}>
                      <Ionicons name="time-outline" size={14} color="#64748b" />
                      <Text style={styles.taskMetaText}>
                        {new Date(task.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                      </Text>
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
            {tasks.pending.length === 0 && (
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
            {tasks.completed.map((task) => (
              <TouchableOpacity
                key={task.id}
                style={styles.taskCard}
                onPress={() => router.push(`/task-detail/${task.id}`)}
              >
                <View style={[
                  styles.statusIndicator,
                  { backgroundColor: '#22c55e' }
                ]}>
                  <Ionicons
                    name="checkmark"
                    size={14}
                    color="white"
                  />
                </View>
                <View style={styles.taskInfo}>
                  <Text style={styles.taskTitle}>{task.title}</Text>
                  <View style={styles.taskMeta}>
                    <View style={styles.taskMetaItem}>
                      <Ionicons name="location-outline" size={14} color="#64748b" />
                      <Text style={styles.taskMetaText}>Oda {task.customers?.room_number || '—'}</Text>
                    </View>
                    <View style={styles.taskMetaItem}>
                      <Ionicons name="checkmark-done-outline" size={14} color="#22c55e" />
                      <Text style={styles.taskMetaText}>
                        {new Date(task.updated_at || task.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: '#dcfce7' }
                ]}>
                  <Text style={[
                    styles.statusBadgeText,
                    { color: '#22c55e' }
                  ]}>
                    Tamamlandı
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
            {tasks.completed.length === 0 && (
              <View style={styles.emptyState}>
                <Ionicons name="time-outline" size={48} color="#cbd5e1" />
                <Text style={styles.emptyStateText}>Tamamlanmış görev yok</Text>
              </View>
            )}
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

