'use client';

import { useState, useEffect } from 'react';

const STORAGE_KEY = 'fitcoach_gym_days';
const GOAL = 15;
const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const TIERS = [
  { min: 0,  max: 4,  label: 'Rookie',    color: 'from-zinc-600 to-zinc-500' },
  { min: 5,  max: 9,  label: 'Dedicated', color: 'from-blue-700 to-blue-500' },
  { min: 10, max: 14, label: 'Warrior',   color: 'from-orange-600 to-yellow-500' },
  { min: 15, max: 15, label: 'Champion',  color: 'from-green-600 to-emerald-400' },
];

function getTier(count: number) {
  return TIERS.find((t) => count >= t.min && count <= t.max) ?? TIERS[0];
}

function toKey(date: Date) {
  return date.toISOString().slice(0, 10); // "YYYY-MM-DD"
}

function monthPrefix(year: number, month: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}`;
}

export default function WorkoutTracker() {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [gymDays, setGymDays] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setGymDays(new Set(JSON.parse(stored)));
    } catch {}
  }, []);

  function save(next: Set<string>) {
    setGymDays(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
  }

  function toggleDay(dateStr: string) {
    const d = new Date(dateStr + 'T12:00:00');
    if (d > today) return; // no future days
    const next = new Set(gymDays);
    if (next.has(dateStr)) next.delete(dateStr);
    else next.add(dateStr);
    save(next);
  }

  // Calendar grid
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  // Progress counts only the current real month
  const currentPrefix = monthPrefix(today.getFullYear(), today.getMonth());
  const monthCount = [...gymDays].filter((d) => d.startsWith(currentPrefix)).length;
  const progressPct = Math.min((monthCount / GOAL) * 100, 100);
  const tier = getTier(monthCount);

  const viewPrefix = monthPrefix(viewYear, viewMonth);
  const monthName = new Date(viewYear, viewMonth, 1).toLocaleString('default', {
    month: 'long',
    year: 'numeric',
  });

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    const isCurrentOrFuture =
      viewYear > today.getFullYear() ||
      (viewYear === today.getFullYear() && viewMonth >= today.getMonth());
    if (isCurrentOrFuture) return;
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  }

  const canGoNext =
    viewYear < today.getFullYear() ||
    (viewYear === today.getFullYear() && viewMonth < today.getMonth());

  return (
    <aside className="flex flex-col gap-6 p-4 h-full overflow-y-auto">
      {/* Progress */}
      <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
            Monthly Goal
          </span>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full bg-zinc-800 ${
            monthCount >= GOAL ? 'text-emerald-400' : 'text-zinc-300'
          }`}>
            {tier.label}
          </span>
        </div>

        <div className="flex items-end gap-1 mb-3">
          <span className="text-4xl font-black text-white tabular-nums">{monthCount}</span>
          <span className="text-zinc-500 text-lg mb-1">/ {GOAL}</span>
          <span className="text-zinc-500 text-xs mb-1.5 ml-1">workouts</span>
        </div>

        {/* XP bar */}
        <div className="h-3 rounded-full bg-zinc-800 overflow-hidden">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${tier.color} transition-all duration-500`}
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {/* Tier labels */}
        <div className="flex justify-between mt-2 text-[10px] text-zinc-600">
          <span>Rookie</span>
          <span>Dedicated</span>
          <span>Warrior</span>
          <span>Champion</span>
        </div>

        {monthCount >= GOAL && (
          <p className="text-center text-emerald-400 text-xs font-semibold mt-3 animate-pulse">
            Goal reached this month!
          </p>
        )}
      </div>

      {/* Calendar */}
      <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-4">
        {/* Month nav */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={prevMonth}
            className="text-zinc-400 hover:text-white transition-colors px-1"
          >
            ‹
          </button>
          <span className="text-sm font-semibold text-zinc-200">{monthName}</span>
          <button
            onClick={nextMonth}
            disabled={!canGoNext}
            className={`px-1 transition-colors ${
              canGoNext ? 'text-zinc-400 hover:text-white' : 'text-zinc-700 cursor-default'
            }`}
          >
            ›
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-1">
          {DAYS_OF_WEEK.map((d) => (
            <div key={d} className="text-center text-[10px] font-semibold text-zinc-600 py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-y-1">
          {cells.map((day, i) => {
            if (!day) return <div key={`empty-${i}`} />;

            const dateStr = `${viewPrefix}-${String(day).padStart(2, '0')}`;
            const cellDate = new Date(dateStr + 'T12:00:00');
            const isGym = gymDays.has(dateStr);
            const isToday = toKey(today) === dateStr;
            const isFuture = cellDate > today;

            return (
              <button
                key={dateStr}
                onClick={() => toggleDay(dateStr)}
                disabled={isFuture}
                title={isGym ? 'Gym day — click to remove' : 'Mark as gym day'}
                className={`
                  mx-auto flex items-center justify-center
                  w-8 h-8 rounded-full text-xs font-medium
                  transition-all duration-150
                  ${isFuture
                    ? 'text-zinc-700 cursor-default'
                    : isGym
                    ? 'bg-green-600 text-white hover:bg-green-500'
                    : 'text-zinc-400 hover:bg-zinc-700 hover:text-white cursor-pointer'
                  }
                  ${isToday && !isGym ? 'ring-1 ring-green-600 text-green-400' : ''}
                `}
              >
                {day}
              </button>
            );
          })}
        </div>

        <p className="text-center text-[10px] text-zinc-600 mt-3">
          Click a day to mark it as a workout
        </p>
      </div>
    </aside>
  );
}
