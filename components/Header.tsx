'use client';

import React from 'react';
import { Clock, BarChart3, Users, FileText, RotateCcw, CheckCircle2, RefreshCw, AlertCircle } from 'lucide-react';

export type ActiveTab = 'timer' | 'reports' | 'employees' | 'readme';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  syncStatus: 'idle' | 'saving' | 'saved' | 'error';
  onResetDemo: () => void;
  activeTimerCount: number;
}

export function Header({
  activeTab,
  onTabChange,
  syncStatus,
  onResetDemo,
  activeTimerCount,
}: HeaderProps) {
  const [showConfirmReset, setShowConfirmReset] = React.useState(false);

  const handleResetClick = () => {
    if (showConfirmReset) {
      onResetDemo();
      setShowConfirmReset(false);
    } else {
      setShowConfirmReset(true);
      setTimeout(() => setShowConfirmReset(false), 4000);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 transition-colors">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
        {/* Зона 1: Бренд и логотип */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-sm">
            <Clock className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
              TimeTracker
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Учёт рабочего времени
            </span>
          </div>
        </div>

        {/* Зона 2: Навигационные вкладки */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => onTabChange('timer')}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'timer'
                ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white font-semibold'
                : 'text-slate-600 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Clock className="h-4 w-4" />
            <span>Таймер задач</span>
            {activeTimerCount > 0 && (
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            )}
          </button>

          <button
            onClick={() => onTabChange('reports')}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'reports'
                ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white font-semibold'
                : 'text-slate-600 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            <span>Отчёты и периоды</span>
          </button>

          <button
            onClick={() => onTabChange('employees')}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'employees'
                ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white font-semibold'
                : 'text-slate-600 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Сотрудники</span>
          </button>

          <button
            onClick={() => onTabChange('readme')}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'readme'
                ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white font-semibold'
                : 'text-slate-600 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>О проекте / README</span>
          </button>
        </nav>

        {/* Зона 3: Статус и действия */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Индикатор синхронизации */}
          <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            {syncStatus === 'saving' && (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin text-amber-500" />
                <span>Сохранение...</span>
              </>
            )}
            {syncStatus === 'saved' && (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                <span>Данные сохранены</span>
              </>
            )}
            {syncStatus === 'error' && (
              <>
                <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
                <span>Локальный кэш</span>
              </>
            )}
          </div>

          {/* Кнопка сброса */}
          <button
            onClick={handleResetClick}
            title="Восстановить эталонные демонстрационные данные"
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all whitespace-nowrap shrink-0 ${
              showConfirmReset
                ? 'border-red-300 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300 animate-pulse'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>{showConfirmReset ? 'Подтвердите сброс' : 'Сброс демо'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
