import type { FC } from 'react';
import { formatDate } from '@/lib/utils';

interface Activity {
  label: string;
  date: number;
  type: string;
}

interface ActivityListProps {
  activities: Activity[];
}

export const ActivityList: FC<ActivityListProps> = ({ activities }) => (
  <div className="border-base-content/10 bg-base-200 container mx-auto mb-8 w-full rounded-2xl border p-6">
    <h2 className="text-base-content/50 mb-4 text-xs tracking-[0.2em] uppercase">
      Recent Activity
    </h2>
    {activities.length > 0 ? (
      <div className="flex flex-col gap-3">
        {activities.map((a, i) => (
          <div
            key={`${a.type}-${i}`}
            className="flex items-center justify-between">
            <span className="text-sm">{a.label}</span>
            <span className="text-base-content/50 text-xs">
              {formatDate(a.date)}
            </span>
          </div>
        ))}
      </div>
    ) : (
      <p className="text-base-content/50 text-center text-sm">
        No activity yet
      </p>
    )}
  </div>
);
