'use client';

import { 
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Calendar,
  Bed,
  ClipboardList,
  Download,
  Filter,
  BarChart3,
  PieChart,
  LineChart,
  Activity,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  FileText
} from 'lucide-react';
import { useState } from 'react';

type ReportPeriod = 'today' | 'week' | 'month' | 'year' | 'custom';
type ReportType = 'revenue' | 'reservations' | 'occupancy' | 'tasks' | 'customers' | 'personnel';

interface ChartDataPoint {
  label: string;
  value: number;
}

function SimpleBarChart({ data, color = 'slate' }: { data: ChartDataPoint[]; color?: string }) {
  const maxValue = Math.max(...data.map(d => d.value));
  
  return (
    <div className="flex items-end justify-between gap-2 h-48">
      {data.map((item, index) => (
        <div key={index} className="flex-1 flex flex-col items-center gap-2">
          <div className="w-full flex items-end justify-center" style={{ height: '180px' }}>
            <div
              className="w-full rounded-t-lg transition-all hover:opacity-80 bg-slate-600 dark:bg-slate-400"
              style={{ 
                height: `${(item.value / maxValue) * 100}%`
              }}
            />
          </div>
          <span className="text-xs text-slate-600 dark:text-slate-400 text-center">{item.label}</span>
          <span className="text-xs font-semibold text-slate-900 dark:text-slate-50">{item.value}</span>
        </div>
      ))}
    </div>
  );
}

function SimpleLineChart({ data, color = 'slate' }: { data: ChartDataPoint[]; color?: string }) {
  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue || 1;
  
  return (
    <div className="relative h-48">
      <svg className="w-full h-full" viewBox="0 0 400 180">
        <polyline
          fill="none"
          stroke="rgb(71 85 105)"
          className="dark:stroke-slate-400"
          strokeWidth="2"
          points={data.map((item, index) => {
            const x = (index / (data.length - 1)) * 380 + 10;
            const y = 170 - ((item.value - minValue) / range) * 160;
            return `${x},${y}`;
          }).join(' ')}
        />
        {data.map((item, index) => {
          const x = (index / (data.length - 1)) * 380 + 10;
          const y = 170 - ((item.value - minValue) / range) * 160;
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="4"
              fill="rgb(71 85 105)"
              className="dark:fill-slate-400"
            />
          );
        })}
      </svg>
      <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-slate-600 dark:text-slate-400">
        {data.map((item, index) => (
          <span key={index}>{item.label}</span>
        ))}
      </div>
    </div>
  );
}

