import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

export default function EfficiencyReportScreen() {
    const weeklyData = [65, 78, 45, 89, 92, 54, 88]; // Mock data for bar chart
    const deptData = [
        { name: 'Kat Hizmetleri', score: 92, color: '#3b82f6' },
        { name: 'Teknik Servis', score: 85, color: '#f59e0b' },
        { name: 'Resepsiyon', score: 98, color: '#22c55e' },
        { name: 'F&B', score: 78, color: '#ef4444' }
    ];

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
              .grid { display: flex; gap: 20px; margin-bottom: 40px; }
              .card { flex: 1; background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; text-align: center; }
              .metric-val { font-size: 32px; font-weight: 800; color: #0f172a; margin-bottom: 4px; }
              .metric-lbl { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; }
              
              .section-title { font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 2px solid #e2e8f0; }

              table { width: 100%; border-collapse: separate; border-spacing: 0; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; margin-top: 20px; }
              th { background: #f8fafc; padding: 16px; text-align: left; font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; }
              td { padding: 16px; border-bottom: 1px solid #e2e8f0; font-size: 14px; color: #0f172a; }
              tr:last-child td { border-bottom: none; }
              .bar-bg { background: #f1f5f9; height: 8px; border-radius: 4px; overflow: hidden; width: 150px; }
              .bar-fill { height: 100%; border-radius: 4px; }

              .footer { margin-top: 60px; border-top: 1px solid #e2e8f0; padding-top: 30px; text-align: center; color: #94a3b8; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="logo">QAssist <span class="logo-text">| Hotel Manager</span></div>
              <div class="report-info">
                <div class="report-title">Verimlilik Analizi</div>
                <div class="report-date">${new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
              </div>
            </div>

            <div class="content">
              <div class="grid">
                 <div class="card">
                    <div class="metric-val">18dk</div>
                    <div class="metric-lbl">Ort. Yanıt</div>
                 </div>
                 <div class="card">
                    <div class="metric-val" style="color: #16a34a">%94</div>
                    <div class="metric-lbl">Tamamlanma</div>
                 </div>
                 <div class="card">
                    <div class="metric-val" style="color: #d97706">4.8</div>
                    <div class="metric-lbl">Memnuniyet</div>
                 </div>
              </div>

              <div class="section-title">Departman Performans Tablosu</div>
              <table>
                <thead>
                  <tr>
                    <th>Departman</th>
                    <th>Verimlilik Skoru</th>
                    <th>Görsel Durum</th>
                  </tr>
                </thead>
                <tbody>
                  ${deptData.map(d => `
                    <tr>
                      <td><strong>${d.name}</strong></td>
                      <td>%${d.score}</td>
                      <td>
                        <div class="bar-bg">
                           <div class="bar-fill" style="width: ${d.score}%; background: ${d.color}"></div>
                        </div>
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

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#0f172a" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Verimlilik Analizi</Text>
                <TouchableOpacity style={styles.actionButton} onPress={handleDownloadPdf}>
                    <Ionicons name="print-outline" size={22} color="#0f172a" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Top Metrics Grid */}
                <View style={styles.gridContainer}>
                    <View style={[styles.gridItem, { backgroundColor: '#dbeafe' }]}>
                        <View style={styles.iconContainer}>
                            <Ionicons name="time-outline" size={24} color="#2563EB" />
                        </View>
                        <Text style={styles.metricValue}>18dk</Text>
                        <Text style={styles.metricLabel}>Ort. Yanıt</Text>
                    </View>
                    <View style={[styles.gridItem, { backgroundColor: '#dcfce7' }]}>
                        <View style={styles.iconContainer}>
                            <Ionicons name="checkmark-circle-outline" size={24} color="#16a34a" />
                        </View>
                        <Text style={styles.metricValue}>%94</Text>
                        <Text style={styles.metricLabel}>Tamamlanma</Text>
                    </View>
                    <View style={[styles.gridItem, { backgroundColor: '#fef3c7' }]}>
                        <View style={styles.iconContainer}>
                            <Ionicons name="star-outline" size={24} color="#d97706" />
                        </View>
                        <Text style={styles.metricValue}>4.8</Text>
                        <Text style={styles.metricLabel}>Memnuniyet</Text>
                    </View>
                </View>

                {/* Weekly Chart Mockup */}
                <View style={styles.chartContainer}>
                    <Text style={styles.sectionTitle}>Haftalık Performans</Text>
                    <View style={styles.chartArea}>
                        {weeklyData.map((value, index) => (
                            <View key={index} style={styles.barContainer}>
                                <View style={[styles.bar, { height: `${value}%` }]} />
                                <Text style={styles.barLabel}>{['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pz'][index]}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Detailed Breakdown */}
                <View style={styles.breakdownContainer}>
                    <Text style={styles.sectionTitle}>Departman Bazlı Verimlilik</Text>

                    {[
                        { name: 'Kat Hizmetleri', score: 92, color: '#3b82f6' },
                        { name: 'Teknik Servis', score: 85, color: '#f59e0b' },
                        { name: 'Resepsiyon', score: 98, color: '#22c55e' },
                        { name: 'F&B', score: 78, color: '#ef4444' }
                    ].map((dept, i) => (
                        <View key={i} style={styles.deptRow}>
                            <View style={styles.deptInfo}>
                                <Text style={styles.deptName}>{dept.name}</Text>
                                <Text style={styles.deptScore}>%{dept.score}</Text>
                            </View>
                            <View style={styles.deptBarBg}>
                                <View style={[styles.deptBar, { width: `${dept.score}%`, backgroundColor: dept.color }]} />
                            </View>
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
    backButton: { padding: 8 },
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
    content: {
        padding: 20,
    },
    gridContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    gridItem: {
        flex: 1,
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
    },
    iconContainer: {
        marginBottom: 8,
        backgroundColor: 'rgba(255,255,255,0.5)',
        padding: 8,
        borderRadius: 12,
    },
    metricValue: {
        fontSize: 20,
        fontFamily: 'Poppins_700Bold',
        color: '#0f172a',
        marginBottom: 4,
    },
    metricLabel: {
        fontSize: 11,
        fontFamily: 'Poppins_500Medium',
        color: '#475569',
    },
    chartContainer: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontFamily: 'Poppins_600SemiBold',
        color: '#0f172a',
        marginBottom: 16,
    },
    chartArea: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        height: 150,
        paddingTop: 20,
    },
    barContainer: {
        alignItems: 'center',
        width: 20,
        height: '100%',
        justifyContent: 'flex-end',
        gap: 8,
    },
    bar: {
        width: 8,
        backgroundColor: '#3b82f6',
        borderRadius: 4,
    },
    barLabel: {
        fontSize: 12,
        fontFamily: 'Poppins_400Regular',
        color: '#64748b',
    },
    breakdownContainer: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
    },
    deptRow: {
        marginBottom: 16,
    },
    deptInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    deptName: {
        fontSize: 14,
        fontFamily: 'Poppins_500Medium',
        color: '#0f172a',
    },
    deptScore: {
        fontSize: 14,
        fontFamily: 'Poppins_600SemiBold',
        color: '#0f172a',
    },
    deptBarBg: {
        height: 6,
        backgroundColor: '#f1f5f9',
        borderRadius: 3,
    },
    deptBar: {
        height: '100%',
        borderRadius: 3,
    },
});
