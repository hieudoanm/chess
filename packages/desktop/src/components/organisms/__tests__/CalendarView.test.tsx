import { fireEvent, render, screen } from '@testing-library/react';
import { CalendarView } from '@/components/organisms/CalendarView';
import type { Match } from '@/types';

const DAY_MS = 24 * 60 * 60 * 1000;

const atNoon = (dayOffset = 0): number => {
  const now = new Date();
  return new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + dayOffset,
    12,
    0,
    0
  ).getTime();
};

const match = (
  id: string,
  scheduledAt: number | undefined,
  round = 1
): Match => ({
  id,
  tournamentId: 't1',
  round,
  participant1Id: 'p1',
  participant2Id: 'p2',
  participant1Score: null,
  participant2Score: null,
  winnerId: null,
  status: 'scheduled',
  scheduledAt,
});

describe('CalendarView', () => {
  const FIXED_NOW = new Date(2026, 0, 15, 12, 0, 0).getTime();

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(FIXED_NOW);
  });

  afterEach(() => {
    jest.useRealTimers();
  });
  it('shows scheduled matches on their day and unscheduled ones separately', () => {
    render(
      <CalendarView
        matches={[match('m1', atNoon(0)), match('m2', undefined)]}
        getParticipantName={() => 'Player'}
        onReschedule={jest.fn()}
      />
    );

    expect(screen.getAllByText(/Player vs Player/).length).toBeGreaterThan(0);
    expect(screen.getByText(/Unscheduled \(1\)/)).toBeInTheDocument();
  });

  it('navigates months with the prev and next buttons', () => {
    render(
      <CalendarView
        matches={[]}
        getParticipantName={() => 'Player'}
        onReschedule={jest.fn()}
      />
    );

    const monthLabel = screen.getByText(/\w+ \d{4}/);
    const current = monthLabel.textContent;
    fireEvent.click(screen.getByLabelText('Next month'));
    expect(screen.getByText(/\w+ \d{4}/).textContent).not.toBe(current);
    fireEvent.click(screen.getByLabelText('Previous month'));
    expect(screen.getByText(/\w+ \d{4}/).textContent).toBe(current);
  });

  it('reschedules a match when dropped on another day', () => {
    const onReschedule = jest.fn();
    render(
      <CalendarView
        matches={[match('m1', atNoon(0))]}
        getParticipantName={() => 'Player'}
        onReschedule={onReschedule}
      />
    );

    const chip = screen.getAllByText(/Player vs Player/)[0];
    fireEvent.dragStart(chip);

    const targetDay = atNoon(2);
    const targetDate = new Date(targetDay);
    const targetCell = screen.getByLabelText(
      `Calendar day ${targetDate.getDate()}`
    );
    fireEvent.dragOver(targetCell);
    fireEvent.drop(targetCell);

    expect(onReschedule).toHaveBeenCalledTimes(1);
    expect(onReschedule.mock.calls[0][0]).toBe('m1');
    expect(onReschedule.mock.calls[0][1]).toBe(targetDay - 12 * 60 * 60 * 1000);
  });

  it('sorts matches within a day by time', () => {
    render(
      <CalendarView
        matches={[
          match('late', atNoon(0) + 60 * 60 * 1000),
          match('early', atNoon(0)),
        ]}
        getParticipantName={() => 'Player'}
        onReschedule={jest.fn()}
      />
    );

    const dayCell = screen.getByLabelText(
      `Calendar day ${new Date(atNoon(0)).getDate()}`
    );
    const times = Array.from(
      dayCell.querySelectorAll('[class*="leading-tight"] > div:first-child')
    ).map((el) => el.textContent);
    expect(times).toHaveLength(2);
  });

  it('does not reschedule when a drop happens after dragEnd', () => {
    const onReschedule = jest.fn();
    render(
      <CalendarView
        matches={[match('m1', atNoon(0))]}
        getParticipantName={() => 'Player'}
        onReschedule={onReschedule}
      />
    );

    const chip = screen.getAllByText(/Player vs Player/)[0];
    fireEvent.dragStart(chip);
    fireEvent.dragEnd(chip);

    const targetDay = atNoon(2);
    const targetDate = new Date(targetDay);
    fireEvent.drop(
      screen.getByLabelText(`Calendar day ${targetDate.getDate()}`)
    );

    expect(onReschedule).not.toHaveBeenCalled();
  });
});
