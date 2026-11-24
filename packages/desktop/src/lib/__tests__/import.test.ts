import {
  importParticipantsFromCSV,
  importTournamentFromCSV,
  importTournamentDataFromCSV,
  parseSections,
  readFileAsText,
} from '@/lib/import';

describe('importParticipantsFromCSV', () => {
  it('parses name, seed, and rating columns', () => {
    const csv = ['name,seed,rating', 'Alice,1,1500', 'Bob,2,1400'].join('\n');
    expect(importParticipantsFromCSV(csv)).toEqual([
      { name: 'Alice', seed: 1, rating: 1500 },
      { name: 'Bob', seed: 2, rating: 1400 },
    ]);
  });

  it('resolves alternative header names', () => {
    const csv = ['Player,Elo', 'Alice,1500'].join('\n');
    expect(importParticipantsFromCSV(csv)).toEqual([
      { name: 'Alice', rating: 1500 },
    ]);
  });

  it('returns empty when fewer than two lines or no name column', () => {
    expect(importParticipantsFromCSV('name,seed')).toEqual([]);
    expect(importParticipantsFromCSV('foo,bar\nAlice,1')).toEqual([]);
  });

  it('skips blank and comment lines', () => {
    const csv = ['# comment', '', 'name,seed', '', 'Alice,1'].join('\n');
    expect(importParticipantsFromCSV(csv)).toEqual([
      { name: 'Alice', seed: 1 },
    ]);
  });

  it('parses quoted cells with commas and escaped quotes', () => {
    const csv = ['name,seed', '"Doe, John",1', '"O""Brien",2'].join('\n');
    expect(importParticipantsFromCSV(csv)).toEqual([
      { name: 'Doe, John', seed: 1 },
      { name: 'O"Brien', seed: 2 },
    ]);
  });

  it('treats non-numeric seeds and ratings as undefined', () => {
    const csv = ['name,seed,rating', 'Alice,abc,xyz'].join('\n');
    expect(importParticipantsFromCSV(csv)).toEqual([{ name: 'Alice' }]);
  });

  it('fills missing cells when a row is shorter than the header', () => {
    const csv = ['seed,name,rating', '1'].join('\n');
    expect(importParticipantsFromCSV(csv)).toEqual([{ name: '', seed: 1 }]);
  });
});

describe('importTournamentFromCSV', () => {
  it('parses tournament columns', () => {
    const csv = [
      'name,description,format,maxParticipants',
      'Cup,Knockout,single-elimination,16',
    ].join('\n');
    expect(importTournamentFromCSV(csv)).toEqual([
      {
        name: 'Cup',
        description: 'Knockout',
        format: 'single-elimination',
        maxParticipants: 16,
      },
    ]);
  });

  it('resolves alternative header names', () => {
    const csv = ['Tournament,Desc,Type,Max', 'Cup,Knockout,se,16'].join('\n');
    expect(importTournamentFromCSV(csv)).toEqual([
      {
        name: 'Cup',
        description: 'Knockout',
        format: 'se',
        maxParticipants: 16,
      },
    ]);
  });

  it('returns empty for invalid input', () => {
    expect(importTournamentFromCSV('name')).toEqual([]);
    expect(importTournamentFromCSV('foo,bar\nCup,1')).toEqual([]);
  });

  it('omits optional fields when their columns are missing', () => {
    const csv = ['name', 'Cup'].join('\n');
    expect(importTournamentFromCSV(csv)).toEqual([{ name: 'Cup' }]);
  });

  it('treats a non-numeric maxParticipants as undefined', () => {
    const csv = ['name,max', 'Cup,many'].join('\n');
    expect(importTournamentFromCSV(csv)).toEqual([{ name: 'Cup' }]);
  });
});

describe('readFileAsText', () => {
  it('resolves with the file contents', async () => {
    const file = new File(['hello world'], 'file.txt', { type: 'text/plain' });
    await expect(readFileAsText(file)).resolves.toBe('hello world');
  });

  it('rejects when reading fails', async () => {
    const spy = jest
      .spyOn(FileReader.prototype, 'readAsText')
      .mockImplementationOnce(function (this: FileReader) {
        queueMicrotask(() => {
          this.onerror?.(
            new ProgressEvent('error') as unknown as ProgressEvent<FileReader>
          );
        });
      });

    await expect(readFileAsText(new File(['x'], 'file.txt'))).rejects.toThrow(
      'Failed to read file'
    );
    spy.mockRestore();
  });
});

describe('parseSections', () => {
  it('splits the csv into sections with headers and rows', () => {
    const csv = [
      '# Tournament',
      'id,name',
      't1,Cup',
      '',
      '# Participants',
      'id,name',
      'p1,Alice',
    ].join('\n');
    const sections = parseSections(csv);
    expect(sections).toEqual([
      { title: 'Tournament', header: ['id', 'name'], rows: [['t1', 'Cup']] },
      {
        title: 'Participants',
        header: ['id', 'name'],
        rows: [['p1', 'Alice']],
      },
    ]);
  });

  it('parses quoted cells with commas and escaped quotes', () => {
    const csv = [
      '# Participants',
      'id,name',
      'p1,"Doe, John"',
      'p2,"O""Brien"',
    ].join('\n');
    const sections = parseSections(csv);
    expect(sections).toEqual([
      {
        title: 'Participants',
        header: ['id', 'name'],
        rows: [
          ['p1', 'Doe, John'],
          ['p2', 'O"Brien'],
        ],
      },
    ]);
  });

  it('ignores text before any section header', () => {
    const csv = ['stray line', '', '# Matches', 'id,round', 'm1,1'].join('\n');
    expect(parseSections(csv)).toEqual([
      { title: 'Matches', header: ['id', 'round'], rows: [['m1', '1']] },
    ]);
  });
});

