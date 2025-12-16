import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAuth } from '../../context/AuthContext';

type Task = {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  created_at: string;
  completed_at: string | null;
  department: string;
};

// Mock Data
const mockCompletedTasks: Task[] = [
  {
    id: 1,
    title: 'Havlu Değişimi - 305',
    description: '305 numaralı odanın havluları değiştirildi. Misafir memnun kaldı.',
    status: 'completed',
    priority: 'high',
    created_at: '2025-01-15T09:00:00',
    completed_at: '2025-01-15T10:30:00',
    department: 'Kat Hizmetleri',
  },
  {
    id: 2,
    title: 'Minibar Kontrolü - 412',
    description: '412 numaralı odanın minibarı kontrol edildi ve eksikler tamamlandı.',
    status: 'completed',
    priority: 'medium',
    created_at: '2025-01-15T11:00:00',
    completed_at: '2025-01-15T11:45:00',
    department: 'Kat Hizmetleri',
  },
  {
    id: 3,
    title: 'Klima Bakımı - 208',
    description: 'Misafir şikayeti üzerine klima bakımı yapıldı. Filtre temizlendi.',
    status: 'completed',
    priority: 'high',
    created_at: '2025-01-14T14:00:00',
    completed_at: '2025-01-14T15:30:00',
    department: 'Teknik Servis',
  },
  {
    id: 4,
    title: 'Oda Temizliği - 501',
    description: 'VIP misafir için özel temizlik yapıldı.',
    status: 'completed',
    priority: 'high',
    created_at: '2025-01-14T08:00:00',
    completed_at: '2025-01-14T10:00:00',
    department: 'Kat Hizmetleri',
  },
  {
    id: 5,
    title: 'Çarşaf Değişimi - 3. Kat',
    description: '3. kattaki tüm odaların çarşafları değiştirildi.',
    status: 'completed',
    priority: 'low',
    created_at: '2025-01-13T09:00:00',
    completed_at: '2025-01-13T12:00:00',
    department: 'Kat Hizmetleri',
  },
  {
    id: 6,
    title: 'Televizyon Arızası - 607',
    description: 'Televizyon kumandası değiştirildi ve çalışır hale getirildi.',
    status: 'completed',
    priority: 'medium',
    created_at: '2025-01-12T16:00:00',
    completed_at: '2025-01-12T16:30:00',
    department: 'Teknik Servis',
  },
];

const mockFailedTasks: Task[] = [
  {
    id: 101,
    title: 'Jakuzi Tamiri - 801',
    description: 'Yedek parça temin edilemedi. Sipariş verildi, 3 gün içinde gelecek.',
    status: 'cancelled',
    priority: 'high',
    created_at: '2025-01-15T10:00:00',
    completed_at: '2025-01-15T14:00:00',
    department: 'Teknik Servis',
  },
  {
    id: 102,
    title: 'Ekstra Yatak Talebi - 320',
    description: 'Misafir erken check-out yaptı, talep iptal edildi.',
    status: 'cancelled',
    priority: 'medium',
    created_at: '2025-01-14T20:00:00',
    completed_at: '2025-01-15T08:00:00',
    department: 'Kat Hizmetleri',
  },
  {
    id: 103,
    title: 'Balkon Kapısı Tamiri - 415',
    description: 'Kapı menteşesi değiştirilmeli. Malzeme bekleniyor.',
    status: 'failed',
    priority: 'low',
    created_at: '2025-01-13T11:00:00',
    completed_at: '2025-01-14T09:00:00',
    department: 'Teknik Servis',
  },
];

