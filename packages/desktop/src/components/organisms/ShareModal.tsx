'use client';

import { useMemo, useState } from 'react';
import { FiX } from 'react-icons/fi';
import { useData } from '@/providers/DataProvider';
import { useToast } from '@/providers/ToastProvider';
import {
  shareTournament,
  generateShareableJSON,
  generateTextSummary,
  copyToClipboard,
} from '@/lib/sharing';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  tournamentId: string;
}

export const ShareModal = ({
  isOpen,
  onClose,
  tournamentId,
}: ShareModalProps) => {
  const { tournaments, participants, matches } = useData();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<'json' | 'text'>('json');

  const tournament = useMemo(
    () => tournaments.find((t) => t.id === tournamentId),
    [tournaments, tournamentId]
  );

  const tournamentParticipants = useMemo(
    () => participants.filter((p) => p.tournamentId === tournamentId),
    [participants, tournamentId]
  );

  const tournamentMatches = useMemo(
    () => matches.filter((m) => m.tournamentId === tournamentId),
    [matches, tournamentId]
  );

  const jsonShare = useMemo(
    () =>
      generateShareableJSON(
        tournament ? [tournament] : [],
        tournamentParticipants,
        tournamentMatches
      ),
    [tournament, tournamentParticipants, tournamentMatches]
  );

  const textShare = useMemo(() => {
    if (!tournament) return '';
    return generateTextSummary(
      tournament,
      tournamentParticipants,
      tournamentMatches
    );
  }, [tournament, tournamentParticipants, tournamentMatches]);

  const currentShare = activeTab === 'json' ? jsonShare : textShare;

  const handleCopy = async () => {
    const success = await copyToClipboard(currentShare);
    addToast(
      success ? 'Copied to clipboard' : 'Failed to copy',
      success ? 'success' : 'error'
    );
  };

  const handleNativeShare = async () => {
    const success = await shareTournament(currentShare);
    if (!success) {
      addToast('Share cancelled', 'info');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open" onClick={onClose}>
      <div className="modal-box max-w-lg" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="card-title">Share Tournament</h2>
          <button className="btn btn-ghost btn-sm btn-square" onClick={onClose}>
            <FiX />
          </button>
        </div>

        {tournament && (
          <p className="text-base-content/60 mb-4 text-sm">{tournament.name}</p>
        )}

        <div className="tabs tabs-boxed mb-4">
          <button
            className={`tab ${activeTab === 'json' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('json')}>
            JSON
          </button>
          <button
            className={`tab ${activeTab === 'text' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('text')}>
            Text Summary
          </button>
        </div>

        <div className="bg-base-300 mb-4 max-h-48 overflow-auto rounded-lg p-3">
          <pre className="font-mono text-xs whitespace-pre-wrap">
            {currentShare}
          </pre>
        </div>

        <div className="flex gap-2">
          <button className="btn btn-primary flex-1" onClick={handleCopy}>
            Copy to Clipboard
          </button>
          {typeof navigator !== 'undefined' && 'share' in navigator && (
            <button
              className="btn btn-secondary flex-1"
              onClick={handleNativeShare}>
              Share
            </button>
          )}
        </div>
      </div>
      <div className="modal-backdrop bg-black/50" onClick={onClose} />
    </div>
  );
};

ShareModal.displayName = 'ShareModal';
