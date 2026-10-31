import { NextRequest, NextResponse } from 'next/server';
import { readStorage, writeStorage } from '@/lib/storage';
import { TimeTrackerData } from '@/lib/types';

export async function GET() {
  try {
    const data = readStorage();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Ошибка GET /api/timetracker:', error);
    return NextResponse.json(
      { error: 'Не удалось прочитать данные с сервера' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as TimeTrackerData;
    if (!body || !Array.isArray(body.employees) || !Array.isArray(body.timeEntries)) {
      return NextResponse.json(
        { error: 'Неверный формат данных' },
        { status: 400 }
      );
    }

    const success = writeStorage(body);
    if (!success) {
      return NextResponse.json(
        { error: 'Ошибка сохранения файла на сервере' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, count: body.timeEntries.length });
  } catch (error) {
    console.error('Ошибка POST /api/timetracker:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера при сохранении' },
      { status: 500 }
    );
  }
}
