import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

type Notification = {
  id: number;
  type: 'task' | 'message' | 'system' | 'alert';
  title: string;
  description: string;
  time: string;
  isRead: boolean;
  avatar?: string;
  taskId?: number;
};

const mockNotifications: Notification[] = [
  {
    id: 1,
    type: 'task',
    title: 'Yeni Görev Atandı',
    description: '305 No\'lu odanın havlu değişimi görevi size atandı.',
    time: '2 dk önce',
    isRead: false,
    taskId: 1,
  },
  {
    id: 2,
    type: 'message',
    title: 'Mehmet Yılmaz',
    description: 'Görevi ne zaman tamamlayabilirsin?',
    time: '15 dk önce',
    isRead: false,
    avatar: 'https://i.pravatar.cc/150?u=mehmet',
  },
  {
    id: 3,
    type: 'alert',
    title: 'Acil Görev!',
    description: 'VIP misafir için özel temizlik talebi - 501 No\'lu oda',
    time: '30 dk önce',
    isRead: false,
    taskId: 2,
  },
  {
    id: 4,
    type: 'task',
    title: 'Görev Tamamlandı',
    description: 'Minibar kontrolü görevi başarıyla tamamlandı olarak işaretlendi.',
    time: '1 saat önce',
    isRead: true,
    taskId: 3,
  },
  {
    id: 5,
    type: 'system',
    title: 'Sistem Güncellemesi',
    description: 'Uygulama yeni özelliklere kavuştu. Keşfetmek için tıklayın.',
    time: '2 saat önce',
    isRead: true,
  },
  {
    id: 6,
    type: 'message',
    title: 'Ayşe Kaya',
    description: 'Teşekkürler, harika iş çıkardın! 👍',
    time: '3 saat önce',
    isRead: true,
    avatar: 'https://i.pravatar.cc/150?u=ayse',
  },
  {
    id: 7,
    type: 'task',
    title: 'Görev Güncellendi',
    description: 'Klima bakımı görevinin önceliği "Yüksek" olarak güncellendi.',
    time: '5 saat önce',
    isRead: true,
    taskId: 4,
  },
  {
    id: 8,
    type: 'alert',
    title: 'Süre Uyarısı',
    description: '412 No\'lu oda temizliği için son 30 dakika kaldı!',
    time: 'Dün',
    isRead: true,
    taskId: 5,
  },
];

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread'>('all');

  const filteredNotifications = activeFilter === 'unread' 
    ? notifications.filter(n => !n.isRead)
    : notifications;

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAsRead = (id: number) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'task': return { name: 'clipboard', color: '#3b82f6', bg: '#dbeafe' };
      case 'message': return { name: 'chatbubble', color: '#8b5cf6', bg: '#ede9fe' };
      case 'alert': return { name: 'warning', color: '#ef4444', bg: '#fef2f2' };
      case 'system': return { name: 'settings', color: '#64748b', bg: '#f1f5f9' };
      default: return { name: 'notifications', color: '#64748b', bg: '#f1f5f9' };
    }
  };

  const handleNotificationPress = (notification: Notification) => {
    markAsRead(notification.id);
    
    if (notification.taskId) {
      router.push(`/task-detail/${notification.taskId}`);
    } else if (notification.type === 'message') {
      router.push('/(tabs)/messages');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bildirimler</Text>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllAsRead} style={styles.markAllButton}>
            <Text style={styles.markAllText}>Tümünü Oku</Text>
          </TouchableOpacity>
        )}
        {unreadCount === 0 && <View style={{ width: 80 }} />}
      </View>

      {/* Filtreler */}
      <View style={styles.filterContainer}>
        <TouchableOpacity 
          style={[styles.filterButton, activeFilter === 'all' && styles.filterButtonActive]}
          onPress={() => setActiveFilter('all')}
        >
          <Text style={[styles.filterText, activeFilter === 'all' && styles.filterTextActive]}>
            Tümü
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterButton, activeFilter === 'unread' && styles.filterButtonActive]}
          onPress={() => setActiveFilter('unread')}
        >
          <Text style={[styles.filterText, activeFilter === 'unread' && styles.filterTextActive]}>
            Okunmamış
          </Text>
          {unreadCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {filteredNotifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <Ionicons name="notifications-off-outline" size={64} color="#cbd5e1" />
          </View>
          <Text style={styles.emptyTitle}>
            {activeFilter === 'unread' ? 'Okunmamış bildirim yok' : 'Bildirim yok'}
          </Text>
          <Text style={styles.emptyDesc}>
            {activeFilter === 'unread' 
              ? 'Tüm bildirimlerinizi okudunuz.'
              : 'Yeni bildirimler burada görünecek.'}
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {filteredNotifications.map((notification) => {
            const icon = getNotificationIcon(notification.type);
            
            return (
              <TouchableOpacity 
                key={notification.id}
                style={[styles.notificationCard, !notification.isRead && styles.notificationCardUnread]}
                onPress={() => handleNotificationPress(notification)}
              >
                {!notification.isRead && <View style={styles.unreadDot} />}
                
                {notification.avatar ? (
                  <Image source={{ uri: notification.avatar }} style={styles.avatar} />
                ) : (
                  <View style={[styles.iconContainer, { backgroundColor: icon.bg }]}>
                    <Ionicons name={icon.name as any} size={22} color={icon.color} />
                  </View>
                )}
                
                <View style={styles.notificationContent}>
                  <View style={styles.notificationHeader}>
                    <Text style={[styles.notificationTitle, !notification.isRead && styles.notificationTitleUnread]}>
                      {notification.title}
                    </Text>
                    <Text style={styles.notificationTime}>{notification.time}</Text>
                  </View>
                  <Text style={styles.notificationDesc} numberOfLines={2}>
                    {notification.description}
                  </Text>
                </View>

                {notification.type === 'alert' && (
                  <View style={styles.alertBadge}>
                    <Ionicons name="alert" size={14} color="#ef4444" />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
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
  markAllButton: {
    padding: 8,
  },
  markAllText: {
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
    color: '#2563EB',
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'white',
    gap: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    gap: 6,
  },
  filterButtonActive: {
    backgroundColor: '#2563EB',
  },
  filterText: {
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
    color: '#64748b',
  },
  filterTextActive: {
    color: 'white',
  },
  filterBadge: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
  },
  filterBadgeText: {
    fontSize: 11,
    fontFamily: 'Poppins_600SemiBold',
    color: 'white',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
    color: '#64748b',
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#94a3b8',
    textAlign: 'center',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
  notificationCardUnread: {
    backgroundColor: '#f0f9ff',
    borderLeftWidth: 3,
    borderLeftColor: '#2563EB',
  },
  unreadDot: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2563EB',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 14,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  notificationContent: {
    flex: 1,
    marginRight: 8,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 15,
    fontFamily: 'Poppins_500Medium',
    color: '#0f172a',
    flex: 1,
    marginRight: 8,
  },
  notificationTitleUnread: {
    fontFamily: 'Poppins_600SemiBold',
  },
  notificationTime: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: '#94a3b8',
  },
  notificationDesc: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#64748b',
    lineHeight: 20,
  },
  alertBadge: {
    position: 'absolute',
    top: 12,
    left: 52,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fef2f2',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
});

