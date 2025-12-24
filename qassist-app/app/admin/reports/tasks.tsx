import React, { useState, useMemo } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

// Enhanced Mock Data
const MOCK_TASKS = [
    { id: '1', title: 'Oda 204 Temizliği', dept: 'Kat Hizmetleri', status: 'completed', completionStatus: 'positive', duration: '35 dk', room: '204', assignee: 'Ayşe Y.', time: '14:30', negativeReason: null },
    { id: '2', title: 'Lobi Kliması Arızası', dept: 'Teknik Servis', status: 'completed', completionStatus: 'negative', duration: '120 dk', room: 'Lobi', assignee: 'Mehmet K.', time: '15:45', negativeReason: 'Yedek parça stoğu yok' },
    { id: '3', title: 'Oda 301 VIP İkram', dept: 'F&B', status: 'completed', completionStatus: 'positive', duration: '15 dk', room: '301', assignee: 'Caner E.', time: '16:00', negativeReason: null },
    { id: '4', title: 'Havuz Suyu Kontrolü', dept: 'Teknik Servis', status: 'completed', completionStatus: 'positive', duration: '45 dk', room: 'Havuz', assignee: 'Ali V.', time: '09:00', negativeReason: null },
    { id: '5', title: 'Geç Çıkış İsteği - 405', dept: 'Resepsiyon', status: 'completed', completionStatus: 'negative', duration: '10 dk', room: '405', assignee: 'Zeynep D.', time: '11:20', negativeReason: 'Misafir onayı alınamadı' },
    { id: '6', title: 'Bavul Taşıma', dept: 'Bellboy', status: 'completed', completionStatus: 'positive', duration: '20 dk', room: '102', assignee: 'Caner E.', time: '16:15', negativeReason: null },
    { id: '7', title: 'Restoran Işıkları', dept: 'Teknik Servis', status: 'pending', completionStatus: null, duration: '-', room: 'Restoran', assignee: '-', time: '16:30', negativeReason: null },
    { id: '8', title: 'Oda 204 Minibar', dept: 'Kat Hizmetleri', status: 'completed', completionStatus: 'negative', duration: '50 dk', room: '204', assignee: 'Ayşe Y.', time: '10:00', negativeReason: 'Eksik ürün tespiti geç yapıldı' },
];

