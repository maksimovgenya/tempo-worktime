'use client';

import { useState, useEffect, useCallback, useRef, useSyncExternalStore } from 'react';
import {
  Employee,
  TimeEntry,
  ActiveTimer,
  TimeTrackerData,
  TaskCategory,
} from '@/lib/types';
import { getInitialData } from '@/lib/mockData';

const LOCAL_STORAGE_KEY = 'timetracker_app_state_v1';

function subscribeToTimerTicker(callback: () => void) {
  const interval = setInterval(callback, 500);
  return () => clearInterval(interval);
}

function computeTimerSeconds(timer: ActiveTimer | null): number {
  if (!timer) return 0;
  if (timer.isPaused) return timer.accumulatedSeconds;
  const lastResume = timer.lastResumeTimestamp || timer.startTimestamp;
  return timer.accumulatedSeconds + Math.max(0, Math.floor((Date.now() - lastResume) / 1000));
}

export function useTimeTracker() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [activeTimer, setActiveTimer] = useState<ActiveTimer | null>(null);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Сохранение на сервер с дебаунсом
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const saveToServer = useCallback(async (data: TimeTrackerData) => {
    try {
      setSyncStatus('saving');
      const res = await fetch('/api/timetracker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setSyncStatus('saved');
      } else {
        setSyncStatus('error');
      }
    } catch (err) {
      console.warn('Сервер временно недоступен, данные сохранены в браузере:', err);
      setSyncStatus('error');
    }
  }, []);

  const persistData = useCallback(
    (newEmployees: Employee[], newEntries: TimeEntry[], newTimer: ActiveTimer | null) => {
      const data: TimeTrackerData = {
        employees: newEmployees,
        timeEntries: newEntries,
        activeTimer: newTimer,
      };

      // 1. Мгновенное сохранение в localStorage
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
      } catch (e) {
        console.error('Ошибка записи в localStorage:', e);
      }

      // 2. Фоновое сохранение на сервер
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
        saveToServer(data);
      }, 400);
    },
    [saveToServer]
  );

  // Инициализация при монтировании
  useEffect(() => {
    let mounted = true;

    async function loadData() {
      let loadedFromStorage = false;

      // Сначала проверим localStorage для моментального рендеринга
      try {
        const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached) as TimeTrackerData;
          if (parsed && Array.isArray(parsed.employees) && Array.isArray(parsed.timeEntries)) {
            setEmployees(parsed.employees);
            setTimeEntries(parsed.timeEntries);
            setActiveTimer(parsed.activeTimer);
            loadedFromStorage = true;
          }
        }
      } catch (err) {
        console.warn('Ошибка чтения из localStorage:', err);
      }

      // Затем запрашиваем серверную истину
      try {
        const res = await fetch('/api/timetracker');
        if (res.ok) {
          const serverData = (await res.json()) as TimeTrackerData;
          if (mounted && serverData && Array.isArray(serverData.employees)) {
            setEmployees(serverData.employees);
            setTimeEntries(serverData.timeEntries);
            setActiveTimer(serverData.activeTimer);
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(serverData));
            setIsLoaded(true);
            return;
          }
        }
      } catch (e) {
        console.warn('Не удалось загрузить данные с сервера, используем локальные:', e);
      }

      // Если ни сервер, ни localStorage не ответили — берем начальные данные
      if (!loadedFromStorage && mounted) {
        const initial = getInitialData();
        setEmployees(initial.employees);
        setTimeEntries(initial.timeEntries);
        setActiveTimer(initial.activeTimer);
      }

      if (mounted) {
        setIsLoaded(true);
      }
    }

    loadData();

    return () => {
      mounted = false;
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, []);

  // Получение прошедшего времени через React useSyncExternalStore
  const elapsedSeconds = useSyncExternalStore(
    subscribeToTimerTicker,
    () => computeTimerSeconds(activeTimer),
    () => 0
  );

  // Запуск таймера
  const startTimer = useCallback(
    (employeeId: string, taskDescription: string, category: TaskCategory) => {
      const newTimer: ActiveTimer = {
        employeeId,
        taskDescription: taskDescription.trim() || 'Без названия',
        category,
        startTimestamp: Date.now(),
        accumulatedSeconds: 0,
        isPaused: false,
        lastResumeTimestamp: Date.now(),
      };
      setActiveTimer(newTimer);
      persistData(employees, timeEntries, newTimer);
    },
    [employees, timeEntries, persistData]
  );

  // Пауза таймера
  const pauseTimer = useCallback(() => {
    if (!activeTimer || activeTimer.isPaused) return;

    const lastResume = activeTimer.lastResumeTimestamp || activeTimer.startTimestamp;
    const currentSegment = Math.max(0, Math.floor((Date.now() - lastResume) / 1000));
    const newAccumulated = activeTimer.accumulatedSeconds + currentSegment;

    const updated: ActiveTimer = {
      ...activeTimer,
      isPaused: true,
      accumulatedSeconds: newAccumulated,
      lastResumeTimestamp: null,
    };

    setActiveTimer(updated);
    persistData(employees, timeEntries, updated);
  }, [activeTimer, employees, timeEntries, persistData]);

  // Возобновление таймера
  const resumeTimer = useCallback(() => {
    if (!activeTimer || !activeTimer.isPaused) return;

    const updated: ActiveTimer = {
      ...activeTimer,
      isPaused: false,
      lastResumeTimestamp: Date.now(),
    };

    setActiveTimer(updated);
    persistData(employees, timeEntries, updated);
  }, [activeTimer, employees, timeEntries, persistData]);

  // Остановка таймера и фиксация записи в журнале
  const stopTimer = useCallback(
    (shouldSave: boolean = true) => {
      if (!activeTimer) return;

      let finalEntries = timeEntries;

      if (shouldSave) {
        let finalSeconds = activeTimer.accumulatedSeconds;
        if (!activeTimer.isPaused) {
          const lastResume = activeTimer.lastResumeTimestamp || activeTimer.startTimestamp;
          const currentSegment = Math.max(0, Math.floor((Date.now() - lastResume) / 1000));
          finalSeconds += currentSegment;
        }

        // Защита: если таймер проработал хотя бы 1 секунду
        if (finalSeconds >= 1) {
          const emp = employees.find((e) => e.id === activeTimer.employeeId);
          const newEntry: TimeEntry = {
            id: `entry-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            employeeId: activeTimer.employeeId,
            employeeName: emp ? emp.name : 'Неизвестный сотрудник',
            taskDescription: activeTimer.taskDescription,
            category: activeTimer.category,
            startTime: new Date(activeTimer.startTimestamp).toISOString(),
            endTime: new Date().toISOString(),
            durationSeconds: finalSeconds,
          };

          finalEntries = [newEntry, ...timeEntries];
          setTimeEntries(finalEntries);
        }
      }

      setActiveTimer(null);
      persistData(employees, finalEntries, null);
    },
    [activeTimer, employees, timeEntries, persistData]
  );

  // Сценарий повторного запуска: завершить текущую задачу и запустить новую
  const switchTaskAndStartNew = useCallback(
    (newEmployeeId: string, newTaskDescription: string, newCategory: TaskCategory) => {
      // 1. Фиксируем текущий таймер
      if (activeTimer) {
        let finalSeconds = activeTimer.accumulatedSeconds;
        if (!activeTimer.isPaused) {
          const lastResume = activeTimer.lastResumeTimestamp || activeTimer.startTimestamp;
          const currentSegment = Math.max(0, Math.floor((Date.now() - lastResume) / 1000));
          finalSeconds += currentSegment;
        }

        const emp = employees.find((e) => e.id === activeTimer.employeeId);
        const savedEntry: TimeEntry = {
          id: `entry-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          employeeId: activeTimer.employeeId,
          employeeName: emp ? emp.name : 'Неизвестный сотрудник',
          taskDescription: activeTimer.taskDescription,
          category: activeTimer.category,
          startTime: new Date(activeTimer.startTimestamp).toISOString(),
          endTime: new Date().toISOString(),
          durationSeconds: Math.max(1, finalSeconds),
        };

        const updatedEntries = [savedEntry, ...timeEntries];
        setTimeEntries(updatedEntries);

        // 2. Создаем новый таймер
        const newTimer: ActiveTimer = {
          employeeId: newEmployeeId,
          taskDescription: newTaskDescription.trim() || 'Без названия',
          category: newCategory,
          startTimestamp: Date.now(),
          accumulatedSeconds: 0,
          isPaused: false,
          lastResumeTimestamp: Date.now(),
        };

        setActiveTimer(newTimer);
        persistData(employees, updatedEntries, newTimer);
      } else {
        startTimer(newEmployeeId, newTaskDescription, newCategory);
      }
    },
    [activeTimer, employees, timeEntries, persistData, startTimer]
  );

  // Добавление нового сотрудника
  const addEmployee = useCallback(
    (name: string, role: string, department: string, color: string) => {
      const newEmp: Employee = {
        id: `emp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: name.trim(),
        role: role.trim() || 'Специалист',
        department: department.trim() || 'Общий',
        color: color || '#3B82F6',
        createdAt: new Date().toISOString(),
      };
      const updated = [...employees, newEmp];
      setEmployees(updated);
      persistData(updated, timeEntries, activeTimer);
      return newEmp;
    },
    [employees, timeEntries, activeTimer, persistData]
  );

  // Удаление сотрудника
  const deleteEmployee = useCallback(
    (employeeId: string) => {
      if (activeTimer && activeTimer.employeeId === employeeId) {
        stopTimer(false);
      }
      const updated = employees.filter((e) => e.id !== employeeId);
      setEmployees(updated);
      persistData(updated, timeEntries, activeTimer);
    },
    [employees, activeTimer, timeEntries, persistData, stopTimer]
  );

  // Ручное добавление записи
  const addManualEntry = useCallback(
    (
      employeeId: string,
      taskDescription: string,
      category: TaskCategory,
      startDate: string,
      durationMinutes: number
    ) => {
      const emp = employees.find((e) => e.id === employeeId);
      const start = new Date(startDate);
      const end = new Date(start.getTime() + durationMinutes * 60 * 1000);

      const newEntry: TimeEntry = {
        id: `entry-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        employeeId,
        employeeName: emp ? emp.name : 'Сотрудник',
        taskDescription: taskDescription.trim() || 'Задача внесена вручную',
        category,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        durationSeconds: durationMinutes * 60,
      };

      const updated = [newEntry, ...timeEntries];
      setTimeEntries(updated);
      persistData(employees, updated, activeTimer);
    },
    [employees, timeEntries, activeTimer, persistData]
  );

  // Удаление записи
  const deleteEntry = useCallback(
    (entryId: string) => {
      const updated = timeEntries.filter((e) => e.id !== entryId);
      setTimeEntries(updated);
      persistData(employees, updated, activeTimer);
    },
    [employees, timeEntries, activeTimer, persistData]
  );

  // Сброс к вымышленным демонстрационным данным
  const resetToDemo = useCallback(async () => {
    try {
      const res = await fetch('/api/timetracker/reset', { method: 'POST' });
      if (res.ok) {
        const body = await res.json();
        const demoData = body.data as TimeTrackerData;
        setEmployees(demoData.employees);
        setTimeEntries(demoData.timeEntries);
        setActiveTimer(null);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(demoData));
        setSyncStatus('saved');
        return;
      }
    } catch (e) {
      console.warn('Ошибка при сбросе через сервер:', e);
    }
    const initial = getInitialData();
    setEmployees(initial.employees);
    setTimeEntries(initial.timeEntries);
    setActiveTimer(null);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initial));
    setSyncStatus('saved');
  }, []);

  return {
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
  };
}
