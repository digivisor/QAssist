import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { supabase } from '../../lib/supabase';
import { useTheme } from '../../context/ThemeContext';
import { RefreshControl, ActivityIndicator } from 'react-native';

const getDeptIcon = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes('kat') || n.includes('cleaning')) return 'bed-outline';
  if (n.includes('resepsiyon') || n.includes('reception')) return 'desktop-outline';
  if (n.includes('teknik') || n.includes('technical')) return 'construct-outline';
  if (n.includes('mutfak') || n.includes(' f&b') || n.includes('food')) return 'restaurant-outline';
  if (n.includes('güvenlik') || n.includes('security')) return 'shield-checkmark-outline';
  return 'business-outline';
};

const getDeptColor = (index: number) => {
  const colors = ['#3b82f6', '#8b5cf6', '#f59e0b', '#22c55e', '#ef4444', '#ec4899'];
  return colors[index % colors.length];
};

export default function DepartmentsScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [departments, setDepartments] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [summary, setSummary] = React.useState({ totalStaff: 0, activeTasks: 0 });

  const fetchData = async () => {
    try {
      // 1. Departmanları cek
      const { data: deptData, error: deptError } = await supabase
        .from('hotel_departments')
        .select('*')
        .order('name');

      if (deptError) throw deptError;

      // 2. Tüm personelleri ve görevleri cek (tek seferde cekip hafızada filtreleyelim performans icin)
      const { data: staffData } = await supabase.from('employees').select('id, first_name, last_name, role, department_id');
      const { data: tasksData } = await supabase.from('tasks').select('id, status, department, created_at');

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const formattedDepts = (deptData || []).map((dept, index) => {
        const deptStaff = (staffData || []).filter(s => s.department_id === dept.id);
        const deptTasks = (tasksData || []).filter(t => t.department === dept.id);
        const manager = deptStaff.find(s => s.role === 'manager');

        return {
          id: dept.id,
          name: dept.name,
          icon: getDeptIcon(dept.name),
          color: getDeptColor(index),
          staffCount: deptStaff.length,
          activeTasks: deptTasks.filter(t => t.status !== 'completed').length,
          completedToday: deptTasks.filter(t => t.status === 'completed' && new Date(t.created_at) >= today).length,
          manager: manager ? `${manager.first_name} ${manager.last_name}` : 'Atanmamış'
        };
      });

      setDepartments(formattedDepts);
      setSummary({
        totalStaff: (staffData || []).length,
        activeTasks: (tasksData || []).filter(t => t.status !== 'completed').length
      });
    } catch (e) {
      console.error('Veri çekme hatası:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

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
          <Text style={styles.summaryValue}>{summary.totalStaff}</Text>
          <Text style={styles.summaryLabel}>Toplam Personel</Text>
        </View>
        <View style={styles.summaryCard}>
          <Ionicons name="layers" size={28} color="#8b5cf6" />
          <Text style={styles.summaryValue}>{summary.activeTasks}</Text>
          <Text style={styles.summaryLabel}>Aktif Görev</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Text style={styles.sectionTitle}>Departmanlar</Text>

        {departments.map((dept) => (
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