describe('importTournamentDataFromCSV', () => {
  it('parses tournaments, participants, and matches', () => {
    const csv = [
      '# Tournament',
      'id,name,description,format,status,maxParticipants,startDate',
      't1,Cup,Knockout,single-elimination,in-progress,16,1700000000000',
      '',
      '# Participants',
      'id,tournamentId,name,seed,rating,groupId',
      'p1,t1,Alice,1,1500,',
      'p2,t1,Bob,2,1400,g1',
      '',
      '# Matches',
      'id,round,bracket,participant1Id,participant2Id,participant1Score,participant2Score,winnerId,status,scheduledAt,venue',
      'm1,1,,p1,p2,2,1,p1,completed,1700000001000,Court 1',
    ].join('\n');

    const result = importTournamentDataFromCSV(csv);

    expect(result.tournaments).toEqual([
      {
        name: 'Cup',
        description: 'Knockout',
        format: 'single-elimination',
        status: 'in-progress',
        maxParticipants: 16,
        startDate: 1700000000000,
      },
    ]);
    expect(result.participants).toEqual([
      { id: 'p1', tournamentId: 't1', name: 'Alice', seed: 1, rating: 1500 },
      {
        id: 'p2',
        tournamentId: 't1',
        name: 'Bob',
        seed: 2,
        rating: 1400,
        groupId: 'g1',
      },
    ]);
    expect(result.matches).toEqual([
      {
        id: 'm1',
        tournamentId: undefined,
        round: 1,
        bracket: undefined,
        participant1Id: 'p1',
        participant2Id: 'p2',
        participant1Score: 2,
        participant2Score: 1,
        winnerId: 'p1',
        status: 'completed',
        scheduledAt: 1700000001000,
        venue: 'Court 1',
      },
    ]);
  });

  it('handles empty values and missing columns', () => {
    const csv = ['# Participants', 'name,seed', 'Alice,'].join('\n');
    const result = importTournamentDataFromCSV(csv);
    expect(result.participants).toEqual([
      { id: 'imported-0', name: 'Alice', seed: undefined },
    ]);
    expect(result.tournaments).toEqual([]);
    expect(result.matches).toEqual([]);
  });

  it('generates fallback ids for matches without ids', () => {
    const csv = [
      '# Matches',
      'participant1Id,participant2Id,status',
      'a,b,',
    ].join('\n');
    const result = importTournamentDataFromCSV(csv);
    expect(result.matches).toEqual([
      {
        id: 'imported-match-0',
        participant1Id: 'a',
        participant2Id: 'b',
        participant1Score: null,
        participant2Score: null,
        winnerId: null,
        status: 'scheduled',
      },
    ]);
  });

  it('skips sections that lack their required name column', () => {
    const csv = [
      '# Tournament',
      'description',
      'Knockout',
      '',
      '# Participants',
      'seed,rating',
      '1,1500',
    ].join('\n');
    const result = importTournamentDataFromCSV(csv);
    expect(result.tournaments).toEqual([]);
    expect(result.participants).toEqual([]);
  });

  it('handles rows shorter than their header and missing columns', () => {
    const csv = [
      '# Tournament',
      'seed,name',
      '1',
      '',
      '# Participants',
      'seed,name,rating',
      '2',
      '',
      '# Matches',
      'id,round,bracket',
      'm1,1,',
    ].join('\n');
    const result = importTournamentDataFromCSV(csv);
    expect(result.tournaments).toEqual([{ name: '' }]);
    expect(result.participants).toEqual([
      { id: 'imported-0', name: '', seed: 2 },
    ]);
    expect(result.matches).toEqual([
      {
        id: 'm1',
        round: 1,
        bracket: undefined,
        participant1Id: null,
        participant2Id: null,
        participant1Score: null,
        participant2Score: null,
        winnerId: null,
        status: 'scheduled',
      },
    ]);
  });

  it('maps all optional match columns', () => {
    const csv = [
      '# Matches',
      'id,tournamentId,round,bracket,participant1Id,participant2Id,participant1Score,participant2Score,winnerId,status,scheduledAt,venue',
      'm1,t1,2,winner,p1,p2,3,0,p1,completed,1700000001000,Court 1',
    ].join('\n');
    const result = importTournamentDataFromCSV(csv);
    expect(result.matches).toEqual([
      {
        id: 'm1',
        tournamentId: 't1',
        round: 2,
        bracket: 'winner',
        participant1Id: 'p1',
        participant2Id: 'p2',
        participant1Score: 3,
        participant2Score: 0,
        winnerId: 'p1',
        status: 'completed',
        scheduledAt: 1700000001000,
        venue: 'Court 1',
      },
    ]);
  });

  it('reads a quoted header and quoted cells in sections', () => {
    const csv = [
      '# Participants',
      '"id","name"',
      '"p1","Alice"',
      '',
      '# Matches',
      '"participant1Id","participant2Id","status"',
      '"a","b","completed"',
    ].join('\n');
    const result = importTournamentDataFromCSV(csv);
    expect(result.participants).toEqual([{ id: 'p1', name: 'Alice' }]);
    expect(result.matches[0].status).toBe('completed');
  });
});
