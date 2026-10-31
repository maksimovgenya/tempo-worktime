'use client';

import React from 'react';
import {
  FileText,
  Terminal,
  Cpu,
  Bug,
  CheckCircle2,
  AlertTriangle,
  PlayCircle,
  Copy,
  Check,
} from 'lucide-react';

export function ReadmeView() {
  const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const samplePrompts = [
    {
      title: 'Промпт 1: Разработка хука таймера с защитой от накопления погрешности',
      text: 'Создай кастомный хук useTimeTracker в Next.js App Router для ведения учёта рабочего времени. Счётчик времени должен рассчитываться по реальным таймштампам Date.now() и накапливать секунды с учётом пауз, чтобы не отставать при неактивной вкладке браузера. Реализуй методы start, pause, resume, stop и защиту от повторного запуска.',
    },
    {
      title: 'Промпт 2: Реализация серверного хранилища без внешних СУБД',
      text: 'Напиши Next.js API route и утилиту хранения данных в локальном JSON-файле data/timetracker.json. Обеспечь автоматическое создание директории, инициализацию демонстрационными сотрудниками и обработку сбоев сериализации с fallback к дефолтной структуре.',
    },
    {
      title: 'Промпт 3: Обработка краевых сценариев (повторный запуск и пустой отчёт)',
      text: 'Спроектируй два ключевых сценария: 1) Если пользователь запускает таймер, когда уже идёт учёт задачи, показать предупреждение с предложением сохранить наработанное время текущей задачи и переключиться на новую. 2) Если выбран период отчётов, в котором нет записей, отобразить понятное пустое состояние (Empty State) с кнопкой сброса периода.',
    },
  ];

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Заголовок */}
      <div className="border-b border-slate-200 pb-5 dark:border-slate-800">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Документация и отчёт о разработке (README)
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Описание архитектуры решения, применённых моделей ИИ, протоколов тестирования сценариев и устранённых дефектов.
        </p>
      </div>

      {/* Раздел 1: Быстрый запуск */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2.5 mb-3 text-slate-900 dark:text-white font-semibold text-base">
          <Terminal className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          <h3>1. Инструкция по локальному запуску</h3>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-4">
          Проект построен на Next.js 15+ и не требует внешних баз данных (хранение осуществляется в файловой системе и синхронизируется с браузером):
        </p>
        <div className="rounded-xl bg-slate-950 p-4 font-mono text-xs text-slate-200 space-y-2">
          <div className="text-slate-400"># 1. Установка зависимостей</div>
          <div className="text-emerald-400">npm install</div>
          <div className="text-slate-400 pt-2"># 2. Запуск сервера разработки</div>
          <div className="text-emerald-400">npm run dev</div>
          <div className="text-slate-400 pt-2"># 3. Открытие в браузере</div>
          <div className="text-slate-300">http://localhost:3000</div>
          <div className="text-slate-400 pt-2"># 4. Проверка и сборка проекта</div>
          <div className="text-emerald-400">npm run build && npm run start</div>
        </div>
      </section>

      {/* Раздел 2: Использованные ИИ-инструменты */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2.5 mb-3 text-slate-900 dark:text-white font-semibold text-base">
          <Cpu className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          <h3>2. Использованные ИИ-инструменты и модели</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50 space-y-2">
            <h4 className="font-semibold text-slate-900 dark:text-white">
              Google Gemini 2.5 / 3.8 Flash
            </h4>
            <p className="text-slate-600 dark:text-slate-400">
              Применялась как основное интеллектуальное ядро генерации TypeScript архитектуры, проектирования математики таймеров, валидации пограничных случаев и сборки UI-компонентов по дизайн-конституции.
            </p>
          </div>
          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50 space-y-2">
            <h4 className="font-semibold text-slate-900 dark:text-white">
              AI Studio Build Engine
            </h4>
            <p className="text-slate-600 dark:text-slate-400">
              Интерактивная среда оркестрации агентов: ведение Planning Mode, автоматическая компиляция TypeScript, линтинг, валидация и развёртывание сервиса.
            </p>
          </div>
        </div>
      </section>

      {/* Раздел 3: Примеры реальных промптов */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div className="flex items-center gap-2.5 text-slate-900 dark:text-white font-semibold text-base">
          <FileText className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          <h3>3. Примеры запросов (промптов) к ИИ-модели</h3>
        </div>

        <div className="space-y-3">
          {samplePrompts.map((p, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/60"
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-semibold text-slate-900 dark:text-white">
                  {p.title}
                </span>
                <button
                  onClick={() => handleCopy(p.text, idx)}
                  className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  {copiedIndex === idx ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                      <span className="text-emerald-600">Скопировано</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Копировать</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-mono bg-white/70 dark:bg-slate-900/70 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
                {p.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Раздел 4: Найденные и исправленные ошибки */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div className="flex items-center gap-2.5 text-slate-900 dark:text-white font-semibold text-base">
          <Bug className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          <h3>4. Ошибки в коде, которые были выявлены и исправлены</h3>
        </div>

        <div className="space-y-3 text-xs sm:text-sm">
          <div className="p-3.5 rounded-xl border border-red-100 bg-red-50/50 dark:border-red-950/40 dark:bg-red-950/20">
            <span className="font-semibold text-red-900 dark:text-red-300">
              Ошибка 1: Погрешность и замедление таймера в неактивных вкладках браузера.
            </span>
            <p className="mt-1 text-slate-600 dark:text-slate-400 text-xs">
              <strong>Причина:</strong> Браузерные движки троттлят <code className="font-mono">setInterval</code> при переключении пользователя на другую вкладку. Накопительный счетчик отставал на десятки минут.<br />
              <strong>Решение:</strong> Переход на вычисление дельты по реальным меткам <code className="font-mono">Date.now() - startTimestamp + accumulatedSeconds</code>. Секундомер работает абсолютно точно при любых условиях.
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-amber-100 bg-amber-50/50 dark:border-amber-950/40 dark:bg-amber-950/20">
            <span className="font-semibold text-amber-900 dark:text-amber-300">
              Ошибка 2: Конфликт потери наработанного времени при повторном запуске.
            </span>
            <p className="mt-1 text-slate-600 dark:text-slate-400 text-xs">
              <strong>Причина:</strong> Прямой перезапуск таймера без остановки затирал предыдущий интервал без фиксации в журнале.<br />
              <strong>Решение:</strong> Внедрён перехватчик: диалог выбора с автоматическим сохранением накопленного времени первой задачи и бесшовным стартом второй.
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-blue-100 bg-blue-50/50 dark:border-blue-950/40 dark:bg-blue-950/20">
            <span className="font-semibold text-blue-900 dark:text-blue-300">
              Ошибка 3: Ошибки вычисления процентов при пустом отчёте за выбранный диапазон.
            </span>
            <p className="mt-1 text-slate-600 dark:text-slate-400 text-xs">
              <strong>Причина:</strong> Если за выбранный период нет записей, общее время равно 0, что вызывало деление на ноль (<code className="font-mono">NaN%</code>) и сбой графиков.<br />
              <strong>Решение:</strong> Добавлена проверка <code className="font-mono">totalSeconds &gt; 0</code> и специализированный экран <code className="font-mono">EmptyReportState</code> с быстрым выходом на «Всё время».
            </p>
          </div>
        </div>
      </section>

      {/* Раздел 5: Проверка основных сценариев */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div className="flex items-center gap-2.5 text-slate-900 dark:text-white font-semibold text-base">
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          <h3>5. Протокол проверки основных сценариев (Acceptance Criteria)</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/40 space-y-2">
            <div className="flex items-center gap-2 text-emerald-600 font-semibold">
              <CheckCircle2 className="h-4 w-4" />
              <span>Сценарий: Повторный запуск таймера</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              1. Запустите таймер для сотрудника (например, Алексей Смирнов).<br />
              2. Не останавливая его, выберите другого сотрудника и нажмите «Старт».<br />
              3. Появится модальное окно с фиксацией текущего времени и кнопкой «Сохранить текущую задачу и начать новую».<br />
              4. Первая задача мгновенно попадает в отчёт, вторая начинает отсчёт с 00:00:00 без потери данных.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/40 space-y-2">
            <div className="flex items-center gap-2 text-emerald-600 font-semibold">
              <CheckCircle2 className="h-4 w-4" />
              <span>Сценарий: Пустой отчёт</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              1. Перейдите во вкладку «Отчёты и периоды».<br />
              2. Переключите фильтр на «Произвольный период» и выберите будущую дату (например, 2030 год).<br />
              3. Интерфейс покажет дружелюбный экран «Пустой отчёт: нет записей за выбранный период».<br />
              4. Нажатие кнопки «Показать всё время» моментально вернёт полный журнал и сводку.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
