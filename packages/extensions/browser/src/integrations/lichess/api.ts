const STATUS_URL = 'https://lichess.org/api/status';
const TIMEOUT_MS = 5000;

export interface LichessStatus {
  ok: boolean;
  message: string;
}

export const checkLichessStatus = async (): Promise<LichessStatus> => {
  try {
    const response = await fetch(STATUS_URL, {
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!response.ok) {
      return { ok: false, message: `HTTP ${response.status}` };
    }
    const data = (await response.json()) as { uptime?: number };
    if (typeof data.uptime !== 'number') {
      return { ok: false, message: 'Unexpected response' };
    }
    return { ok: true, message: 'Online' };
  } catch {
    return { ok: false, message: 'Unreachable' };
  }
};
