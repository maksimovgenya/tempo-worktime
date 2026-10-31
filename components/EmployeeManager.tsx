'use client';

import React, { useState } from 'react';
import { UserPlus, Users, Trash2, Briefcase, Building, Sparkles } from 'lucide-react';
import { Employee } from '@/lib/types';

interface EmployeeManagerProps {
  employees: Employee[];
  onAddEmployee: (name: string, role: string, department: string, color: string) => void;
  onDeleteEmployee: (id: string) => void;
}

const PRESET_COLORS = [
  '#3B82F6', // Blue
  '#8B5CF6', // Purple
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#6366F1', // Indigo
  '#F97316', // Orange
];

export function EmployeeManager({
  employees,
  onAddEmployee,
  onDeleteEmployee,
}: EmployeeManagerProps) {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [department, setDepartment] = useState('Разработка');
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddEmployee(name, role, department, selectedColor);
    setName('');
    setRole('');
    setDepartment('Разработка');
    setIsFormOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Шапка секции сотрудников */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Команда и сотрудники
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Реестр участников проекта для привязки отработанного времени и формирования отчётов ({employees.length} чел.)
          </p>
        </div>

        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs sm:text-sm font-medium text-white shadow-sm hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 transition-colors"
        >
          <UserPlus className="h-4 w-4" />
          <span>{isFormOpen ? 'Скрыть форму' : 'Добавить сотрудника'}</span>
        </button>
      </div>

      {/* Форма добавления сотрудника */}
      {isFormOpen && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 animate-in fade-in transition-all">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4">
            Карточка нового сотрудника
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  ФИО сотрудника *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Иван Петров"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Должность / Специализация
                </label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="Frontend Developer"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Отдел / Направление
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="Разработка">Разработка</option>
                  <option value="Дизайн">Дизайн</option>
                  <option value="Тестирование">Тестирование (QA)</option>
                  <option value="Инфраструктура">Инфраструктура / DevOps</option>
                  <option value="Управление">Менеджмент / Продукт</option>
                  <option value="Аналитика">Аналитика</option>
                </select>
              </div>
            </div>

            {/* Выбор цвета аватара */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Цвет бейджа
              </label>
              <div className="flex items-center gap-2">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setSelectedColor(c)}
                    style={{ backgroundColor: c }}
                    className={`h-7 w-7 rounded-full transition-transform ${
                      selectedColor === c ? 'ring-2 ring-slate-900 dark:ring-white scale-110' : 'opacity-80 hover:opacity-100'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
              >
                Отмена
              </button>
              <button
                type="submit"
                className="rounded-xl bg-slate-900 px-5 py-2 text-xs font-medium text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
              >
                Сохранить сотрудника
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Список сотрудников (Сетка карточек) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {employees.map((emp) => {
          // Инициалы
          const initials = emp.name
            .split(' ')
            .filter(Boolean)
            .map((p) => p[0])
            .join('')
            .slice(0, 2)
            .toUpperCase() || 'С';

          return (
            <div
              key={emp.id}
              className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 transition-all hover:border-slate-300 dark:hover:border-slate-700 shadow-sm"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  style={{ backgroundColor: emp.color }}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white font-bold text-sm shadow-sm"
                >
                  {initials}
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                    {emp.name}
                  </h4>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    <span className="truncate">{emp.role}</span>
                    <span>·</span>
                    <span className="shrink-0">{emp.department}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  if (confirm(`Удалить сотрудника «${emp.name}» из списка?`)) {
                    onDeleteEmployee(emp.id);
                  }
                }}
                title="Удалить сотрудника"
                className="p-2 text-slate-400 hover:text-red-600 transition-colors rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>

      {employees.length === 0 && (
        <div className="text-center py-12 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-8">
          <Users className="mx-auto h-10 w-10 text-slate-400 mb-2" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            Нет сотрудников в базе
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Добавьте первого сотрудника, чтобы начать учитывать рабочее время и вести аналитику.
          </p>
          <button
            onClick={() => setIsFormOpen(true)}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-medium text-white hover:bg-slate-800"
          >
            <UserPlus className="h-4 w-4" />
            <span>Добавить сотрудника</span>
          </button>
        </div>
      )}
    </div>
  );
}
