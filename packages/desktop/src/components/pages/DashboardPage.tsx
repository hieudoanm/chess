'use client';

import { useData } from '@/providers/DataProvider';
import type { TournamentStatus } from '@/types';
import { useState } from 'react';
import { SearchBar } from '@/components/molecules/SearchBar';
import { StatusFilter } from '@/components/molecules/StatusFilter';
import { TournamentList } from '@/components/molecules/TournamentList';
import { Navbar, NAV_ITEMS } from '@/components/organisms/Navbar';
import type { FC } from 'react';

export const DashboardPage: FC = () => {
  const { tournaments, participants, loading } = useData();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<TournamentStatus | 'all'>('all');

  const filtered = tournaments.filter((t) => {
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || t.status === filter;
    return matchesSearch && matchesFilter;
  });

  const participantCounts = Object.fromEntries(
    tournaments.map((t) => [
      t.id,
      participants.filter((p) => p.tournamentId === t.id).length,
    ])
  );

  return (
    <div className="flex min-h-dvh flex-col pb-20">
      <main className="container mx-auto flex flex-1 flex-col p-4 sm:p-6">
        <SearchBar value={search} onChange={setSearch} />
        <StatusFilter value={filter} onChange={setFilter} />
        <TournamentList
          loading={loading}
          tournaments={filtered}
          participantCounts={participantCounts}
        />
      </main>

      <Navbar items={NAV_ITEMS} />
    </div>
  );
};
