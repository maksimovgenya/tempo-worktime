import { NextResponse } from 'next/server';
import { resetStorage } from '@/lib/storage';

export async function POST() {
  try {
    const data = resetStorage();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Ошибка сброса /api/timetracker/reset:', error);
    return NextResponse.json(
      { error: 'Не удалось сбросить данные' },
      { status: 500 }
    );
  }
}
