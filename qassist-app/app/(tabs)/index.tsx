import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, ScrollView, RefreshControl, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { supabase } from '../../lib/supabase';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Skeleton, SkeletonCircle } from '../../components/ui/Skeleton';

export default function HomeScreen() {
  const { user, isAdmin } = useAuth();
  const { colors } = useTheme();
  const [stats, setStats] = useState({ pending: 0, in_progress: 0, completed: 0, urgent: 0 });
  const [recentTasks, setRecentTasks] = useState<any[]>([]);
  const [deptStats, setDeptStats] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // 1. Genel İstatistikleri Çek
      let statsQuery = supabase.from('tasks').select('status, department, priority');

      if (!isAdmin) {
        if (user.role === 'manager') {
          statsQuery = statsQuery.eq('department', user.department_id);
        } else {
          statsQuery = statsQuery.contains('assigned_employee_ids', [user.id]);
        }
      }

      const { data: allTasks, error: statsError } = await statsQuery;
      if (statsError) throw statsError;

      const pending = (allTasks || []).filter(t => t.status === 'pending').length;
      const in_progress = (allTasks || []).filter(t => t.status === 'in_progress').length;

      // Bugün tamamlananlar
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const completedToday = (allTasks || []).filter(t =>
        t.status === 'completed'
      ).length;

      setStats({
        pending,
        in_progress,
        completed: completedToday,
        urgent: (allTasks || []).filter(t => t.priority === 'high' && (t.status === 'pending' || t.status === 'in_progress')).length
      });

      // 2. Son Görevleri Çek
      let recentQuery = supabase
        .from('tasks')
        .select(`
          *,
          hotel_departments(name),
          customers(room_number)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (!isAdmin) {
        if (user.role === 'manager') {
          recentQuery = recentQuery.eq('department', user.department_id);
        } else {
          recentQuery = recentQuery.contains('assigned_employee_ids', [user.id]);
        }
      }

      const { data: tasksData, error: tasksError } = await recentQuery;
      if (tasksError) throw tasksError;

      setRecentTasks(tasksData || []);

      // 3. Admin ise Departman Özetlerini Çek
      if (isAdmin) {
        const { data: depts, error: deptsError } = await supabase
          .from('hotel_departments')
          .select('id, name');

        if (deptsError) throw deptsError;

        const deptSummaries = depts.map(d => {
          const deptTasks = (allTasks || []).filter(t => t.department === d.id);
          const active = deptTasks.filter(t => t.status === 'pending' || t.status === 'in_progress').length;
          const completed = deptTasks.filter(t => t.status === 'completed').length;
          const urgent = deptTasks.filter(t => t.priority === 'high' && (t.status === 'pending' || t.status === 'in_progress')).length;

          const colors = ['#3b82f6', '#8b5cf6', '#f59e0b', '#22c55e', '#ef4444'];
          const color = colors[d.id % colors.length] || '#64748b';

          return {
            id: d.id,
            name: d.name,
            active,
            completed,
            urgent,
            color
          };
        });

        setDeptStats(deptSummaries);
      }
    } catch (e) {
      console.error('Dashboard veri çekme hatası:', e);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    const channel = supabase
      .channel('tasks-dashboard')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => {
        fetchDashboardData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDashboardData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#22c55e';
      case 'in_progress': return '#3b82f6';
      case 'pending': return '#f59e0b';
      default: return '#64748b';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Tamamlandı';
      case 'in_progress': return 'Devam Ediyor';
      case 'pending': return 'Bekliyor';
      default: return status;
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Günaydın';
    if (hour < 18) return 'İyi Günler';
    return 'İyi Akşamlar';
  };

  const renderSkeleton = () => (
    <View style={{ paddingBottom: 20 }}>
      <View style={styles.header}>
        <View style={styles.greetingContainer}>
          <Skeleton width={150} height={24} style={{ marginBottom: 8 }} />
          <Skeleton width={100} height={16} />
        </View>
        <SkeletonCircle size={44} />
      </View>
      <Skeleton height={50} borderRadius={12} style={{ marginBottom: 24 }} />
      <View style={styles.statsContainer}>
        <Skeleton height={120} borderRadius={16} style={{ flex: 1 }} />
        <Skeleton height={120} borderRadius={16} style={{ flex: 1 }} />
      </View>
      <View style={styles.sectionHeader}>
        <Skeleton width={120} height={20} />
      </View>
      {[1, 2, 3].map((i) => (
        <View key={i} style={[styles.taskCard, { backgroundColor: colors.card }]}>
          <Skeleton width={4} height={40} style={{ marginRight: 12 }} />
          <View style={{ flex: 1 }}>
            <Skeleton width="60%" height={16} style={{ marginBottom: 8 }} />
            <Skeleton width="40%" height={12} />
          </View>
        </View>
      ))}
    </View>
  );

  const renderTaskCard = (task: any) => (
    <TouchableOpacity
      key={task.id}
      style={[styles.taskCard, { backgroundColor: colors.card }]}
      onPress={() => router.push({ pathname: '/task-detail/[id]', params: { id: task.id } })}
    >
      <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(task.status) }]} />
      <View style={styles.taskContent}>
        <View style={styles.taskHeaderRow}>
          <Text style={[styles.taskTitle, { color: colors.text }]} numberOfLines={1}>{task.title}</Text>
          {task.priority === 'high' && (
            <View style={styles.deptUrgentBadge}>
              <Ionicons name="alert-circle" size={12} color="#ef4444" />
              <Text style={styles.deptUrgentText}>Acil</Text>
            </View>
          )}
        </View>
        <Text style={[styles.taskDesc, { color: colors.textSecondary }]} numberOfLines={1}>{task.description}</Text>
        <View style={styles.taskFooter}>
          <View style={styles.taskMetaRow}>
            {task.hotel_departments?.name && (
              <View style={styles.taskMetaItem}>
                <Ionicons name="business-outline" size={14} color={colors.textSecondary} />
                <Text style={[styles.taskMetaText, { color: colors.textSecondary }]}>{task.hotel_departments.name}</Text>
              </View>
            )}
            {task.customers?.room_number && (
              <View style={styles.taskMetaItem}>
                <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
                <Text style={[styles.taskMetaText, { color: colors.textSecondary }]}>Oda {task.customers.room_number}</Text>
              </View>
            )}
          </View>
          <Text style={[styles.taskTime, { color: colors.textSecondary }]}>
            {new Date(task.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.border} />
    </TouchableOpacity>
  );

  const renderAdminHome = () => (
    <>
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <View style={styles.greetingContainer}>
          <Text style={[styles.greeting, { color: colors.text }]}>{getGreeting()}, <Text style={styles.userName}>{user?.first_name || 'Yönetici'}</Text></Text>
          <Text style={[styles.date, { color: colors.textSecondary }]}>{new Date().toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })}</Text>
        </View>
        <TouchableOpacity style={[styles.notificationButton, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={() => router.push('/notifications')}>
          <Ionicons name="notifications-outline" size={24} color={colors.text} />
          <View style={styles.notificationBadge} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={[styles.searchBar, { backgroundColor: colors.input, borderColor: colors.inputBorder }]}>
        <Ionicons name="search-outline" size={20} color={colors.placeholder} />
        <Text style={[styles.searchText, { color: colors.placeholder }]}>Arama yapın...</Text>
      </TouchableOpacity>

      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: '#2563EB' }]}>
          <View style={styles.statHeader}>
            <Ionicons name="flash-outline" size={20} color="rgba(255,255,255,0.9)" />
          </View>
          <Text style={styles.statValue}>{stats.in_progress + stats.pending}</Text>
          <Text style={styles.statLabel}>Aktif Görev</Text>
          <View style={styles.progressBar}>
            <View style={{ width: '70%', height: '100%', backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 2 }} />
          </View>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#22c55e' }]}>
          <View style={styles.statHeader}>
            <Ionicons name="checkmark-circle-outline" size={20} color="rgba(255,255,255,0.9)" />
          </View>
          <Text style={styles.statValue}>{stats.completed}</Text>
          <Text style={styles.statLabel}>Bugün Tamamlanan</Text>
          <View style={styles.progressBar}>
            <View style={{ width: '60%', height: '100%', backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 2 }} />
          </View>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Departman Durumu</Text>
        <TouchableOpacity onPress={() => router.push('/admin/departments')}>
          <Text style={[styles.seeAll, { color: colors.textSecondary }]}>Tümü</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.deptScroll}>
        {deptStats.map((dept) => (
          <TouchableOpacity key={dept.id} style={[styles.deptCard, { backgroundColor: colors.card }]} onPress={() => router.push('/admin/departments')}>
            <View style={[styles.deptIcon, { backgroundColor: dept.color + '20' }]}>
              <Ionicons name="business-outline" size={20} color={dept.color} />
            </View>
            <Text style={[styles.deptName, { color: colors.text }]} numberOfLines={1}>{dept.name}</Text>
            <View style={styles.deptStatsRow}>
              <Text style={[styles.deptStatText, { color: colors.textSecondary }]}>{dept.active} aktif</Text>
              <Text style={[styles.deptStatText, { color: colors.textSecondary, marginLeft: 8 }]}>{dept.completed} tamamlandı</Text>
            </View>
            {dept.urgent > 0 && (
              <View style={styles.deptUrgentBadge}>
                <Ionicons name="alert-circle" size={12} color="#ef4444" />
                <Text style={styles.deptUrgentText}>{dept.urgent} acil</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Son Görevler</Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/tasks')}>
          <Text style={[styles.seeAll, { color: colors.textSecondary }]}>Tümü</Text>
        </TouchableOpacity>
      </View>
      {recentTasks.map(task => renderTaskCard(task))}

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Hızlı İşlemler</Text>
      </View>

      <View style={styles.quickActionsContainer}>
        <TouchableOpacity style={[styles.quickActionCard, { backgroundColor: colors.card }]} onPress={() => router.push('/(tabs)/new-request')}>
          <View style={[styles.quickIcon, { backgroundColor: '#dbeafe' }]}>
            <Ionicons name="add-circle-outline" size={22} color="#2563EB" />
          </View>
          <View style={styles.quickTextContainer}>
            <Text style={[styles.quickTitle, { color: colors.text }]}>Yeni Görev</Text>
            <Text style={[styles.quickSubtitle, { color: colors.textSecondary }]}>Departmanlara hızlı görev oluştur</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.quickActionCard, { backgroundColor: colors.card }]} onPress={() => router.push('/admin/staff-management')}>
          <View style={[styles.quickIcon, { backgroundColor: '#dcfce7' }]}>
            <Ionicons name="people-outline" size={22} color="#16a34a" />
          </View>
          <View style={styles.quickTextContainer}>
            <Text style={[styles.quickTitle, { color: colors.text }]}>Personel Yönetimi</Text>
            <Text style={[styles.quickSubtitle, { color: colors.textSecondary }]}>Performans ve görev takibi</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.quickActionCard, { backgroundColor: colors.card }]} onPress={() => router.push('/admin/reports')}>
          <View style={[styles.quickIcon, { backgroundColor: '#fef3c7' }]}>
            <Ionicons name="bar-chart-outline" size={22} color="#f59e0b" />
          </View>
          <View style={styles.quickTextContainer}>
            <Text style={[styles.quickTitle, { color: colors.text }]}>Raporlar</Text>
            <Text style={[styles.quickSubtitle, { color: colors.textSecondary }]}>Otel performans özetleri</Text>
          </View>
        </TouchableOpacity>
      </View>
    </>
  );

  const renderManagerHome = () => (
    <>
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <View style={styles.greetingContainer}>
          <Text style={[styles.greeting, { color: colors.text }]}>{getGreeting()}, <Text style={styles.userName}>{user?.first_name}</Text></Text>
          <Text style={[styles.date, { color: colors.textSecondary }]}>Departman Müdürü</Text>
        </View>
        <TouchableOpacity style={[styles.notificationButton, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={() => router.push('/notifications')}>
          <Ionicons name="notifications-outline" size={24} color={colors.text} />
          <View style={styles.notificationBadge} />
        </TouchableOpacity>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Departman Özeti</Text>
      </View>
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: '#3b82f6' }]}>
          <View style={styles.statHeader}>
            <Ionicons name="flash-outline" size={20} color="rgba(255,255,255,0.9)" />
          </View>
          <Text style={styles.statValue}>{stats.pending + stats.in_progress}</Text>
          <Text style={styles.statLabel}>Aktif Görev</Text>
          <View style={styles.progressBar}>
            <View style={{ width: '65%', height: '100%', backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 2 }} />
          </View>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#22c55e' }]}>
          <View style={styles.statHeader}>
            <Ionicons name="checkmark-circle-outline" size={20} color="rgba(255,255,255,0.9)" />
          </View>
          <Text style={styles.statValue}>{stats.completed}</Text>
          <Text style={styles.statLabel}>Tamamlanan (Bugün)</Text>
          <View style={styles.progressBar}>
            <View style={{ width: '50%', height: '100%', backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 2 }} />
          </View>
        </View>
      </View>

      <View style={styles.quickActionsContainer}>
        <TouchableOpacity style={[styles.quickActionCard, { backgroundColor: colors.card }]} onPress={() => router.push('/admin/staff-management')}>
          <View style={[styles.quickIcon, { backgroundColor: '#dcfce7' }]}>
            <Ionicons name="people-outline" size={22} color="#16a34a" />
          </View>
          <View style={styles.quickTextContainer}>
            <Text style={[styles.quickTitle, { color: colors.text }]}>Ekibimi Yönet</Text>
            <Text style={[styles.quickSubtitle, { color: colors.textSecondary }]}>Kendi departman personelinizi takip edin</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Departman Görevleri</Text>
      </View>
      {recentTasks.map(task => renderTaskCard(task))}
    </>
  );

  const renderStaffHome = () => (
    <>
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <View style={styles.greetingContainer}>
          <Text style={[styles.greeting, { color: colors.text }]}>{getGreeting()}, <Text style={styles.userName}>{user?.first_name}</Text></Text>
          <Text style={[styles.date, { color: colors.textSecondary }]}>Gününüz nasıl geçiyor?</Text>
        </View>
        <TouchableOpacity style={[styles.notificationButton, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={() => router.push('/notifications')}>
          <Ionicons name="notifications-outline" size={24} color={colors.text} />
          <View style={styles.notificationBadge} />
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: '#3b82f6' }]}>
          <View style={styles.statHeader}>
            <Ionicons name="sync-outline" size={20} color="rgba(255,255,255,0.8)" />
          </View>
          <Text style={styles.statValue}>{stats.in_progress}</Text>
          <Text style={styles.statLabel}>Devam Eden</Text>
          <View style={styles.progressBar}>
            <View style={{ width: '40%', height: '100%', backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 2 }} />
          </View>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#f97316' }]}>
          <View style={styles.statHeader}>
            <Ionicons name="time-outline" size={20} color="rgba(255,255,255,0.8)" />
          </View>
          <Text style={styles.statValue}>{stats.pending}</Text>
          <Text style={styles.statLabel}>Bekleyen</Text>
          <View style={styles.progressBar}>
            <View style={{ width: '30%', height: '100%', backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 2 }} />
          </View>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Görevlerim</Text>
      </View>
      {recentTasks.map(task => renderTaskCard(task))}
    </>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {loading && !refreshing ? (
          renderSkeleton()
        ) : isAdmin ? (
          renderAdminHome()
        ) : user?.role === 'manager' ? (
          renderManagerHome()
        ) : (
          renderStaffHome()
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
    marginBottom: 4,
  },
  greetingContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: 22,
    fontFamily: 'Poppins_600SemiBold',
  },
  userName: {
    fontFamily: 'Poppins_700Bold',
    color: '#2563EB',
  },
  date: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    marginTop: 4,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  notificationBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
  },
  searchText: {
    marginLeft: 10,
    fontFamily: 'Poppins_400Regular',
    fontSize: 15,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    elevation: 4,
  },
  statHeader: {
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 8,
  },
  statLabel: {
    color: 'white',
    fontSize: 13,
    fontFamily: 'Poppins_500Medium',
    opacity: 0.9,
  },
  statValue: {
    color: 'white',
    fontSize: 28,
    fontFamily: 'Poppins_700Bold',
    marginBottom: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_700Bold',
  },
  seeAll: {
    fontFamily: 'Poppins_600SemiBold',
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    elevation: 2,
  },
  statusIndicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: 12,
  },
  taskContent: {
    flex: 1,
    marginRight: 12,
  },
  taskTitle: {
    fontSize: 15,
    fontFamily: 'Poppins_600SemiBold',
  },
  taskDesc: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    marginBottom: 8,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskTime: {
    fontSize: 11,
    fontFamily: 'Poppins_400Regular',
  },
  deptScroll: {
    paddingBottom: 16,
  },
  deptCard: {
    width: 150,
    borderRadius: 16,
    padding: 14,
    marginRight: 12,
    elevation: 2,
  },
  deptIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  deptName: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    marginBottom: 4,
  },
  deptStatsRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  deptStatText: {
    fontSize: 11,
    fontFamily: 'Poppins_400Regular',
  },
  quickActionsContainer: {
    marginBottom: 24,
  },
  quickActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    elevation: 2,
  },
  quickIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  quickTextContainer: {
    flex: 1,
  },
  quickTitle: {
    fontSize: 15,
    fontFamily: 'Poppins_600SemiBold',
  },
  quickSubtitle: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    marginTop: 2,
  },
  taskHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  deptUrgentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fee2e2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  deptUrgentText: {
    fontSize: 10,
    fontFamily: 'Poppins_500Medium',
    color: '#b91c1c',
  },
  taskMetaRow: {
    flexDirection: 'row',
    gap: 12,
  },
  taskMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  taskMetaText: {
    fontSize: 11,
    fontFamily: 'Poppins_400Regular',
  },
});
