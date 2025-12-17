import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function ReportsScreen() {
  const insets = useSafeAreaInsets();
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  const periods = [
    { id: 'today', label: 'Bugün' },
    { id: 'week', label: 'Bu Hafta' },
    { id: 'month', label: 'Bu Ay' },
  ];

  // Mock veriler
  const stats = {
    totalTasks: 156,
    completedTasks: 142,
    pendingTasks: 14,
    avgCompletionTime: '2.4 saat',
    topDepartment: 'Kat Hizmetleri',
    topEmployee: 'Ahmet Yılmaz',
  };

  const departmentPerformance = [
    { name: 'Kat Hizmetleri', completed: 48, total: 52, percentage: 92 },
    { name: 'Resepsiyon', completed: 32, total: 35, percentage: 91 },
    { name: 'F&B', completed: 38, total: 42, percentage: 90 },
    { name: 'Teknik Servis', completed: 18, total: 22, percentage: 82 },
    { name: 'Güvenlik', completed: 6, total: 8, percentage: 75 },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Raporlar & Analizler</Text>
        <TouchableOpacity style={styles.downloadButton}>
          <Ionicons name="download-outline" size={22} color="#2563EB" />
        </TouchableOpacity>
      </View>

      {/* Dönem Seçici */}
      <View style={styles.periodSelector}>
        {periods.map((period) => (
          <TouchableOpacity
            key={period.id}
            style={[
              styles.periodButton,
              selectedPeriod === period.id && styles.periodButtonActive
            ]}
            onPress={() => setSelectedPeriod(period.id)}
          >
            <Text style={[
              styles.periodButtonText,
              selectedPeriod === period.id && styles.periodButtonTextActive
            ]}>
              {period.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView 
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Ana İstatistikler */}
        <View style={styles.mainStatsContainer}>
          <View style={styles.mainStatCard}>
            <View style={[styles.mainStatIcon, { backgroundColor: '#dcfce7' }]}>
              <Ionicons name="checkmark-circle" size={28} color="#22c55e" />
            </View>
            <Text style={styles.mainStatValue}>{stats.completedTasks}</Text>
            <Text style={styles.mainStatLabel}>Tamamlanan</Text>
          </View>
          <View style={styles.mainStatCard}>
            <View style={[styles.mainStatIcon, { backgroundColor: '#fef3c7' }]}>
              <Ionicons name="time" size={28} color="#f59e0b" />
            </View>
            <Text style={styles.mainStatValue}>{stats.pendingTasks}</Text>
            <Text style={styles.mainStatLabel}>Bekleyen</Text>
          </View>
        </View>

        {/* Özet Bilgiler */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Ionicons name="speedometer-outline" size={20} color="#3b82f6" />
              <View>
                <Text style={styles.infoLabel}>Ort. Tamamlama Süresi</Text>
                <Text style={styles.infoValue}>{stats.avgCompletionTime}</Text>
              </View>
            </View>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Ionicons name="trophy-outline" size={20} color="#f59e0b" />
              <View>
                <Text style={styles.infoLabel}>En İyi Departman</Text>
                <Text style={styles.infoValue}>{stats.topDepartment}</Text>
              </View>
            </View>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Ionicons name="star-outline" size={20} color="#8b5cf6" />
              <View>
                <Text style={styles.infoLabel}>En Başarılı Personel</Text>
                <Text style={styles.infoValue}>{stats.topEmployee}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Departman Performansı */}
        <Text style={styles.sectionTitle}>Departman Performansı</Text>
        <View style={styles.performanceCard}>
          {departmentPerformance.map((dept, index) => (
            <View key={dept.name}>
              <View style={styles.performanceRow}>
                <Text style={styles.performanceName}>{dept.name}</Text>
                <Text style={styles.performanceStats}>
                  {dept.completed}/{dept.total}
                </Text>
                <Text style={[
                  styles.performancePercentage,
                  { color: dept.percentage >= 90 ? '#22c55e' : dept.percentage >= 80 ? '#f59e0b' : '#ef4444' }
                ]}>
                  %{dept.percentage}
                </Text>
              </View>
              <View style={styles.progressBarBg}>
                <View 
                  style={[
                    styles.progressBar, 
                    { 
                      width: `${dept.percentage}%`,
                      backgroundColor: dept.percentage >= 90 ? '#22c55e' : dept.percentage >= 80 ? '#f59e0b' : '#ef4444'
                    }
                  ]} 
                />
              </View>
              {index < departmentPerformance.length - 1 && <View style={styles.performanceDivider} />}
            </View>
          ))}
        </View>

        {/* Rapor Türleri */}
        <Text style={styles.sectionTitle}>Detaylı Raporlar</Text>
        <View style={styles.reportTypesContainer}>
          <TouchableOpacity style={styles.reportTypeCard}>
            <View style={[styles.reportTypeIcon, { backgroundColor: '#dbeafe' }]}>
              <Ionicons name="document-text-outline" size={24} color="#3b82f6" />
            </View>
            <Text style={styles.reportTypeText}>Görev Raporu</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.reportTypeCard}>
            <View style={[styles.reportTypeIcon, { backgroundColor: '#dcfce7' }]}>
              <Ionicons name="people-outline" size={24} color="#22c55e" />
            </View>
            <Text style={styles.reportTypeText}>Personel Raporu</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.reportTypeCard}>
            <View style={[styles.reportTypeIcon, { backgroundColor: '#fef3c7' }]}>
              <Ionicons name="trending-up-outline" size={24} color="#f59e0b" />
            </View>
            <Text style={styles.reportTypeText}>Verimlilik</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.reportTypeCard}>
            <View style={[styles.reportTypeIcon, { backgroundColor: '#f3e8ff' }]}>
              <Ionicons name="calendar-outline" size={24} color="#8b5cf6" />
            </View>
            <Text style={styles.reportTypeText}>Aylık Özet</Text>
          </TouchableOpacity>
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
  downloadButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  periodSelector: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 10,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: 'white',
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: '#2563EB',
  },
  periodButtonText: {
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
    color: '#64748b',
  },
  periodButtonTextActive: {
    color: 'white',
  },
  content: {
    paddingHorizontal: 20,
  },
  mainStatsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  mainStatCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  mainStatIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  mainStatValue: {
    fontSize: 32,
    fontFamily: 'Poppins_700Bold',
    color: '#0f172a',
  },
  mainStatLabel: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: '#64748b',
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 4,
    marginBottom: 24,
  },
  infoRow: {
    padding: 14,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  infoLabel: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: '#94a3b8',
  },
  infoValue: {
    fontSize: 15,
    fontFamily: 'Poppins_600SemiBold',
    color: '#0f172a',
  },
  infoDivider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginHorizontal: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: '#0f172a',
    marginBottom: 16,
  },
  performanceCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  performanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  performanceName: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
    color: '#0f172a',
  },
  performanceStats: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: '#64748b',
    marginRight: 12,
  },
  performancePercentage: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    width: 45,
    textAlign: 'right',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#f1f5f9',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  performanceDivider: {
    height: 16,
  },
  reportTypesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  reportTypeCard: {
    width: '47%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  reportTypeIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  reportTypeText: {
    fontSize: 13,
    fontFamily: 'Poppins_500Medium',
    color: '#0f172a',
  },
});

