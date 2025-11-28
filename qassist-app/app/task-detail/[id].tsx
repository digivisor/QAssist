import { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

interface Task {
  id: number;
  room: string;
  guest: string;
  request: string;
  priority: 'low' | 'medium' | 'high';
  department: string;
  status: 'pending' | 'in-progress' | 'completed';
  createdAt: number;
  description?: string;
  assignedTo?: string;
}

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [task, setTask] = useState<Task | null>(null);
  
  const backgroundColor = useThemeColor({}, 'background');
  const borderColor = useThemeColor({ light: '#e2e8f0', dark: '#1e293b' }, 'background');
  const cardBg = useThemeColor({ light: '#ffffff', dark: '#1e293b' }, 'background');
  const textColor = useThemeColor({}, 'text');

  useEffect(() => {
    loadTask();
  }, [id]);

  const loadTask = () => {
    // TODO: API call
    const mockTask: Task = {
      id: parseInt(id || '1'),
      room: '201',
      guest: 'Ahmet Yılmaz',
      request: 'Odaya havlu istiyorum',
      description: 'Müşteri oda 201\'de konaklıyor ve odaya ekstra havlu istiyor. Lütfen 2 adet havlu gönderin.',
      priority: 'high',
      department: 'Temizlik',
      status: 'pending',
      createdAt: Date.now() - 3600000,
    };
    setTask(mockTask);
  };

  const handleAcceptTask = () => {
    Alert.alert(
      'Görevi Onayla',
      'Bu görevi kabul etmek istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Onayla',
          onPress: () => {
            if (task) {
              setTask({ ...task, status: 'in-progress' as const });
              // TODO: API call
            }
          },
        },
      ]
    );
  };

  const handleCompleteTask = () => {
    Alert.alert(
      'Görevi Tamamla',
      'Bu görevi tamamladınız mı?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Tamamla',
          onPress: () => {
            if (task) {
              setTask({ ...task, status: 'completed' as const });
              // TODO: API call
              router.back();
            }
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
    const date = new Date(timestamp);
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!task) {
    return (
      <ThemedView style={[styles.container, { backgroundColor }]}>
        <ThemedText>Yükleniyor...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
      <ThemedView style={[styles.container, { backgroundColor }]}>
        <View style={[styles.header, { backgroundColor: cardBg }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color={textColor} />
          </TouchableOpacity>
          <ThemedText type="title" style={styles.headerTitle}>Görev Detayı</ThemedText>
          <View style={{ width: 40 }} />
        </View>

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Card */}
        <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
          <View style={styles.cardHeader}>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(task.status) + '20' },
              ]}
            >
              <ThemedText
                style={[styles.statusText, { color: getStatusColor(task.status) }]}
              >
                {getStatusText(task.status)}
              </ThemedText>
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
                  ? 'Yüksek Öncelik'
                  : task.priority === 'medium'
                  ? 'Orta Öncelik'
                  : 'Düşük Öncelik'}
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Room & Guest Info */}
        <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
          <ThemedText style={styles.cardTitle}>Oda ve Misafir Bilgisi</ThemedText>
          <View style={styles.infoRow}>
            <ThemedText style={styles.infoLabel}>Oda Numarası</ThemedText>
            <ThemedText style={styles.infoValue}>Oda {task.room}</ThemedText>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <ThemedText style={styles.infoLabel}>Misafir</ThemedText>
            <ThemedText style={styles.infoValue}>{task.guest}</ThemedText>
          </View>
        </View>

        {/* Request Details */}
        <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
          <ThemedText style={styles.cardTitle}>Talep</ThemedText>
          <ThemedText style={styles.requestText}>{task.request}</ThemedText>
          {task.description && (
            <>
              <View style={styles.divider} />
              <ThemedText style={styles.descriptionText}>{task.description}</ThemedText>
            </>
          )}
        </View>

        {/* Task Info */}
        <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
          <ThemedText style={styles.cardTitle}>Görev Bilgileri</ThemedText>
          <View style={styles.infoRow}>
            <ThemedText style={styles.infoLabel}>Departman</ThemedText>
            <ThemedText style={styles.infoValue}>{task.department}</ThemedText>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <ThemedText style={styles.infoLabel}>Oluşturulma</ThemedText>
            <ThemedText style={styles.infoValue}>{formatTime(task.createdAt)}</ThemedText>
          </View>
        </View>

        {/* Action Buttons */}
        {task.status === 'pending' && (
          <TouchableOpacity
            style={[styles.actionButton, styles.acceptButton]}
            onPress={handleAcceptTask}
          >
            <ThemedText style={styles.actionButtonText}>Görevi Onayla</ThemedText>
          </TouchableOpacity>
        )}

        {task.status === 'in-progress' && (
          <TouchableOpacity
            style={[styles.actionButton, styles.completeButton]}
            onPress={handleCompleteTask}
          >
            <ThemedText style={styles.actionButtonText}>Görevi Tamamla</ThemedText>
          </TouchableOpacity>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 20,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  priorityBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 14,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  infoLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginVertical: 12,
  },
  requestText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    lineHeight: 26,
  },
  descriptionText: {
    fontSize: 15,
    lineHeight: 22,
    opacity: 0.8,
  },
  actionButton: {
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  acceptButton: {
    backgroundColor: '#0f172a',
  },
  completeButton: {
    backgroundColor: '#10b981',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