function SimplePieChart({ data }: { data: ChartDataPoint[] }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let currentAngle = 0;
  const colors = ['rgb(71 85 105)', 'rgb(100 116 139)', 'rgb(148 163 184)', 'rgb(203 213 225)', 'rgb(226 232 240)'];
  
  return (
    <div className="flex items-center gap-8">
      <div className="relative w-48 h-48">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
          {data.map((item, index) => {
            const percentage = (item.value / total) * 100;
            const angle = (percentage / 100) * 360;
            const largeArcFlag = angle > 180 ? 1 : 0;
            const x1 = 100 + 100 * Math.cos((currentAngle * Math.PI) / 180);
            const y1 = 100 + 100 * Math.sin((currentAngle * Math.PI) / 180);
            const x2 = 100 + 100 * Math.cos(((currentAngle + angle) * Math.PI) / 180);
            const y2 = 100 + 100 * Math.sin(((currentAngle + angle) * Math.PI) / 180);
            
            const pathData = [
              `M 100 100`,
              `L ${x1} ${y1}`,
              `A 100 100 0 ${largeArcFlag} 1 ${x2} ${y2}`,
              `Z`
            ].join(' ');
            
            const currentColor = colors[index % colors.length];
            currentAngle += angle;
            
            return (
              <path
                key={index}
                d={pathData}
                fill={currentColor}
                stroke="white"
                strokeWidth="2"
              />
            );
          })}
        </svg>
      </div>
      <div className="flex-1 space-y-2">
        {data.map((item, index) => {
          const percentage = ((item.value / total) * 100).toFixed(1);
          return (
            <div key={index} className="flex items-center gap-3">
              <div 
                className="w-4 h-4 rounded"
                style={{ backgroundColor: colors[index % colors.length] }}
              />
              <span className="text-sm text-slate-600 dark:text-slate-400 flex-1">{item.label}</span>
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-50">{percentage}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Reports() {
  const [period, setPeriod] = useState<ReportPeriod>('month');
  const [reportType, setReportType] = useState<ReportType>('revenue');

  // Mock Data
  const revenueData: ChartDataPoint[] = [
    { label: 'Pzt', value: 45000 },
    { label: 'Sal', value: 52000 },
    { label: 'Çar', value: 48000 },
    { label: 'Per', value: 61000 },
    { label: 'Cum', value: 75000 },
    { label: 'Cmt', value: 82000 },
    { label: 'Paz', value: 68000 },
  ];

  const occupancyData: ChartDataPoint[] = [
    { label: 'Ocak', value: 65 },
    { label: 'Şubat', value: 72 },
    { label: 'Mart', value: 68 },
    { label: 'Nisan', value: 78 },
    { label: 'Mayıs', value: 85 },
    { label: 'Haziran', value: 92 },
  ];

  const reservationTypes: ChartDataPoint[] = [
    { label: 'Oda', value: 245 },
    { label: 'Restoran', value: 180 },
    { label: 'Spa', value: 95 },
    { label: 'Etkinlik', value: 45 },
  ];

  const taskStatus: ChartDataPoint[] = [
    { label: 'Tamamlandı', value: 320 },
    { label: 'Onaylandı', value: 45 },
    { label: 'Bekliyor', value: 18 },
  ];

  const departmentPerformance: ChartDataPoint[] = [
    { label: 'Temizlik', value: 95 },
    { label: 'Resepsiyon', value: 88 },
    { label: 'Mutfak', value: 92 },
    { label: 'Güvenlik', value: 90 },
  ];

  const customerSatisfaction: ChartDataPoint[] = [
    { label: 'Çok İyi', value: 45 },
    { label: 'İyi', value: 35 },
    { label: 'Orta', value: 15 },
    { label: 'Kötü', value: 5 },
  ];

  const stats = {
    totalRevenue: 425000,
    revenueChange: 12.5,
    totalReservations: 156,
    reservationsChange: 8.3,
    occupancyRate: 78,
    occupancyChange: 5.2,
    totalTasks: 383,
    tasksChange: -3.1,
    avgResponseTime: 15,
    responseTimeChange: -8.5,
    customerSatisfaction: 4.2,
    satisfactionChange: 0.3,
  };

  return (
    <div className="p-6 lg:p-8 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-2">Raporlar</h1>
          <p className="text-slate-600 dark:text-slate-400">Otel performans analizi ve istatistikler</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filtrele
          </button>
          <button className="px-4 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl font-semibold hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" />
            Dışa Aktar
          </button>
        </div>
      </div>

      {/* Period Selector */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-200/50 dark:border-slate-800/50 p-4 shadow-lg mb-6">
        <div className="flex items-center gap-2 flex-wrap">
          {(['today', 'week', 'month', 'year', 'custom'] as ReportPeriod[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                period === p
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {p === 'today' ? 'Bugün' : p === 'week' ? 'Bu Hafta' : p === 'month' ? 'Bu Ay' : p === 'year' ? 'Bu Yıl' : 'Özel'}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-xl border border-slate-200/50 dark:border-slate-800/50 p-5 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <DollarSign className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </div>
            {stats.revenueChange > 0 ? (
              <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <ArrowUpRight className="w-4 h-4" />
                <span className="text-sm font-semibold">+{stats.revenueChange}%</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                <ArrowDownRight className="w-4 h-4" />
                <span className="text-sm font-semibold">{stats.revenueChange}%</span>
              </div>
            )}
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Toplam Gelir</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            ₺{stats.totalRevenue.toLocaleString('tr-TR')}
          </p>
        </div>

        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-xl border border-slate-200/50 dark:border-slate-800/50 p-5 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <Calendar className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </div>
            <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <ArrowUpRight className="w-4 h-4" />
              <span className="text-sm font-semibold">+{stats.reservationsChange}%</span>
            </div>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Toplam Rezervasyon</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">{stats.totalReservations}</p>
        </div>

        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-xl border border-slate-200/50 dark:border-slate-800/50 p-5 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <Bed className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </div>
            <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <ArrowUpRight className="w-4 h-4" />
              <span className="text-sm font-semibold">+{stats.occupancyChange}%</span>
            </div>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Doluluk Oranı</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">{stats.occupancyRate}%</p>
        </div>

        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-xl border border-slate-200/50 dark:border-slate-800/50 p-5 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <ClipboardList className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </div>
            <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
              <ArrowDownRight className="w-4 h-4" />
              <span className="text-sm font-semibold">{stats.tasksChange}%</span>
            </div>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Toplam Görev</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">{stats.totalTasks}</p>
        </div>

        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-xl border border-slate-200/50 dark:border-slate-800/50 p-5 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <Clock className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </div>
            <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <ArrowUpRight className="w-4 h-4" />
              <span className="text-sm font-semibold">{stats.responseTimeChange}%</span>
            </div>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Ort. Yanıt Süresi</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">{stats.avgResponseTime} dk</p>
        </div>

        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-xl border border-slate-200/50 dark:border-slate-800/50 p-5 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <Activity className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </div>
            <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <ArrowUpRight className="w-4 h-4" />
              <span className="text-sm font-semibold">+{stats.satisfactionChange}</span>
            </div>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Müşteri Memnuniyeti</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">{stats.customerSatisfaction}/5</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Revenue Chart */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-200/50 dark:border-slate-800/50 p-6 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50 mb-1">Gelir Trendi</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Haftalık gelir analizi</p>
            </div>
            <LineChart className="w-5 h-5 text-slate-400" />
          </div>
          <SimpleLineChart data={revenueData} />
        </div>

        {/* Occupancy Chart */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-200/50 dark:border-slate-800/50 p-6 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50 mb-1">Doluluk Oranı</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Aylık doluluk trendi</p>
            </div>
            <BarChart3 className="w-5 h-5 text-slate-400" />
          </div>
          <SimpleBarChart data={occupancyData} />
        </div>

        {/* Reservation Types */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-200/50 dark:border-slate-800/50 p-6 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50 mb-1">Rezervasyon Tipleri</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Rezervasyon dağılımı</p>
            </div>
            <PieChart className="w-5 h-5 text-slate-400" />
          </div>
          <SimplePieChart data={reservationTypes} />
        </div>

        {/* Task Status */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-200/50 dark:border-slate-800/50 p-6 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50 mb-1">Görev Durumları</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Görev tamamlanma durumu</p>
            </div>
            <Activity className="w-5 h-5 text-slate-400" />
          </div>
          <SimplePieChart data={taskStatus} />
        </div>
      </div>

      {/* Detailed Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Department Performance */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-200/50 dark:border-slate-800/50 p-6 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50 mb-1">Departman Performansı</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Performans skorları</p>
            </div>
            <Users className="w-5 h-5 text-slate-400" />
          </div>
          <div className="space-y-4">
            {departmentPerformance.map((dept, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-900 dark:text-slate-50">{dept.label}</span>
                  <span className="text-sm font-semibold text-slate-900 dark:text-slate-50">{dept.value}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2">
                  <div
                    className="bg-slate-900 dark:bg-slate-100 rounded-full h-2 transition-all"
                    style={{ width: `${dept.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Customer Satisfaction */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-200/50 dark:border-slate-800/50 p-6 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50 mb-1">Müşteri Memnuniyeti</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Memnuniyet dağılımı</p>
            </div>
            <Activity className="w-5 h-5 text-slate-400" />
          </div>
          <SimplePieChart data={customerSatisfaction} />
        </div>
      </div>

      {/* Detailed Table */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-200/50 dark:border-slate-800/50 p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50 mb-1">Detaylı Rezervasyon Raporu</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">Günlük rezervasyon detayları</p>
          </div>
          <FileText className="w-5 h-5 text-slate-400" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Tarih</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Tip</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Müşteri</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Tutar</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Durum</th>
              </tr>
            </thead>
            <tbody>
              {[
                { date: '15.11.2025', type: 'Oda', customer: 'Ahmet Yılmaz', amount: 2500, status: 'completed' },
                { date: '15.11.2025', type: 'Restoran', customer: 'Ayşe Demir', amount: 450, status: 'completed' },
                { date: '15.11.2025', type: 'Spa', customer: 'Mehmet Kaya', amount: 800, status: 'pending' },
                { date: '14.11.2025', type: 'Oda', customer: 'Fatma Şahin', amount: 3200, status: 'completed' },
                { date: '14.11.2025', type: 'Etkinlik', customer: 'Ali Çelik', amount: 200, status: 'completed' },
              ].map((row, index) => (
                <tr key={index} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="py-3 px-4 text-sm text-slate-900 dark:text-slate-50">{row.date}</td>
                  <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">{row.type}</td>
                  <td className="py-3 px-4 text-sm text-slate-900 dark:text-slate-50">{row.customer}</td>
                  <td className="py-3 px-4 text-sm text-slate-900 dark:text-slate-50 text-right font-semibold">₺{row.amount.toLocaleString('tr-TR')}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                      row.status === 'completed'
                        ? 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400'
                        : 'bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400'
                    }`}>
                      {row.status === 'completed' ? 'Tamamlandı' : 'Bekliyor'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

