import React, { useState } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Image, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

const MOCK_STAFF = [
    { id: '1', name: 'Ahmet Yılmaz', dept: 'Kat Hizmetleri', completed: 42, active: 3, efficiency: 95 },
    { id: '2', name: 'Ayşe Demir', dept: 'Kat Hizmetleri', completed: 38, active: 5, efficiency: 92 },
    { id: '3', name: 'Mehmet Can', dept: 'Teknik Servis', completed: 22, active: 2, efficiency: 88 },
    { id: '4', name: 'Zeynep Kaya', dept: 'Resepsiyon', completed: 18, active: 1, efficiency: 94 },
    { id: '5', name: 'Ali Veli', dept: 'F&B', completed: 15, active: 4, efficiency: 85 },
    { id: '6', name: 'Selin Yıldız', dept: 'Resepsiyon', completed: 30, active: 2, efficiency: 98 },
];

export default function StaffReportScreen() {
    const handleDownloadPdf = async () => {
        try {
            const html = `
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: 'Helvetica Neue', 'Helvetica', sans-serif; margin: 0; padding: 0; color: #334155; }
              .header { background: #0f172a; padding: 40px; color: white; display: flex; justify-content: space-between; align-items: center; }
              .logo { font-size: 28px; font-weight: 900; letter-spacing: -1px; background: linear-gradient(45deg, #3b82f6, #06b6d4); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; text-fill-color: transparent; display: inline-block; }
              .logo-text { color: white; display: inline-block; margin-left: 5px; }
              .report-info { text-align: right; }
              .report-title { font-size: 22px; font-weight: 700; margin-bottom: 4px; }
              .report-date { font-size: 14px; opacity: 0.8; }
              .content { padding: 40px; }
              table { width: 100%; border-collapse: separate; border-spacing: 0; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; }
              th { background: #f8fafc; padding: 16px; text-align: left; font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #e2e8f0; }
              td { padding: 16px; border-bottom: 1px solid #e2e8f0; font-size: 14px; color: #0f172a; background: white; }
              tr:last-child td { border-bottom: none; }
              .badge { padding: 6px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; display: inline-block; text-transform: uppercase; }
              .badge-high { background: #dcfce7; color: #166534; }
              .badge-med { background: #fef3c7; color: #b45309; }
              .footer { margin-top: 60px; border-top: 1px solid #e2e8f0; padding-top: 30px; text-align: center; color: #94a3b8; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="logo">QAssist <span class="logo-text">| Hotel Manager</span></div>
              <div class="report-info">
                <div class="report-title">Personel Performans Raporu</div>
                <div class="report-date">${new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
              </div>
            </div>

            <div class="content">
              <table>
                <thead>
                  <tr>
                    <th>Personel</th>
                    <th>Departman</th>
                    <th>Tamamlanan</th>
                    <th>Aktif</th>
                    <th>Verimlilik</th>
                  </tr>
                </thead>
                <tbody>
                  ${MOCK_STAFF.map(s => `
                    <tr>
                      <td><strong>${s.name}</strong></td>
                      <td>${s.dept}</td>
                      <td>${s.completed}</td>
                      <td>${s.active}</td>
                      <td>
                        <span class="badge ${s.efficiency >= 90 ? 'badge-high' : 'badge-med'}">
                          %${s.efficiency}
                        </span>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>

              <div class="footer">
                Bu rapor QAssist Otel Yönetim Sistemi tarafından otomatik olarak oluşturulmuştur.<br/>
                &copy; ${new Date().getFullYear()} Digivisor Technology
              </div>
            </div>
          </body>
        </html>
      `;

            const { uri } = await Print.printToFileAsync({ html });
            if (Platform.OS === "ios") {
                await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
            } else {
                await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Raporu İndir' });
            }
        } catch (error) {
            Alert.alert('Hata', 'PDF oluşturulamadı: ' + error);
        }
    };

    const renderStaffItem = ({ item }: { item: any }) => (
        <View style={styles.staffCard}>
            <View style={styles.staffHeader}>
                <View style={styles.avatarContainer}>
                    <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
                </View>
                <View style={styles.staffInfo}>
                    <Text style={styles.staffName}>{item.name}</Text>
                    <Text style={styles.staffDept}>{item.dept}</Text>
                </View>
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>%{item.efficiency}</Text>
                </View>
            </View>

            <View style={styles.statsRow}>
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{item.completed}</Text>
                    <Text style={styles.statLabel}>Tamamlanan</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{item.active}</Text>
                    <Text style={styles.statLabel}>Aktif Görev</Text>
                </View>
            </View>

            <View style={styles.progresContainer}>
                <View style={styles.progressLabelRow}>
                    <Text style={styles.progressLabel}>Verimlilik Skoru</Text>
                    <Text style={styles.progressValue}>{item.efficiency}/100</Text>
                </View>
                <View style={styles.progressBg}>
                    <View style={[styles.progressBar, { width: `${item.efficiency}%` }]} />
                </View>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#0f172a" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Personel Raporu</Text>
                <TouchableOpacity style={styles.actionButton} onPress={handleDownloadPdf}>
                    <Ionicons name="print-outline" size={22} color="#0f172a" />
                </TouchableOpacity>
            </View>

            <FlatList
                data={MOCK_STAFF}
                renderItem={renderStaffItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />
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
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontFamily: 'Poppins_600SemiBold',
        color: '#0f172a',
    },
    actionButton: {
        padding: 8,
        backgroundColor: '#f1f5f9',
        borderRadius: 8,
    },
    listContent: {
        padding: 16,
    },
    staffCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    staffHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    avatarContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#eff6ff',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    avatarText: {
        fontSize: 18,
        fontFamily: 'Poppins_600SemiBold',
        color: '#2563EB',
    },
    staffInfo: {
        flex: 1,
    },
    staffName: {
        fontSize: 16,
        fontFamily: 'Poppins_600SemiBold',
        color: '#0f172a',
    },
    staffDept: {
        fontSize: 13,
        fontFamily: 'Poppins_400Regular',
        color: '#64748b',
    },
    badge: {
        backgroundColor: '#dcfce7',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    badgeText: {
        fontSize: 12,
        fontFamily: 'Poppins_700Bold',
        color: '#16a34a',
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#f1f5f9',
        marginBottom: 16,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    divider: {
        width: 1,
        height: 24,
        backgroundColor: '#e2e8f0',
    },
    statValue: {
        fontSize: 18,
        fontFamily: 'Poppins_700Bold',
        color: '#0f172a',
    },
    statLabel: {
        fontSize: 12,
        fontFamily: 'Poppins_400Regular',
        color: '#64748b',
    },
    progresContainer: {
        gap: 8,
    },
    progressLabelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    progressLabel: {
        fontSize: 12,
        fontFamily: 'Poppins_500Medium',
        color: '#64748b',
    },
    progressValue: {
        fontSize: 12,
        fontFamily: 'Poppins_600SemiBold',
        color: '#0f172a',
    },
    progressBg: {
        height: 8,
        backgroundColor: '#f1f5f9',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#3b82f6',
        borderRadius: 4,
    },
});
