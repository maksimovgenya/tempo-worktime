import fs from 'fs';
import path from 'path';
import { TimeTrackerData } from './types';
import { getInitialData } from './mockData';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'timetracker.json');

// Гарантируем наличие папки и файла
function ensureStorageExists(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
      const initial = getInitialData();
      fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2), 'utf-8');
    }
  } catch (error) {
    console.error('Ошибка инициализации хранилища:', error);
  }
}

export function readStorage(): TimeTrackerData {
  try {
    ensureStorageExists();
    if (!fs.existsSync(DATA_FILE)) {
      return getInitialData();
    }
    const content = fs.readFileSync(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(content) as TimeTrackerData;
    if (!parsed || !Array.isArray(parsed.employees) || !Array.isArray(parsed.timeEntries)) {
      return getInitialData();
    }
    return parsed;
  } catch (error) {
    console.error('Ошибка чтения из файла хранилища:', error);
    return getInitialData();
  }
}

export function writeStorage(data: TimeTrackerData): boolean {
  try {
    ensureStorageExists();
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Ошибка записи в файл хранилища:', error);
    return false;
  }
}

export function resetStorage(): TimeTrackerData {
  try {
    const initial = getInitialData();
    ensureStorageExists();
    fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2), 'utf-8');
    return initial;
  } catch (error) {
    console.error('Ошибка сброса хранилища:', error);
    return getInitialData();
  }
}
