'use client';

import { 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Search,
  Info,
  User,
  Phone,
  MessageSquare,
  Activity,
  LayoutGrid,
  List,
  GripVertical,
  Building2,
  X,
  Plus
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import {
  DndContext,
  closestCorners,
  rectIntersection,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  useDroppable,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Task {
  id: number;
  room: string;
  guest: string;
  request: string;
  requestDetail?: string;
  time: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  assignedTo?: string;
  source: 'whatsapp' | 'phone' | 'direct' | 'crm';
  department?: string; // department name (display için)
  departmentId?: number; // department id (VT'deki department foreign key)
  createdAt?: number; // timestamp
  inProgressAt?: number; // timestamp - görevin onaylandığı (in-progress'e geçtiği) zaman
  completedAt?: number; // timestamp
  completedBy?: string;
  completionTime?: number; // dakika cinsinden - oluşturulma ile tamamlanma arası
  workTime?: number; // dakika cinsinden - onaylama ile tamamlanma arası
  origin?: 'tasks' | 'customer_requests'; // hangi tablodan geldi
  backendId?: number; // ilgili tablodaki gerçek id
}

type ViewMode = 'list' | 'kanban' | 'department';
type SortMode = 'latest' | 'priority';

interface Department {
  id: number;
  name: string;
}

function DroppableColumn({ id, children, className }: { id: string; children: React.ReactNode; className?: string }) {
  const { setNodeRef, isOver } = useDroppable({ 
    id,
    data: {
      type: 'container',
      accepts: ['task'],
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={`${className} ${isOver ? 'ring-2 ring-slate-400 dark:ring-slate-600 ring-offset-2' : ''} transition-all`}
    >
      {children}
    </div>
  );
}

function SortableTask({ task, onDetailsClick }: { task: Task; onDetailsClick: (task: Task) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: task.id,
    data: {
      type: 'task',
      task,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getPriorityBadge = (priority: string) => {
    const styles = {
      low: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
      medium: 'bg-orange-100 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400',
      high: 'bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400',
    };
    
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${styles[priority as keyof typeof styles]}`}>
        {priority === 'low' ? 'Düşük' : priority === 'medium' ? 'Orta' : 'Yüksek'}
      </span>
    );
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'whatsapp':
        return <MessageSquare className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />;
      case 'phone':
        return <Phone className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />;
      case 'crm':
        return <LayoutGrid className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />;
      default:
        return <User className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400',
      'in-progress': 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
      completed: 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400',
    };
    
    const icons = {
      pending: Clock,
      'in-progress': Activity,
      completed: CheckCircle2,
    };

    const Icon = icons[status as keyof typeof icons];
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold ${styles[status as keyof typeof styles]}`}>
        <Icon className="w-3 h-3" />
        {status === 'pending' ? 'Bekliyor' : status === 'in-progress' ? 'Onaylandı' : 'Tamamlandı'}
      </span>
    );
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-4 shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing relative"
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDetailsClick(task);
        }}
        className="absolute top-2 right-2 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors z-10"
      >
        <Info className="w-4 h-4 text-slate-400" />
      </button>
      <div className="flex-1 pr-6">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className="px-2 py-0.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded text-xs font-bold">
            Oda {task.room}
          </span>
          {getPriorityBadge(task.priority)}
          {getStatusBadge(task.status)}
        </div>
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-50 mb-1">
            {task.guest}
          </p>
          <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
            {task.request}
          </p>
          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-500">
            {getSourceIcon(task.source)}
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {task.time}
            </span>
            {task.assignedTo && (
              <span className="flex items-center gap-1">
                <User className="w-3 h-3" />
                {task.assignedTo}
              </span>
            )}
            {task.department && (
              <span className="flex items-center gap-1">
                <Building2 className="w-3 h-3" />
                {task.department}
              </span>
            )}
          </div>
      </div>
    </div>
  );
}

function CreateTaskModal({ isOpen, onClose, onCreate, departments }: { isOpen: boolean; onClose: () => void; onCreate: (task: Omit<Task, 'id' | 'time' | 'createdAt'>) => void; departments: Department[] }) {
  const [formData, setFormData] = useState({
    room: '',
    guest: '',
    request: '',
    priority: 'medium' as Task['priority'],
    department: '', // department ID (number as string)
    assignedTo: '',
    source: 'crm' as Task['source'],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.room || !formData.guest || !formData.request || !formData.department) {
      return;
    }
    onCreate({
      ...formData,
      status: 'pending',
    });
    setFormData({
      room: '',
      guest: '',
      request: '',
      priority: 'medium',
      department: '',
      assignedTo: '',
      source: 'crm',
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
              Yeni Görev Oluştur
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
                  Oda Numarası *
                </label>
                <input
                  type="text"
                  value={formData.room}
                  onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Misafir Adı *
                </label>
                <input
                  type="text"
                  value={formData.guest}
                  onChange={(e) => setFormData({ ...formData, guest: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Talep/İstek *
              </label>
              <textarea
                value={formData.request}
                onChange={(e) => setFormData({ ...formData, request: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 min-h-[100px]"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Departman *
                </label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600"
                  required
                >
                  <option value="">Seçiniz</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Öncelik
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as Task['priority'] })}
                  className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600"
                >
                  <option value="low">Düşük</option>
                  <option value="medium">Orta</option>
                  <option value="high">Yüksek</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Atanan Kişi (Opsiyonel)
              </label>
              <input
                type="text"
                value={formData.assignedTo}
                onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600"
                placeholder="Örn: Mehmet K."
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
              >
                İptal
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-3 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl font-semibold hover:bg-slate-800 dark:hover:bg-slate-200 transition-all"
              >
                Görev Oluştur
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function TaskDetailModal({ task, isOpen, onClose, onStatusChange, onRequestDelete, onDepartmentChange, departments }: { task: Task | null; isOpen: boolean; onClose: () => void; onStatusChange: (taskId: number, newStatus: Task['status'], assignedTo?: string) => void; onRequestDelete: (task: Task) => void; onDepartmentChange: (taskId: number, departmentId: number | null) => void; departments: Department[] }) {
  if (!isOpen || !task) return null;

  const getPriorityBadge = (priority: string) => {
    const styles = {
      low: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
      medium: 'bg-orange-100 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400',
      high: 'bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400',
    };
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-semibold ${styles[priority as keyof typeof styles]}`}>
        {priority === 'low' ? 'Düşük' : priority === 'medium' ? 'Orta' : 'Yüksek'}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800',
      'in-progress': 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
      completed: 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    };
    
    const icons = {
      pending: Clock,
      'in-progress': Activity,
      completed: CheckCircle2,
    };

    const Icon = icons[status as keyof typeof icons];
    
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold border ${styles[status as keyof typeof styles]}`}>
        <Icon className="w-4 h-4" />
        {status === 'pending' ? 'Bekliyor' : status === 'in-progress' ? 'Onaylandı' : 'Tamamlandı'}
      </span>
    );
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'whatsapp':
        return <MessageSquare className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
      case 'phone':
        return <Phone className="w-5 h-5 text-slate-600 dark:text-slate-400" />;
      default:
        return <User className="w-5 h-5 text-slate-600 dark:text-slate-400" />;
    }
  };

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
                Görev Detayı
              </h2>
              <div className="flex items-center gap-3">
                {getPriorityBadge(task.priority)}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Oluşturulma tarihi */}
            {task.createdAt && (
              <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <Clock className="w-3 h-3" />
                <span>
                  Oluşturulma: {new Date(task.createdAt).toLocaleString('tr-TR')}
                </span>
              </div>
            )}

            <div>
              <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-3">Durum</h3>
              <div className="space-y-2">
                <select
                  value={task.status}
                  onChange={(e) => {
                    onStatusChange(task.id, e.target.value as Task['status'], task.assignedTo);
                  }}
                  className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 text-base font-semibold focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 transition-all"
                >
                  <option value="pending">Bekliyor</option>
                  <option value="in-progress">Onaylandı</option>
                  <option value="completed">Tamamlandı</option>
                </select>
                {task.status === 'completed' && !task.completedBy && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2">
                      Tamamlayan Kişi
                    </label>
                    <input
                      type="text"
                      placeholder="Tamamlayan kişinin adı"
                      onBlur={(e) => {
                        if (e.target.value && task.status === 'completed') {
                          onStatusChange(task.id, 'completed', e.target.value);
                        }
                      }}
                      className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600"
                    />
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2">Oda Bilgisi</h3>
              <p className="text-lg font-bold text-slate-900 dark:text-slate-50">Oda {task.room}</p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2">Misafir</h3>
              <p className="text-lg text-slate-900 dark:text-slate-50">{task.guest}</p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2">Talep</h3>
              <p className="text-base text-slate-900 dark:text-slate-50">{task.request}</p>
            </div>

            {task.requestDetail && (
              <div>
                <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2">Talep Açıklaması</h3>
                <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap break-words">
                  {task.requestDetail}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2">Kaynak</h3>
                <div className="flex items-center gap-2">
                  {getSourceIcon(task.source)}
                  <span className="text-base text-slate-900 dark:text-slate-50">
                    {task.source === 'whatsapp' ? 'WhatsApp' : task.source === 'phone' ? 'Telefon' : 'Yüz Yüze'}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2">Zaman</h3>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span className="text-base text-slate-900 dark:text-slate-50">{task.time}</span>
                </div>
                {task.createdAt && (
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Oluşturulma: {new Date(task.createdAt).toLocaleString('tr-TR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                )}
              </div>

              {task.assignedTo && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2">Atanan Kişi</h3>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-400" />
                    <span className="text-base text-slate-900 dark:text-slate-50">{task.assignedTo}</span>
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2">Departman</h3>
                <select
                  value={task.departmentId || ''}
                  onChange={(e) => {
                    const deptId = e.target.value ? parseInt(e.target.value) : null;
                    onDepartmentChange(task.id, deptId);
                  }}
                  className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 text-base font-semibold focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 transition-all"
                >
                  <option value="">Departman Seçin</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {task.status === 'completed' && task.completedBy && (
              <div className="mt-6 p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
                <h3 className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 mb-4">
                  Tamamlanma Bilgisi
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-base text-emerald-900 dark:text-emerald-300">
                      <span className="font-semibold">Personel:</span> {task.completedBy}
                    </span>
                  </div>

                  {(task.inProgressAt || task.createdAt) && (
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-base text-emerald-900 dark:text-emerald-300">
                        <span className="font-semibold">Personelin Görevi Onayladığı Tarih:</span> {new Date(task.inProgressAt || task.createdAt || 0).toLocaleString('tr-TR', { 
                          day: '2-digit', 
                          month: '2-digit', 
                          year: 'numeric',
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                  )}

                  {task.completedAt && (
                    <>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-base text-emerald-900 dark:text-emerald-300">
                          <span className="font-semibold">Personelin İşi Bitirdiği Tarih:</span> {new Date(task.completedAt).toLocaleString('tr-TR', { 
                            day: '2-digit', 
                            month: '2-digit', 
                            year: 'numeric',
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </div>
                      {(task.inProgressAt || task.createdAt) && (
                        <div className="flex items-center gap-2 ml-6">
                          <span className="text-sm text-emerald-800 dark:text-emerald-400">
                            <span className="font-semibold">İş Süresi:</span> {
                              task.workTime !== undefined 
                                ? task.workTime 
                                : task.completedAt && (task.inProgressAt || task.createdAt)
                                  ? Math.floor((task.completedAt - (task.inProgressAt || task.createdAt || 0)) / 60000)
                                  : 0
                            } dakika (onaylama - bitiş arası)
                          </span>
                        </div>
                      )}
                    </>
                  )}

                </div>
              </div>
            )}
          </div>

          {/* Silme butonu */}
          <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Bu görevi kalıcı olarak silebilirsiniz.
            </span>
            <button
              onClick={() => onRequestDelete(task)}
              className="px-3 py-2 text-xs font-semibold rounded-lg bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-950/20 dark:text-red-400 dark:hover:bg-red-950/40 transition-colors"
            >
              Görevi Sil
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Tasks() {
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [filter, setFilter] = useState<'all' | 'pending' | 'in-progress' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('Tümü');
  const [sortMode, setSortMode] = useState<SortMode>('latest');
  const [activeId, setActiveId] = useState<number | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [deleteTargetTask, setDeleteTargetTask] = useState<Task | null>(null);
  
  const getTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} gün önce`;
    if (hours > 0) return `${hours} saat önce`;
    if (minutes > 0) return `${minutes} dakika önce`;
    return 'Az önce';
  };

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState<Department[]>([]);

  // Verileri Supabase'den yükle
  useEffect(() => {
    loadDepartments();
    loadTasks();
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
        console.log('Yüklenen departmanlar:', data);
        setDepartments(data.map(d => ({ id: d.id, name: d.name })));
      } else {
        console.warn('Departman verisi bulunamadı');
      }
    } catch (error) {
      console.error('Departments yükleme hatası:', error);
    }
  };

  const loadTasks = async () => {
    try {
      setLoading(true);
      
      // Tasks tablosundan verileri çek
      // Tasks tablosundan verileri çek
      // Önce basit sorgu ile RLS kontrolü yap
      let tasksData: any[] = [];
      
      const { data: simpleData, error: simpleError } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });
      
      console.log('Basit sorgu sonucu:', {
        data: simpleData,
        error: simpleError,
        count: simpleData?.length || 0
      });
      
      if (simpleError) {
        console.error('Tasks yükleme hatası:', simpleError);
        console.error('Hata detayları:', {
          message: simpleError?.message,
          details: simpleError?.details,
          hint: simpleError?.hint,
          code: simpleError?.code,
          fullError: simpleError
        });
        await loadCustomerRequests();
        return;
      }
      
      if (!simpleData || simpleData.length === 0) {
        console.warn('Tasks tablosunda veri yok veya RLS nedeniyle görünmüyor');
        await loadCustomerRequests();
        return;
      }
      
      tasksData = simpleData;
      
      // Foreign key'leri ayrı çek
      const guestIds = [...new Set(tasksData.map((t: any) => t.guest_id).filter(Boolean))];
      const deptIds = [...new Set(tasksData.map((t: any) => t.department).filter(Boolean))];
      
      let customersData: any[] = [];
      let departmentsData: any[] = [];
      
      if (guestIds.length > 0) {
        const { data: custData, error: custError } = await supabase
          .from('customers')
          .select('id, first_name, last_name, room_number')
          .in('id', guestIds);
        
        if (custError) {
          console.error('Customers yükleme hatası:', custError);
        } else {
          customersData = custData || [];
        }
      }
      
      if (deptIds.length > 0) {
        const { data: deptData, error: deptError } = await supabase
          .from('hotel_departments')
          .select('id, name')
          .in('id', deptIds);
        
        if (deptError) {
          console.error('Departments yükleme hatası:', deptError);
        } else {
          departmentsData = deptData || [];
        }
      }
      
      // Verileri birleştir
      tasksData = tasksData.map((task: any) => ({
        ...task,
        customers: customersData.find(c => c.id === task.guest_id),
        hotel_departments: departmentsData.find(d => d.id === task.department)
      }));

      // Customer requests'ten de veri çek
      const { data: requestsData, error: requestsError } = await supabase
        .from('customer_requests')
        .select(`
          *,
          customers:customer_id (
            id,
            first_name,
            last_name,
            room_number
          )
        `)
        .order('created_at', { ascending: false });

      if (requestsError) {
        console.error('Customer requests yükleme hatası:', requestsError);
      }

      // Tasks verilerini formatla
      const formattedTasks: Task[] = (tasksData || []).map((task: any) => {
        // Tasks tablosunda title ve description var, bunları kullan
        const createdAt = task.created_at ? new Date(task.created_at).getTime() : Date.now();
        const inProgressAt = task.in_progress_at ? new Date(task.in_progress_at).getTime() : undefined;
        const completedAt = task.completed_at ? new Date(task.completed_at).getTime() : undefined;
        
        let completionTime: number | undefined;
        let workTime: number | undefined;
        
        if (completedAt && createdAt) {
          completionTime = Math.floor((completedAt - createdAt) / 60000); // dakika
        }
        if (completedAt && inProgressAt) {
          workTime = Math.floor((completedAt - inProgressAt) / 60000); // dakika
        }

        // Status değerlerini Türkçe'den İngilizce'ye çevir
        let status: 'pending' | 'in-progress' | 'completed' = 'pending';
        if (task.status) {
          const statusLower = task.status.toLowerCase();
          if (statusLower === 'bekliyor' || statusLower === 'pending') {
            status = 'pending';
          } else if (statusLower === 'onaylandı' || statusLower === 'in-progress' || statusLower === 'in_progress') {
            status = 'in-progress';
          } else if (statusLower === 'tamamlandı' || statusLower === 'completed') {
            status = 'completed';
          }
        }

        // Foreign key'lerden gelen verileri al
        const customer = task.customers || (Array.isArray(task.customers) ? task.customers[0] : null);
        const departmentData = task.hotel_departments || (Array.isArray(task.hotel_departments) ? task.hotel_departments[0] : null);

        return {
          id: task.id,
          origin: 'tasks',
          backendId: task.id,
          room: customer?.room_number || task.room || task.room_number || '',
          guest: customer 
            ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim()
            : task.guest || task.customer_name || '',
          request: task.title || task.request || task.description || '',
          requestDetail: task.description && task.description !== task.title ? task.description : undefined,
          time: getTimeAgo(createdAt),
          status,
          priority: (task.priority || 'medium') as 'low' | 'medium' | 'high',
          assignedTo: task.assigned_to || task.assignedTo,
          source: (task.source || 'crm') as 'whatsapp' | 'phone' | 'direct' | 'crm',
          department: departmentData?.name || task.department || '',
          departmentId: task.department || departmentData?.id || undefined,
          createdAt,
          inProgressAt,
          completedAt,
          completedBy: task.completed_by,
          completionTime,
          workTime,
        };
      });

      // Customer requests'ten gelen verileri de ekle (eğer tasks'te yoksa)
      const requestTasks: Task[] = (requestsData || [])
        .filter((req: any) => {
          // Sadece pending veya in-progress olanları ekle (completed olanlar tasks'te olabilir)
          const reqStatus = req.status?.toLowerCase();
          return reqStatus === 'pending' || reqStatus === 'bekliyor' || 
                 reqStatus === 'in-progress' || reqStatus === 'in_progress' || reqStatus === 'onaylandı';
        })
        .map((req: any) => {
          const customer = req.customers;
          const createdAt = req.created_at ? new Date(req.created_at).getTime() : Date.now();
          
          // Status değerlerini Türkçe'den İngilizce'ye çevir
          let status: 'pending' | 'in-progress' | 'completed' = 'pending';
          const reqStatus = req.status?.toLowerCase();
          if (reqStatus === 'bekliyor' || reqStatus === 'pending') {
            status = 'pending';
          } else if (reqStatus === 'onaylandı' || reqStatus === 'in-progress' || reqStatus === 'in_progress') {
            status = 'in-progress';
          } else if (reqStatus === 'tamamlandı' || reqStatus === 'completed') {
            status = 'completed';
          }
          
          return {
            id: req.id + 1000000, // UI'de id çakışmaması için offset
            origin: 'customer_requests',
            backendId: req.id,
            room: customer?.room_number || '',
            guest: customer 
              ? `${customer.first_name} ${customer.last_name}` 
              : '',
            request: req.type || req.description || '',
            requestDetail: req.description && req.description !== req.type ? req.description : undefined,
            time: getTimeAgo(createdAt),
            status,
            priority: 'medium' as 'low' | 'medium' | 'high',
            source: 'crm' as 'whatsapp' | 'phone' | 'direct' | 'crm',
            department: req.type || '',
            createdAt,
          };
        });

      // Tüm taskları birleştir
      const allTasks = [...formattedTasks, ...requestTasks];
      setTasks(allTasks);
      
      console.log('=== TASKS YÜKLEME SONUÇLARI ===');
      console.log('Tasks data (raw):', tasksData);
      console.log('Tasks data length:', tasksData?.length || 0);
      console.log('Formatted tasks:', formattedTasks);
      console.log('Formatted tasks length:', formattedTasks.length);
      console.log('Request tasks length:', requestTasks.length);
      console.log('Total tasks:', allTasks.length);
    } catch (error: any) {
      console.error('Veri yükleme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async (task: Task) => {
    try {
      // Veritabanından sil (eğer kayıt varsa)
      if (task.origin === 'tasks' && task.backendId) {
        await supabase.from('tasks').delete().eq('id', task.backendId);
      } else if (task.origin === 'customer_requests' && task.backendId) {
        await supabase.from('customer_requests').delete().eq('id', task.backendId);
      }
    } catch (error) {
      // Hata olursa sessizce devam et; en kötü ihtimalle sadece local state'ten silinir
    } finally {
      setTasks(prev => prev.filter(t => t.id !== task.id));
      if (selectedTask && selectedTask.id === task.id) {
        setSelectedTask(null);
        setIsModalOpen(false);
      }
      setDeleteTargetTask(null);
    }
  };

  const loadCustomerRequests = async () => {
    try {
      const { data: requestsData, error } = await supabase
        .from('customer_requests')
        .select(`
          *,
          customers:customer_id (
            id,
            first_name,
            last_name,
            room_number
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Customer requests yükleme hatası:', error);
        return;
      }

      const formattedTasks: Task[] = (requestsData || []).map((req: any) => {
        const customer = req.customers;
        const createdAt = req.created_at ? new Date(req.created_at).getTime() : Date.now();
        
        return {
          id: req.id + 1000000,
          room: customer?.room_number || '',
          guest: customer 
            ? `${customer.first_name} ${customer.last_name}` 
            : '',
          request: req.description || req.type || '',
          time: getTimeAgo(createdAt),
          status: req.status === 'in-progress' ? 'in-progress' : 'pending' as 'pending' | 'in-progress' | 'completed',
          priority: 'medium' as 'low' | 'medium' | 'high',
          source: 'crm' as 'whatsapp' | 'phone' | 'direct' | 'crm',
          department: req.type || '',
          createdAt,
        };
      });

      setTasks(formattedTasks);
    } catch (error: any) {
      console.error('Customer requests yükleme hatası:', error);
    }
  };

  const updateTaskInSupabase = async (task: Task) => {
    try {
      // Status değerlerini VT'ye uygun değerlere çevir
      // tasks.status constraint: ['bekliyor','pending','in_progress','completed','cancelled']
      let dbStatus: string = 'pending';
      if (task.status === 'pending') dbStatus = 'pending';
      if (task.status === 'in-progress') dbStatus = 'in_progress';
      if (task.status === 'completed') dbStatus = 'completed';

      const updateData: any = {
        status: dbStatus,
      };

      if (task.inProgressAt) {
        updateData.in_progress_at = new Date(task.inProgressAt).toISOString();
      }

      if (task.completedAt) {
        updateData.completed_at = new Date(task.completedAt).toISOString();
        updateData.completed_by = task.completedBy;
      }

      if (task.origin === 'tasks' && task.backendId) {
        const { error } = await supabase
          .from('tasks')
          .update(updateData)
          .eq('id', task.backendId);

        if (error) {
          console.error('Task güncelleme hatası:', error);
        }
      } else if (task.origin === 'customer_requests' && task.backendId) {
        const { error } = await supabase
          .from('customer_requests')
          .update(updateData)
          .eq('id', task.backendId);

        if (error) {
          console.error('Customer request güncelleme hatası:', error);
        }
      }
    } catch (error: any) {
      console.error('Task güncelleme hatası:', error);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 0,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDetailsClick = (task: Task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeId = active.id as number;
    const overId = over.id;
    const overData = over.data.current;

    let targetDepartmentId: number | undefined;
    
    if (overData?.type === 'container') {
      const overIdStr = typeof overId === 'string' ? overId : overId.toString();
      targetDepartmentId = departments.find(d => d.id.toString() === overIdStr)?.id;
    } 
    else {
      const overTask = tasks.find(t => t.id === overId);
      if (overTask && overTask.departmentId) {
        targetDepartmentId = overTask.departmentId;
      }
    }
    
    if (targetDepartmentId) {
      const activeTask = tasks.find(t => t.id === activeId);
      if (!activeTask) return;
      
      if (activeTask.departmentId === targetDepartmentId) {
        const deptTasks = tasks.filter(t => t.departmentId === targetDepartmentId);
        const activeIndex = deptTasks.findIndex(t => t.id === activeId);
        const overIndex = deptTasks.findIndex(t => t.id === overId);
        
        if (activeIndex !== -1 && overIndex !== -1 && activeIndex !== overIndex) {
          const reorderedTasks = arrayMove(deptTasks, activeIndex, overIndex);
          const otherTasks = tasks.filter(t => t.departmentId !== targetDepartmentId);
          setTasks([...otherTasks, ...reorderedTasks]);
        }
        return;
      }
      
      const targetDept = departments.find(d => d.id === targetDepartmentId);
      const updatedTask: Task = {
        ...activeTask,
        departmentId: targetDepartmentId,
        department: targetDept?.name || '',
      };
      
      setTasks(tasks.map(task => 
        task.id === activeId ? updatedTask : task
      ));
      
      try {
        if (activeTask.origin === 'tasks' && activeTask.backendId) {
          const { error } = await supabase
            .from('tasks')
            .update({
              department: targetDepartmentId,
            })
            .eq('id', activeTask.backendId);
          
          if (error) {
            console.error('Tasks department update error:', error);
          }
        }
      } catch (e) {
        console.error('Department update exception:', e);
      }
      
      return;
    }

    const isContainer = overData?.type === 'container' || 
                       (typeof overId === 'string' && ['pending', 'in-progress', 'completed'].includes(overId));
    
    if (isContainer) {
      const containerId = typeof overId === 'string' ? overId : overId.toString();
      
      if (!['pending', 'in-progress', 'completed'].includes(containerId)) return;
      
      const activeTask = tasks.find(t => t.id === activeId);
      if (!activeTask) return;
      
      if (activeTask.status === containerId) return;
      
      const now = Date.now();
      const newStatus = containerId as Task['status'];
      let updatedTask: Task = { ...activeTask, status: newStatus };

      if (newStatus === 'in-progress' && activeTask.status !== 'in-progress') {
        updatedTask = {
          ...updatedTask,
          inProgressAt: now,
        };
      }

      if (newStatus === 'pending' && activeTask.status === 'in-progress') {
        updatedTask = {
          ...updatedTask,
          inProgressAt: undefined,
        };
      }

      if (newStatus === 'completed' && activeTask.status !== 'completed') {
        const inProgressTime = activeTask.inProgressAt || activeTask.createdAt || now;
        const completionTime = activeTask.createdAt 
          ? Math.floor((now - activeTask.createdAt) / 60000) 
          : 0;
        const workTime = inProgressTime 
          ? Math.floor((now - inProgressTime) / 60000) 
          : completionTime;
        updatedTask = {
          ...updatedTask,
          inProgressAt: activeTask.inProgressAt || activeTask.createdAt || now, // Eğer yoksa createdAt'i kullan
          completedAt: now,
          completedBy: activeTask.assignedTo || 'Sistem',
          completionTime,
          workTime,
        };
      }

      if (newStatus !== 'completed' && activeTask.status === 'completed') {
        updatedTask = {
          ...updatedTask,
          completedAt: undefined,
          completedBy: undefined,
          completionTime: undefined,
          workTime: undefined,
        };
      }

      setTasks(tasks.map(task => 
        task.id === activeId ? updatedTask : task
      ));

      // Supabase'e kaydet
      await updateTaskInSupabase(updatedTask);
      return;
    }

    // Aynı container içinde sıralama
    const activeTask = tasks.find(t => t.id === activeId);
    const overTask = tasks.find(t => t.id === overId);

    if (!activeTask || !overTask || activeTask.status !== overTask.status) return;

    const oldIndex = tasks.findIndex(t => t.id === activeId);
    const newIndex = tasks.findIndex(t => t.id === overId);

    setTasks(arrayMove(tasks, oldIndex, newIndex));
  };

  const filteredTasks = tasks.filter(task => {
    const matchesFilter = filter === 'all' || task.status === filter;
    const matchesSearch = searchQuery === '' || 
      task.room.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.guest.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.request.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment = selectedDepartment === 'Tümü' || task.department === selectedDepartment;
    return matchesFilter && matchesSearch && matchesDepartment;
  });

  // Sıralama
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortMode === 'priority') {
      const priorityOrder: Record<Task['priority'], number> = { high: 0, medium: 1, low: 2 };
      const diff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (diff !== 0) return diff;
    }
    // Varsayılan: en son oluşturulan en üstte
    const aCreated = a.createdAt || 0;
    const bCreated = b.createdAt || 0;
    return bCreated - aCreated;
  });

  const tasksByStatus = {
    pending: sortedTasks.filter(t => t.status === 'pending'),
    'in-progress': sortedTasks.filter(t => t.status === 'in-progress'),
    completed: sortedTasks.filter(t => t.status === 'completed'),
  };

  const tasksByDepartment = departments.map(dept => ({
    department: dept.name,
    departmentId: dept.id,
    tasks: sortedTasks.filter(t => t.departmentId === dept.id),
  }));

  const stats = {
    all: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    'in-progress': tasks.filter(t => t.status === 'in-progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
  };

  const statusColumns = [
    { id: 'pending', title: 'Bekliyor', color: 'amber' },
    { id: 'in-progress', title: 'Onaylandı', color: 'slate' },
    { id: 'completed', title: 'Tamamlandı', color: 'emerald' },
  ];

  const activeTask = activeId ? tasks.find(t => t.id === activeId) : null;

  if (loading) {
    return (
      <div className="p-6 lg:p-8 min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-slate-300 dark:border-slate-700 border-t-slate-900 dark:border-t-slate-100 rounded-full animate-spin"></div>
          <p className="text-slate-600 dark:text-slate-400 font-medium">Görevler yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 min-h-screen">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-xl border border-slate-200/50 dark:border-slate-800/50 p-5 shadow-lg hover:shadow-xl transition-all">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2 font-medium">Toplam</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-slate-50">{stats.all}</p>
        </div>
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-xl border border-slate-200/50 dark:border-slate-800/50 p-5 shadow-lg hover:shadow-xl transition-all">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2 font-medium">Bekleyen</p>
          <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">{stats.pending}</p>
        </div>
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-xl border border-slate-200/50 dark:border-slate-800/50 p-5 shadow-lg hover:shadow-xl transition-all">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2 font-medium">Onaylanan</p>
          <p className="text-3xl font-bold text-slate-700 dark:text-slate-300">{stats['in-progress']}</p>
        </div>
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-xl border border-slate-200/50 dark:border-slate-800/50 p-5 shadow-lg hover:shadow-xl transition-all">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2 font-medium">Tamamlanan</p>
          <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{stats.completed}</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-200/50 dark:border-slate-800/50 p-5 shadow-lg mb-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Oda, misafir veya talep ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 transition-all"
              />
            </div>
            <div className="flex gap-2">
              {(['all', 'pending', 'in-progress', 'completed'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-5 py-3 rounded-xl text-sm font-semibold transition-all ${
                    filter === status
                      ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-lg hover:bg-slate-800 dark:hover:bg-slate-200'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {status === 'all' ? 'Tümü' : status === 'pending' ? 'Bekliyor' : status === 'in-progress' ? 'Onaylandı' : 'Tamamlandı'}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Departman:</span>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600"
              >
                <option value="Tümü">Tümü</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.name}>{dept.name}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-4 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg font-semibold hover:bg-slate-800 dark:hover:bg-slate-200 transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Yeni Görev
              </button>
              
              <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded transition-all ${
                  viewMode === 'list' 
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 shadow-sm' 
                    : 'text-slate-600 dark:text-slate-400'
                }`}
                title="Liste Görünümü"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                className={`p-2 rounded transition-all ${
                  viewMode === 'kanban' 
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 shadow-sm' 
                    : 'text-slate-600 dark:text-slate-400'
                }`}
                title="Kanban Görünümü"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('department')}
                className={`p-2 rounded transition-all ${
                  viewMode === 'department' 
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 shadow-sm' 
                    : 'text-slate-600 dark:text-slate-400'
                }`}
                title="Departman Görünümü"
              >
                <Building2 className="w-4 h-4" />
              </button>

              {/* Sıralama filtreleri */}
              <select
                value={sortMode}
                onChange={(e) => setSortMode(e.target.value as SortMode)}
                className="ml-2 px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 text-xs focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600"
              >
                <option value="latest">En Son Gelen</option>
                <option value="priority">En Öncelikli</option>
              </select>
            </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <DndContext
        sensors={sensors}
        collisionDetection={(args) => {
          // Departman görünümünde departman kolonlarını kontrol et
          if (viewMode === 'department') {
            const containerCollisions = rectIntersection(args);
            if (containerCollisions.length > 0) {
              const departmentCollision = containerCollisions.find(
                (collision) => {
                  const collisionId = typeof collision.id === 'number' ? collision.id : 
                                    typeof collision.id === 'string' ? parseInt(collision.id) : null;
                  return collisionId && departments.some(d => d.id === collisionId);
                }
              );
              if (departmentCollision) return [departmentCollision];
            }
          }
          
          // Önce container'ları kontrol et (kanban görünümü için)
          const containerCollisions = rectIntersection(args);
          if (containerCollisions.length > 0) {
            const containerCollision = containerCollisions.find(
              (collision) => 
                typeof collision.id === 'string' && 
                ['pending', 'in-progress', 'completed'].includes(collision.id)
            );
            if (containerCollision) return [containerCollision];
          }
          // Sonra kartlar arası collision
          return closestCorners(args);
        }}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {viewMode === 'kanban' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {statusColumns.map((column) => (
              <DroppableColumn
                key={column.id}
                id={column.id}
                className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-xl border border-slate-200/50 dark:border-slate-800/50 p-4 shadow-lg min-h-[400px]"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-slate-900 dark:text-slate-50">
                    {column.title}
                  </h3>
                  <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded text-xs font-semibold">
                    {tasksByStatus[column.id as keyof typeof tasksByStatus].length}
                  </span>
                </div>
                <SortableContext
                  items={tasksByStatus[column.id as keyof typeof tasksByStatus].map(t => t.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3 min-h-[200px]">
                    {tasksByStatus[column.id as keyof typeof tasksByStatus].map((task) => (
                      <SortableTask key={task.id} task={task} onDetailsClick={handleDetailsClick} />
                    ))}
                    {/* Boş alan droppable indicator */}
                    {tasksByStatus[column.id as keyof typeof tasksByStatus].length === 0 && (
                      <div className="h-32 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg flex items-center justify-center">
                        <p className="text-sm text-slate-400 dark:text-slate-500">Kartları buraya bırakın</p>
                      </div>
                    )}
                  </div>
                </SortableContext>
              </DroppableColumn>
            ))}
          </div>
        )}

        {viewMode === 'list' && (
          <div className="space-y-4">
            <SortableContext
              items={sortedTasks.map(t => t.id)}
              strategy={verticalListSortingStrategy}
            >
              {sortedTasks.map((task) => (
                <SortableTask key={task.id} task={task} onDetailsClick={handleDetailsClick} />
              ))}
            </SortableContext>
          </div>
        )}

        {viewMode === 'department' && (
          <>
            {departments.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Building2 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600 dark:text-slate-400 font-medium">
                    Departmanlar yükleniyor...
                  </p>
                </div>
              </div>
            ) : tasksByDepartment.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Building2 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600 dark:text-slate-400 font-medium">
                    Departman bulunamadı
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tasksByDepartment.map(({ department, departmentId, tasks: deptTasks }) => (
                  <DroppableColumn
                    key={departmentId}
                    id={departmentId.toString()}
                    className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-xl border border-slate-200/50 dark:border-slate-800/50 p-4 shadow-lg"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-slate-900 dark:text-slate-50 flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        {department}
                      </h3>
                      <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded text-xs font-semibold">
                        {deptTasks.length}
                      </span>
                    </div>
                    <SortableContext
                      items={deptTasks.map(t => t.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-3 min-h-[200px]">
                        {deptTasks.length === 0 ? (
                          <div className="h-32 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg flex items-center justify-center">
                            <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
                              Bu departmanda görev yok
                            </p>
                          </div>
                        ) : (
                          deptTasks.map((task) => (
                            <SortableTask key={task.id} task={task} onDetailsClick={handleDetailsClick} />
                          ))
                        )}
                      </div>
                    </SortableContext>
                  </DroppableColumn>
                ))}
              </div>
            )}
          </>
        )}

        <DragOverlay>
          {activeTask ? (
            <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-4 shadow-lg opacity-90 rotate-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded text-xs font-bold">
                  Oda {activeTask.room}
                </span>
              </div>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-50 mb-1">
                {activeTask.guest}
              </p>
              <p className="text-sm text-slate-700 dark:text-slate-300">
                {activeTask.request}
              </p>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={(newTask) => {
          const selectedDept = departments.find(d => d.id === parseInt(newTask.department || '0'));
          const task: Task = {
            ...newTask,
            department: selectedDept?.name || newTask.department || '',
            departmentId: selectedDept?.id || undefined,
            id: Math.max(...tasks.map(t => t.id), 0) + 1,
            time: 'Az önce',
            createdAt: Date.now(),
          };
          setTasks([task, ...tasks]);
        }}
        departments={departments}
      />

      <TaskDetailModal 
        task={selectedTask} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onStatusChange={async (taskId, newStatus, assignedTo) => {
          const task = tasks.find(t => t.id === taskId);
          if (!task) return;

          const now = Date.now();
          let updatedTask: Task = { ...task, status: newStatus };

          // Eğer in-progress'e geçildiyse, onaylama zamanını kaydet
          if (newStatus === 'in-progress' && task.status !== 'in-progress') {
            updatedTask = {
              ...updatedTask,
              inProgressAt: now,
            };
          }

          // Eğer pending'e geri döndüyse, onaylama zamanını temizle
          if (newStatus === 'pending' && task.status === 'in-progress') {
            updatedTask = {
              ...updatedTask,
              inProgressAt: undefined,
            };
          }

          // Eğer tamamlandıysa, tamamlanma bilgilerini kaydet
          if (newStatus === 'completed' && task.status !== 'completed') {
            // Eğer inProgressAt yoksa, createdAt'i onaylama tarihi olarak kullan
            const inProgressTime = task.inProgressAt || task.createdAt || now;
            const completionTime = task.createdAt 
              ? Math.floor((now - task.createdAt) / 60000) 
              : 0;
            const workTime = inProgressTime 
              ? Math.floor((now - inProgressTime) / 60000) 
              : completionTime;
            updatedTask = {
              ...updatedTask,
              inProgressAt: task.inProgressAt || task.createdAt || now, // Eğer yoksa createdAt'i kullan
              completedAt: now,
              completedBy: assignedTo || task.assignedTo || 'Sistem',
              completionTime,
              workTime,
            };
          }

          // Eğer başka bir duruma geçildiyse ve daha önce tamamlanmışsa, tamamlanma bilgilerini temizle
          if (newStatus !== 'completed' && task.status === 'completed') {
            updatedTask = {
              ...updatedTask,
              completedAt: undefined,
              completedBy: undefined,
              completionTime: undefined,
              workTime: undefined,
            };
          }

          const updatedTasks = tasks.map(t => 
            t.id === taskId ? updatedTask : t
          );
          setTasks(updatedTasks);
          
          // Modal içindeki task'ı da güncelle
          if (selectedTask && selectedTask.id === taskId) {
            setSelectedTask(updatedTask);
          }

          // Veritabanına da yaz
          try {
            if (task.origin === 'tasks' && task.backendId) {
              const dbStatus =
                newStatus === 'in-progress'
                  ? 'in_progress'
                  : newStatus === 'pending'
                    ? 'pending'
                    : newStatus === 'completed'
                      ? 'completed'
                      : newStatus;

              const { error } = await supabase
                .from('tasks')
                .update({
                  status: dbStatus,
                  in_progress_at: updatedTask.inProgressAt ? new Date(updatedTask.inProgressAt).toISOString() : null,
                  completed_at: updatedTask.completedAt ? new Date(updatedTask.completedAt).toISOString() : null,
                  completed_by: updatedTask.completedBy || null,
                  completion_time: updatedTask.completionTime ?? null,
                  work_time: updatedTask.workTime ?? null,
                })
                .eq('id', taskId);

              if (error) {
                console.error('Tasks status update error:', error);
              }
            } else if (task.origin === 'customer_requests' && task.backendId) {
              const requestId = task.backendId;
              let dbStatus: string = newStatus;
              // Hem İngilizce hem Türkçe formatlarla uyumlu olsun
              if (newStatus === 'pending') dbStatus = 'pending';
              if (newStatus === 'in-progress') dbStatus = 'in_progress';
              if (newStatus === 'completed') dbStatus = 'completed';

              const { error } = await supabase
                .from('customer_requests')
                .update({
                  status: dbStatus,
                })
                .eq('id', requestId);

              if (error) {
                console.error('Customer requests status update error:', error);
              }
            }
          } catch (e) {
            console.error('Status update exception:', e);
          }
        }}
        onRequestDelete={(task) => {
          setDeleteTargetTask(task);
        }}
        onDepartmentChange={async (taskId, departmentId) => {
          const task = tasks.find(t => t.id === taskId);
          if (!task) return;

          // Yerel state'i güncelle
          const selectedDept = departments.find(d => d.id === departmentId);
          const updatedTask: Task = {
            ...task,
            departmentId: departmentId || undefined,
            department: selectedDept?.name || '',
          };

          const updatedTasks = tasks.map(t => 
            t.id === taskId ? updatedTask : t
          );
          setTasks(updatedTasks);

          // Modal içindeki task'ı da güncelle
          if (selectedTask && selectedTask.id === taskId) {
            setSelectedTask(updatedTask);
          }

          // Veritabanına da yaz
          try {
            if (task.origin === 'tasks' && task.backendId) {
              const { error } = await supabase
                .from('tasks')
                .update({
                  department: departmentId,
                })
                .eq('id', task.backendId);

              if (error) {
                console.error('Tasks department update error:', error);
              }
            }
            // customer_requests tablosunda department yok, sadece tasks'ta var
          } catch (e) {
            console.error('Department update exception:', e);
          }
        }}
        departments={departments}
      />

      {/* Delete Confirm Modal */}
      {deleteTargetTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setDeleteTargetTask(null)}>
          <div
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50 mb-2">
                Görevi Sil
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                Bu görevi kalıcı olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
              </p>
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 mb-4 text-sm text-slate-700 dark:text-slate-200">
                <p className="font-semibold mb-1">Oda {deleteTargetTask.room} - {deleteTargetTask.guest}</p>
                <p className="text-xs">{deleteTargetTask.request}</p>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setDeleteTargetTask(null)}
                  className="px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  İptal
                </button>
                <button
                  onClick={() => handleDeleteTask(deleteTargetTask)}
                  className="px-3 py-2 text-xs font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700"
                >
                  Sil
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {filteredTasks.length === 0 && (
        <div className="text-center py-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-lg">
          <AlertCircle className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400 text-lg font-medium">Görev bulunamadı</p>
        </div>
      )}
    </div>
  );
}
