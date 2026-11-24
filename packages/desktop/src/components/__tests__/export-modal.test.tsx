import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ExportModal } from '@/components/organisms/ExportModal';
import {
  exportToCSV,
  exportTournamentToCSV,
  downloadFile,
  exportToJSON,
  importFromJSON,
} from '@/lib/export';
import { exportToSQLite } from '@/lib/sqlite';
import {
  importParticipantsFromCSV,
  importTournamentDataFromCSV,
  readFileAsText,
} from '@/lib/import';
import type { Tournament } from '@/types';

const tournament = (id: string): Tournament => ({
  id,
  name: `Cup ${id}`,
  description: '',
  format: 'single-elimination',
  status: 'draft',
  maxParticipants: 8,
  createdAt: 100,
  updatedAt: 100,
});

const mockData = {
  tournaments: [tournament('t1'), tournament('t2')],
  participants: [
    { id: 'p1', tournamentId: 't1', name: 'Alpha', seed: 1 },
    { id: 'p2', tournamentId: 't2', name: 'Beta', seed: 1 },
  ],
  matches: [
    {
      id: 'm1',
      tournamentId: 't1',
      round: 1,
      participant1Id: 'p1',
      participant2Id: null,
      participant1Score: null,
      participant2Score: null,
      winnerId: null,
      status: 'scheduled',
    },
  ],
  groups: [],
  createTournament: jest.fn(),
  createParticipants: jest.fn(),
  createMatches: jest.fn(),
};

jest.mock('@/providers/DataProvider', () => ({
  useData: () => mockData,
}));

jest.mock('@/lib/export', () => ({
  exportToCSV: jest.fn(),
  exportTournamentToCSV: jest.fn(),
  downloadFile: jest.fn(),
  exportToJSON: jest.fn(),
  importFromJSON: jest.fn(),
}));

jest.mock('@/lib/sqlite', () => ({
  exportToSQLite: jest.fn(),
}));

jest.mock('@/lib/import', () => ({
  importParticipantsFromCSV: jest.fn(),
  importTournamentDataFromCSV: jest.fn(),
  readFileAsText: jest.fn(),
}));

const mockedExportToCSV = exportToCSV as jest.MockedFunction<
  typeof exportToCSV
>;
const mockedExportTournamentToCSV =
  exportTournamentToCSV as jest.MockedFunction<typeof exportTournamentToCSV>;
const mockedDownloadFile = downloadFile as jest.MockedFunction<
  typeof downloadFile
>;
const mockedExportToJSON = exportToJSON as jest.MockedFunction<
  typeof exportToJSON
>;
const mockedImportFromJSON = importFromJSON as jest.MockedFunction<
  typeof importFromJSON
>;
const mockedExportToSQLite = exportToSQLite as jest.MockedFunction<
  typeof exportToSQLite
>;
const mockedImportParticipantsFromCSV =
  importParticipantsFromCSV as jest.MockedFunction<
    typeof importParticipantsFromCSV
  >;
const mockedImportTournamentDataFromCSV =
  importTournamentDataFromCSV as jest.MockedFunction<
    typeof importTournamentDataFromCSV
  >;
const mockedReadFileAsText = readFileAsText as jest.MockedFunction<
  typeof readFileAsText
>;

const changeFile = (container: HTMLElement, id: string) => {
  const input = container.querySelector<HTMLInputElement>(`#${id}`)!;
  fireEvent.change(input, {
    target: { files: [new File(['data'], 'file.json')] },
  });
};

const onClose = jest.fn();

