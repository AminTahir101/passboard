interface Entry {
  count: number;
  firstAttempt: number;
  lockedUntil?: number;
}

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 5;
const LOCK_MS = 15 * 60 * 1000;   // 15-minute lockout

const store = new Map<string, Entry>();

function cleanup() {
  const now = Date.now();
  for (const [key, entry] of store) {
    const expired = entry.lockedUntil
      ? entry.lockedUntil < now
      : now - entry.firstAttempt > WINDOW_MS;
    if (expired) store.delete(key);
  }
}

export function checkRateLimit(key: string): { allowed: boolean; retryAfterSec?: number } {
  cleanup();
  const entry = store.get(key);
  if (!entry?.lockedUntil) return { allowed: true };
  const now = Date.now();
  if (now < entry.lockedUntil) {
    return { allowed: false, retryAfterSec: Math.ceil((entry.lockedUntil - now) / 1000) };
  }
  store.delete(key);
  return { allowed: true };
}

export function recordFailure(key: string): { locked: boolean } {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now - entry.firstAttempt > WINDOW_MS) {
    store.set(key, { count: 1, firstAttempt: now });
    return { locked: false };
  }

  const count = entry.count + 1;
  if (count >= MAX_ATTEMPTS) {
    store.set(key, { count, firstAttempt: entry.firstAttempt, lockedUntil: now + LOCK_MS });
    return { locked: true };
  }

  store.set(key, { ...entry, count });
  return { locked: false };
}

export function clearAttempts(key: string) {
  store.delete(key);
}
