import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function NotificationsScreen() {
  const [pushEnabled, setPushEnabled] = useState(true);
  const [taskNotifications, setTaskNotifications] = useState(true);
  const [messageNotifications, setMessageNotifications] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [dailySummary, setDailySummary] = useState(false);

  const notificationSettings = [
    {
      id: 'push',
      label: 'Anlık Bildirimler',
      description: 'Tüm bildirimleri al',
      icon: 'notifications',
      color: '#3b82f6',
      value: pushEnabled,
      onValueChange: setPushEnabled,
    },
    {
      id: 'tasks',
      label: 'Görev Bildirimleri',
      description: 'Yeni ve güncellenen görevler',
      icon: 'clipboard',
      color: '#22c55e',
      value: taskNotifications,
      onValueChange: setTaskNotifications,
    },
    {
      id: 'messages',
      label: 'Mesaj Bildirimleri',
      description: 'Yeni mesajlar ve yanıtlar',
      icon: 'chatbubble',
      color: '#8b5cf6',
      value: messageNotifications,
      onValueChange: setMessageNotifications,
    },
    {
      id: 'sound',
      label: 'Sesli Bildirimler',
      description: 'Bildirim sesi çal',
      icon: 'volume-high',
      color: '#f59e0b',
      value: soundEnabled,
      onValueChange: setSoundEnabled,
    },
    {
      id: 'vibration',
      label: 'Titreşim',
      description: 'Bildirimlerde titreşim',
      icon: 'phone-portrait',
      color: '#64748b',
      value: vibrationEnabled,
      onValueChange: setVibrationEnabled,
    },
    {
      id: 'summary',
      label: 'Günlük Özet',
      description: 'Her gün saat 18:00\'da özet al',
      icon: 'calendar',
      color: '#ec4899',
      value: dailySummary,
      onValueChange: setDailySummary,
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bildirim Ayarları</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          {notificationSettings.map((setting, index) => (
            <View 
              key={setting.id}
              style={[
                styles.settingItem,
                index === notificationSettings.length - 1 && { borderBottomWidth: 0 }
              ]}
            >
              <View style={[styles.settingIcon, { backgroundColor: setting.color + '20' }]}>
                <Ionicons name={setting.icon as any} size={22} color={setting.color} />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingLabel}>{setting.label}</Text>
                <Text style={styles.settingDescription}>{setting.description}</Text>
              </View>
              <Switch
                value={setting.value}
                onValueChange={setting.onValueChange}
                trackColor={{ false: '#e2e8f0', true: '#2563EB' }}
                thumbColor="white"
              />
            </View>
          ))}
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoIcon}>
            <Ionicons name="information-circle" size={24} color="#3b82f6" />
          </View>
          <Text style={styles.infoText}>
            Bildirimleri devre dışı bıraktığınızda önemli görev güncellemelerini kaçırabilirsiniz.
          </Text>
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
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 20,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  settingIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  settingContent: {
    flex: 1,
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 15,
    fontFamily: 'Poppins_600SemiBold',
    color: '#0f172a',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: '#64748b',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  infoIcon: {
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: '#3b82f6',
    lineHeight: 20,
  },
});

