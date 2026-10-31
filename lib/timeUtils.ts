import { TimeEntry, Employee, EmployeeSummary, PeriodPreset, DateFilterRange } from './types';

// Форматирование секунд в формат 00:00:00 (для секундомера)
export function formatSecondsToTimer(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

// Форматирование секунд в человекопонятный русский вид (например "3 ч 45 мин")
export function formatSecondsHuman(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  if (hours > 0 && minutes > 0) {
    return `${hours} ч ${minutes} мин`;
  }
  if (hours > 0 && minutes === 0) {
    return `${hours} ч`;
  }
  if (minutes > 0) {
    return `${minutes} мин ${seconds} сек`;
  }
  return `${seconds} сек`;
}

// Форматирование даты в русский формат "31 окт 2026, 14:30"
export function formatDateTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '—';
  }
}

// Форматирование только времени "14:30:15"
export function formatTimeOnly(isoString: string): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return '—';
  }
}

// Определение диапазона дат для пресета
export function getPresetDateRange(preset: PeriodPreset): { start: Date; end: Date } {
  const now = new Date();
  const start = new Date(now);
  const end = new Date(now);

  if (preset === 'today') {
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
  } else if (preset === 'week') {
    // Неделя с понедельника
    const day = start.getDay();
    const diff = (day === 0 ? -6 : 1) - day;
    start.setDate(start.getDate() + diff);
    start.setHours(0, 0, 0, 0);

    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
  } else if (preset === 'month') {
    start.setDate(1);
    start.setHours(0, 0, 0, 0);

    end.setMonth(end.getMonth() + 1, 0);
    end.setHours(23, 59, 59, 999);
  } else {
    // all or custom default
    start.setFullYear(2000, 0, 1);
    start.setHours(0, 0, 0, 0);
    end.setFullYear(2100, 11, 31);
    end.setHours(23, 59, 59, 999);
  }

  return { start, end };
}

// Проверка попадания записи в диапазон
export function isEntryInPeriod(
  entry: TimeEntry,
  preset: PeriodPreset,
  customRange: DateFilterRange
): boolean {
  const entryDate = new Date(entry.startTime);
  if (isNaN(entryDate.getTime())) return false;

  if (preset === 'custom') {
    if (!customRange.from && !customRange.to) return true;
    
    let fromDate: Date | null = null;
    let toDate: Date | null = null;

    if (customRange.from) {
      fromDate = new Date(customRange.from);
      fromDate.setHours(0, 0, 0, 0);
    }
    if (customRange.to) {
      toDate = new Date(customRange.to);
      toDate.setHours(23, 59, 59, 999);
    }

    if (fromDate && entryDate < fromDate) return false;
    if (toDate && entryDate > toDate) return false;
    return true;
  }

  if (preset === 'all') return true;

  const { start, end } = getPresetDateRange(preset);
  return entryDate >= start && entryDate <= end;
}

// Расчёт сводки по каждому сотруднику за период
export function computeEmployeeSummaries(
  employees: Employee[],
  filteredEntries: TimeEntry[]
): { summaries: EmployeeSummary[]; totalCompanySeconds: number } {
  let totalCompanySeconds = 0;
  const timeByEmp: Record<string, { seconds: number; count: number }> = {};

  filteredEntries.forEach((entry) => {
    totalCompanySeconds += entry.durationSeconds;
    if (!timeByEmp[entry.employeeId]) {
      timeByEmp[entry.employeeId] = { seconds: 0, count: 0 };
    }
    timeByEmp[entry.employeeId].seconds += entry.durationSeconds;
    timeByEmp[entry.employeeId].count += 1;
  });

  const summaries: EmployeeSummary[] = employees.map((emp) => {
    const stats = timeByEmp[emp.id] || { seconds: 0, count: 0 };
    const percentOfTotal =
      totalCompanySeconds > 0
        ? Math.round((stats.seconds / totalCompanySeconds) * 100)
        : 0;

    return {
      employeeId: emp.id,
      employeeName: emp.name,
      role: emp.role,
      department: emp.department,
      color: emp.color,
      totalSeconds: stats.seconds,
      entryCount: stats.count,
      formattedDuration: formatSecondsHuman(stats.seconds),
      percentOfTotal,
    };
  });

  // Сортировка: сначала те, у кого больше отработанного времени
  summaries.sort((a, b) => b.totalSeconds - a.totalSeconds);

  return { summaries, totalCompanySeconds };
}

// Экспорт записей в CSV-файл
export function exportEntriesToCsv(entries: TimeEntry[], periodLabel: string): void {
  const headers = ['Сотрудник', 'Категория', 'Описание задачи', 'Начало', 'Окончание', 'Длительность (сек)', 'Длительность (формат)'];
  const rows = entries.map((e) => [
    `"${e.employeeName.replace(/"/g, '""')}"`,
    `"${e.category}"`,
    `"${e.taskDescription.replace(/"/g, '""')}"`,
    `"${formatDateTime(e.startTime)}"`,
    `"${formatDateTime(e.endTime)}"`,
    e.durationSeconds,
    `"${formatSecondsHuman(e.durationSeconds)}"`,
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `time-report-${periodLabel}-${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
