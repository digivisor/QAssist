import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, TextInput, RefreshControl, Image, Modal, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { supabase } from '../../lib/supabase';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Skeleton, SkeletonCircle } from '../../components/ui/Skeleton';

export default function TasksScreen() {
  const { user, isAdmin } = useAuth();
  const { colors } = useTheme();
  const [tasks, setTasks] = useState<any[]>([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [activeDepartment, setActiveDepartment] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [departments, setDepartments] = useState<any[]>([]);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  const fetchTasks = async () => {
    if (!user) return;
    setLoading(true);
    try {
      let query = supabase
        .from('tasks')
        .select(`
          *,
          hotel_departments (name),
          customers (room_number)
        `)
        .order('created_at', { ascending: sortOrder === 'oldest' });

      // Filtreleme Mantığı
      if (activeFilter !== 'all') {
        query = query.eq('status', activeFilter);
      }

      if (isAdmin) {
        // Admin: Departman filtresi (activeDepartment is now department ID from UI)
        if (activeDepartment !== 'all') {
          query = query.eq('department', activeDepartment);
        }
      } else if (user.role === 'manager') {
        // Yönetici: Sadece kendi departmanını görür
        if (user.department_id) {
          query = query.eq('department', user.department_id);
        }
      } else {
        // Personel: Sadece kendisine atananları görür (array contains)
        query = query.contains('assigned_employee_ids', [user.id]);
      }

      const { data: tasksData, error: tasksError } = await query;

      if (tasksError) {
        console.error('Görevleri çekerken hata:', tasksError);
        return;
      }

      // 2. Atanan personellerin detaylarını çek (Manuel Join)
      const allEmployeeIds = new Set<number>();
      tasksData.forEach((t: any) => {
        if (t.assigned_employee_ids && Array.isArray(t.assigned_employee_ids)) {
          t.assigned_employee_ids.forEach((empId: number) => allEmployeeIds.add(empId));
        }
      });

      let employeesMap = new Map<number, any>();
      if (allEmployeeIds.size > 0) {
        const { data: employeesData } = await supabase
          .from('employees')
          .select('id, first_name, last_name, avatar_url')
          .in('id', Array.from(allEmployeeIds));

        if (employeesData) {
          employeesData.forEach((emp: any) => employeesMap.set(emp.id, emp));
        }
      }

      // Veriyi UI formatına dönüştür
      const formattedTasks = tasksData.map((t: any) => {
        let assignee = { name: 'Atanmamış', avatar: null, isUnassigned: true };

        // Show first assignee on card (if multiple, show first)
        if (t.assigned_employee_ids && t.assigned_employee_ids.length > 0) {
          const firstId = t.assigned_employee_ids[0];
          const emp = employeesMap.get(firstId);
          if (emp) {
            const assigneeCount = t.assigned_employee_ids.length;
            assignee = {
              name: assigneeCount > 1
                ? `${emp.first_name} ${emp.last_name} +${assigneeCount - 1}`
                : `${emp.first_name} ${emp.last_name}`,
              avatar: emp.avatar_url || null,
              isUnassigned: false
            };
          }
        }

        // Get department name from join
        const departmentName = t.hotel_departments?.name || 'Departman Yok';

        // Get room number from customers join
        const roomNumber = t.customers?.room_number || null;

        // Format date as HH:MM DD.MM.YYYY
        let formattedDate = '';
        if (t.due_date) {
          const date = new Date(t.due_date);
          const time = date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
          const day = date.toLocaleDateString('tr-TR');
          formattedDate = `${time} ${day}`;
        }

        return {
          ...t,
          assignee,
          department: departmentName,
          roomNumber: roomNumber,
          created_at: new Date(t.created_at).toLocaleDateString('tr-TR'),
          due_date: formattedDate,
        };
      });

      setTasks(formattedTasks);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const { data, error } = await supabase
        .from('hotel_departments')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setDepartments(data || []);
    } catch (e) {
      console.error('Departman çekme hatası:', e);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchTasks();
      if (isAdmin) {
        fetchDepartments();
      }
    }, [activeFilter, activeDepartment, sortOrder])
  );

  // Supabase Realtime - tasks tablosundaki değişiklikleri dinle
  useEffect(() => {
    const channel = supabase
      .channel('tasks-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks' },
        (payload) => {
          console.log('Task değişikliği:', payload.eventType);
          fetchTasks(); // Değişiklik olduğunda listeyi yenile
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeFilter, activeDepartment, sortOrder]);

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
      style={[
        styles.filterBadge,
        { backgroundColor: colors.input, borderColor: colors.inputBorder },
        activeFilter === value && styles.filterBadgeActive
      ]}
      onPress={() => setActiveFilter(value)}
    >
      <Text style={[
        styles.filterText,
        { color: colors.textSecondary },
        activeFilter === value && styles.filterTextActive
      ]}>{label}</Text>
    </TouchableOpacity>
  );

  const DepartmentBadge = ({ label, value }: { label: string, value: string }) => (
    <TouchableOpacity
      style={[
        styles.deptBadge,
        { backgroundColor: colors.input, borderColor: colors.inputBorder },
        activeDepartment === value && styles.deptBadgeActive
      ]}
      onPress={() => setActiveDepartment(value)}
    >
      <Text style={[
        styles.deptText,
        { color: colors.textSecondary },
        activeDepartment === value && styles.deptTextActive
      ]} numberOfLines={1}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderSkeleton = () => {
    return (
      <View style={{ padding: 20, paddingTop: 0 }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <View key={i} style={[styles.taskCard, { backgroundColor: colors.card, opacity: 0.8 }]}>
            <View style={styles.cardHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Skeleton width={80} height={24} borderRadius={8} />
                <Skeleton width={60} height={24} borderRadius={6} />
              </View>
              <SkeletonCircle size={20} />
            </View>

            <Skeleton width="70%" height={22} style={{ marginBottom: 12 }} />
            <Skeleton width="100%" height={16} style={{ marginBottom: 6 }} />
            <Skeleton width="90%" height={16} style={{ marginBottom: 16 }} />

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.cardFooter}>
              <View style={styles.assigneeContainer}>
                <SkeletonCircle size={28} style={{ marginRight: 8 }} />
                <Skeleton width={100} height={14} />
              </View>
              <Skeleton width={80} height={12} />
            </View>
          </View>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Görevler</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, { backgroundColor: colors.input, borderColor: colors.inputBorder }]}>
          <Ionicons name="search-outline" size={20} color={colors.placeholder} />
          <TextInput
            placeholder="Görev ara..."
            style={[styles.searchInput, { color: colors.text }]}
            placeholderTextColor={colors.placeholder}
          />
        </View>
      </View>

      {/* Durum Filtreleri - Sadece Admin dışındakiler için */}
      {!isAdmin && (
        <View style={styles.filters}>
          <FilterBadge label="Tümü" value="all" />
          <FilterBadge label="Bekleyen" value="pending" />
          <FilterBadge label="Devam Eden" value="in_progress" />
          <FilterBadge label="Tamamlanan" value="completed" />
        </View>
      )}

      {/* Admin Gelişmiş Filtre Butonu */}
      {isAdmin && (
        <TouchableOpacity
          style={[styles.filterButton, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => setFilterModalVisible(true)}
        >
          <Ionicons name="options-outline" size={18} color={colors.text} />
          <Text style={[styles.filterButtonText, { color: colors.text }]}>
            Filtrele
          </Text>
          <View style={styles.filterBadgeCount}>
            <Text style={styles.filterBadgeCountText}>
              {(activeFilter !== 'all' ? 1 : 0) + (activeDepartment !== 'all' ? 1 : 0)}
            </Text>
          </View>
        </TouchableOpacity>
      )}

      {loading && !refreshing ? (
        renderSkeleton()
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.taskCard, { backgroundColor: colors.card }]}
              onPress={() => router.push({ pathname: '/task-detail/[id]', params: { id: item.id } })}
            >
              <View style={styles.cardHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={[styles.statusBadge, { color: getStatusColor(item.status), backgroundColor: getStatusColor(item.status) + '20' }]}>
                    {getStatusText(item.status)}
                  </Text>
                  {item.roomNumber && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#dbeafe', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
                      <Ionicons name="bed-outline" size={12} color="#2563EB" />
                      <Text style={{ fontSize: 11, color: '#2563EB', marginLeft: 4, fontWeight: '500', fontFamily: 'Poppins_500Medium' }}>Oda {item.roomNumber}</Text>
                    </View>
                  )}
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.border} />
              </View>

              <Text style={[styles.taskTitle, { color: colors.text }]}>{item.title}</Text>
              <Text style={[styles.taskDesc, { color: colors.textSecondary }]}>{item.description}</Text>

              <View style={[styles.divider, { backgroundColor: colors.border }]} />

              <View style={styles.cardFooter}>
                <View style={styles.assigneeContainer}>
                  {item.assignee.isUnassigned ? (
                    <View style={{ backgroundColor: '#fef2f2', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 }}>
                      <Text style={{ fontSize: 12, color: '#ef4444', fontWeight: '600', fontFamily: 'Poppins_600SemiBold' }}>{item.assignee.name}</Text>
                    </View>
                  ) : (
                    <>
                      {item.assignee.avatar ? (
                        <Image source={{ uri: item.assignee.avatar }} style={styles.assigneeAvatar} />
                      ) : (
                        <View style={[styles.assigneeAvatar, { backgroundColor: '#e2e8f0', justifyContent: 'center', alignItems: 'center' }]}>
                          <Ionicons name="person" size={16} color="#64748b" />
                        </View>
                      )}
                      <Text style={[styles.assigneeName, { color: colors.text }]}>{item.assignee.name}</Text>
                    </>
                  )}
                </View>
                {item.due_date ? (
                  <View style={styles.dueDateContainer}>
                    <Ionicons name="time-outline" size={12} color={colors.textSecondary} />
                    <Text style={[styles.dueDate, { color: colors.textSecondary, fontSize: 10 }]}>{item.due_date}</Text>
                  </View>
                ) : null}
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Admin Gelişmiş Filtre Modalı */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={filterModalVisible}
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHandle} />
            <Text style={[styles.modalTitle, { color: colors.text }]}>Gelişmiş Filtrele</Text>

            <ScrollView style={styles.modalList} showsVerticalScrollIndicator={false}>
              {/* Sıralama Bölümü */}
              <Text style={[styles.modalSectionTitle, { color: colors.textSecondary }]}>Sıralama</Text>
              <View style={styles.modalChipRow}>
                <TouchableOpacity
                  style={[
                    styles.modalChip,
                    { backgroundColor: colors.input, borderColor: colors.inputBorder },
                    sortOrder === 'newest' && styles.modalChipActive
                  ]}
                  onPress={() => setSortOrder('newest')}
                >
                  <Ionicons name="arrow-down" size={16} color={sortOrder === 'newest' ? '#2563EB' : colors.textSecondary} />
                  <Text style={[
                    styles.modalChipText,
                    { color: colors.text },
                    sortOrder === 'newest' && styles.modalChipTextActive
                  ]}>En Yeni</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.modalChip,
                    { backgroundColor: colors.input, borderColor: colors.inputBorder },
                    sortOrder === 'oldest' && styles.modalChipActive
                  ]}
                  onPress={() => setSortOrder('oldest')}
                >
                  <Ionicons name="arrow-up" size={16} color={sortOrder === 'oldest' ? '#2563EB' : colors.textSecondary} />
                  <Text style={[
                    styles.modalChipText,
                    { color: colors.text },
                    sortOrder === 'oldest' && styles.modalChipTextActive
                  ]}>En Eski</Text>
                </TouchableOpacity>
              </View>

              {/* Durum Bölümü */}
              <Text style={[styles.modalSectionTitle, { color: colors.textSecondary }]}>Durum</Text>
              <View style={styles.modalChipRow}>
                <TouchableOpacity
                  style={[
                    styles.modalChip,
                    { backgroundColor: colors.input, borderColor: colors.inputBorder },
                    activeFilter === 'all' && styles.modalChipActive
                  ]}
                  onPress={() => setActiveFilter('all')}
                >
                  <Text style={[
                    styles.modalChipText,
                    { color: colors.text },
                    activeFilter === 'all' && styles.modalChipTextActive
                  ]}>Tümü</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.modalChip,
                    { backgroundColor: colors.input, borderColor: colors.inputBorder },
                    activeFilter === 'pending' && styles.modalChipActive
                  ]}
                  onPress={() => setActiveFilter('pending')}
                >
                  <View style={[styles.statusDot, { backgroundColor: '#f59e0b' }]} />
                  <Text style={[
                    styles.modalChipText,
                    { color: colors.text },
                    activeFilter === 'pending' && styles.modalChipTextActive
                  ]}>Bekleyen</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.modalChipRow}>
                <TouchableOpacity
                  style={[
                    styles.modalChip,
                    { backgroundColor: colors.input, borderColor: colors.inputBorder },
                    activeFilter === 'in_progress' && styles.modalChipActive
                  ]}
                  onPress={() => setActiveFilter('in_progress')}
                >
                  <View style={[styles.statusDot, { backgroundColor: '#3b82f6' }]} />
                  <Text style={[
                    styles.modalChipText,
                    { color: colors.text },
                    activeFilter === 'in_progress' && styles.modalChipTextActive
                  ]}>Devam Eden</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.modalChip,
                    { backgroundColor: colors.input, borderColor: colors.inputBorder },
                    activeFilter === 'completed' && styles.modalChipActive
                  ]}
                  onPress={() => setActiveFilter('completed')}
                >
                  <View style={[styles.statusDot, { backgroundColor: '#22c55e' }]} />
                  <Text style={[
                    styles.modalChipText,
                    { color: colors.text },
                    activeFilter === 'completed' && styles.modalChipTextActive
                  ]}>Tamamlanan</Text>
                </TouchableOpacity>
              </View>

              {/* Departman Bölümü */}
              <Text style={[styles.modalSectionTitle, { color: colors.textSecondary }]}>Departman</Text>
              <TouchableOpacity
                style={[
                  styles.modalItem,
                  { borderBottomColor: colors.border },
                  activeDepartment === 'all' && styles.modalItemActive
                ]}
                onPress={() => setActiveDepartment('all')}
              >
                <Text style={[
                  styles.modalItemText,
                  { color: colors.text },
                  activeDepartment === 'all' && styles.modalItemTextActive
                ]}>Tüm Departmanlar</Text>
                {activeDepartment === 'all' && (
                  <Ionicons name="checkmark" size={20} color="#2563EB" />
                )}
              </TouchableOpacity>

              {departments.map((dept) => (
                <TouchableOpacity
                  key={dept.id}
                  style={[
                    styles.modalItem,
                    { borderBottomColor: colors.border },
                    activeDepartment === dept.id.toString() && styles.modalItemActive
                  ]}
                  onPress={() => setActiveDepartment(dept.id.toString())}
                >
                  <Text style={[
                    styles.modalItemText,
                    { color: colors.text },
                    activeDepartment === dept.id.toString() && styles.modalItemTextActive
                  ]}>{dept.name}</Text>
                  {activeDepartment === dept.id.toString() && (
                    <Ionicons name="checkmark" size={20} color="#2563EB" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Butonlar */}
            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={[styles.modalResetButton, { borderColor: colors.border }]}
                onPress={() => {
                  setActiveFilter('all');
                  setActiveDepartment('all');
                  setSortOrder('newest');
                }}
              >
                <Ionicons name="refresh-outline" size={18} color={colors.textSecondary} />
                <Text style={[styles.modalResetText, { color: colors.textSecondary }]}>Sıfırla</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalApplyButton}
                onPress={() => setFilterModalVisible(false)}
              >
                <Text style={styles.modalApplyText}>Uygula</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
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
    borderWidth: 1,
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
    borderWidth: 1,
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
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginBottom: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  filterButtonText: {
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingBottom: 32,
    maxHeight: '70%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#cbd5e1',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
    textAlign: 'center',
    marginBottom: 16,
  },
  modalList: {
    paddingHorizontal: 20,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalItemActive: {
    backgroundColor: '#eff6ff',
  },
  modalItemText: {
    fontSize: 15,
    fontFamily: 'Poppins_500Medium',
  },
  modalItemTextActive: {
    color: '#2563EB',
    fontFamily: 'Poppins_600SemiBold',
  },
  modalCloseButton: {
    marginTop: 16,
    marginHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 15,
    fontFamily: 'Poppins_600SemiBold',
    color: '#64748b',
  },
  modalSectionTitle: {
    fontSize: 13,
    fontFamily: 'Poppins_600SemiBold',
    marginTop: 16,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  modalChipRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8,
  },
  modalChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    gap: 6,
  },
  modalChipActive: {
    backgroundColor: '#eff6ff',
    borderColor: '#2563EB',
  },
  modalChipText: {
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
  },
  modalChipTextActive: {
    color: '#2563EB',
    fontFamily: 'Poppins_600SemiBold',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  modalButtonRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 12,
  },
  modalResetButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  modalResetText: {
    fontSize: 15,
    fontFamily: 'Poppins_500Medium',
  },
  modalApplyButton: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#2563EB',
  },
  modalApplyText: {
    fontSize: 15,
    fontFamily: 'Poppins_600SemiBold',
    color: '#fff',
  },
  filterBadgeCount: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 22,
    alignItems: 'center',
  },
  filterBadgeCountText: {
    fontSize: 12,
    fontFamily: 'Poppins_600SemiBold',
    color: '#fff',
  },
});
