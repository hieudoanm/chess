import type { FC } from 'react';
import { useState, useRef } from 'react';
import { useData } from '@/providers/DataProvider';
import { importParticipantsFromCSV, readFileAsText } from '@/lib/import';

interface ParticipantsViewProps {
  tournament: ReturnType<typeof useData>['tournaments'][number];
  participants: ReturnType<typeof useData>['participants'];
}

export const ParticipantsView: FC<ParticipantsViewProps> = ({
  tournament,
  participants,
}) => {
  const { createParticipant, createParticipants, deleteParticipant } =
    useData();
  const csvInputRef = useRef<HTMLInputElement>(null);

  const [newName, setNewName] = useState('');
  const [batchText, setBatchText] = useState('');
  const [showBatch, setShowBatch] = useState(false);

  const handleAdd = async () => {
    if (!newName.trim()) return;
    await createParticipant({
      tournamentId: tournament.id,
      name: newName.trim(),
      seed: participants.length + 1,
    });
    setNewName('');
  };

  const handleBatchAdd = async () => {
    const names = batchText
      .split('\n')
      .map((n) => n.trim())
      .filter(Boolean);
    if (names.length === 0) return;
    await createParticipants(
      names.map((name, i) => ({
        tournamentId: tournament.id,
        name,
        seed: participants.length + i + 1,
      }))
    );
    setBatchText('');
    setShowBatch(false);
  };

  const handleRemove = async (id: string) => {
    await deleteParticipant(id);
  };

  const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await readFileAsText(file);
    const imported = importParticipantsFromCSV(text);
    if (imported.length > 0) {
      await createParticipants(
        imported.map((p, i) => ({
          tournamentId: tournament.id,
          name: p.name,
          seed: p.seed ?? participants.length + i + 1,
          rating: p.rating,
        }))
      );
    }
    if (csvInputRef.current) csvInputRef.current.value = '';
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="border-base-content/10 bg-base-200 flex gap-2 rounded-xl border p-3">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Participant name"
          className="input input-bordered input-sm flex-1"
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
        <button
          onClick={handleAdd}
          className="btn btn-primary btn-sm"
          disabled={!newName.trim()}>
          Add
        </button>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setShowBatch(!showBatch)}
          className="btn btn-ghost btn-sm">
          Batch Add
        </button>
        <button
          onClick={() => csvInputRef.current?.click()}
          className="btn btn-ghost btn-sm">
          Import CSV
        </button>
        <input
          ref={csvInputRef}
          type="file"
          accept=".csv"
          onChange={handleImportCSV}
          className="hidden"
          aria-label="Import participants CSV"
        />
      </div>

      {showBatch && (
        <div className="border-base-content/10 bg-base-200 rounded-xl border p-3">
          <textarea
            value={batchText}
            onChange={(e) => setBatchText(e.target.value)}
            placeholder="One name per line"
            className="textarea textarea-bordered w-full"
            rows={4}
          />
          <button
            onClick={handleBatchAdd}
            className="btn btn-primary btn-sm mt-2"
            disabled={!batchText.trim()}>
            Add All
          </button>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {participants.map((p) => (
          <div
            key={p.id}
            className="border-base-content/10 bg-base-200 flex items-center justify-between rounded-xl border p-3">
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm">#{p.seed ?? '-'}</span>
              <span className="text-sm font-medium">{p.name}</span>
              {p.rating && (
                <span className="text-base-content/50 font-mono text-xs">
                  {p.rating}
                </span>
              )}
            </div>
            <button
              onClick={() => handleRemove(p.id)}
              className="btn btn-ghost btn-xs text-error">
              Remove
            </button>
          </div>
        ))}
      </div>

      {participants.length === 0 && (
        <div className="text-base-content/50 py-8 text-center text-sm">
          No participants yet. Add some to get started.
        </div>
      )}
    </div>
  );
};
