export const EXTENSION_NAME = 'Chess Unlocked';
export const EXTENSION_VERSION = '0.0.1';

export const CHESS_HOSTS = ['chess.com', 'www.chess.com'] as const;
export const CHESS_MATCHES = [
  '*://chess.com/*',
  '*://www.chess.com/*',
] as const;

export const LICHHESS_BASE = 'https://lichess.org';

export const SETTINGS_STORAGE_KEY = 'chessUnlocked.settings';
export const DATA_ATTRIBUTE = 'data-chess-unlocked';
export const STYLE_ELEMENT_ID = 'chess-unlocked-styles';
export const LINK_CLASS = 'chess-unlocked-link';
