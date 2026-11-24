import type { Match } from '@/types';

export interface BracketExportRow {
  round: number;
  label: string;
  participant1Name: string;
  participant2Name: string;
  score1: number | null;
  score2: number | null;
}

export const buildBracketExportRows = (
  matches: Match[],
  getName: (participantId: string | null) => string
): BracketExportRow[] => {
  const rounds = Array.from(new Set(matches.map((m) => m.round))).sort(
    (a, b) => a - b
  );

  return matches
    .slice()
    .sort((a, b) => (a.round ?? 0) - (b.round ?? 0))
    .map((m) => ({
      round: m.round ?? 0,
      label:
        m.round === rounds[rounds.length - 1] && rounds.length > 1
          ? 'Final'
          : m.round === rounds[rounds.length - 2] && rounds.length > 2
            ? 'Semi-Final'
            : `Round ${m.round ?? 0}`,
      participant1Name: getName(m.participant1Id),
      participant2Name: getName(m.participant2Id),
      score1: m.participant1Score,
      score2: m.participant2Score,
    }));
};

export const downloadBlob = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
};

const escapePdfString = (value: string): string => {
  const escaped = value
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
  const ascii = escaped.replace(
    /[^\x20-\x7E]/g,
    (c) =>
      `\\${'0'.repeat(3 - c.charCodeAt(0).toString(8).length)}${c
        .charCodeAt(0)
        .toString(8)}`
  );
  return ascii;
};

const splitLines = (text: string, maxChars: number): string[] => {
  const lines: string[] = [];
  let current = '';
  for (const char of text) {
    current += char;
    if (current.length >= maxChars) {
      lines.push(current);
      current = '';
    }
  }
  if (current) lines.push(current);
  return lines;
};

export const buildBracketPdf = (
  tournamentName: string,
  rows: BracketExportRow[],
  filename = 'bracket.pdf'
): void => {
  const pdf = makePdf([
    `Tournament: ${tournamentName}`,
    `Exported: ${new Date().toLocaleString()}`,
    '',
    ...rows.map(
      (r) =>
        `${r.label}: ${r.participant1Name} ${r.score1 ?? '-'} : ${
          r.score2 ?? '-'
        } ${r.participant2Name}`
    ),
  ]);
  downloadBlob(pdf, filename);
};

export const buildPdfContent = (lines: string[]): string => {
  const MAX_LINES = 60;
  const MAX_CHARS = 96;

  const flatLines = lines.flatMap((line) => splitLines(line, MAX_CHARS));
  const streamLines = flatLines.slice(0, MAX_LINES);

  const content = [
    'BT',
    '/F1 11 Tf',
    '50 800 Td',
    '14 TL',
    ...streamLines.map((line) => `(${escapePdfString(line)}) Tj`),
    'T*',
    'ET',
  ].join('\n');

  const streamLength = content.length;

  const obj1 = '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj';
  const obj2 = '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj';
  const obj3 =
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj';
  const obj4 =
    '4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj';
  const obj5 = `5 0 obj\n<< /Length ${streamLength} >>\nstream\n${content}\nendstream\nendobj`;

  const pdfObjects = [obj1, obj2, obj3, obj4, obj5];

  const header = '%PDF-1.4\n%âãÏÓ\n';
  let body = header;
  const offsets: number[] = [];
  for (const obj of pdfObjects) {
    offsets.push(body.length);
    body += obj + '\n';
  }
  const xrefStart = body.length;
  const count = pdfObjects.length + 1;
  body += `xref\n0 ${count}\n0000000000 65535 f \n`;
  for (const offset of offsets) {
    body += `${offset.toString().padStart(10, '0')} 00000 n \n`;
  }
  body += `trailer\n<< /Size ${count} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  return body;
};

export const makePdf = (lines: string[]): Blob =>
  new Blob([buildPdfContent(lines)], { type: 'application/pdf' });

export const exportBracketToPNG = (
  tournamentName: string,
  rows: BracketExportRow[],
  filename = 'bracket.png'
): void => {
  if (typeof document === 'undefined') return;
  const canvas = document.createElement('canvas');
  const width = 900;
  const rowHeight = 34;
  const height = 80 + rows.length * rowHeight;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);
  ctx.font = 'bold 20px sans-serif';
  ctx.fillStyle = '#000000';
  ctx.fillText(tournamentName, 24, 40);
  ctx.font = '13px sans-serif';
  rows.forEach((row, index) => {
    const y = 80 + index * rowHeight;
    ctx.fillStyle = '#000000';
    const scoreText = `${row.score1 ?? '-'} : ${row.score2 ?? '-'}`;
    ctx.fillText(`${row.label} - ${row.participant1Name}`, 24, y);
    ctx.fillText(scoreText, width - 260, y);
    ctx.fillText(row.participant2Name, width - 160, y);
  });

  const dataUrl = canvas.toDataURL('image/png');
  const anchor = document.createElement('a');
  anchor.href = dataUrl;
  anchor.download = filename;
  anchor.click();
};
