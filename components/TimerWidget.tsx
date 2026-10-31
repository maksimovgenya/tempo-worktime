'use client';

import React, { useState } from 'react';
import {
  Play,
  Pause,
  Square,
  Clock,
  PlusCircle,
  AlertTriangle,
  User,
  Tag,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { Employee, ActiveTimer, TaskCategory } from '@/lib/types';
import { formatSecondsToTimer, formatSecondsHuman } from '@/lib/timeUtils';

const TASK_CATEGORIES: TaskCategory[] = [
  'Разработка',
  'Дизайн',
  'Созвон / Встреча',
  'Аналитика',
  'Тестирование',
  'Управление',
  'Другое',
];

interface TimerWidgetProps {
  employees: Employee[];
  activeTimer: ActiveTimer | null;
  elapsedSeconds: number;
  onStartTimer: (employeeId: string, taskDescription: string, category: TaskCategory) => void;
  onPauseTimer: () => void;
  onResumeTimer: () => void;
  onStopTimer: (save: boolean) => void;
  onSwitchAndStartNew: (
    newEmployeeId: string,
    newTaskDescription: string,
    newCategory: TaskCategory
  ) => void;
  onAddManualEntry: (
    employeeId: string,
    taskDescription: string,
    category: TaskCategory,
    startDate: string,
    durationMinutes: number
  ) => void;
  onOpenAddEmployeeModal: () => void;
}

export function TimerWidget({
  employees,
  activeTimer,
  elapsedSeconds,
  onStartTimer,
  onPauseTimer,
  onResumeTimer,
  onStopTimer,
  onSwitchAndStartNew,
  onAddManualEntry,
  onOpenAddEmployeeModal,
}: TimerWidgetProps) {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [taskDescription, setTaskDescription] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<TaskCategory>('Разработка');

  // Модалка предупреждения о повторном запуске (Сценарий ТЗ)
  const [conflictPromptOpen, setConflictPromptOpen] = useState(false);
  const [pendingStartParams, setPendingStartParams] = useState<{
    employeeId: string;
    taskDescription: string;
    category: TaskCategory;
  } | null>(null);

  // Модалка ручного добавления записи
  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [manualEmpId, setManualEmpId] = useState('');
  const [manualTask, setManualTask] = useState('');
  const [manualCategory, setManualCategory] = useState<TaskCategory>('Разработка');
  const [manualDate, setManualDate] = useState(() => new Date().toISOString().slice(0, 16));
  const [manualDurationMinutes, setManualDurationMinutes] = useState('60');

  // Вычисляем сотрудника по умолчанию
  const effectiveEmployeeId = selectedEmployeeId || (employees.length > 0 ? employees[0].id : '');

  // Нажатие на "Старт"
  const handleStartClick = (e: React.FormEvent) => {
    e.preventDefault();
    const empId = selectedEmployeeId || (employees[0] ? employees[0].id : '');
    if (!empId) {
      alert('Пожалуйста, сначала добавьте хотя бы одного сотрудника.');
      return;
    }

    const desc = taskDescription.trim() || 'Основная задача';

    // ПРОВЕРКА ОСНОВНОГО СЦЕНАРИЯ: Повторный запуск таймера
    if (activeTimer) {
      // Уже идет таймер! Показываем модальное окно подтверждения
      setPendingStartParams({
        employeeId: empId,
        taskDescription: desc,
        category: selectedCategory,
      });
      setConflictPromptOpen(true);
      return;
    }

    // Обычный старт
    onStartTimer(empId, desc, selectedCategory);
    setTaskDescription('');
  };

  // Подтверждение переключения в сценарии повторного пуска
  const handleConfirmSwitchTask = () => {
    if (pendingStartParams) {
      onSwitchAndStartNew(
        pendingStartParams.employeeId,
        pendingStartParams.taskDescription,
        pendingStartParams.category
      );
      setPendingStartParams(null);
      setConflictPromptOpen(false);
      setTaskDescription('');
    }
  };

  // Ручное внесение записи
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const empId = manualEmpId || selectedEmployeeId || (employees[0] ? employees[0].id : '');
    const minutes = parseInt(manualDurationMinutes, 10);
    if (!empId || isNaN(minutes) || minutes <= 0) {
      alert('Укажите корректную длительность в минутах.');
      return;
    }

    onAddManualEntry(
      empId,
      manualTask.trim() || 'Выполненная задача',
      manualCategory,
      manualDate,
      minutes
    );
    setManualModalOpen(false);
    setManualTask('');
    setManualDurationMinutes('60');
  };

  const activeEmployee = employees.find((e) => e.id === activeTimer?.employeeId);

  return (
    <div className="space-y-6">
      {/* Карточка основного таймера */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-all">
        {/* Верхняя строка статуса */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 bg-slate-50/70 px-6 py-4 dark:border-slate-800/80 dark:bg-slate-900/50">
          <div className="flex items-center gap-2">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                activeTimer
                  ? activeTimer.isPaused
                    ? 'bg-amber-500'
                    : 'bg-emerald-500 animate-pulse'
                  : 'bg-slate-300 dark:bg-slate-600'
              }`}
            />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {activeTimer
                ? activeTimer.isPaused
                  ? 'Таймер на паузе'
                  : 'Таймер активен'
                : 'Таймер остановлен'}
            </span>
          </div>

          <button
            onClick={() => {
              setManualEmpId(selectedEmployeeId || (employees[0]?.id ?? ''));
              setManualModalOpen(true);
            }}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>Внести время вручную</span>
          </button>
        </div>

        <div className="p-6 sm:p-8">
          {/* Большое цифровое табло секундомера */}
          <div className="flex flex-col items-center justify-center py-4 text-center">
            <div className="font-mono text-5xl sm:text-7xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums select-none">
              {formatSecondsToTimer(elapsedSeconds)}
            </div>

            {activeTimer && activeEmployee && (
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <span className="font-semibold text-slate-900 dark:text-white">
                  {activeEmployee.name}
                </span>
                <span>·</span>
                <span className="font-medium text-indigo-600 dark:text-indigo-400">
                  {activeTimer.category}
                </span>
                <span>·</span>
                <span className="max-w-xs truncate text-slate-700 dark:text-slate-300">
                  «{activeTimer.taskDescription}»
                </span>
              </div>
            )}
          </div>

          {/* Панель управления, если таймер запущен */}
          {activeTimer ? (
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              {activeTimer.isPaused ? (
                <button
                  type="button"
                  onClick={onResumeTimer}
                  className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-medium text-white shadow-sm hover:bg-emerald-500 transition-colors"
                >
                  <Play className="h-4 w-4 fill-white" />
                  <span>Продолжить таймер</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onPauseTimer}
                  className="flex items-center gap-2 rounded-xl bg-amber-600 px-6 py-3 text-sm font-medium text-white shadow-sm hover:bg-amber-500 transition-colors"
                >
                  <Pause className="h-4 w-4" />
                  <span>Поставить на паузу</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => onStopTimer(true)}
                className="flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-medium text-white shadow-sm hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 transition-colors"
              >
                <Square className="h-4 w-4 fill-current" />
                <span>Завершить и сохранить</span>
              </button>

              <button
                type="button"
                onClick={() => onStopTimer(false)}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
              >
                <span>Отменить без сохранения</span>
              </button>
            </div>
          ) : (
            /* Форма запуска нового таймера */
            <form onSubmit={handleStartClick} className="mt-6 space-y-4 max-w-2xl mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Выбор сотрудника */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Сотрудник
                  </label>
                  {employees.length > 0 ? (
                    <div className="relative">
                      <select
                        value={effectiveEmployeeId}
                        onChange={(e) => setSelectedEmployeeId(e.target.value)}
                        className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-slate-400"
                      >
                        {employees.map((emp) => (
                          <option key={emp.id} value={emp.id}>
                            {emp.name} ({emp.role})
                          </option>
                        ))}
                      </select>
                      <User className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-slate-400" />
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={onOpenAddEmployeeModal}
                      className="w-full rounded-xl border border-dashed border-slate-300 p-2.5 text-xs font-medium text-indigo-600 hover:bg-indigo-50/50 dark:border-slate-700 dark:text-indigo-400"
                    >
                      + Добавьте первого сотрудника
                    </button>
                  )}
                </div>

                {/* Выбор категории задачи */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Категория работы
                  </label>
                  <div className="relative">
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value as TaskCategory)}
                      className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-slate-400"
                    >
                      {TASK_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                    <Tag className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-slate-400" />
                  </div>
                </div>
              </div>

              {/* Описание задачи */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Описание задачи
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={taskDescription}
                    onChange={(e) => setTaskDescription(e.target.value)}
                    placeholder="Например: Разработка формы отчётов и рефакторинг API..."
                    className="flex-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-slate-400"
                  />
                  <button
                    type="submit"
                    disabled={employees.length === 0}
                    className="flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-slate-800 disabled:opacity-50 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 transition-colors whitespace-nowrap shrink-0"
                  >
                    <Play className="h-4 w-4 fill-current" />
                    <span>Старт</span>
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* МОДАЛЬНОЕ ОКНО ПРОВЕРКИ СЦЕНАРИЯ: Повторный запуск таймера */}
      {conflictPromptOpen && activeTimer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                  Таймер уже запущен!
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  В данный момент ведётся учёт задачи:
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-3.5 text-xs space-y-1.5 dark:border-slate-800 dark:bg-slate-800/60">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Сотрудник:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {activeEmployee?.name || 'Сотрудник'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Задача:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[200px]">
                  {activeTimer.taskDescription}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Набежало времени:</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {formatSecondsHuman(elapsedSeconds)}
                </span>
              </div>
            </div>

            <p className="mt-3 text-xs text-slate-600 dark:text-slate-400">
              Вы хотите запустить новую задачу для:{' '}
              <span className="font-medium text-slate-900 dark:text-white">
                {employees.find((e) => e.id === pendingStartParams?.employeeId)?.name}
              </span>
              . Что сделать с текущей задачей?
            </p>

            <div className="mt-5 flex flex-col gap-2">
              <button
                type="button"
                onClick={handleConfirmSwitchTask}
                className="w-full rounded-xl bg-slate-900 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 transition-colors"
              >
                Сохранить текущую задачу и начать новую
              </button>
              <button
                type="button"
                onClick={() => {
                  setConflictPromptOpen(false);
                  setPendingStartParams(null);
                }}
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
              >
                Отмена (продолжить текущий таймер)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* МОДАЛЬНОЕ ОКНО: Ручное внесение времени */}
      {manualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              Ручное добавление записи времени
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Используйте эту форму, если задача была выполнена ранее без таймера.
            </p>

            <form onSubmit={handleManualSubmit} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Сотрудник
                </label>
                <select
                  value={manualEmpId}
                  onChange={(e) => setManualEmpId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Категория
                </label>
                <select
                  value={manualCategory}
                  onChange={(e) => setManualCategory(e.target.value as TaskCategory)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  {TASK_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Описание задачи
                </label>
                <input
                  type="text"
                  required
                  value={manualTask}
                  onChange={(e) => setManualTask(e.target.value)}
                  placeholder="Что было сделано?"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Дата и время
                  </label>
                  <input
                    type="datetime-local"
                    value={manualDate}
                    onChange={(e) => setManualDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Длительность (минут)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="1440"
                    value={manualDurationMinutes}
                    onChange={(e) => setManualDurationMinutes(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="mt-5 flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setManualModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-medium text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
                >
                  Сохранить запись
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
