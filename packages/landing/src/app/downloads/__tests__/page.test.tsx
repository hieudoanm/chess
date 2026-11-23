import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import Downloads, { metadata } from '../page';

const html = renderToStaticMarkup(<Downloads />);
const RELEASES = 'https://github.com/hieudoanm/chess/releases/latest/download';

describe('downloads page', () => {
  it('exports downloads metadata', () => {
    expect(metadata.title).toBe('Downloads');
    expect(metadata.description).toBeTruthy();
  });

  it('renders the intro with a link to the latest release', () => {
    expect(html).toContain(
      'https://github.com/hieudoanm/chess/releases/latest'
    );
    expect(html).toContain('latest release');
  });

  it('renders the expected sections', () => {
    expect(html).toContain('CLI</h2>');
  });

  it('hides sections that have no assets', () => {
    expect(html).not.toContain('Models</h2>');
    expect(html).not.toContain('Desktop</h2>');
    expect(html).not.toContain('Editor Extensions</h2>');
    expect(html).not.toContain('Browser Extensions</h2>');
  });

  it('links every release asset', () => {
    expect(html).toContain(`${RELEASES}/cli-chess-aarch64-apple-darwin`);
    expect(html).toContain(`${RELEASES}/cli-chess-x86_64-apple-darwin`);
    expect(html).toContain(`${RELEASES}/cli-chess-x86_64-pc-windows-msvc.exe`);
    expect(html).toContain(`${RELEASES}/cli-chess-x86_64-unknown-linux-gnu`);
  });
});
