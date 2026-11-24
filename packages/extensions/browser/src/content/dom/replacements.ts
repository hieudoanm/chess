import {
  DATA_ATTRIBUTE,
  LINK_CLASS,
  STYLE_ELEMENT_ID,
} from '../../shared/constants';
import type {
  FeatureMapping,
  LichessContext,
  Settings,
} from '../../shared/types';
import {
  openLichess,
  planFeatureUrl,
} from '../../integrations/lichess/importer';
import { extractFen } from '../../features/opening-explorer/fen-extractor';
import { extractPgn } from '../../features/game-review/pgn-extractor';
import {
  CANDIDATE_ELEMENTS,
  NAV_CONTAINER,
  type FeatureAnchor,
} from './selectors';

const EXT_ATTR = `${DATA_ATTRIBUTE}-feature`;
const LINK_ATTR = `${DATA_ATTRIBUTE}-link`;

export interface AppliedReplacement {
  featureId: string;
  element: HTMLElement;
}

const ensureStyles = (doc: Document): void => {
  if (doc.getElementById(STYLE_ELEMENT_ID)) return;
  const style = doc.createElement('style');
  style.id = STYLE_ELEMENT_ID;
  style.textContent = `
    .${LINK_CLASS} {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      margin-inline-start: 6px;
      padding: 2px 8px;
      border-radius: 999px;
      border: 1px solid rgba(120, 130, 150, 0.4);
      font-size: 0.78em;
      font-weight: 600;
      line-height: 1.4;
      text-decoration: none;
      color: inherit;
      opacity: 0.85;
      white-space: nowrap;
    }
    .${LINK_CLASS}:hover { opacity: 1; }
    .${LINK_CLASS}::before { content: '↗'; font-size: 0.9em; }
    a[${EXT_ATTR}] { opacity: 0.55; }
  `;
  (doc.head ?? doc.documentElement).appendChild(style);
};

export const clearReplacements = (doc: Document): void => {
  doc.getElementById(STYLE_ELEMENT_ID)?.remove();
  for (const el of doc.querySelectorAll<HTMLElement>(`[${EXT_ATTR}]`)) {
    el.removeAttribute(EXT_ATTR);
    el.style.opacity = '';
  }
  for (const el of doc.querySelectorAll<HTMLElement>(`[${LINK_ATTR}]`)) {
    el.remove();
  }
};

export const findAnchor = (
  anchor: FeatureAnchor,
  doc: Document = document
): HTMLElement | null => {
  for (const selector of anchor.css) {
    const found = doc.querySelector<HTMLElement>(selector);
    if (found) return found;
  }
  if (!anchor.text) return null;
  const scope = doc.querySelector(NAV_CONTAINER) ?? doc.body ?? doc;
  for (const el of scope.querySelectorAll<HTMLElement>(CANDIDATE_ELEMENTS)) {
    const label = (el.textContent ?? '').trim();
    if (label.length > 0 && label.length <= 60 && anchor.text.test(label)) {
      return el;
    }
  }
  return null;
};

const buildContext = (
  doc: Document,
  mapping: FeatureMapping
): LichessContext => {
  const context: LichessContext = {
    url: doc.defaultView?.location.href ?? doc.URL,
    title: doc.title,
  };
  if (!mapping.extract || mapping.extract === 'none') return context;
  if (mapping.extract === 'pgn') {
    const pgn = extractPgn(doc);
    if (pgn) context.pgn = pgn;
    const fen = extractFen(doc);
    if (fen) context.fen = fen;
  } else {
    const fen = extractFen(doc);
    if (fen) context.fen = fen;
  }
  return context;
};

const injectLink = (
  doc: Document,
  anchor: HTMLElement,
  mapping: FeatureMapping,
  context: LichessContext,
  settings: Settings
): HTMLAnchorElement => {
  const plan = planFeatureUrl(
    mapping.lichessPath,
    context,
    settings.transferContext
  );
  const link = doc.createElement('a');
  link.className = LINK_CLASS;
  link.href = plan.url;
  link.target = settings.openInNewTab ? '_blank' : '_self';
  link.rel = 'noopener noreferrer';
  link.textContent = `Lichess ${mapping.label}`;
  link.setAttribute(LINK_ATTR, mapping.id);
  link.setAttribute('title', `Open ${mapping.name} on Lichess`);
  link.addEventListener('click', (event) => {
    if (plan.pgn && settings.transferContext) {
      event.preventDefault();
      openLichess(
        plan.url,
        settings.openInNewTab ? 'new-tab' : 'current',
        plan.pgn
      );
    }
  });
  return link;
};

const placeLink = (anchor: HTMLElement, link: HTMLElement): void => {
  const parent =
    anchor.parentElement ?? anchor.closest('li') ?? anchor.parentNode;
  if (parent instanceof HTMLElement) {
    parent.appendChild(link);
  } else {
    anchor.insertAdjacentElement('afterend', link);
  }
};

export const applyMapping = (
  doc: Document,
  mapping: FeatureMapping,
  settings: Settings
): AppliedReplacement | null => {
  if (!settings.enabled || !settings.features[mapping.id]) return null;
  if (doc.querySelector(`[${LINK_ATTR}="${mapping.id}"]`)) return null;
  const anchor = findAnchor(mapping.anchor, doc);
  if (!anchor) return null;
  ensureStyles(doc);
  const context = buildContext(doc, mapping);
  const link = injectLink(doc, anchor, mapping, context, settings);

  switch (mapping.strategy) {
    case 'navigation':
      anchor.setAttribute(EXT_ATTR, mapping.id);
      anchor.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        window.open(
          link.href,
          settings.openInNewTab ? '_blank' : '_self',
          'noopener'
        );
      });
      break;
    case 'button':
      anchor.setAttribute(EXT_ATTR, mapping.id);
      placeLink(anchor, link);
      break;
    case 'enhancement':
      placeLink(anchor, link);
      break;
  }
  return { featureId: mapping.id, element: link };
};

export const applyReplacements = (
  doc: Document,
  mappings: FeatureMapping[],
  settings: Settings
): AppliedReplacement[] => {
  clearReplacements(doc);
  if (!settings.enabled) return [];
  const applied: AppliedReplacement[] = [];
  for (const mapping of mappings) {
    const result = applyMapping(doc, mapping, settings);
    if (result) applied.push(result);
  }
  return applied;
};
