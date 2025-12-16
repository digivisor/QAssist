'use client';

import { 
  Search,
  User,
  Phone,
  Mail,
  MoreVertical,
  X,
  Plus,
  Edit,
  Trash2,
  Building2,
  Lock,
  Calendar,
  LayoutGrid,
  List,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Department {
  id: number;
  name: string;
}

interface Employee {
  id: number;
  departmentId?: number;
  departmentName?: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  appPassword: string;
  age?: number;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

type ViewMode = 'grid' | 'list';

function EmployeeDetailModal({ 
  employee, 
  isOpen, 
  onClose, 
  onEdit, 
  onDelete, 
  onToggleStatus 
}: { 
  employee: Employee | null; 
  isOpen: boolean; 
  onClose: () => void;
  onEdit: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
  onToggleStatus: (employee: Employee) => void;
}) {
  if (!isOpen || !employee) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-2">
                {employee.firstName} {employee.lastName}
              </h2>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                employee.status === 'active' 
                  ? 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}>
                {employee.status === 'active' ? 'Aktif' : 'Pasif'}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2">Departman</h3>
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-slate-400" />
                  <span className="text-base text-slate-900 dark:text-slate-50">
                    {employee.departmentName || 'Belirtilmemiş'}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2">Telefon</h3>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span className="text-base text-slate-900 dark:text-slate-50">{employee.phone}</span>
                </div>
              </div>

              {employee.email && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2">E-posta</h3>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span className="text-base text-slate-900 dark:text-slate-50">{employee.email}</span>
                  </div>
                </div>
              )}

              {employee.age && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2">Yaş</h3>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span className="text-base text-slate-900 dark:text-slate-50">{employee.age}</span>
                  </div>
                </div>
              )}
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2">Uygulama Şifresi</h3>
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-slate-400" />
                <span className="text-base text-slate-900 dark:text-slate-50 font-mono">
                  {employee.appPassword}
                </span>
              </div>
            </div>

            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Calendar className="w-3 h-3" />
              <span>
                Oluşturulma: {new Date(employee.createdAt).toLocaleString('tr-TR')}
              </span>
            </div>

            <div className="flex gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => {
                  onEdit(employee);
                  onClose();
                }}
                className="flex-1 px-4 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg font-semibold hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Düzenle
              </button>
              <button
                onClick={() => {
                  onToggleStatus(employee);
                  onClose();
                }}
                className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
                  employee.status === 'active'
                    ? 'bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-950/50'
                    : 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-950/50'
                }`}
              >
                {employee.status === 'active' ? (
                  <>
                    <XCircle className="w-4 h-4" />
                    Pasif Yap
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Aktif Yap
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  if (confirm(`${employee.firstName} ${employee.lastName} adlı personeli silmek istediğinize emin misiniz?`)) {
                    onDelete(employee);
                    onClose();
                  }
                }}
                className="px-4 py-2 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 rounded-lg font-semibold hover:bg-red-100 dark:hover:bg-red-950/40 transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Sil
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AddEditEmployeeModal({ 
  employee, 
  isOpen, 
  onClose, 
  onSave, 
  departments 
}: { 
  employee: Employee | null; 
  isOpen: boolean; 
  onClose: () => void;
  onSave: (employee: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>) => void;
  departments: Department[];
}) {
  const [formData, setFormData] = useState({
    departmentId: '',
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    appPassword: '',
    age: '',
    status: 'active' as 'active' | 'inactive',
  });

  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (employee) {
      setFormData({
        departmentId: employee.departmentId?.toString() || '',
        firstName: employee.firstName,
        lastName: employee.lastName,
        phone: employee.phone,
        email: employee.email || '',
        appPassword: employee.appPassword,
        age: employee.age?.toString() || '',
        status: employee.status,
      });
    } else {
      setFormData({
        departmentId: '',
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        appPassword: '',
        age: '',
        status: 'active',
      });
    }
  }, [employee, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.phone || !formData.appPassword) {
      alert('Lütfen zorunlu alanları doldurun');
      return;
    }

    onSave({
      departmentId: formData.departmentId ? parseInt(formData.departmentId) : undefined,
      departmentName: departments.find(d => d.id === parseInt(formData.departmentId))?.name,
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: formData.phone,
      email: formData.email || undefined,
      appPassword: formData.appPassword,
      age: formData.age ? parseInt(formData.age) : undefined,
      status: formData.status,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-start justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
              {employee ? 'Personel Düzenle' : 'Yeni Personel Ekle'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Ad *
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Soyad *
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Departman
              </label>
              <select
                value={formData.departmentId}
                onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600"
              >
                <option value="">Departman Seçin</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Telefon *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  E-posta
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Uygulama Şifresi *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.appPassword}
                    onChange={(e) => setFormData({ ...formData, appPassword: e.target.value })}
                    className="w-full px-4 py-2.5 pr-10 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 font-mono"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Yaş
                </label>
                <input
                  type="number"
                  min="18"
                  max="100"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Durum
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600"
              >
                <option value="active">Aktif</option>
                <option value="inactive">Pasif</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                İptal
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg font-semibold hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors"
              >
                {employee ? 'Güncelle' : 'Ekle'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function Personnel() {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    loadDepartments();
    loadEmployees();
  }, []);

  const loadDepartments = async () => {
    try {
      const { data, error } = await supabase
        .from('hotel_departments')
        .select('id, name')
        .order('name', { ascending: true });

      if (error) {
        console.error('Departments yükleme hatası:', error);
        return;
      }

      if (data) {
        setDepartments(data.map(d => ({ id: d.id, name: d.name })));
      }
    } catch (error) {
      console.error('Departments yükleme hatası:', error);
    }
  };

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('employees')
        .select(`
          *,
          hotel_departments:department_id (
            id,
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        setEmployees(data.map((emp: any) => ({
          id: emp.id,
          departmentId: emp.department_id || undefined,
          departmentName: emp.hotel_departments?.name || undefined,
          firstName: emp.first_name,
          lastName: emp.last_name,
          phone: emp.phone,
          email: emp.email || undefined,
          appPassword: emp.app_password,
          age: emp.age || undefined,
          status: emp.status || 'active',
          createdAt: emp.created_at,
          updatedAt: emp.updated_at,
        })));
      }
    } catch (error) {
      console.error('Employees yükleme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEmployee = async (employeeData: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (editingEmployee) {
        // Güncelle
        const { error } = await supabase
          .from('employees')
          .update({
            department_id: employeeData.departmentId || null,
            first_name: employeeData.firstName,
            last_name: employeeData.lastName,
            phone: employeeData.phone,
            email: employeeData.email || null,
            app_password: employeeData.appPassword,
            age: employeeData.age || null,
            status: employeeData.status,
          })
          .eq('id', editingEmployee.id);

        if (error) throw error;
      } else {
        // Yeni ekle
        const { error } = await supabase
          .from('employees')
          .insert({
            department_id: employeeData.departmentId || null,
            first_name: employeeData.firstName,
            last_name: employeeData.lastName,
            phone: employeeData.phone,
            email: employeeData.email || null,
            app_password: employeeData.appPassword,
            age: employeeData.age || null,
            status: employeeData.status,
          });

        if (error) throw error;
      }

      await loadEmployees();
      setEditingEmployee(null);
    } catch (error) {
      console.error('Employee kaydetme hatası:', error);
      alert('Personel kaydedilirken bir hata oluştu');
    }
  };

  const handleDeleteEmployee = async (employee: Employee) => {
    try {
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', employee.id);

      if (error) throw error;

      await loadEmployees();
    } catch (error) {
      console.error('Employee silme hatası:', error);
      alert('Personel silinirken bir hata oluştu');
    }
  };

  const handleToggleStatus = async (employee: Employee) => {
    try {
      const newStatus = employee.status === 'active' ? 'inactive' : 'active';
      const { error } = await supabase
        .from('employees')
        .update({ status: newStatus })
        .eq('id', employee.id);

      if (error) throw error;

      await loadEmployees();
    } catch (error) {
      console.error('Employee durum güncelleme hatası:', error);
      alert('Personel durumu güncellenirken bir hata oluştu');
    }
  };

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = searchQuery === '' || 
      `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.phone.includes(searchQuery) ||
      emp.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.departmentName?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || emp.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="p-6 lg:p-8 min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-slate-300 dark:border-slate-700 border-t-slate-900 dark:border-t-slate-100 rounded-full animate-spin"></div>
          <p className="text-slate-600 dark:text-slate-400 font-medium">Personeller yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">Personel Yönetimi</h1>
          <button
            onClick={() => {
              setEditingEmployee(null);
              setIsAddEditModalOpen(true);
            }}
            className="px-4 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg font-semibold hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Yeni Personel
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Personel ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                statusFilter === 'all'
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              Tümü
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                statusFilter === 'active'
                  ? 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              Aktif
            </button>
            <button
              onClick={() => setStatusFilter('inactive')}
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                statusFilter === 'inactive'
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              Pasif
            </button>
          </div>

          <div className="flex items-center gap-2 border border-slate-200 dark:border-slate-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'grid'
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'list'
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {filteredEmployees.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <User className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400 font-medium">
              {searchQuery ? 'Arama sonucu bulunamadı' : 'Henüz personel eklenmemiş'}
            </p>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEmployees.map((employee) => (
            <div
              key={employee.id}
              className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-all cursor-pointer"
              onClick={() => {
                setSelectedEmployee(employee);
                setIsModalOpen(true);
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-slate-50">
                      {employee.firstName} {employee.lastName}
                    </h3>
                    {employee.departmentName && (
                      <p className="text-sm text-slate-500 dark:text-slate-400">{employee.departmentName}</p>
                    )}
                  </div>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                  employee.status === 'active'
                    ? 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}>
                  {employee.status === 'active' ? 'Aktif' : 'Pasif'}
                </span>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <Phone className="w-4 h-4" />
                  <span>{employee.phone}</span>
                </div>
                {employee.email && (
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <Mail className="w-4 h-4" />
                    <span>{employee.email}</span>
                  </div>
                )}
                {employee.age && (
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <Calendar className="w-4 h-4" />
                    <span>{employee.age} yaş</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">Personel</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">Departman</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">Telefon</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">E-posta</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">Durum</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredEmployees.map((employee) => (
                <tr key={employee.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-slate-50">
                          {employee.firstName} {employee.lastName}
                        </div>
                        {employee.age && (
                          <div className="text-xs text-slate-500 dark:text-slate-400">{employee.age} yaş</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                    {employee.departmentName || '-'}
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{employee.phone}</td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{employee.email || '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      employee.status === 'active'
                        ? 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}>
                      {employee.status === 'active' ? 'Aktif' : 'Pasif'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setSelectedEmployee(employee);
                          setIsModalOpen(true);
                        }}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                      >
                        <MoreVertical className="w-4 h-4 text-slate-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      <EmployeeDetailModal
        employee={selectedEmployee}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onEdit={(employee) => {
          setEditingEmployee(employee);
          setIsAddEditModalOpen(true);
        }}
        onDelete={handleDeleteEmployee}
        onToggleStatus={handleToggleStatus}
      />

      <AddEditEmployeeModal
        employee={editingEmployee}
        isOpen={isAddEditModalOpen}
        onClose={() => {
          setIsAddEditModalOpen(false);
          setEditingEmployee(null);
        }}
        onSave={handleSaveEmployee}
        departments={departments}
      />
    </div>
  );
}