export default function TaskReportScreen() {
    const [filter, setFilter] = useState('all');

    // Analytics Calculations
    const analytics = useMemo(() => {
        const completed = MOCK_TASKS.filter(t => t.status === 'completed');
        const positive = completed.filter(t => t.completionStatus === 'positive').length;
        const negative = completed.filter(t => t.completionStatus === 'negative').length;

        // Most problematic room
        const roomCounts: { [key: string]: number } = {};
        MOCK_TASKS.forEach(t => {
            if (t.completionStatus === 'negative' && t.room) {
                roomCounts[t.room] = (roomCounts[t.room] || 0) + 1;
            }
        });
        const problematicRoom = Object.keys(roomCounts).length > 0
            ? Object.entries(roomCounts).reduce((a, b) => b[1] > a[1] ? b : a)[0]
            : '-';

        return {
            totalCompleted: completed.length,
            positiveRate: completed.length ? Math.round((positive / completed.length) * 100) : 0,
            negativeCount: negative,
            problematicRoom,
            avgDuration: '42 dk' // Mock avg for simplicity
        };
    }, []);

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
              .stats-grid { display: flex; flex-direction: row; gap: 20px; margin-bottom: 40px; }
              .stat-card { flex: 1; background: #f8fafc; padding: 24px; border-radius: 12px; border: 1px solid #e2e8f0; }
              .stat-value { font-size: 32px; font-weight: 800; color: #0f172a; margin-bottom: 4px; letter-spacing: -1px; }
              .stat-label { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1px; }
              .section-title { font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 2px solid #e2e8f0; }
              table { width: 100%; border-collapse: separate; border-spacing: 0; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; }
              th { background: #f8fafc; padding: 16px; text-align: left; font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #e2e8f0; }
              td { padding: 16px; border-bottom: 1px solid #e2e8f0; font-size: 14px; color: #0f172a; background: white; }
              .row-error td { background: #fef2f2; }
              tr:last-child td { border-bottom: none; }
              .badge { padding: 6px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; display: inline-block; text-transform: uppercase; }
              .badge-success { background: #dcfce7; color: #166534; }
              .badge-danger { background: #fee2e2; color: #991b1b; }
              .badge-neutral { background: #f1f5f9; color: #475569; }
              .error-text { display: block; font-size: 12px; color: #dc2626; margin-top: 4px; font-style: italic; }
              .footer { margin-top: 60px; border-top: 1px solid #e2e8f0; padding-top: 30px; text-align: center; color: #94a3b8; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="logo">QAssist <span class="logo-text">| Hotel Manager</span></div>
              <div class="report-info">
                <div class="report-title">Görev Analiz Raporu</div>
                <div class="report-date">${new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
              </div>
            </div>

            <div class="content">
              <div class="stats-grid">
                <div class="stat-card">
                  <div class="stat-value" style="color: #16a34a">%${analytics.positiveRate}</div>
                  <div class="stat-label">Başarı Oranı</div>
                </div>
                <div class="stat-card">
                  <div class="stat-value" style="color: #dc2626">${analytics.negativeCount}</div>
                  <div class="stat-label">Sorunlu Görev</div>
                </div>
                <div class="stat-card">
                  <div class="stat-value">${analytics.problematicRoom}</div>
                  <div class="stat-label">En Çok Arıza</div>
                </div>
                <div class="stat-card">
                  <div class="stat-value">${analytics.avgDuration}</div>
                  <div class="stat-label">Ortalama Süre</div>
                </div>
              </div>

              <div class="section-title">Detaylı Görev Listesi</div>
              <table>
                <thead>
                  <tr>
                    <th>Görev Detayı</th>
                    <th>Departman</th>
                    <th>Oda / Konum</th>
                    <th>Personel</th>
                    <th>Süre</th>
                    <th>Durum</th>
                  </tr>
                </thead>
                <tbody>
                  ${MOCK_TASKS.map(t => `
                    <tr class="${t.completionStatus === 'negative' ? 'row-error' : ''}">
                      <td>
                        <strong>${t.title}</strong>
                        ${t.negativeReason ? `<span class="error-text">⚠️ ${t.negativeReason}</span>` : ''}
                      </td>
                      <td>${t.dept}</td>
                      <td>${t.room || '-'}</td>
                      <td>${t.assignee}</td>
                      <td>${t.duration}</td>
                      <td>
                        <span class="badge ${t.completionStatus === 'positive' ? 'badge-success' : t.completionStatus === 'negative' ? 'badge-danger' : 'badge-neutral'}">
                          ${t.completionStatus === 'positive' ? 'BAŞARILI' : t.completionStatus === 'negative' ? 'SORUNLU' : 'BEKLİYOR'}
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
            // Share handling
            if (Platform.OS === "ios") {
                await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
            } else {
                // Android sharing
                await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Raporu İndir' });
            }
        } catch (error) {
            Alert.alert('Hata', 'PDF oluşturulamadı: ' + error);
        }
    };

    const getStatusColor = (status: string | null) => {
        switch (status) {
            case 'positive': return { bg: '#dcfce7', text: '#16a34a', label: 'Başarılı', icon: 'happy-outline' };
            case 'negative': return { bg: '#fee2e2', text: '#ef4444', label: 'Sorunlu', icon: 'alert-circle-outline' };
            default: return { bg: '#f1f5f9', text: '#64748b', label: 'Bekliyor', icon: 'time-outline' };
        }
    };

    const renderTaskItem = ({ item }: { item: any }) => {
        const status = getStatusColor(item.completionStatus || (item.status === 'completed' ? 'positive' : null));

        return (
            <View style={styles.taskCard}>
                <View style={styles.taskHeader}>
                    <View style={styles.headerLeft}>
                        <View style={[styles.deptBadge, { backgroundColor: '#eff6ff' }]}>
                            <Text style={styles.deptText}>{item.dept}</Text>
                        </View>
                        <Text style={styles.taskId}>#{item.id}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                        <Ionicons name={status.icon as any} size={12} color={status.text} style={{ marginRight: 4 }} />
                        <Text style={[styles.statusText, { color: status.text }]}>{status.label}</Text>
                    </View>
                </View>

                <Text style={styles.taskTitle}>{item.title}</Text>

                {/* Negative Reason Alert */}
                {item.completionStatus === 'negative' && item.negativeReason && (
                    <View style={styles.errorContainer}>
                        <Ionicons name="warning" size={16} color="#ef4444" />
                        <Text style={styles.errorText}>{item.negativeReason}</Text>
                    </View>
                )}

                <View style={styles.taskFooter}>
                    <View style={styles.footerItem}>
                        <Ionicons name="location-outline" size={16} color="#64748b" />
                        <Text style={styles.footerText}>{item.room || 'Genel'}</Text>
                    </View>
                    <View style={styles.footerItem}>
                        <Ionicons name="person-outline" size={16} color="#64748b" />
                        <Text style={styles.footerText}>{item.assignee}</Text>
                    </View>
                    <View style={styles.footerItem}>
                        <Ionicons name="timer-outline" size={16} color="#64748b" />
                        <Text style={styles.footerText}>{item.duration}</Text>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#0f172a" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Görev Analiz Raporu</Text>
                <TouchableOpacity style={styles.actionButton} onPress={handleDownloadPdf}>
                    <Ionicons name="print-outline" size={22} color="#0f172a" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Analytics Dashboard */}
                <View style={styles.analyticsSection}>
                    <Text style={styles.sectionTitle}>Performans Analizi</Text>
                    <View style={styles.analyticsGrid}>
                        <View style={[styles.analyticsCard, { backgroundColor: '#dcfce7' }]}>
                            <View style={styles.analyticsIconBg}>
                                <Ionicons name="checkmark-done" size={20} color="#15803d" />
                            </View>
                            <Text style={styles.analyticsValue}>%{analytics.positiveRate}</Text>
                            <Text style={styles.analyticsLabel}>Başarı Oranı</Text>
                        </View>
                        <View style={[styles.analyticsCard, { backgroundColor: '#fee2e2' }]}>
                            <View style={[styles.analyticsIconBg, { backgroundColor: 'white' }]}>
                                <Ionicons name="alert" size={20} color="#b91c1c" />
                            </View>
                            <Text style={[styles.analyticsValue, { color: '#b91c1c' }]}>{analytics.negativeCount}</Text>
                            <Text style={[styles.analyticsLabel, { color: '#7f1d1d' }]}>Sorunlu İş</Text>
                        </View>
                        <View style={[styles.analyticsCard, { backgroundColor: '#e0f2fe' }]}>
                            <View style={[styles.analyticsIconBg, { backgroundColor: 'white' }]}>
                                <Ionicons name="business" size={20} color="#0369a1" />
                            </View>
                            <Text style={[styles.analyticsValue, { color: '#0369a1' }]}>{analytics.problematicRoom}</Text>
                            <Text style={[styles.analyticsLabel, { color: '#075985' }]}>En Çok Arıza</Text>
                        </View>
                    </View>
                </View>

                {/* Task List */}
                <View style={styles.listSection}>
                    <View style={styles.listHeader}>
                        <Text style={styles.sectionTitle}>Görev Detayları</Text>
                        <TouchableOpacity style={styles.filterBtn}>
                            <Ionicons name="filter" size={16} color="#64748b" />
                            <Text style={styles.filterBtnText}>Filtrele</Text>
                        </TouchableOpacity>
                    </View>

                    {MOCK_TASKS.map(task => (
                        <View key={task.id}>
                            {renderTaskItem({ item: task })}
                        </View>
                    ))}
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
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 16,
        fontFamily: 'Poppins_600SemiBold',
        color: '#0f172a',
    },
    actionButton: {
        padding: 8,
        backgroundColor: '#f1f5f9',
        borderRadius: 8,
    },
    scrollContent: {
        padding: 20,
    },
    analyticsSection: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontFamily: 'Poppins_600SemiBold',
        color: '#0f172a',
        marginBottom: 16,
    },
    analyticsGrid: {
        flexDirection: 'row',
        gap: 12,
    },
    analyticsCard: {
        flex: 1,
        padding: 16,
        borderRadius: 16,
        alignItems: 'flex-start',
    },
    analyticsIconBg: {
        padding: 8,
        backgroundColor: 'rgba(255,255,255,0.6)',
        borderRadius: 10,
        marginBottom: 12,
    },
    analyticsValue: {
        fontSize: 20,
        fontFamily: 'Poppins_700Bold',
        color: '#14532d',
        marginBottom: 2,
    },
    analyticsLabel: {
        fontSize: 11,
        fontFamily: 'Poppins_500Medium',
        color: '#166534',
    },
    listHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    filterBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: 'white',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    filterBtnText: {
        fontSize: 12,
        fontFamily: 'Poppins_500Medium',
        color: '#64748b',
    },
    taskCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    taskHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    deptBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    deptText: {
        fontSize: 10,
        fontFamily: 'Poppins_600SemiBold',
        color: '#3b82f6',
    },
    taskId: {
        fontSize: 12,
        fontFamily: 'Poppins_500Medium',
        color: '#94a3b8',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    statusText: {
        fontSize: 11,
        fontFamily: 'Poppins_600SemiBold',
    },
    taskTitle: {
        fontSize: 14,
        fontFamily: 'Poppins_600SemiBold',
        color: '#0f172a',
        marginBottom: 8,
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#fef2f2',
        padding: 10,
        borderRadius: 8,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#fecaca',
    },
    errorText: {
        flex: 1,
        fontSize: 12,
        fontFamily: 'Poppins_400Regular',
        color: '#b91c1c',
    },
    taskFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        paddingTop: 12,
    },
    footerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    footerText: {
        fontSize: 12,
        fontFamily: 'Poppins_400Regular',
        color: '#64748b',
    },
    listSection: {
        marginTop: 8,
    },
});
