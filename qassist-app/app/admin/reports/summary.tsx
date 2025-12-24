import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

export default function MonthlySummaryScreen() {

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
              
              .score-card { background: #2563EB; color: white; border-radius: 12px; padding: 30px; text-align: center; margin-bottom: 40px; }
              .score-val { font-size: 64px; font-weight: 800; line-height: 1; }
              .score-lbl { font-size: 16px; opacity: 0.9; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 1px; }
              .score-trend { background: white; color: #16a34a; padding: 6px 12px; border-radius: 20px; display: inline-block; margin-top: 10px; font-weight: bold; font-size: 14px; }

              .grid { display: flex; gap: 20px; margin-bottom: 40px; }
              .card { flex: 1; background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; text-align: center; }
              .metric-val { font-size: 32px; font-weight: 800; color: #0f172a; margin-bottom: 4px; }
              .metric-lbl { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; }

              .section-title { font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 2px solid #e2e8f0; }

              .highlight-list { list-style: none; padding: 0; }
              .highlight-item { padding: 16px; background: white; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 12px; display: flex; align-items: center; }
              .bullet { width: 10px; height: 10px; border-radius: 50%; margin-right: 12px; }

              .footer { margin-top: 60px; border-top: 1px solid #e2e8f0; padding-top: 30px; text-align: center; color: #94a3b8; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="logo">QAssist <span class="logo-text">| Hotel Manager</span></div>
              <div class="report-info">
                <div class="report-title">Aylık Yönetici Özeti</div>
                <div class="report-date">Aralık 2024</div>
              </div>
            </div>

            <div class="content">
              <div class="score-card">
                 <div class="score-lbl">Genel Otel Skoru</div>
                 <div class="score-val">9.2<span style="font-size: 24px; opacity: 0.6">/10</span></div>
                 <div class="score-trend">⬆ +%4.5 Geçen aya göre</div>
              </div>

              <div class="grid">
                 <div class="card">
                    <div class="metric-val">1,245</div>
                    <div class="metric-lbl">Toplam Görev</div>
                 </div>
                 <div class="card">
                    <div class="metric-val">18dk</div>
                    <div class="metric-lbl">Ort. Süre</div>
                 </div>
                 <div class="card">
                    <div class="metric-val">%98</div>
                    <div class="metric-lbl">Memnuniyet</div>
                 </div>
              </div>

              <div class="section-title">Ayın Öne Çıkanları</div>
              <div class="highlight-list">
                 <div class="highlight-item">
                    <div class="bullet" style="background: #22c55e"></div>
                    <div>Kat Hizmetleri verimliliği %12 arttı.</div>
                 </div>
                 <div class="highlight-item">
                     <div class="bullet" style="background: #3b82f6"></div>
                    <div>Teknik servis yanıt süresi 5dk düştü.</div>
                 </div>
                 <div class="highlight-item">
                     <div class="bullet" style="background: #f59e0b"></div>
                    <div>F&B departmanı yoğunluk nedeniyle destek bekliyor.</div>
                 </div>
              </div>

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
                <Text style={styles.headerTitle}>Aylık Özet: Aralık 2024</Text>
                <TouchableOpacity style={styles.actionButton} onPress={handleDownloadPdf}>
                    <Ionicons name="share-outline" size={22} color="#0f172a" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                {/* Big Executive Score Card */}
                <View style={styles.scoreCard}>
                    <Text style={styles.scoreLabel}>Genel Otel Skoru</Text>
                    <Text style={styles.scoreValue}>9.2<Text style={styles.scoreMax}>/10</Text></Text>
                    <View style={styles.trendBadge}>
                        <Ionicons name="trending-up" size={16} color="#16a34a" />
                        <Text style={styles.trendText}>+%4.5 Geçen aya göre</Text>
                    </View>
                </View>

                <View style={styles.gridContainer}>
                    <View style={styles.statBox}>
                        <Text style={styles.statNumber}>1,245</Text>
                        <Text style={styles.statLabel}>Toplam Görev</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statNumber}>18dk</Text>
                        <Text style={styles.statLabel}>Ort. Süre</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statNumber}>%98</Text>
                        <Text style={styles.statLabel}>Memnuniyet</Text>
                    </View>
                </View>

                <Text style={styles.sectionTitle}>Öne Çıkanlar</Text>
                <View style={styles.highlightsContainer}>
                    <View style={styles.highlightRow}>
                        <View style={[styles.bullet, { backgroundColor: '#22c55e' }]} />
                        <Text style={styles.highlightText}>Kat Hizmetleri verimliliği %12 arttı.</Text>
                    </View>
                    <View style={styles.highlightRow}>
                        <View style={[styles.bullet, { backgroundColor: '#3b82f6' }]} />
                        <Text style={styles.highlightText}>Teknik servis yanıt süresi 5dk düştü.</Text>
                    </View>
                    <View style={styles.highlightRow}>
                        <View style={[styles.bullet, { backgroundColor: '#f59e0b' }]} />
                        <Text style={styles.highlightText}>F&B departmanı yoğunluk nedeniyle destek bekliyor.</Text>
                    </View>
                </View>

                <TouchableOpacity style={styles.pdfButton} onPress={handleDownloadPdf}>
                    <Ionicons name="document-text" size={24} color="white" />
                    <Text style={styles.pdfButtonText}>Detaylı PDF Raporu İndir</Text>
                </TouchableOpacity>
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
        fontSize: 16,
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
    scoreCard: {
        backgroundColor: '#2563EB',
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        marginBottom: 24,
        shadowColor: '#2563EB',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    scoreLabel: {
        fontSize: 14,
        fontFamily: 'Poppins_500Medium',
        color: 'rgba(255,255,255,0.8)',
        marginBottom: 8,
    },
    scoreValue: {
        fontSize: 48,
        fontFamily: 'Poppins_700Bold',
        color: 'white',
        lineHeight: 56,
    },
    scoreMax: {
        fontSize: 20,
        fontFamily: 'Poppins_500Medium',
        color: 'rgba(255,255,255,0.6)',
    },
    trendBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        marginTop: 16,
        gap: 6,
    },
    trendText: {
        fontSize: 13,
        fontFamily: 'Poppins_600SemiBold',
        color: '#16a34a',
    },
    gridContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 32,
    },
    statBox: {
        flex: 1,
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    statNumber: {
        fontSize: 20,
        fontFamily: 'Poppins_700Bold',
        color: '#0f172a',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        fontFamily: 'Poppins_500Medium',
        color: '#64748b',
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: 'Poppins_600SemiBold',
        color: '#0f172a',
        marginBottom: 16,
    },
    highlightsContainer: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
    },
    highlightRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 12,
    },
    bullet: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    highlightText: {
        flex: 1,
        fontSize: 14,
        fontFamily: 'Poppins_400Regular',
        color: '#334155',
    },
    pdfButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0f172a',
        paddingVertical: 16,
        borderRadius: 16,
        gap: 12,
    },
    pdfButtonText: {
        fontSize: 16,
        fontFamily: 'Poppins_600SemiBold',
        color: 'white',
    },
});
