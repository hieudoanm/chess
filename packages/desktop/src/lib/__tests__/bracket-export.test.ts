import {
  buildBracketExportRows,
  makePdf,
  buildPdfContent,
  buildBracketPdf,
  exportBracketToPNG,
} from '@/lib/bracket-export';
import type { Match } from '@/types';

const match = (id: string, round: number, p1: string, p2: string): Match => ({
  id,
  tournamentId: 't1',
  round,
  participant1Id: p1,
  participant2Id: p2,
  participant1Score: null,
  participant2Score: null,
  winnerId: null,
  status: 'scheduled',
});

const getName = (id: string | null): string => (id ? `Name ${id}` : 'BYE');

describe('buildBracketExportRows', () => {
  it('labels rounds and maps participant names', () => {
    const rows = buildBracketExportRows(
      [
        {
          ...match('m1', 1, 'a', 'b'),
          participant1Score: 2,
          participant2Score: 1,
        },
        { ...match('m2', 2, 'x', 'y') },
      ],
      getName
    );
    expect(rows).toEqual([
      {
        round: 1,
        label: 'Round 1',
        participant1Name: 'Name a',
        participant2Name: 'Name b',
        score1: 2,
        score2: 1,
      },
      {
        round: 2,
        label: 'Final',
        participant1Name: 'Name x',
        participant2Name: 'Name y',
        score1: null,
        score2: null,
      },
    ]);
  });

  it('labels the semi-final round', () => {
    const rows = buildBracketExportRows(
      [
        match('m1', 1, 'a', 'b'),
        match('m2', 2, 'c', 'd'),
        match('m3', 3, 'e', 'f'),
      ],
      getName
    );
    expect(rows.find((r) => r.round === 2)?.label).toBe('Semi-Final');
    expect(rows.find((r) => r.round === 3)?.label).toBe('Final');
  });
});

describe('makePdf', () => {
  it('returns a valid PDF blob', () => {
    const blob = makePdf(['Tournament: Cup', 'Final: A 2 : 1 B']);
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe('application/pdf');
  });
});

describe('buildPdfContent', () => {
  it('produces a PDF document containing the text lines', () => {
    const text = buildPdfContent(['Tournament: Cup', 'Final: A 2 : 1 B']);
    expect(text.startsWith('%PDF-1.4')).toBe(true);
    expect(text).toContain('/F1 4 0 R');
    expect(text).toContain('(Tournament: Cup)');
    expect(text).toContain('startxref');
    expect(text.trimEnd().endsWith('%%EOF')).toBe(true);
  });

  it('wraps long lines and truncates at the page limit', () => {
    const long = 'X'.repeat(120);
    const lines = Array.from({ length: 70 }, (_, i) => `${i} ${long}`);
    const text = buildPdfContent(lines);
    const stream = text.match(/stream\n([\s\S]*?)\nendstream/)?.[1] ?? '';
    expect(stream.split('\n').filter((l) => l.endsWith(') Tj'))).toHaveLength(
      60
    );
  });

  it('escapes special characters in text lines', () => {
    const text = buildPdfContent(['Player (A) \\ "quoted"']);
    expect(text).toContain('(Player \\(A\\) \\\\ "quoted")');
  });

  it('encodes non-ASCII characters as octal escapes', () => {
    const text = buildPdfContent(['Café']);
    expect(text).toContain('(Caf\\351)');
  });
});

describe('buildBracketPdf', () => {
  it('builds and downloads the bracket pdf', () => {
    const click = jest.fn();
    const anchorPrototype = document.createElement('a') as HTMLAnchorElement;
    jest
      .spyOn(document, 'createElement')
      .mockReturnValue(anchorPrototype as HTMLElement);
    const urlSpy = jest
      .spyOn(URL, 'createObjectURL')
      .mockReturnValue('blob:test');
    anchorPrototype.click = click;

    buildBracketPdf(
      'Cup',
      [
        {
          round: 1,
          label: 'Round 1',
          participant1Name: 'A',
          participant2Name: 'B',
          score1: null,
          score2: null,
        },
      ],
      'bracket.pdf'
    );

    expect(click).toHaveBeenCalled();
    expect(urlSpy).toHaveBeenCalled();
  });

  it('uses the default pdf filename when none is provided', () => {
    const anchorPrototype = document.createElement('a') as HTMLAnchorElement;
    const click = jest.fn();
    anchorPrototype.click = click;
    jest
      .spyOn(document, 'createElement')
      .mockReturnValue(anchorPrototype as HTMLElement);
    jest.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test');

    buildBracketPdf('Cup', []);

    expect(anchorPrototype.download).toBe('bracket.pdf');
    expect(click).toHaveBeenCalled();
  });
});

describe('exportBracketToPNG', () => {
  const createFillRect = jest.fn();
  const createFillText = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('draws the bracket on a canvas and downloads a png', () => {
    const ctx = {
      fillRect: createFillRect,
      fillText: createFillText,
      set font(value: string) {},
      set fillStyle(value: string) {},
      measureText: () => ({ width: 10 }),
    };
    const canvas = {
      width: 0,
      height: 0,
      getContext: jest.fn(() => ctx),
      toDataURL: jest.fn(() => 'data:image/png;base64,xxx'),
    };
    const click = jest.fn();
    const anchor = { href: '', download: '', click };
    jest
      .spyOn(document, 'createElement')
      .mockImplementation(((tag: string) =>
        tag === 'canvas'
          ? canvas
          : anchor) as unknown as typeof document.createElement);

    exportBracketToPNG(
      'Cup',
      [
        {
          round: 1,
          label: 'Round 1',
          participant1Name: 'A',
          participant2Name: 'B',
          score1: 2,
          score2: 1,
        },
      ],
      'bracket.png'
    );

    expect(canvas.getContext).toHaveBeenCalledWith('2d');
    expect(createFillRect).toHaveBeenCalled();
    expect(createFillText).toHaveBeenCalled();
    expect(click).toHaveBeenCalled();
    expect(anchor.download).toBe('bracket.png');
  });

  it('does nothing when the canvas context is unavailable', () => {
    const canvas = {
      getContext: jest.fn(() => null),
      toDataURL: jest.fn(),
    };
    jest
      .spyOn(document, 'createElement')
      .mockReturnValue(canvas as unknown as HTMLElement);

    exportBracketToPNG('Cup', [], 'bracket.png');
    expect(canvas.toDataURL).not.toHaveBeenCalled();
  });

  it('uses a default filename and renders null scores as dashes', () => {
    const ctx = {
      fillRect: createFillRect,
      fillText: createFillText,
      set font(value: string) {},
      set fillStyle(value: string) {},
      measureText: () => ({ width: 10 }),
    };
    const canvas = {
      width: 0,
      height: 0,
      getContext: jest.fn(() => ctx),
      toDataURL: jest.fn(() => 'data:image/png;base64,xxx'),
    };
    const click = jest.fn();
    const anchor = { href: '', download: '', click };
    jest
      .spyOn(document, 'createElement')
      .mockImplementation(((tag: string) =>
        tag === 'canvas'
          ? canvas
          : anchor) as unknown as typeof document.createElement);

    exportBracketToPNG('Cup', [
      {
        round: 1,
        label: 'Round 1',
        participant1Name: 'A',
        participant2Name: 'B',
        score1: null,
        score2: null,
      },
    ]);

    expect(anchor.download).toBe('bracket.png');
    expect(click).toHaveBeenCalled();
  });
});