describe('ExportModal', () => {
  beforeEach(() => {
    onClose.mockClear();
    mockedDownloadFile.mockClear();
    mockedExportToCSV.mockClear();
    mockedExportTournamentToCSV.mockClear();
    mockedExportToJSON.mockClear();
    mockedImportFromJSON.mockClear();
    mockedExportToSQLite.mockClear();
    mockedImportParticipantsFromCSV.mockClear();
    mockedImportTournamentDataFromCSV.mockClear();
    mockedReadFileAsText.mockClear();
    mockData.createTournament.mockClear();
    mockData.createParticipants.mockClear();
    mockData.createMatches = jest.fn();
    mockedReadFileAsText.mockResolvedValue('text');
    mockedExportToCSV.mockImplementation(() => 'a,b');
    mockedExportTournamentToCSV.mockImplementation(() => 'a,b');
    mockedExportToJSON.mockImplementation(() => '{}');
    mockedExportToSQLite.mockImplementation(async () => new Blob(['x']));
    mockedImportParticipantsFromCSV.mockReturnValue([]);
  });

  it('renders nothing when closed', () => {
    const { container } = render(
      <ExportModal isOpen={false} onClose={onClose} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders the export and import actions for all data', () => {
    render(<ExportModal isOpen onClose={onClose} />);
    expect(screen.getByText('Data Export & Import')).toBeInTheDocument();
    expect(screen.getByText('CSV Spreadsheet')).toBeInTheDocument();
    expect(screen.getByText('JSON Backup')).toBeInTheDocument();
    expect(screen.getByText('SQLite Database')).toBeInTheDocument();
    expect(screen.getByText('Restore JSON Backup')).toBeInTheDocument();
    expect(screen.getByText('Import Participants CSV')).toBeInTheDocument();
  });

  it('shows the tournament name in export mode', () => {
    render(<ExportModal isOpen onClose={onClose} tournamentId="t1" />);
    expect(screen.getByText('Tournament Export')).toBeInTheDocument();
    expect(screen.getByText('Cup t1')).toBeInTheDocument();
  });

  it('falls back to the id when the tournament is missing', () => {
    render(<ExportModal isOpen onClose={onClose} tournamentId="missing" />);
    expect(screen.getByText('missing')).toBeInTheDocument();
  });

  it('exports all data to CSV', () => {
    render(<ExportModal isOpen onClose={onClose} />);
    fireEvent.click(screen.getByText('CSV Spreadsheet'));
    expect(mockedExportToCSV).toHaveBeenCalled();
    expect(mockedDownloadFile).toHaveBeenCalledWith(
      'a,b',
      'tourney-export.csv',
      'text/csv'
    );
  });

  it('exports a single tournament to CSV', () => {
    render(<ExportModal isOpen onClose={onClose} tournamentId="t1" />);
    fireEvent.click(screen.getByText('CSV Spreadsheet'));
    expect(mockedExportTournamentToCSV).toHaveBeenCalled();
    expect(mockedDownloadFile).toHaveBeenCalledWith(
      'a,b',
      'tourney-t1.csv',
      'text/csv'
    );
  });

  it('reports a CSV export failure', () => {
    mockedExportToCSV.mockImplementationOnce(() => {
      throw new Error('boom');
    });
    render(<ExportModal isOpen onClose={onClose} />);
    fireEvent.click(screen.getByText('CSV Spreadsheet'));
    expect(screen.getByText('CSV export failed')).toBeInTheDocument();
  });

  it('exports data to JSON', () => {
    render(<ExportModal isOpen onClose={onClose} />);
    fireEvent.click(screen.getByText('JSON Backup'));
    expect(mockedExportToJSON).toHaveBeenCalled();
    expect(mockedDownloadFile).toHaveBeenCalledWith(
      '{}',
      'tourney-backup.json',
      'application/json'
    );
  });

  it('exports a single tournament backup to JSON', () => {
    render(<ExportModal isOpen onClose={onClose} tournamentId="t1" />);
    fireEvent.click(screen.getByText('JSON Backup'));
    expect(mockedDownloadFile).toHaveBeenCalledWith(
      '{}',
      'tourney-t1-backup.json',
      'application/json'
    );
  });

  it('reports a JSON export failure', () => {
    mockedExportToJSON.mockImplementationOnce(() => {
      throw new Error('boom');
    });
    render(<ExportModal isOpen onClose={onClose} />);
    fireEvent.click(screen.getByText('JSON Backup'));
    expect(screen.getByText('JSON export failed')).toBeInTheDocument();
  });

  it('exports data to SQLite', async () => {
    render(<ExportModal isOpen onClose={onClose} />);
    fireEvent.click(screen.getByText('SQLite Database'));
    await waitFor(() => expect(mockedExportToSQLite).toHaveBeenCalled());
    expect(mockedDownloadFile).toHaveBeenCalledWith(
      expect.any(Blob),
      'tourney-export.db',
      'application/x-sqlite3'
    );
  });

  it('reports a SQLite export failure', async () => {
    mockedExportToSQLite.mockRejectedValueOnce(new Error('boom'));
    render(<ExportModal isOpen onClose={onClose} />);
    fireEvent.click(screen.getByText('SQLite Database'));
    expect(await screen.findByText('SQLite export failed')).toBeInTheDocument();
  });

  it('restores a valid JSON backup', async () => {
    mockedImportFromJSON.mockReturnValue({
      tournaments: [tournament('t1')],
      participants: [{ id: 'p1', tournamentId: 't1', name: 'Alpha', seed: 1 }],
      matches: [],
      groups: [],
    });
    const { container } = render(<ExportModal isOpen onClose={onClose} />);
    changeFile(container, 'import-json');
    expect(
      await screen.findByText(
        'Restored: 1 tournament(s), 1 participant(s), 0 match(es)'
      )
    ).toBeInTheDocument();
    expect(mockData.createTournament).toHaveBeenCalled();
  });

  it('rejects an invalid JSON backup', async () => {
    mockedImportFromJSON.mockReturnValue(null);
    const { container } = render(<ExportModal isOpen onClose={onClose} />);
    changeFile(container, 'import-json');
    expect(
      await screen.findByText('Invalid backup file format')
    ).toBeInTheDocument();
    expect(mockData.createTournament).not.toHaveBeenCalled();
  });

  it('reports a JSON import failure', async () => {
    mockedReadFileAsText.mockRejectedValueOnce(new Error('boom'));
    const { container } = render(<ExportModal isOpen onClose={onClose} />);
    changeFile(container, 'import-json');
    expect(await screen.findByText('Import failed')).toBeInTheDocument();
  });

  it('ignores a JSON import with no file', () => {
    const { container } = render(<ExportModal isOpen onClose={onClose} />);
    const input = container.querySelector<HTMLInputElement>('#import-json')!;
    fireEvent.change(input, { target: { files: [] } });
    expect(screen.queryByText('Import failed')).not.toBeInTheDocument();
  });

  it('imports participants from CSV', async () => {
    mockedImportParticipantsFromCSV.mockReturnValue([
      { name: 'Newcomer', seed: 2 },
    ]);
    const { container } = render(<ExportModal isOpen onClose={onClose} />);
    changeFile(container, 'import-csv');
    expect(
      await screen.findByText('Imported 1 participant(s)')
    ).toBeInTheDocument();
    expect(mockData.createParticipants).toHaveBeenCalled();
  });

  it('imports participants into the targeted tournament', async () => {
    mockedImportParticipantsFromCSV.mockReturnValue([
      { name: 'Newcomer', seed: 2 },
    ]);
    const { container } = render(
      <ExportModal isOpen onClose={onClose} tournamentId="t1" />
    );
    changeFile(container, 'import-csv');
    expect(
      await screen.findByText('Imported 1 participant(s)')
    ).toBeInTheDocument();
    expect(mockData.createParticipants).toHaveBeenCalledWith([
      { name: 'Newcomer', seed: 2, tournamentId: 't1' },
    ]);
  });

  it('rejects a CSV with no participants', async () => {
    mockedImportParticipantsFromCSV.mockReturnValue([]);
    const { container } = render(<ExportModal isOpen onClose={onClose} />);
    changeFile(container, 'import-csv');
    expect(
      await screen.findByText('No participants found in CSV')
    ).toBeInTheDocument();
    expect(mockData.createParticipants).not.toHaveBeenCalled();
  });

  it('reports when no tournament is available for CSV import', async () => {
    mockedImportParticipantsFromCSV.mockReturnValue([
      { name: 'Newcomer', seed: 2 },
    ]);
    mockData.tournaments = [];
    const { container } = render(<ExportModal isOpen onClose={onClose} />);
    changeFile(container, 'import-csv');
    expect(
      await screen.findByText('No tournament available')
    ).toBeInTheDocument();
    mockData.tournaments = [tournament('t1'), tournament('t2')];
  });

  it('reports a CSV import failure', async () => {
    mockedReadFileAsText.mockRejectedValueOnce(new Error('boom'));
    const { container } = render(<ExportModal isOpen onClose={onClose} />);
    changeFile(container, 'import-csv');
    expect(await screen.findByText('CSV import failed')).toBeInTheDocument();
  });

  it('shows the close button and calls onClose', () => {
    render(<ExportModal isOpen onClose={onClose} />);
    fireEvent.click(screen.getByText('Close'));
    expect(onClose).toHaveBeenCalled();
  });

  it('shows the status message and loading state during an export', async () => {
    let resolveExport: (b: Blob) => void = () => {};
    mockedExportToSQLite.mockImplementationOnce(
      () =>
        new Promise<Blob>((resolve) => {
          resolveExport = resolve;
        })
    );
    render(<ExportModal isOpen onClose={onClose} />);
    fireEvent.click(screen.getByText('SQLite Database'));
    expect(
      await screen.findByText('Building SQLite database…')
    ).toBeInTheDocument();
    expect(screen.getByText('Close')).toBeDisabled();
    fireEvent.click(screen.getByText('Close'));
    expect(onClose).not.toHaveBeenCalled();
    resolveExport(new Blob(['x']));
  });

  it('ignores a tournament CSV import with no file', () => {
    const { container } = render(<ExportModal isOpen onClose={onClose} />);
    const input = container.querySelector<HTMLInputElement>(
      '#import-tournament-csv'
    )!;
    fireEvent.change(input, { target: { files: [] } });
    expect(mockedImportTournamentDataFromCSV).not.toHaveBeenCalled();
  });

  it('rejects a tournament CSV with no data', async () => {
    mockedImportTournamentDataFromCSV.mockReturnValue({
      tournaments: [],
      participants: [],
      matches: [],
    });
    const { container } = render(<ExportModal isOpen onClose={onClose} />);
    changeFile(container, 'import-tournament-csv');
    expect(
      await screen.findByText('No tournament data found in CSV')
    ).toBeInTheDocument();
    expect(mockData.createTournament).not.toHaveBeenCalled();
  });

  it('creates a tournament and imports data from a tournament CSV', async () => {
    mockData.createTournament.mockResolvedValue({ id: 'new-t' });
    mockData.createParticipants.mockResolvedValue([
      { id: 'imported-p1', name: 'Alpha', tournamentId: 'new-t', seed: 1 },
      { id: 'imported-p2', name: 'Beta', tournamentId: 'new-t', seed: 2 },
    ]);
    mockedImportTournamentDataFromCSV.mockReturnValue({
      tournaments: [
        {
          id: 'csv-t',
          name: 'Imported Cup',
          description: 'From CSV',
          format: 'invalid-format',
          status: 'invalid-status',
          startDate: 200,
          endDate: 300,
        },
      ],
      participants: [
        { id: 'csv-p1', name: 'Alpha', seed: 1, rating: 1500, groupId: 'g1' },
        { id: 'csv-p2', name: 'Beta', seed: 2 },
      ],
      matches: [
        {
          id: 'csv-m1',
          bracket: 'weird',
          participant1Id: 'csv-p1',
          participant2Id: 'csv-p2',
          participant1Score: 2,
          participant2Score: 1,
          winnerId: 'csv-p1',
          status: 'invalid-status',
          scheduledAt: 400,
          venue: 'Court 1',
        },
        {
          id: 'csv-m2',
          participant1Id: null,
          participant2Id: null,
          participant1Score: null,
          participant2Score: null,
          winnerId: null,
          status: undefined,
        },
      ],
    });
    const { container } = render(<ExportModal isOpen onClose={onClose} />);
    changeFile(container, 'import-tournament-csv');

    expect(
      await screen.findByText(
        'Imported 1 tournament(s), 2 participant(s), 2 match(es)'
      )
    ).toBeInTheDocument();

    expect(mockData.createTournament).toHaveBeenCalledWith({
      name: 'Imported Cup',
      description: 'From CSV',
      format: 'round-robin',
      status: 'draft',
      maxParticipants: 16,
      startDate: 200,
      endDate: 300,
    });

    expect(mockData.createParticipants).toHaveBeenCalledWith([
      {
        name: 'Alpha',
        tournamentId: 'new-t',
        seed: 1,
        rating: 1500,
        groupId: 'g1',
      },
      {
        name: 'Beta',
        tournamentId: 'new-t',
        seed: 2,
        rating: undefined,
        groupId: undefined,
      },
    ]);

    expect(mockData.createMatches).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          tournamentId: 'new-t',
          round: 1,
          bracket: undefined,
          participant1Id: 'imported-p1',
          participant2Id: 'imported-p2',
          participant1Score: 2,
          participant2Score: 1,
          winnerId: 'imported-p1',
          status: 'scheduled',
          scheduledAt: 400,
          venue: 'Court 1',
        }),
        expect.objectContaining({
          tournamentId: 'new-t',
          round: 1,
          bracket: undefined,
          participant1Id: null,
          participant2Id: null,
          participant1Score: null,
          participant2Score: null,
          winnerId: null,
          status: 'scheduled',
        }),
      ])
    );
  });

  it('imports a tournament CSV into an existing tournament', async () => {
    mockData.createParticipants.mockResolvedValue([{ id: 'p9' }]);
    mockedImportTournamentDataFromCSV.mockReturnValue({
      tournaments: [
        {
          id: 'csv-t',
          name: 'Cup t1',
          description: 'Desc',
          format: 'league',
          status: 'in-progress',
          maxParticipants: 32,
        },
      ],
      participants: [{ id: 'csv-p1', name: 'Newcomer', seed: 3 }],
      matches: [
        {
          id: 'csv-m1',
          bracket: 'winners',
          participant1Id: 'csv-p1',
          participant2Id: 'missing',
          status: 'completed',
        },
      ],
    });
    const { container } = render(
      <ExportModal isOpen onClose={onClose} tournamentId="t1" />
    );
    changeFile(container, 'import-tournament-csv');

    expect(
      await screen.findByText(
        'Imported 1 tournament(s), 1 participant(s), 1 match(es)'
      )
    ).toBeInTheDocument();
    expect(mockData.createTournament).not.toHaveBeenCalled();
    expect(mockData.createParticipants).toHaveBeenCalledWith([
      {
        name: 'Newcomer',
        tournamentId: 't1',
        seed: 3,
        rating: undefined,
        groupId: undefined,
      },
    ]);
    expect(mockData.createMatches).toHaveBeenCalledWith([
      expect.objectContaining({
        tournamentId: 't1',
        round: 1,
        bracket: 'winners',
        participant1Id: 'p9',
        participant2Id: 'missing',
        status: 'completed',
      }),
    ]);
  });

  it('reports a tournament CSV import failure', async () => {
    mockedReadFileAsText.mockRejectedValueOnce(new Error('boom'));
    const { container } = render(<ExportModal isOpen onClose={onClose} />);
    changeFile(container, 'import-tournament-csv');
    expect(
      await screen.findByText('Tournament CSV import failed')
    ).toBeInTheDocument();
  });

  it('downloads a single-tournament sqlite database', async () => {
    render(<ExportModal isOpen onClose={onClose} tournamentId="t1" />);
    fireEvent.click(screen.getByText('SQLite Database'));
    await waitFor(() =>
      expect(mockedDownloadFile).toHaveBeenCalledWith(
        expect.any(Blob),
        'tourney-t1.db',
        'application/x-sqlite3'
      )
    );
  });
});
