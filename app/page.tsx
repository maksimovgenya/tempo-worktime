'use client';

import React, { useState } from 'react';
import { Header, ActiveTab } from '@/components/Header';
import { TimerWidget } from '@/components/TimerWidget';
import { EmployeeManager } from '@/components/EmployeeManager';
import { ReportView } from '@/components/ReportView';
import { ReadmeView } from '@/components/ReadmeView';
import { useTimeTracker } from '@/hooks/useTimeTracker';
import { Clock, Users, BarChart3, CheckCircle2, History, ArrowRight } from 'lucide-react';
import { formatSecondsHuman, formatDateTime } from '@/lib/timeUtils';

export default function Home() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('timer');
  const [isAddEmployeeModalOpen, setIsAddEmployeeModalOpen] = useState(false);
  const [newEmpName, setNewEmpName] = useState('');
  const [newEmpRole, setNewEmpRole] = useState('');
  const [newEmpDept, setNewEmpDept] = useState('Разработка');

  const {
    employees,
    timeEntries,
    activeTimer,
    elapsedSeconds,
    isLoaded,
    syncStatus,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    switchTaskAndStartNew,
    addEmployee,
    deleteEmployee,
    addManualEntry,
    deleteEntry,
    resetToDemo,
  } = useTimeTracker();

  const handleQuickAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmpName.trim()) return;
    addEmployee(newEmpName, newEmpRole, newEmpDept, '#3B82F6');
    setNewEmpName('');
    setNewEmpRole('');
    setIsAddEmployeeModalOpen(false);
  };

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-900 border-t-transparent dark:border-white" />
          <p className="text-xs text-slate-500">Загрузка данных учёта времени...</p>
        </div>
      </div>
    );
  }

  // Расчет статистики за сегодня для главного экрана
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEntries = timeEntries.filter((e) => new Date(e.startTime) >= todayStart);
  const todayTotalSeconds = todayEntries.reduce((sum, e) => sum + e.durationSeconds, 0);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col">
      {/* Шапка навигации */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        syncStatus={syncStatus}
        onResetDemo={resetToDemo}
        activeTimerCount={activeTimer ? 1 : 0}
      />

      {/* Основной контент */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* ВКЛАДКА 1: ТАЙМЕР ЗАДАЧ */}
        {activeTab === 'timer' && (
          <div className="space-y-8">
            {/* Виджет таймера */}
            <TimerWidget
              employees={employees}
              activeTimer={activeTimer}
              elapsedSeconds={elapsedSeconds}
              onStartTimer={startTimer}
              onPauseTimer={pauseTimer}
              onResumeTimer={resumeTimer}
              onStopTimer={stopTimer}
              onSwitchAndStartNew={switchTaskAndStartNew}
              onAddManualEntry={addManualEntry}
              onOpenAddEmployeeModal={() => setIsAddEmployeeModalOpen(true)}
            />

            {/* Карточки быстрых показателей за сегодня */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span>Отработано сегодня</span>
                  <Clock className="h-4 w-4 text-slate-400" />
                </div>
                <div className="text-xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
                  {formatSecondsHuman(todayTotalSeconds)}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Всего задач закрыто: {todayEntries.length}</p>
              </div>

              <div className="p-5 rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span>Сотрудников в штате</span>
                  <Users className="h-4 w-4 text-slate-400" />
                </div>
                <div className="text-xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
                  {employees.length} чел.
                </div>
                <button
                  onClick={() => setActiveTab('employees')}
                  className="text-[11px] text-indigo-600 hover:underline dark:text-indigo-400 mt-1 block"
                >
                  Управление командой →
                </button>
              </div>

              <div className="p-5 rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span>Аналитика и отчёты</span>
                  <BarChart3 className="h-4 w-4 text-slate-400" />
                </div>
                <div className="text-xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
                  {timeEntries.length} записей
                </div>
                <button
                  onClick={() => setActiveTab('reports')}
                  className="text-[11px] text-indigo-600 hover:underline dark:text-indigo-400 mt-1 block"
                >
                  Открыть сводный отчёт →
                </button>
              </div>
            </div>

            {/* Последние зафиксированные задачи */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-6 py-4 dark:border-slate-800/80 dark:bg-slate-900/50">
                <div className="flex items-center gap-2">
                  <History className="h-4 w-4 text-slate-400" />
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                    Недавние завершённые задачи
                  </h3>
                </div>
                <button
                  onClick={() => setActiveTab('reports')}
                  className="flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                >
                  <span>Все записи</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>

              {timeEntries.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  Пока нет завершённых задач. Запустите таймер выше.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {timeEntries.slice(0, 5).map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between px-6 py-3.5 text-xs hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <div className="min-w-0 pr-4">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {entry.employeeName}
                          </span>
                          <span className="text-slate-400">·</span>
                          <span className="text-slate-500">{entry.category}</span>
                        </div>
                        <p className="truncate text-slate-700 dark:text-slate-300 mt-0.5">
                          {entry.taskDescription}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                          {formatSecondsHuman(entry.durationSeconds)}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {formatDateTime(entry.startTime)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ВКЛАДКА 2: ОТЧЁТЫ И ПЕРИОДЫ */}
        {activeTab === 'reports' && (
          <ReportView
            employees={employees}
            timeEntries={timeEntries}
            onDeleteEntry={deleteEntry}
            onOpenTimerTab={() => setActiveTab('timer')}
          />
        )}

        {/* ВКЛАДКА 3: СОТРУДНИКИ */}
        {activeTab === 'employees' && (
          <EmployeeManager
            employees={employees}
            onAddEmployee={addEmployee}
            onDeleteEmployee={deleteEmployee}
          />
        )}

        {/* ВКЛАДКА 4: О ПРОЕКТЕ / README */}
        {activeTab === 'readme' && <ReadmeView />}
      </main>

      {/* Быстрое модальное окно добавления сотрудника */}
      {isAddEmployeeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              Быстрое добавление сотрудника
            </h3>
            <form onSubmit={handleQuickAddEmployee} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  ФИО *
                </label>
                <input
                  type="text"
                  required
                  value={newEmpName}
                  onChange={(e) => setNewEmpName(e.target.value)}
                  placeholder="Сергей Семёнов"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Должность
                </label>
                <input
                  type="text"
                  value={newEmpRole}
                  onChange={(e) => setNewEmpRole(e.target.value)}
                  placeholder="Backend Developer"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Отдел
                </label>
                <select
                  value={newEmpDept}
                  onChange={(e) => setNewEmpDept(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="Разработка">Разработка</option>
                  <option value="Дизайн">Дизайн</option>
                  <option value="Тестирование">Тестирование</option>
                  <option value="Управление">Управление</option>
                  <option value="Инфраструктура">Инфраструктура</option>
                </select>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddEmployeeModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-medium text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
                >
                  Добавить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Подвал */}
      <footer className="border-t border-slate-200 bg-white py-6 dark:border-slate-800 dark:bg-slate-900 text-xs text-slate-500">
        <div className="mx-auto flex max-w-7xl flex-col sm:flex-row items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <p>© 2026 TimeTracker — Веб-приложение учёта рабочего времени сотрудников</p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab('readme')}
              className="hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Инструкция и отчёт README
            </button>
            <span>·</span>
            <span>Автосохранение включено</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
