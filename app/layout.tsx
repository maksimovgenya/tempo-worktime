import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Учёт рабочего времени сотрудников | Time Tracker',
  description: 'Простое и надёжное веб-приложение для учёта рабочего времени сотрудников компании, трекинга задач и формирования отчётов.',
  openGraph: {
    title: 'Учёт рабочего времени сотрудников | Time Tracker',
    description: 'Веб-приложение для учёта рабочего времени сотрудников компании с живым таймером задач и отчётами по периодам.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Учёт рабочего времени сотрудников | Time Tracker',
    description: 'Веб-приложение для учёта рабочего времени сотрудников компании с живым таймером задач и отчётами по периодам.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="ru" className="scroll-smooth">
      <body suppressHydrationWarning className="min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-slate-200 selection:text-slate-900">
        {children}
      </body>
    </html>
  );
}
