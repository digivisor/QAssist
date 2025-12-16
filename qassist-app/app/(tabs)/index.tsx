import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, ScrollView, RefreshControl, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function HomeScreen() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ pending: 0, in_progress: 0, completed: 0 });
  const [recentTasks, setRecentTasks] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    // Simüle edilmiş veri
    setRecentTasks([
      { id: 1, title: 'Oda Temizliği', description: '305 Numaralı odanın temizlik isteği', status: 'pending', created_at: new Date().toISOString() },
      { id: 2, title: 'Havuz Kontrolü', description: 'Havuz temizliği kontrol isteği', status: 'in_progress', created_at: new Date().toISOString() },
      { id: 3, title: 'Rezervasyon', description: 'A La Carte Rezervasyon isteği', status: 'completed', created_at: new Date().toISOString() },
    ]);
    setStats({ pending: 5, in_progress: 2, completed: 12 });
    
    setRefreshing(false);
  };

  useEffect(() => {
    fetchDashboardData();
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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView 
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.greetingContainer}>
            <Text style={styles.greeting}>{getGreeting()}, <Text style={styles.userName}>{user?.first_name || 'Misafir'}</Text></Text>
            <Text style={styles.date}>{new Date().toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })}</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications-outline" size={24} color="#0f172a" />
            <View style={styles.notificationBadge} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <TouchableOpacity style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color="#94a3b8" />
          <Text style={styles.searchText}>Görev ara...</Text>
        </TouchableOpacity>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: '#3b82f6' }]}>
            <View style={styles.statHeader}>
              <Ionicons name="sync-outline" size={20} color="rgba(255,255,255,0.8)" />
            </View>
            <Text style={styles.statValue}>{stats.in_progress}</Text>
            <Text style={styles.statLabel}>Devam Eden</Text>
            <View style={styles.progressBar}>
              <View style={{ width: '60%', height: '100%', backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 2 }} />
            </View>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#f97316' }]}>
            <View style={styles.statHeader}>
              <Ionicons name="time-outline" size={20} color="rgba(255,255,255,0.8)" />
            </View>
            <Text style={styles.statValue}>{stats.pending}</Text>
            <Text style={styles.statLabel}>Bekleyen</Text>
            <View style={styles.progressBar}>
              <View style={{ width: '40%', height: '100%', backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 2 }} />
            </View>
          </View>
        </View>

        {/* Recent Tasks */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Son Görevler</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/tasks')}>
            <Text style={styles.seeAll}>Tümü</Text>
          </TouchableOpacity>
        </View>

        {recentTasks.map((task) => (
          <TouchableOpacity 
            key={task.id} 
            style={styles.taskCard}
            onPress={() => router.push({ pathname: '/task-detail/[id]', params: { id: task.id } })}
          >
            <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(task.status) }]} />
            <View style={styles.taskContent}>
              <Text style={styles.taskTitle}>{task.title}</Text>
              <Text style={styles.taskDesc} numberOfLines={1}>{task.description}</Text>
              <View style={styles.taskFooter}>
                <Text style={styles.taskTime}>{new Date(task.created_at).toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'})}</Text>
                <Text style={[styles.statusText, { color: getStatusColor(task.status) }]}>
                  {getStatusText(task.status)}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
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
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greetingContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: 22,
    fontFamily: 'Poppins_600SemiBold',
    color: '#0f172a',
  },
  userName: {
    fontFamily: 'Poppins_700Bold',
    color: '#2563EB',
  },
  date: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#64748b',
    marginTop: 4,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
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
    backgroundColor: 'white',
    padding: 14,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  searchText: {
    marginLeft: 10,
    fontFamily: 'Poppins_400Regular',
    color: '#94a3b8',
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statHeader: {
    marginBottom: 8,
  },
  statLabel: {
    color: 'white',
    fontSize: 13,
    fontFamily: 'Poppins_500Medium',
    opacity: 0.9,
    marginBottom: 8,
  },
  statValue: {
    color: 'white',
    fontSize: 32,
    fontFamily: 'Poppins_700Bold',
    marginBottom: 4,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_700Bold',
    color: '#0f172a',
  },
  seeAll: {
    color: '#2563EB',
    fontFamily: 'Poppins_600SemiBold',
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
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
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: '#0f172a',
    marginBottom: 4,
  },
  taskDesc: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#64748b',
    marginBottom: 8,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskTime: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: '#94a3b8',
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Poppins_500Medium',
  },
});
