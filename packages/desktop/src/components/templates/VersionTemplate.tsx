'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiCheck, FiCopy } from 'react-icons/fi';

export const VersionTemplate: FC<{ version: string }> = ({ version }) => {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(version);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const [year, month, day, hh, mm, ss] = version.split('.');
  const hasSegments = year && month && day;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-4 px-4 py-10 text-center sm:gap-6 sm:px-6 sm:py-16">
      <p className="text-base-content/50 text-xs tracking-[0.2em] uppercase">
        Current deployment
      </p>

      <h1 className="mb-1">Version</h1>

      <div className="border-base-content/10 bg-base-200 w-full max-w-lg overflow-x-auto rounded-2xl border p-4 sm:p-6">
        {hasSegments ? (
          <div className="flex min-w-max items-center justify-center gap-0">
            <Segment value={year} label="Year" primary />
            <Dot />
            <Segment value={month} label="Month" />
            <Dot />
            <Segment value={day} label="Day" />
            {hh && (
              <>
                <Dot />
                <Segment value={hh} label="Hour" />
              </>
            )}
            {mm && (
              <>
                <Dot />
                <Segment value={mm} label="Min" />
              </>
            )}
            {ss && (
              <>
                <Dot />
                <Segment value={ss} label="Sec" />
              </>
            )}
          </div>
        ) : (
          <p className="text-error font-mono text-lg font-bold break-all sm:text-xl">
            {version}
          </p>
        )}
      </div>

      <div className="flex w-full flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <button
          onClick={copy}
          className={`btn btn-sm w-full rounded-full sm:w-auto ${copied ? 'btn-success' : 'btn-primary'}`}>
          {copied ? <FiCheck /> : <FiCopy />}
          {copied ? 'Copied' : 'Copy version'}
        </button>
        <button
          className="btn btn-neutral btn-sm w-full truncate rounded-full sm:w-auto"
          onClick={copy}>
          {version}
        </button>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <span className="border-base-content/20 text-base-content/50 rounded-full border px-3 py-1 text-xs">
          Format: YYYY.MM.DD.hh.mm.ss
        </span>
        <span className="badge badge-neutral rounded-full">Stable</span>
      </div>
    </div>
  );
};

const Segment: FC<{ value: string; label: string; primary?: boolean }> = ({
  value,
  label,
  primary,
}) => (
  <div className="flex flex-col items-center px-2 sm:px-4">
    <span
      className={`font-mono text-xl font-bold sm:text-2xl ${primary ? 'text-primary' : 'text-base-content'}`}>
      {value}
    </span>
    <span className="text-base-content/50 mt-1 hidden text-[10px] tracking-[0.2em] uppercase sm:inline sm:text-xs">
      {label}
    </span>
  </div>
);

const Dot: FC = () => (
  <span className="text-base-content/50 font-mono text-xl">.</span>
);

VersionTemplate.displayName = 'VersionTemplate';
