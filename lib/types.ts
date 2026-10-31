export interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
  color: string;
  createdAt: string;
}

export type TaskCategory =
  | 'Разработка'
  | 'Дизайн'
  | 'Созвон / Встреча'
  | 'Аналитика'
  | 'Тестирование'
  | 'Управление'
  | 'Другое';

export interface TimeEntry {
  id: string;
  employeeId: string;
  employeeName: string;
  taskDescription: string;
  category: TaskCategory;
  startTime: string; // ISO date string
  endTime: string;   // ISO date string
  durationSeconds: number;
}

export interface ActiveTimer {
  employeeId: string;
  taskDescription: string;
  category: TaskCategory;
  startTimestamp: number;         // Date.now() when started
  accumulatedSeconds: number;     // seconds from past unpaused intervals
  isPaused: boolean;
  lastResumeTimestamp: number | null; // Date.now() when last resumed
}

export interface TimeTrackerData {
  employees: Employee[];
  timeEntries: TimeEntry[];
  activeTimer: ActiveTimer | null;
}

export type PeriodPreset = 'today' | 'week' | 'month' | 'all' | 'custom';

export interface DateFilterRange {
  from: string; // YYYY-MM-DD
  to: string;   // YYYY-MM-DD
}

export interface EmployeeSummary {
  employeeId: string;
  employeeName: string;
  role: string;
  department: string;
  color: string;
  totalSeconds: number;
  entryCount: number;
  formattedDuration: string;
  percentOfTotal: number;
}
