export type TournamentFormat =
  | 'single-elimination'
  | 'double-elimination'
  | 'round-robin'
  | 'swiss'
  | 'group-stage'
  | 'league';

export type TournamentStatus =
  'draft' | 'upcoming' | 'in-progress' | 'completed' | 'cancelled';
export type MatchStatus =
  'scheduled' | 'in-progress' | 'completed' | 'postponed' | 'walkover';

export type BestOf = 1 | 3 | 5;

export type MatchScoringRule =
  'standard' | 'sets' | 'penalty-shootout' | 'golden-goal';

export type Tiebreaker =
  'points' | 'wins' | 'goal-difference' | 'head-to-head' | 'scored';

export interface MatchSet {
  p1Score: number;
  p2Score: number;
}

export interface Tournament {
  id: string;
  name: string;
  description: string;
  format: TournamentFormat;
  status: TournamentStatus;
  maxParticipants: number;
  createdAt: number;
  updatedAt: number;
  startDate?: number;
  endDate?: number;
  isSample?: boolean;
  bestOf?: BestOf;
  scoringRule?: MatchScoringRule;
  thirdPlacePlayoff?: boolean;
  tiebreakers?: Tiebreaker[];
}

export interface Participant {
  id: string;
  tournamentId: string;
  name: string;
  seed?: number;
  rating?: number;
  groupId?: string;
}

export interface Match {
  id: string;
  tournamentId: string;
  round: number;
  bracket?: 'winners' | 'losers' | 'final';
  participant1Id: string | null;
  participant2Id: string | null;
  participant1Score: number | null;
  participant2Score: number | null;
  winnerId: string | null;
  status: MatchStatus;
  scheduledAt?: number;
  venue?: string;
  sets?: MatchSet[];
  penaltyScore1?: number | null;
  penaltyScore2?: number | null;
  isThirdPlaceMatch?: boolean;
}

export interface Group {
  id: string;
  tournamentId: string;
  name: string;
  participantIds: string[];
}

export interface Standing {
  participantId: string;
  tournamentId: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  points: number;
  position: number;
}

export interface StandingSnapshot {
  id: string;
  tournamentId: string;
  label: string;
  createdAt: number;
  standings: Standing[];
}

export interface TournamentTemplate {
  id: string;
  name: string;
  description: string;
  format: TournamentFormat;
  maxParticipants: number;
  createdAt: number;
  bestOf?: BestOf;
  scoringRule?: MatchScoringRule;
  thirdPlacePlayoff?: boolean;
  tiebreakers?: Tiebreaker[];
}
