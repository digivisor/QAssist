import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, TextInput, RefreshControl, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function TasksScreen() {
  const { user, isAdmin } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [activeDepartment, setActiveDepartment] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      const dummyTasks = [
        { id: 1, title: 'Oda Temizliği', description: '305 Numaralı odanın temizlik isteği', status: 'pending', department: 'Kat Hizmetleri', created_at: new Date().toISOString(), due_date: '10:00-12:00', assignee: { name: 'Selin Demir', avatar: 'https://i.pravatar.cc/150?u=1' } },
        { id: 2, title: 'Havuz Kontrolü', description: 'Havuz temizliği kontrol isteği', status: 'in_progress', department: 'Teknik Servis', created_at: new Date().toISOString(), due_date: '10:00-12:00', assignee: { name: 'Ahmet Yılmaz', avatar: 'https://i.pravatar.cc/150?u=2' } },
        { id: 3, title: 'Rezervasyon', description: 'A La Carte Rezervasyon isteği', status: 'completed', department: 'Resepsiyon', created_at: new Date().toISOString(), due_date: 'Akşam', assignee: { name: 'Ayşe Kaya', avatar: 'https://i.pravatar.cc/150?u=3' } },
        { id: 4, title: 'Havlu Değişimi', description: '202 No\'lu oda havlu isteği', status: 'pending', department: 'Kat Hizmetleri', created_at: new Date().toISOString(), due_date: '15:00-16:00', assignee: { name: 'Selin Demir', avatar: 'https://i.pravatar.cc/150?u=1' } },
      ];
      
      let filtered = dummyTasks;

      if (activeFilter !== 'all') {
        filtered = filtered.filter(t => t.status === activeFilter);
      }

      if (isAdmin && activeDepartment !== 'all') {
        filtered = filtered.filter(t => t.department === activeDepartment);
      }
        
      setTasks(filtered);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [activeFilter, activeDepartment]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTasks();
  }, [activeFilter]);

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

  const FilterBadge = ({ label, value }: { label: string, value: string }) => (
    <TouchableOpacity 
      style={[styles.filterBadge, activeFilter === value && styles.filterBadgeActive]}
      onPress={() => setActiveFilter(value)}
    >
      <Text style={[styles.filterText, activeFilter === value && styles.filterTextActive]}>{label}</Text>
    </TouchableOpacity>
  );

  const DepartmentBadge = ({ label, value }: { label: string, value: string }) => (
    <TouchableOpacity 
      style={[styles.deptBadge, activeDepartment === value && styles.deptBadgeActive]}
      onPress={() => setActiveDepartment(value)}
    >
      <Text style={[styles.deptText, activeDepartment === value && styles.deptTextActive]} numberOfLines={1}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Görevler</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color="#94a3b8" />
          <TextInput 
            placeholder="Görev ara..." 
            style={styles.searchInput} 
            placeholderTextColor="#94a3b8" 
          />
        </View>
      </View>

      <View style={styles.filters}>
        <FilterBadge label="Tümü" value="all" />
        <FilterBadge label="Bekleyen" value="pending" />
        <FilterBadge label="Devam Eden" value="in_progress" />
        <FilterBadge label="Tamamlanan" value="completed" />
      </View>

      {isAdmin && (
        <View style={styles.deptFilterContainer}>
          <Text style={styles.deptFilterLabel}>Departmanlar</Text>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={[
              { label: 'Tümü', value: 'all' },
              { label: 'Kat Hizmetleri', value: 'Kat Hizmetleri' },
              { label: 'Resepsiyon', value: 'Resepsiyon' },
              { label: 'Teknik Servis', value: 'Teknik Servis' },
            ]}
            keyExtractor={(item) => item.value}
            contentContainerStyle={styles.deptFilterList}
            renderItem={({ item }) => (
              <DepartmentBadge label={item.label} value={item.value} />
            )}
          />
        </View>
      )}

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
            <TouchableOpacity
            style={styles.taskCard}
            onPress={() => router.push({ pathname: '/task-detail/[id]', params: { id: item.id } })}
            >
            <View style={styles.cardHeader}>
               <Text style={[styles.statusBadge, { color: getStatusColor(item.status), backgroundColor: getStatusColor(item.status) + '20' }]}>
                 {getStatusText(item.status)}
               </Text>
               <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
                </View>
            
            <Text style={styles.taskTitle}>{item.title}</Text>
            <Text style={styles.taskDesc}>{item.description}</Text>
            
            <View style={styles.divider} />
            
            <View style={styles.cardFooter}>
              <View style={styles.assigneeContainer}>
                <Image source={{ uri: item.assignee.avatar }} style={styles.assigneeAvatar} />
                <Text style={styles.assigneeName}>{item.assignee.name}</Text>
              </View>
              <View style={styles.dueDateContainer}>
                <Ionicons name="time-outline" size={14} color="#94a3b8" />
                <Text style={styles.dueDate}>{item.due_date}</Text>
              </View>
            </View>
            </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'Poppins_700Bold',
    color: '#0f172a',
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  searchInput: {
    marginLeft: 8,
    flex: 1,
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
  },
  filters: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 10,
    gap: 8,
  },
  filterBadge: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  filterBadgeActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  filterText: {
    color: '#64748b',
    fontFamily: 'Poppins_500Medium',
    fontSize: 13,
  },
  filterTextActive: {
    color: 'white',
  },
  deptFilterContainer: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  deptFilterLabel: {
    fontSize: 13,
    fontFamily: 'Poppins_500Medium',
    color: '#64748b',
    marginBottom: 6,
  },
  deptFilterList: {
    paddingRight: 4,
  },
  deptBadge: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginRight: 8,
  },
  deptBadgeActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  deptText: {
    fontSize: 12,
    fontFamily: 'Poppins_500Medium',
    color: '#64748b',
  },
  deptTextActive: {
    color: 'white',
  },
  listContent: {
    padding: 20,
    paddingTop: 0,
    paddingBottom: 100,
  },
  taskCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    fontSize: 12,
    fontFamily: 'Poppins_600SemiBold',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    overflow: 'hidden',
  },
  taskTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
    color: '#0f172a',
    marginBottom: 6,
  },
  taskDesc: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#64748b',
    marginBottom: 16,
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  assigneeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  assigneeAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 8,
  },
  assigneeName: {
    fontSize: 13,
    fontFamily: 'Poppins_500Medium',
    color: '#334155',
  },
  dueDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dueDate: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: '#94a3b8',
  },
});
