import { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useRouter } from 'expo-router';

interface Task {
  id: number;
  room: string;
  guest: string;
  request: string;
  priority: 'low' | 'medium' | 'high';
  department: string;
  status: 'pending' | 'in-progress' | 'completed';
  createdAt: number;
}

// Mock user data - API'den gelecek
const currentUser = {
  id: 1,
  name: 'Ayşe Yılmaz',
  phone: '+90 555 111 2233',
  department: 'Temizlik',
};

export default function TasksScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  
  const backgroundColor = useThemeColor({}, 'background');
  const borderColor = useThemeColor({ light: '#e2e8f0', dark: '#1e293b' }, 'background');
  const cardBg = useThemeColor({ light: '#ffffff', dark: '#1e293b' }, 'background');

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = () => {
    // TODO: API call - sadece kullanıcının departmanına ait görevler
    const mockTasks: Task[] = [
      {
        id: 1,
        room: '201',
        guest: 'Ahmet Yılmaz',
        request: 'Odaya havlu istiyorum',
        priority: 'high',
        department: 'Temizlik',
        status: 'pending',
        createdAt: Date.now() - 3600000,
      },
      {
        id: 2,
        room: '305',
        guest: 'Mehmet Demir',
        request: 'Ekstra yastık',
        priority: 'medium',
        department: 'Temizlik',
        status: 'pending',
        createdAt: Date.now() - 7200000,
      },
      {
        id: 3,
        room: '102',
        guest: 'Fatma Kaya',
        request: 'Oda temizliği',
        priority: 'high',
        department: 'Temizlik',
        status: 'in-progress',
        createdAt: Date.now() - 1800000,
      },
    ];

    // Sadece kendi departmanına ait görevleri filtrele
    const filteredTasks = mockTasks.filter(
      task => task.department === currentUser.department
    );
    setTasks(filteredTasks);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadTasks();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleAcceptTask = (taskId: number) => {
    Alert.alert(
      'Görevi Onayla',
      'Bu görevi kabul etmek istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Onayla',
          onPress: () => {
            setTasks(tasks.map(task =>
              task.id === taskId
                ? { ...task, status: 'in-progress' as const }
                : task
            ));
            // TODO: API call - görev durumunu güncelle
          },
        },
      ]
    );
  };

  const handleCompleteTask = (taskId: number) => {
    Alert.alert(
      'Görevi Tamamla',
      'Bu görevi tamamladınız mı?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Tamamla',
          onPress: () => {
            setTasks(tasks.map(task =>
              task.id === taskId
                ? { ...task, status: 'completed' as const }
                : task
            ));
            // TODO: API call - görev durumunu güncelle
          },
        },
      ]
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return '#ef4444';
      case 'medium':
        return '#f59e0b';
      case 'low':
        return '#10b981';
      default:
        return '#64748b';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#10b981';
      case 'in-progress':
        return '#3b82f6';
      case 'pending':
        return '#f59e0b';
      default:
        return '#64748b';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Tamamlandı';
      case 'in-progress':
        return 'Onaylandı';
      case 'pending':
        return 'Bekliyor';
      default:
        return status;
    }
  };

  const formatTime = (timestamp: number) => {
    const minutes = Math.floor((Date.now() - timestamp) / 60000);
    if (minutes < 1) return 'Şimdi';
    if (minutes < 60) return `${minutes} dakika önce`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} saat önce`;
    const days = Math.floor(hours / 24);
    return `${days} gün önce`;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
      <ThemedView style={[styles.container, { backgroundColor }]}>
        <View style={[styles.header, { backgroundColor: cardBg }]}>
        <View style={styles.headerContent}>
          <ThemedText type="title" style={styles.headerTitle}>Görevler</ThemedText>
          <ThemedText style={styles.headerSubtitle}>
            {currentUser.department} Departmanı
          </ThemedText>
        </View>
        <View style={styles.statsContainer}>
          <View style={styles.statBadge}>
            <ThemedText style={styles.statNumber}>{tasks.length}</ThemedText>
            <ThemedText style={styles.statLabel}>Toplam</ThemedText>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {tasks.length === 0 ? (
          <View style={styles.emptyContainer}>
            <ThemedText style={styles.emptyText}>Henüz görev yok</ThemedText>
          </View>
        ) : (
          tasks.map((task) => (
            <TouchableOpacity
              key={task.id}
              style={[styles.taskCard, { borderColor, backgroundColor: cardBg }]}
              onPress={() => router.push(`/task-detail/${task.id}`)}
              activeOpacity={0.7}
            >
              <View style={styles.taskHeader}>
                <View style={styles.taskInfo}>
                  <ThemedText style={styles.roomNumber}>Oda {task.room}</ThemedText>
                  <ThemedText style={styles.guestName}>{task.guest}</ThemedText>
                </View>
                <View
                  style={[
                    styles.priorityBadge,
                    { backgroundColor: getPriorityColor(task.priority) + '20' },
                  ]}
                >
                  <ThemedText
                    style={[
                      styles.priorityText,
                      { color: getPriorityColor(task.priority) },
                    ]}
                  >
                    {task.priority === 'high'
                      ? 'Yüksek'
                      : task.priority === 'medium'
                      ? 'Orta'
                      : 'Düşük'}
                  </ThemedText>
                </View>
              </View>

              <ThemedText style={styles.requestText}>{task.request}</ThemedText>

              <View style={styles.taskFooter}>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(task.status) + '20' },
                  ]}
                >
                  <ThemedText
                    style={[
                      styles.statusText,
                      { color: getStatusColor(task.status) },
                    ]}
                  >
                    {getStatusText(task.status)}
                  </ThemedText>
                </View>
                <ThemedText style={styles.timeText}>
                  {formatTime(task.createdAt)}
                </ThemedText>
              </View>

              {task.status === 'pending' && (
                <TouchableOpacity
                  style={[styles.acceptButton, { backgroundColor: '#0f172a' }]}
                  onPress={(e) => {
                    e.stopPropagation();
                    handleAcceptTask(task.id);
                  }}
                  activeOpacity={0.8}
                >
                  <ThemedText style={styles.acceptButtonText}>
                    Görevi Onayla
                  </ThemedText>
                </TouchableOpacity>
              )}

              {task.status === 'in-progress' && (
                <TouchableOpacity
                  style={[styles.completeButton, { backgroundColor: '#10b981' }]}
                  onPress={(e) => {
                    e.stopPropagation();
                    handleCompleteTask(task.id);
                  }}
                  activeOpacity={0.8}
                >
                  <ThemedText style={styles.completeButtonText}>
                    Görevi Tamamla
                  </ThemedText>
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 12,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  headerContent: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 15,
    opacity: 0.6,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  statBadge: {
    backgroundColor: 'rgba(15, 23, 42, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 80,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 80,
  },
  taskCard: {
    margin: 16,
    marginBottom: 12,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  taskInfo: {
    flex: 1,
  },
  roomNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  guestName: {
    fontSize: 14,
    opacity: 0.7,
  },
  priorityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '600',
  },
  requestText: {
    fontSize: 16,
    marginBottom: 12,
    lineHeight: 22,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  timeText: {
    fontSize: 12,
    opacity: 0.6,
  },
  acceptButton: {
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  completeButton: {
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.6,
  },
});

