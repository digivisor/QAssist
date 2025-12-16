import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAuth } from '../../context/AuthContext';

export default function StatsScreen() {
  const { user } = useAuth();

  const statsData = [
    { label: 'Toplam Görev', value: '127', icon: 'clipboard', color: '#3b82f6', change: '+12 bu ay' },
    { label: 'Tamamlanan', value: '98', icon: 'checkmark-circle', color: '#22c55e', change: '%77 başarı' },
    { label: 'Devam Eden', value: '18', icon: 'sync', color: '#f59e0b', change: '5 acil' },
    { label: 'İptal Edilen', value: '11', icon: 'close-circle', color: '#ef4444', change: '%8.6' },
  ];

  const monthlyStats = [
    { month: 'Ocak', completed: 12 },
    { month: 'Şubat', completed: 15 },
    { month: 'Mart', completed: 18 },
    { month: 'Nisan', completed: 14 },
    { month: 'Mayıs', completed: 20 },
    { month: 'Haziran', completed: 19 },
  ];

  const maxCompleted = Math.max(...monthlyStats.map(s => s.completed));

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>İstatistiklerim</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Özet Kartlar */}
        <View style={styles.statsGrid}>
          {statsData.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <View style={[styles.statIconContainer, { backgroundColor: stat.color + '20' }]}>
                <Ionicons name={stat.icon as any} size={24} color={stat.color} />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
              <Text style={[styles.statChange, { color: stat.color }]}>{stat.change}</Text>
            </View>
          ))}
        </View>

        {/* Puan Kartı */}
        <View style={styles.ratingCard}>
          <View style={styles.ratingHeader}>
            <Text style={styles.ratingTitle}>Performans Puanı</Text>
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={16} color="#f59e0b" />
              <Text style={styles.ratingBadgeText}>4.8</Text>
            </View>
          </View>
          <View style={styles.ratingBarContainer}>
            <View style={styles.ratingBar}>
              <View style={[styles.ratingBarFill, { width: '96%' }]} />
            </View>
            <Text style={styles.ratingPercent}>96%</Text>
          </View>
          <Text style={styles.ratingNote}>Son 30 günlük performansınız mükemmel!</Text>
        </View>

        {/* Aylık Grafik */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Aylık Görev Tamamlama</Text>
          <View style={styles.chartContainer}>
            {monthlyStats.map((stat, index) => (
              <View key={index} style={styles.chartColumn}>
                <View style={styles.chartBarContainer}>
                  <View 
                    style={[
                      styles.chartBar, 
                      { height: `${(stat.completed / maxCompleted) * 100}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.chartLabel}>{stat.month.substring(0, 3)}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Son Başarılar */}
        <View style={styles.achievementsCard}>
          <Text style={styles.achievementsTitle}>Son Başarılar</Text>
          <View style={styles.achievement}>
            <View style={[styles.achievementIcon, { backgroundColor: '#fef3c7' }]}>
              <Text style={{ fontSize: 24 }}>🏆</Text>
            </View>
            <View style={styles.achievementContent}>
              <Text style={styles.achievementName}>Hız Şampiyonu</Text>
              <Text style={styles.achievementDesc}>10 görevi zamanından önce tamamladın</Text>
            </View>
          </View>
          <View style={styles.achievement}>
            <View style={[styles.achievementIcon, { backgroundColor: '#dbeafe' }]}>
              <Text style={{ fontSize: 24 }}>⭐</Text>
            </View>
            <View style={styles.achievementContent}>
              <Text style={styles.achievementName}>Mükemmel Hafta</Text>
              <Text style={styles.achievementDesc}>Tüm haftalık görevleri tamamladın</Text>
            </View>
          </View>
        </View>
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
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 28,
    fontFamily: 'Poppins_700Bold',
    color: '#0f172a',
  },
  statLabel: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: '#64748b',
    marginBottom: 4,
  },
  statChange: {
    fontSize: 12,
    fontFamily: 'Poppins_500Medium',
  },
  ratingCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  ratingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  ratingTitle: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: '#0f172a',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  ratingBadgeText: {
    fontSize: 14,
    fontFamily: 'Poppins_700Bold',
    color: '#f59e0b',
  },
  ratingBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  ratingBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  ratingBarFill: {
    height: '100%',
    backgroundColor: '#22c55e',
    borderRadius: 4,
  },
  ratingPercent: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: '#22c55e',
  },
  ratingNote: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: '#64748b',
  },
  chartCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: '#0f172a',
    marginBottom: 20,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
  },
  chartColumn: {
    alignItems: 'center',
    flex: 1,
  },
  chartBarContainer: {
    width: 24,
    height: 100,
    backgroundColor: '#e2e8f0',
    borderRadius: 12,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  chartBar: {
    width: '100%',
    backgroundColor: '#2563EB',
    borderRadius: 12,
  },
  chartLabel: {
    fontSize: 11,
    fontFamily: 'Poppins_500Medium',
    color: '#64748b',
    marginTop: 8,
  },
  achievementsCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  achievementsTitle: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: '#0f172a',
    marginBottom: 16,
  },
  achievement: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  achievementContent: {
    flex: 1,
  },
  achievementName: {
    fontSize: 15,
    fontFamily: 'Poppins_600SemiBold',
    color: '#0f172a',
  },
  achievementDesc: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: '#64748b',
  },
});