export default function TaskHistoryScreen() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'completed' | 'failed'>('completed');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTasks();
  }, [activeTab]);

  const loadTasks = () => {
    setLoading(true);
    // Mock data kullan
    setTimeout(() => {
      if (activeTab === 'completed') {
        setTasks(mockCompletedTasks);
      } else {
        setTasks(mockFailedTasks);
      }
      setLoading(false);
    }, 500);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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
      case 'high': return 'Yüksek';
      case 'medium': return 'Orta';
      case 'low': return 'Düşük';
      default: return priority;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Görev Geçmişim</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Tab Bar */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'completed' && styles.tabActiveCompleted]}
          onPress={() => setActiveTab('completed')}
        >
          <Ionicons 
            name="checkmark-circle" 
            size={18} 
            color={activeTab === 'completed' ? '#22c55e' : '#94a3b8'} 
          />
          <Text style={[styles.tabText, activeTab === 'completed' && styles.tabTextActiveCompleted]}>
            Tamamlanan ({mockCompletedTasks.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'failed' && styles.tabActiveFailed]}
          onPress={() => setActiveTab('failed')}
        >
          <Ionicons 
            name="close-circle" 
            size={18} 
            color={activeTab === 'failed' ? '#ef4444' : '#94a3b8'} 
          />
          <Text style={[styles.tabText, activeTab === 'failed' && styles.tabTextActiveFailed]}>
            Tamamlanamayan ({mockFailedTasks.length})
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {tasks.map((task) => (
            <TouchableOpacity 
              key={task.id} 
              style={styles.taskCard}
              onPress={() => router.push(`/task-detail/${task.id}`)}
            >
              <View style={styles.taskHeader}>
                <View style={[styles.statusBadge, { 
                  backgroundColor: activeTab === 'completed' ? '#dcfce7' : '#fef2f2' 
                }]}>
                  <Ionicons 
                    name={activeTab === 'completed' ? 'checkmark' : 'close'} 
                    size={14} 
                    color={activeTab === 'completed' ? '#22c55e' : '#ef4444'} 
                  />
                  <Text style={[styles.statusText, { 
                    color: activeTab === 'completed' ? '#22c55e' : '#ef4444' 
                  }]}>
                    {activeTab === 'completed' ? 'Tamamlandı' : 'İptal/Başarısız'}
                  </Text>
                </View>
                <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(task.priority) + '20' }]}>
                  <Text style={[styles.priorityText, { color: getPriorityColor(task.priority) }]}>
                    {getPriorityLabel(task.priority)}
                  </Text>
                </View>
              </View>
              
              <Text style={styles.taskTitle}>{task.title}</Text>
              
              {task.description && (
                <Text style={styles.taskDescription} numberOfLines={2}>
                  {task.description}
                </Text>
              )}

              <View style={styles.taskMeta}>
                <View style={styles.taskMetaItem}>
                  <Ionicons name="business-outline" size={14} color="#94a3b8" />
                  <Text style={styles.taskMetaText}>{task.department}</Text>
                </View>
              </View>
              
              <View style={styles.taskFooter}>
                <View style={styles.taskDate}>
                  <Ionicons name="calendar-outline" size={14} color="#94a3b8" />
                  <Text style={styles.taskDateText}>
                    {task.completed_at ? formatDate(task.completed_at) : formatDate(task.created_at)}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#cbd5e1" />
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
    color: '#0f172a',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    gap: 8,
  },
  tabActiveCompleted: {
    backgroundColor: '#f0fdf4',
  },
  tabActiveFailed: {
    backgroundColor: '#fef2f2',
  },
  tabText: {
    fontSize: 13,
    fontFamily: 'Poppins_500Medium',
    color: '#94a3b8',
  },
  tabTextActiveCompleted: {
    color: '#22c55e',
  },
  tabTextActiveFailed: {
    color: '#ef4444',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  taskCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Poppins_500Medium',
  },
  priorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priorityText: {
    fontSize: 12,
    fontFamily: 'Poppins_500Medium',
  },
  taskTitle: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: '#0f172a',
    marginBottom: 6,
  },
  taskDescription: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#64748b',
    marginBottom: 12,
    lineHeight: 20,
  },
  taskMeta: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  taskMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  taskMetaText: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: '#94a3b8',
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  taskDate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  taskDateText: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: '#94a3b8',
  },
});
