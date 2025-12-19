import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export default function ProfileScreen() {
  const { user, signOut, isAdmin, isManager } = useAuth();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  const handleLogout = async () => {
    setLogoutModalVisible(false);
    await signOut();
    router.replace('/login');
  };

  const getJobTitle = () => {
    // Önce job_title'ı kontrol et, varsa onu göster
    if (user?.job_title) {
      return user.job_title;
    }
    // Yoksa rol bazlı varsayılan değerleri kullan
    switch (user?.role) {
      case 'admin': return 'Yönetici';
      case 'manager': return 'Departman Müdürü';
      case 'staff': return 'Personel';
      default: return 'Personel';
    }
  };

  // Admin için farklı menü
  const adminMenuItems = [
    { 
      id: 'staff-management', 
      label: 'Personel Yönetimi', 
      icon: 'people-outline', 
      color: '#3b82f6',
      onPress: () => router.push('/admin/staff-management')
    },
    { 
      id: 'departments', 
      label: 'Departman Takibi', 
      icon: 'business-outline', 
      color: '#8b5cf6',
      onPress: () => router.push('/admin/departments')
    },
    { 
      id: 'reports', 
      label: 'Raporlar & Analizler', 
      icon: 'bar-chart-outline', 
      color: '#22c55e',
      onPress: () => router.push('/admin/reports')
    },
    { 
      id: 'notifications', 
      label: 'Bildirim Ayarları', 
      icon: 'notifications-outline', 
      color: '#f59e0b',
      onPress: () => router.push('/profile/notifications')
    },
    { 
      id: 'settings', 
      label: 'Uygulama Ayarları', 
      icon: 'settings-outline', 
      color: '#64748b',
      onPress: () => router.push('/profile/settings')
    },
    { 
      id: 'help', 
      label: 'Yardım & Destek', 
      icon: 'help-circle-outline', 
      color: '#94a3b8',
      onPress: () => router.push('/profile/help')
    },
  ];

  // Staff ve Manager için menü
  const staffMenuItems = [
    { 
      id: 'stats', 
      label: 'İstatistiklerim', 
      icon: 'stats-chart-outline', 
      color: '#3b82f6',
      onPress: () => router.push('/profile/stats')
    },
    { 
      id: 'tasks', 
      label: 'Görev Geçmişim', 
      icon: 'time-outline', 
      color: '#22c55e',
      onPress: () => router.push('/profile/task-history') 
    },
    { 
      id: 'notifications', 
      label: 'Bildirim Ayarları', 
      icon: 'notifications-outline', 
      color: '#f59e0b',
      onPress: () => router.push('/profile/notifications')
    },
    { 
      id: 'settings', 
      label: 'Uygulama Ayarları', 
      icon: 'settings-outline', 
      color: '#8b5cf6',
      onPress: () => router.push('/profile/settings')
    },
    { 
      id: 'help', 
      label: 'Yardım & Destek', 
      icon: 'help-circle-outline', 
      color: '#64748b',
      onPress: () => router.push('/profile/help')
    },
  ];

  // Role göre menü seç
  const menuItems = isAdmin ? adminMenuItems : staffMenuItems;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView 
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Profil Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            {user?.avatar_url ? (
              <Image source={{ uri: user.avatar_url }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Ionicons name="person" size={40} color="#2563EB" />
              </View>
            )}
            <TouchableOpacity style={styles.editAvatarButton}>
              <Ionicons name="camera" size={16} color="white" />
            </TouchableOpacity>
          </View>
          
          <Text style={[styles.userName, { color: colors.text }]}>{user?.first_name} {user?.last_name}</Text>
          <View style={styles.roleContainer}>
            <Text style={styles.roleText}>{getJobTitle()}</Text>
          </View>
        </View>

        {/* Kişisel Bilgiler Kartı */}
        <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
          <View style={styles.infoItem}>
            <View style={[styles.infoIconContainer, { backgroundColor: '#dbeafe' }]}>
              <Ionicons name="call" size={18} color="#2563EB" />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Telefon</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>{user?.phone || 'Belirtilmemiş'}</Text>
            </View>
          </View>
          <View style={[styles.infoDivider, { backgroundColor: colors.border }]} />
          <View style={styles.infoItem}>
            <View style={[styles.infoIconContainer, { backgroundColor: '#fef3c7' }]}>
              <Ionicons name="mail" size={18} color="#f59e0b" />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>E-posta</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>{user?.email || 'Belirtilmemiş'}</Text>
            </View>
          </View>
          <View style={[styles.infoDivider, { backgroundColor: colors.border }]} />
          <View style={styles.infoItem}>
            <View style={[styles.infoIconContainer, { backgroundColor: '#dcfce7' }]}>
              <Ionicons name="briefcase" size={18} color="#22c55e" />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Departman</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>{user?.department_name || 'Belirtilmemiş'}</Text>
            </View>
          </View>
        </View>

        {/* İstatistikler - Sadece Staff ve Manager için */}
        {!isAdmin && (
          <View style={[styles.statsContainer, { backgroundColor: colors.card }]}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.text }]}>{user?.completed_tasks_count || 0}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Tamamlanan</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.text }]}>3</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Devam Eden</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: '#22c55e' }]}>{user?.rating || '5.0'}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Puan</Text>
            </View>
          </View>
        )}

        {/* Admin için Özet Kartları */}
        {isAdmin && (
          <View style={styles.adminStatsContainer}>
            <View style={[styles.adminStatCard, { backgroundColor: colors.card }]}>
              <View style={[styles.adminStatIcon, { backgroundColor: '#dbeafe' }]}>
                <Ionicons name="people" size={24} color="#3b82f6" />
              </View>
              <Text style={[styles.adminStatValue, { color: colors.text }]}>24</Text>
              <Text style={[styles.adminStatLabel, { color: colors.textSecondary }]}>Toplam Personel</Text>
            </View>
            <View style={[styles.adminStatCard, { backgroundColor: colors.card }]}>
              <View style={[styles.adminStatIcon, { backgroundColor: '#dcfce7' }]}>
                <Ionicons name="checkmark-circle" size={24} color="#22c55e" />
              </View>
              <Text style={[styles.adminStatValue, { color: colors.text }]}>156</Text>
              <Text style={[styles.adminStatLabel, { color: colors.textSecondary }]}>Tamamlanan Görev</Text>
            </View>
            <View style={[styles.adminStatCard, { backgroundColor: colors.card }]}>
              <View style={[styles.adminStatIcon, { backgroundColor: '#fef3c7' }]}>
                <Ionicons name="time" size={24} color="#f59e0b" />
              </View>
              <Text style={[styles.adminStatValue, { color: colors.text }]}>12</Text>
              <Text style={[styles.adminStatLabel, { color: colors.textSecondary }]}>Bekleyen Görev</Text>
            </View>
            <View style={[styles.adminStatCard, { backgroundColor: colors.card }]}>
              <View style={[styles.adminStatIcon, { backgroundColor: '#fee2e2' }]}>
                <Ionicons name="alert-circle" size={24} color="#ef4444" />
              </View>
              <Text style={[styles.adminStatValue, { color: colors.text }]}>3</Text>
              <Text style={[styles.adminStatLabel, { color: colors.textSecondary }]}>Acil Görev</Text>
            </View>
          </View>
        )}

        {/* Menü */}
        <View style={[styles.menuContainer, { backgroundColor: colors.card }]}>
          {menuItems.map((item, index) => (
            <TouchableOpacity 
              key={item.id} 
              style={[
                styles.menuItem,
                { borderBottomColor: colors.border },
                index === menuItems.length - 1 && { borderBottomWidth: 0 }
              ]}
              onPress={item.onPress}
            >
              <View style={[styles.menuIconContainer, { backgroundColor: item.color + '20' }]}>
                <Ionicons name={item.icon as any} size={22} color={item.color} />
              </View>
              <Text style={[styles.menuLabel, { color: colors.text }]}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.border} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Çıkış Butonu */}
        <TouchableOpacity 
          style={[styles.logoutButton, { backgroundColor: colors.card }]}
          onPress={() => setLogoutModalVisible(true)}
        >
          <Ionicons name="log-out-outline" size={22} color="#ef4444" />
          <Text style={[styles.logoutText, { color: '#ef4444' }]}>Çıkış Yap</Text>
        </TouchableOpacity>

        <Text style={[styles.versionText, { color: colors.textSecondary }]}>QHotelier v1.0.0</Text>
      </ScrollView>

      {/* Çıkış Modalı */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={logoutModalVisible}
        onRequestClose={() => setLogoutModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={[styles.modalIconContainer, { backgroundColor: '#fef2f2' }]}>
              <Ionicons name="log-out-outline" size={32} color="#ef4444" />
            </View>
            <Text style={styles.modalTitle}>Çıkış Yap</Text>
            <Text style={styles.modalMessage}>
              Hesabınızdan çıkış yapmak istediğinize emin misiniz?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.modalCancelButton}
                onPress={() => setLogoutModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.modalConfirmButton}
                onPress={handleLogout}
              >
                <Text style={styles.modalConfirmText}>Çıkış Yap</Text>
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
  content: {
    padding: 20,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#f8fafc',
  },
  userName: {
    fontSize: 24,
    fontFamily: 'Poppins_700Bold',
    color: '#0f172a',
    marginBottom: 8,
  },
  roleContainer: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  roleText: {
    color: 'white',
    fontSize: 13,
    fontFamily: 'Poppins_600SemiBold',
  },
  // Kişisel Bilgiler Kartı
  infoCard: {
    borderRadius: 16,
    padding: 4,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: '#94a3b8',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    fontFamily: 'Poppins_500Medium',
    color: '#0f172a',
  },
  infoDivider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginHorizontal: 14,
  },
  // İstatistikler
  statsContainer: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontFamily: 'Poppins_700Bold',
    color: '#0f172a',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: '#64748b',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#e2e8f0',
  },
  // Admin İstatistik Kartları
  adminStatsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 12,
  },
  adminStatCard: {
    width: '47%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  adminStatIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  adminStatValue: {
    fontSize: 24,
    fontFamily: 'Poppins_700Bold',
    color: '#0f172a',
    marginBottom: 4,
  },
  adminStatLabel: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: '#64748b',
    textAlign: 'center',
  },
  // Menü
  menuContainer: {
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Poppins_500Medium',
    color: '#0f172a',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fef2f2',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    marginBottom: 16,
  },
  logoutText: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: '#ef4444',
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: '#94a3b8',
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
  },
  modalIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Poppins_700Bold',
    color: '#0f172a',
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 15,
    fontFamily: 'Poppins_400Regular',
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: '#64748b',
  },
  modalConfirmButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#ef4444',
    alignItems: 'center',
  },
  modalConfirmText: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: 'white',
  },
});
