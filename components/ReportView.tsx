'use client';

import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Filter,
  Download,
  Clock,
  User,
  Trash2,
  Inbox,
  ArrowUpDown,
  Search,
  CheckCircle,
} from 'lucide-react';
import {
  TimeEntry,
  Employee,
  PeriodPreset,
  DateFilterRange,
  EmployeeSummary,
} from '@/lib/types';
import {
  isEntryInPeriod,
  computeEmployeeSummaries,
  formatSecondsHuman,
  formatDateTime,
  formatTimeOnly,
  exportEntriesToCsv,
} from '@/lib/timeUtils';

interface ReportViewProps {
  employees: Employee[];
  timeEntries: TimeEntry[];
  onDeleteEntry: (id: string) => void;
  onOpenTimerTab: () => void;
}

export function ReportView({
  employees,
  timeEntries,
  onDeleteEntry,
  onOpenTimerTab,
}: ReportViewProps) {
  const [periodPreset, setPeriodPreset] = useState<PeriodPreset>('week');
  const [customRange, setCustomRange] = useState<DateFilterRange>(() => {
    const today = new Date().toISOString().slice(0, 10);
    return { from: today, to: today };
  });
  const [selectedEmployeeFilter, setSelectedEmployeeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // 1. Фильтрация записей по периоду и сотруднику
  const filteredEntries = useMemo(() => {
    return timeEntries.filter((entry) => {
      // Фильтр по периоду
      const matchesPeriod = isEntryInPeriod(entry, periodPreset, customRange);
      if (!matchesPeriod) return false;

      // Фильтр по сотруднику
      if (selectedEmployeeFilter !== 'all' && entry.employeeId !== selectedEmployeeFilter) {
        return false;
      }

      // Поиск по тексту задачи
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesText =
          entry.taskDescription.toLowerCase().includes(query) ||
          entry.employeeName.toLowerCase().includes(query) ||
          entry.category.toLowerCase().includes(query);
        if (!matchesText) return false;
      }

      return true;
    });
  }, [timeEntries, periodPreset, customRange, selectedEmployeeFilter, searchQuery]);

  // 2. Расчет сводки по сотрудникам
  const { summaries, totalCompanySeconds } = useMemo(() => {
    return computeEmployeeSummaries(employees, filteredEntries);
  }, [employees, filteredEntries]);

  // Экспорт
  const handleExportCsv = () => {
    let label: string = periodPreset;
    if (periodPreset === 'custom') {
      label = `${customRange.from}_to_${customRange.to}`;
    }
    exportEntriesToCsv(filteredEntries, label);
  };

  const periodLabels: Record<PeriodPreset, string> = {
    today: 'Сегодня',
    week: 'Текущая неделя',
    month: 'Текущий месяц',
    all: 'Всё время',
    custom: 'Произвольный период',
  };

  return (
    <div className="space-y-8">
      {/* Секция панели управления фильтрами */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-all">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Сегментированные кнопки выбора периода */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl dark:bg-slate-800/80">
            {(['today', 'week', 'month', 'all', 'custom'] as PeriodPreset[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriodPreset(p)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap shrink-0 ${
                  periodPreset === p
                    ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white font-semibold'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                {periodLabels[p]}
              </button>
            ))}
          </div>

          {/* Дополнительные фильтры: сотрудник, поиск, экспорт */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Фильтр по сотруднику */}
            <div className="relative min-w-[170px]">
              <select
                value={selectedEmployeeFilter}
                onChange={(e) => setSelectedEmployeeFilter(e.target.value)}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="all">Все сотрудники</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name}
                  </option>
                ))}
              </select>
              <User className="pointer-events-none absolute right-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            </div>

            {/* Быстрый поиск */}
            <div className="relative min-w-[180px]">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск по задачам..."
                className="w-full rounded-xl border border-slate-200 bg-white pl-8 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
              <Search className="pointer-events-none absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            </div>

            {/* Кнопка экспорта CSV */}
            <button
              onClick={handleExportCsv}
              disabled={filteredEntries.length === 0}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors whitespace-nowrap shrink-0"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Экспорт CSV</span>
            </button>
          </div>
        </div>

        {/* Выбор дат, если выбран произвольный период */}
        {periodPreset === 'custom' && (
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-4 text-xs animate-in fade-in">
            <span className="font-medium text-slate-700 dark:text-slate-300">
              Диапазон дат:
            </span>
            <div className="flex items-center gap-2">
              <label className="text-slate-500">С:</label>
              <input
                type="date"
                value={customRange.from}
                onChange={(e) => setCustomRange((prev) => ({ ...prev, from: e.target.value }))}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-slate-500">По:</label>
              <input
                type="date"
                value={customRange.to}
                onChange={(e) => setCustomRange((prev) => ({ ...prev, to: e.target.value }))}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>
        )}
      </div>

      {/* Информационная строка суммарного времени за период */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-1">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Общее время сотрудников за выбранный период
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Период: <span className="font-semibold text-slate-700 dark:text-slate-300">{periodLabels[periodPreset]}</span> · Найдено записей: <span className="font-mono font-medium">{filteredEntries.length}</span>
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-white dark:bg-white dark:text-slate-900 shadow-sm">
          <Clock className="h-4 w-4" />
          <span className="text-xs uppercase tracking-wider opacity-80">Итого:</span>
          <span className="font-mono font-bold text-sm tabular-nums">
            {formatSecondsHuman(totalCompanySeconds)}
          </span>
        </div>
      </div>

      {/* ПРОВЕРКА ОСНОВНОГО СЦЕНАРИЯ: Пустой отчёт */}
      {filteredEntries.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900/40">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 mb-4">
            <Inbox className="h-7 w-7" />
          </div>
          <h4 className="text-base font-semibold text-slate-900 dark:text-white">
            Пустой отчёт: нет записей за выбранный период
          </h4>
          <p className="mx-auto mt-2 max-w-md text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            За период «{periodLabels[periodPreset]}»
            {selectedEmployeeFilter !== 'all' ? ' у выбранного сотрудника' : ''} не зафиксировано рабочих отрезков. Вы можете выбрать другой диапазон дат или запустить новый таймер.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => {
                setPeriodPreset('all');
                setSelectedEmployeeFilter('all');
                setSearchQuery('');
              }}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              Показать всё время
            </button>
            <button
              onClick={onOpenTimerTab}
              className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-medium text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
            >
              Перейти к таймеру задач
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Сводные карточки сотрудников с прогресс-барами */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {summaries.map((s) => (
              <div
                key={s.employeeId}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      style={{ backgroundColor: s.color }}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold text-white text-xs shadow-sm"
                    >
                      {s.employeeName
                        .split(' ')
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join('')}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                        {s.employeeName}
                      </h4>
                      <p className="text-xs text-slate-500 truncate">{s.role}</p>
                    </div>
                  </div>

                  <span className="font-mono text-sm font-bold text-slate-900 dark:text-white tabular-nums shrink-0">
                    {s.formattedDuration}
                  </span>
                </div>

                {/* Прогресс-бар доли сотрудника */}
                <div className="mt-4">
                  <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                    <span>{s.entryCount} {s.entryCount === 1 ? 'задача' : s.entryCount < 5 ? 'задачи' : 'задач'}</span>
                    <span className="font-mono">{s.percentOfTotal}% от всех часов</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      style={{ width: `${s.percentOfTotal}%`, backgroundColor: s.color }}
                      className="h-full rounded-full transition-all duration-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Таблица детального журнала записей */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="border-b border-slate-100 bg-slate-50/70 px-6 py-4 dark:border-slate-800/80 dark:bg-slate-900/50">
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                Детальный журнал выполненных задач ({filteredEntries.length})
              </h4>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-100 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
                  <tr>
                    <th className="px-6 py-3 font-semibold uppercase tracking-wider">Сотрудник</th>
                    <th className="px-6 py-3 font-semibold uppercase tracking-wider">Категория</th>
                    <th className="px-6 py-3 font-semibold uppercase tracking-wider">Описание задачи</th>
                    <th className="px-6 py-3 font-semibold uppercase tracking-wider">Период</th>
                    <th className="px-6 py-3 font-semibold uppercase tracking-wider text-right">Длительность</th>
                    <th className="px-4 py-3 text-right">Действие</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {filteredEntries.map((entry) => (
                    <tr
                      key={entry.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="px-6 py-3.5 font-medium text-slate-900 dark:text-white whitespace-nowrap">
                        {entry.employeeName}
                      </td>
                      <td className="px-6 py-3.5 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                        {entry.category}
                      </td>
                      <td className="px-6 py-3.5 text-slate-700 dark:text-slate-300 max-w-sm truncate">
                        {entry.taskDescription}
                      </td>
                      <td className="px-6 py-3.5 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        <span>{formatDateTime(entry.startTime)}</span>
                        <span className="mx-1 text-slate-400">→</span>
                        <span>{formatTimeOnly(entry.endTime)}</span>
                      </td>
                      <td className="px-6 py-3.5 font-mono font-semibold text-slate-900 dark:text-white text-right tabular-nums whitespace-nowrap">
                        {formatSecondsHuman(entry.durationSeconds)}
                      </td>
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <button
                          onClick={() => {
                            if (confirm(`Удалить запись «${entry.taskDescription}»?`)) {
                              onDeleteEntry(entry.id);
                            }
                          }}
                          title="Удалить запись"
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
