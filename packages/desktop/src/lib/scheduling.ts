import type { Match } from '@/types';

export interface ScheduleSlot {
  matchId: string;
  start: number;
  end: number;
  venue?: string;
}

export const autoSchedule = (
  matches: Match[],
  venues: string[],
  slotDurationMinutes: number,
  startDate: number
): ScheduleSlot[] => {
  const slots: ScheduleSlot[] = [];
  const slotMs = slotDurationMinutes * 60_000;

  const sorted = [...matches].sort((a, b) => {
    if (a.round !== b.round) return a.round - b.round;
    return a.id > b.id ? 1 : -1;
  });

  const rounds = new Map<number, Match[]>();
  for (const match of sorted) {
    const round = match.round ?? 0;
    if (!rounds.has(round)) rounds.set(round, []);
    rounds.get(round)!.push(match);
  }

  const sortedRounds = Array.from(rounds.entries()).sort(([a], [b]) => a - b);
  let currentTime = startDate;

  for (const [, roundMatches] of sortedRounds) {
    const slotsInRound = roundMatches.length;
    const parallelSlots = venues.length || 1;
    const roundsNeeded = Math.ceil(slotsInRound / parallelSlots);

    for (let slotIdx = 0; slotIdx < roundsNeeded; slotIdx++) {
      const matchesInSlot = roundMatches.slice(
        slotIdx * parallelSlots,
        (slotIdx + 1) * parallelSlots
      );

      for (let v = 0; v < matchesInSlot.length; v++) {
        const match = matchesInSlot[v];
        const venue = venues.length > 0 ? venues[v % venues.length] : undefined;

        slots.push({
          matchId: match.id,
          start: currentTime,
          end: currentTime + slotMs,
          venue,
        });
      }

      currentTime += slotMs;
    }
  }

  return slots;
};

export const detectConflicts = (
  slots: ScheduleSlot[]
): { slot1: ScheduleSlot; slot2: ScheduleSlot }[] => {
  const conflicts: { slot1: ScheduleSlot; slot2: ScheduleSlot }[] = [];

  for (let i = 0; i < slots.length; i++) {
    for (let j = i + 1; j < slots.length; j++) {
      const a = slots[i];
      const b = slots[j];

      if (a.venue && b.venue && a.venue !== b.venue) continue;
      if (!a.venue && !b.venue) continue;

      const overlaps = a.start < b.end && b.start < a.end;
      if (overlaps) {
        conflicts.push({ slot1: a, slot2: b });
      }
    }
  }

  return conflicts;
};

export const reschedule = (
  slots: ScheduleSlot[],
  matchId: string,
  newStart: number
): ScheduleSlot[] => {
  const target = slots.find((s) => s.matchId === matchId);
  if (!target) return slots;

  const duration = target.end - target.start;
  const newEnd = newStart + duration;
  const delta = newStart - target.start;

  return slots.map((slot) => {
    if (slot.matchId === matchId) {
      return { ...slot, start: newStart, end: newEnd };
    }

    if (slot.venue && slot.venue === target.venue) {
      const slotOverlaps = newStart < slot.end && slot.start < newEnd;
      if (slotOverlaps) {
        return {
          ...slot,
          start: slot.start + delta,
          end: slot.end + delta,
        };
      }
    }

    return slot;
  });
};
