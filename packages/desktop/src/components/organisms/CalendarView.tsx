'use client';

import { useMemo, useState, type FC } from 'react';
import type { Match } from '@/types';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface CalendarViewProps {
  matches: Match[];
  getParticipantName: (participantId: string | null) => string;
  onReschedule: (matchId: string, start: number) => void;
}

const DAY_MS = 24 * 60 * 60 * 1000;

const isSameDay = (timestamp: number, dayStart: number): boolean =>
  timestamp >= dayStart && timestamp < dayStart + DAY_MS;

const formatTime = (timestamp: number): string =>
  new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

export const CalendarView: FC<CalendarViewProps> = ({
  matches,
  getParticipantName,
  onReschedule,
}) => {
  const today = new Date();
  const [viewDate, setViewDate] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startWeekday = new Date(year, month, 1).getDay();
  const weeks = Math.ceil((startWeekday + daysInMonth) / 7);

  const scheduledMatches = useMemo(
    () =>
      matches
        .filter((m) => m.scheduledAt)
        .sort((a, b) => (a.scheduledAt ?? 0) - (b.scheduledAt ?? 0)),
    [matches]
  );

  const unscheduled = useMemo(
    () => matches.filter((m) => !m.scheduledAt),
    [matches]
  );

  const moveMonth = (delta: number): void => {
    setViewDate(new Date(year, month + delta, 1));
  };

  const handleDrop = (dayStart: number): void => {
    if (!draggingId) return;
    onReschedule(draggingId, dayStart);
    setDraggingId(null);
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={() => moveMonth(-1)}
          className="btn btn-ghost btn-sm"
          aria-label="Previous month">
          ‹
        </button>
        <h3 className="text-sm font-medium">
          {viewDate.toLocaleDateString([], {
            month: 'long',
            year: 'numeric',
          })}
        </h3>
        <button
          onClick={() => moveMonth(1)}
          className="btn btn-ghost btn-sm"
          aria-label="Next month">
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="text-base-content/50 text-center text-xs font-medium">
            {day}
          </div>
        ))}

        {Array.from({ length: startWeekday }).map((_, i) => (
          <div key={`blank-${i}`} />
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dayStart = new Date(year, month, day).getTime();
          const dayMatches = scheduledMatches.filter((m) =>
            isSameDay(m.scheduledAt ?? 0, dayStart)
          );
          const isToday =
            day === today.getDate() &&
            month === today.getMonth() &&
            year === today.getFullYear();

          return (
            <div
              key={day}
              aria-label={`Calendar day ${day}`}
              className="rounded-box border-base-300/40 bg-base-200/30 min-h-20 border p-1"
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(dayStart)}>
              <span
                className={`text-xs ${isToday ? 'text-primary font-bold' : 'text-base-content/60'}`}>
                {day}
              </span>
              <div className="mt-1 flex flex-col gap-1">
                {dayMatches.map((m) => (
                  <div
                    key={m.id}
                    draggable
                    onDragStart={() => setDraggingId(m.id)}
                    onDragEnd={() => setDraggingId(null)}
                    className="bg-primary/15 text-primary-content cursor-grab rounded px-1 py-0.5 text-[10px] leading-tight">
                    <div>{formatTime(m.scheduledAt ?? 0)}</div>
                    <div className="truncate">
                      {getParticipantName(m.participant1Id)} vs{' '}
                      {getParticipantName(m.participant2Id)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {Array.from({
          length: weeks * 7 - startWeekday - daysInMonth,
        }).map((_, i) => (
          <div key={`trail-${i}`} />
        ))}
      </div>

      {unscheduled.length > 0 && (
        <div className="mt-4">
          <h4 className="text-base-content/70 mb-2 text-xs font-medium uppercase">
            Unscheduled ({unscheduled.length})
          </h4>
          <div className="flex flex-col gap-1">
            {unscheduled.map((m) => (
              <div
                key={m.id}
                className="text-base-content/60 bg-base-200 rounded px-2 py-1 text-xs">
                {getParticipantName(m.participant1Id)} vs{' '}
                {getParticipantName(m.participant2Id)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
