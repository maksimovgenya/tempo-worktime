import { Employee, TimeEntry, TimeTrackerData } from './types';

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'emp-1',
    name: 'Алексей Смирнов',
    role: 'Senior Frontend Developer',
    department: 'Разработка',
    color: '#3B82F6', // Blue
    createdAt: '2026-10-01T09:00:00.000Z',
  },
  {
    id: 'emp-2',
    name: 'Елена Кузнецова',
    role: 'Lead UI/UX Designer',
    department: 'Дизайн',
    color: '#8B5CF6', // Purple
    createdAt: '2026-10-01T09:00:00.000Z',
  },
  {
    id: 'emp-3',
    name: 'Дмитрий Васильев',
    role: 'Backend Architect',
    department: 'Инфраструктура',
    color: '#10B981', // Emerald
    createdAt: '2026-10-02T10:00:00.000Z',
  },
  {
    id: 'emp-4',
    name: 'Анна Морозова',
    role: 'Product Manager',
    department: 'Управление',
    color: '#F59E0B', // Amber
    createdAt: '2026-10-05T08:30:00.000Z',
  },
  {
    id: 'emp-5',
    name: 'Максим Павлов',
    role: 'QA Automation Lead',
    department: 'Тестирование',
    color: '#EC4899', // Pink
    createdAt: '2026-10-10T11:00:00.000Z',
  },
];

// Генерируем тестовые записи времени относительно текущей даты
export function generateInitialTimeEntries(): TimeEntry[] {
  const now = new Date();
  
  const createEntry = (
    daysAgo: number,
    startHour: number,
    durationMinutes: number,
    employeeId: string,
    taskDescription: string,
    category: TimeEntry['category']
  ): TimeEntry => {
    const start = new Date(now);
    start.setDate(now.getDate() - daysAgo);
    start.setHours(startHour, 15, 0, 0);

    const end = new Date(start);
    end.setMinutes(start.getMinutes() + durationMinutes);

    const emp = INITIAL_EMPLOYEES.find((e) => e.id === employeeId)!;

    return {
      id: `entry-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      employeeId,
      employeeName: emp.name,
      taskDescription,
      category,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      durationSeconds: durationMinutes * 60,
    };
  };

  return [
    // Сегодня
    createEntry(0, 9, 135, 'emp-1', 'Рефакторинг хука таймера и оптимизация рендеринга', 'Разработка'),
    createEntry(0, 10, 80, 'emp-2', 'Дизайн адаптивной версии мобильного дашборда', 'Дизайн'),
    createEntry(0, 11, 45, 'emp-4', 'Синхронизация спринта и приоритизация бэклога', 'Созвон / Встреча'),
    createEntry(0, 13, 110, 'emp-3', 'Настройка индексов БД и проверка производительности запросов', 'Разработка'),
    createEntry(0, 14, 90, 'emp-5', 'Регрессионное тестирование сценариев отчётов и фильтрации', 'Тестирование'),

    // Вчера
    createEntry(1, 9, 180, 'emp-1', 'Вёрстка компонентов карточек аналитики сотрудников', 'Разработка'),
    createEntry(1, 10, 120, 'emp-3', 'Разработка серверного роута сохранения данных', 'Разработка'),
    createEntry(1, 14, 60, 'emp-4', 'Подготовка демонстрации функционала клиенту', 'Управление'),
    createEntry(1, 15, 95, 'emp-2', 'Проектирование диалога предупреждения о повторном запуске', 'Дизайн'),

    // 2 дня назад
    createEntry(2, 10, 150, 'emp-1', 'Интеграция модального окна добавления сотрудника', 'Разработка'),
    createEntry(2, 11, 110, 'emp-5', 'Написание тестов для проверки пустого состояния отчёта', 'Тестирование'),
    createEntry(2, 14, 85, 'emp-2', 'Подбор типографики и цветовой палитры согласно гайдлайнам', 'Дизайн'),

    // 3 дня назад
    createEntry(3, 9, 210, 'emp-3', 'Архитектурный анализ способов хранения данных в Node.js', 'Аналитика'),
    createEntry(3, 13, 140, 'emp-1', 'Настройка клиентского кэширования в LocalStorage', 'Разработка'),
  ];
}

export function getInitialData(): TimeTrackerData {
  return {
    employees: INITIAL_EMPLOYEES,
    timeEntries: generateInitialTimeEntries(),
    activeTimer: null,
  };
}
