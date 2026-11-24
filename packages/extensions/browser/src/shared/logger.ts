const PREFIX = '[Chess Unlocked]';

export const log = (...args: unknown[]): void => {
  console.log(PREFIX, ...args);
};

export const warn = (...args: unknown[]): void => {
  console.warn(PREFIX, ...args);
};
