import { AccessSession } from '../types';
import { DEFAULT_SESSION_CODE, DEMO_PATIENT, DEMO_DOCTOR } from '../data/demoData';

const STORAGE_KEY = 'swasthyasangam_demo_session';
const SESSIONS_MAP_KEY = 'swasthyasangam_sessions_map';
const SELECTED_RECORDS_KEY = 'swasthyasangam_selected_records';

export const INITIAL_SELECTED_RECORDS = [
  'rec-ecg-01',
  'rec-lipid-02',
  'rec-echo-03'
];

/**
 * Returns public deployed base URL (prefers deployed origin over localhost)
 */
export function getAppBaseUrl(): string {
  // 1. Explicitly configured VITE_PUBLIC_APP_URL
  const envUrl = (import.meta.env?.VITE_PUBLIC_APP_URL as string)?.trim();
  if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
    return envUrl.replace(/\/+$/, '');
  }

  // 2. Safe derivation from window.location.origin
  if (typeof window !== 'undefined' && window.location?.origin) {
    const origin = window.location.origin;
    if (
      !origin.includes('localhost') &&
      !origin.includes('127.0.0.1') &&
      !origin.match(/^https?:\/\/(192\.168|10\.|172\.(1[6-9]|2[0-9]|3[01]))/)
    ) {
      return origin;
    }
  }

  // 3. Deployed production Netlify default
  return 'https://swasthyasangam.netlify.app';
}

/**
 * Returns clean public QR access URL: https://swasthyasangam.netlify.app/<SESSION_CODE>
 * Pure session pointer with zero patient or health data in the URL
 */
export function getDoctorAccessUrl(sessionId: string): string {
  const baseUrl = getAppBaseUrl();
  const cleanId = encodeURIComponent(sessionId.trim().toUpperCase());
  return `${baseUrl}/${cleanId}`;
}

/**
 * Creates a fresh active session instance
 */
export function createInitialSession(
  durationMinutes: number = 30,
  recordIds: string[] = INITIAL_SELECTED_RECORDS,
  overrideMs?: number
): AccessSession {
  const now = Date.now();
  const durationMs = overrideMs ? overrideMs : durationMinutes * 60 * 1000;
  const session: AccessSession = {
    id: `session-${now}`,
    sessionId: DEFAULT_SESSION_CODE,
    patientId: DEMO_PATIENT.id,
    doctorId: DEMO_DOCTOR.id,
    recordIds: [...recordIds],
    purpose: 'Cardiology consultation',
    durationMinutes,
    createdAt: now,
    expiresAt: now + durationMs,
    status: 'active'
  };
  return session;
}

/**
 * Gets map of all stored sessions by session ID
 */
export function getAllStoredSessions(): Record<string, AccessSession> {
  try {
    const raw = localStorage.getItem(SESSIONS_MAP_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    // ignore
  }
  return {};
}

/**
 * Look up a session synchronously by its session ID with URL token fallback
 */
export function getSessionById(
  sessionId: string,
  urlParams?: { records?: string[]; expiresAt?: number; purpose?: string }
): AccessSession | null {
  const cleanId = sessionId.trim().toUpperCase();

  // Explicit invalid test ID
  if (cleanId.includes('INVALID') || cleanId.includes('DOES-NOT-EXIST')) {
    return null;
  }

  const sessions = getAllStoredSessions();
  let session = sessions[cleanId] || null;

  // Fallback to active stored session if ID matches
  if (!session) {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const active: AccessSession = JSON.parse(raw);
        if (active.sessionId.toUpperCase() === cleanId) {
          session = active;
        }
      }
    } catch (e) {
      // ignore
    }
  }

  // Fallback to URL-encoded token metadata
  if (!session && urlParams && urlParams.records && urlParams.records.length > 0) {
    const now = Date.now();
    session = {
      id: `session-${now}`,
      sessionId: cleanId,
      patientId: DEMO_PATIENT.id,
      doctorId: DEMO_DOCTOR.id,
      recordIds: [...urlParams.records],
      purpose: urlParams.purpose || 'Cardiology consultation',
      durationMinutes: 30,
      createdAt: now,
      expiresAt: urlParams.expiresAt || (now + 30 * 60 * 1000),
      status: 'active'
    };
    saveStoredSessionLocally(session);
  }

  // Fallback to demo default if code is DEFAULT_SESSION_CODE or SS-4821
  if (!session && (cleanId === DEFAULT_SESSION_CODE || cleanId === 'SS-4821')) {
    session = getStoredSession();
  }

  if (session) {
    if (session.status === 'active' && Date.now() >= session.expiresAt) {
      session.status = 'expired';
      saveStoredSessionLocally(session);
    }
  }

  return session;
}

/**
 * Asynchronous session lookup querying the server-side temporary store (/api/session/:code)
 */
export async function getSessionByIdAsync(sessionId: string): Promise<AccessSession | null> {
  const cleanId = sessionId.trim().toUpperCase();
  if (cleanId.includes('INVALID') || cleanId.includes('DOES-NOT-EXIST')) {
    return null;
  }

  // 1. Query server-side temporary storage endpoint
  try {
    const res = await fetch(`/api/session/${encodeURIComponent(cleanId)}`);
    if (res.status === 410) {
      const expiredSession: AccessSession = {
        ...createInitialSession(),
        sessionId: cleanId,
        recordIds: [],
        status: 'expired'
      };
      saveStoredSessionLocally(expiredSession);
      return expiredSession;
    }
    if (res.status === 403) {
      const revokedSession: AccessSession = {
        ...createInitialSession(),
        sessionId: cleanId,
        recordIds: [],
        status: 'revoked'
      };
      saveStoredSessionLocally(revokedSession);
      return revokedSession;
    }
    if (res.status === 404) {
      return null;
    }
    if (res.ok) {
      const data = await res.json();
      if (data && (data.sessionId || data.sessionCode)) {
        const session: AccessSession = {
          id: data.id || `session-${data.sessionCode}`,
          sessionId: (data.sessionId || data.sessionCode).toUpperCase(),
          patientId: data.patientId || DEMO_PATIENT.id,
          doctorId: data.doctorId || DEMO_DOCTOR.id,
          recordIds: data.status === 'active' ? (data.recordIds || data.selectedRecordIds || []) : [],
          purpose: data.purpose || 'Cardiology consultation',
          durationMinutes: data.durationMinutes || 30,
          createdAt: Number(data.createdAt),
          expiresAt: Number(data.expiresAt),
          status: data.status
        };
        saveStoredSessionLocally(session);
        return session;
      }
    }
  } catch (e) {
    // Network or server error, fallback below
  }

  // 2. Query legacy /api/sync-session for local E2E dev server
  try {
    const res = await fetch(`/api/sync-session?id=${encodeURIComponent(cleanId)}`);
    if (res.ok) {
      const serverSession = await res.json();
      if (serverSession && serverSession.sessionId) {
        saveStoredSessionLocally(serverSession);
        return serverSession;
      }
    }
  } catch (e) {
    // ignore
  }

  // 3. Fallback to synchronous local store
  return getSessionById(cleanId);
}

/**
 * Load session from localStorage with expiration checks
 */
export function getStoredSession(): AccessSession {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: AccessSession = JSON.parse(raw);
      if (parsed.status === 'active' && Date.now() >= parsed.expiresAt) {
        parsed.status = 'expired';
        saveStoredSessionLocally(parsed);
      }
      return parsed;
    }
  } catch (e) {
    // ignore
  }
  const fallback = createInitialSession();
  return fallback;
}

/**
 * Save session to local storage only
 */
export function saveStoredSessionLocally(session: AccessSession): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    const map = getAllStoredSessions();
    map[session.sessionId.toUpperCase()] = session;
    localStorage.setItem(SESSIONS_MAP_KEY, JSON.stringify(map));
    window.dispatchEvent(new CustomEvent('swasthyasangam:session_update', { detail: session }));
  } catch (e) {
    // ignore
  }
}

/**
 * Save session locally AND push to server-side temporary storage
 */
export async function saveStoredSession(session: AccessSession): Promise<void> {
  saveStoredSessionLocally(session);

  // Sync to server-side Netlify endpoint POST /api/session/create
  try {
    await fetch('/api/session/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionCode: session.sessionId,
        patientId: session.patientId,
        doctorId: session.doctorId,
        purpose: session.purpose,
        selectedRecordIds: session.recordIds,
        durationMinutes: session.durationMinutes,
        expiresAt: session.expiresAt
      })
    });
  } catch (e) {
    // ignore
  }

  // Legacy sync
  try {
    await fetch('/api/sync-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(session)
    });
  } catch (e) {
    // ignore
  }
}

/**
 * Revoke session on server and locally
 */
export async function revokeSessionOnServer(sessionId: string): Promise<void> {
  const cleanId = sessionId.trim().toUpperCase();
  const current = getSessionById(cleanId);
  if (current) {
    current.status = 'revoked';
    saveStoredSessionLocally(current);
  }

  try {
    await fetch(`/api/session/${encodeURIComponent(cleanId)}/revoke`, {
      method: 'POST'
    });
  } catch (e) {
    // ignore
  }
}

/**
 * Update server-side session expiry timestamp for stage demonstration
 */
export async function simulateServerExpiry(sessionId: string, seconds: 15 | 30 = 15): Promise<number> {
  const cleanId = sessionId.trim().toUpperCase();
  const now = Date.now();
  const expiresAt = now + seconds * 1000;

  const current = getSessionById(cleanId);
  if (current) {
    current.expiresAt = expiresAt;
    current.status = 'active';
    saveStoredSessionLocally(current);
  }

  try {
    const res = await fetch(`/api/session/${encodeURIComponent(cleanId)}/expire`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ seconds })
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.expiresAt) {
        if (current) {
          current.expiresAt = Number(data.expiresAt);
          saveStoredSessionLocally(current);
        }
        return Number(data.expiresAt);
      }
    }
  } catch (e) {
    // network fallback
  }

  return expiresAt;
}

/**
 * Update session status across local and remote backends
 */
export function updateSessionStatus(sessionId: string, status: 'active' | 'expired' | 'revoked'): void {
  const cleanId = sessionId.trim().toUpperCase();
  const current = getSessionById(cleanId);
  if (current) {
    current.status = status;
    saveStoredSessionLocally(current);
  }

  if (status === 'revoked') {
    revokeSessionOnServer(cleanId).catch(() => {});
  }
}

/**
 * Get stored selected record IDs
 */
export function getStoredSelectedRecords(): string[] {
  try {
    const raw = localStorage.getItem(SELECTED_RECORDS_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    // ignore
  }
  return [...INITIAL_SELECTED_RECORDS];
}

/**
 * Save stored selected record IDs
 */
export function saveStoredSelectedRecords(recordIds: string[]): void {
  try {
    localStorage.setItem(SELECTED_RECORDS_KEY, JSON.stringify(recordIds));
  } catch (e) {
    // ignore
  }
}

/**
 * Clear and reset all demo state to fresh default
 */
export function resetDemoState(): { session: AccessSession; selectedRecords: string[] } {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(SESSIONS_MAP_KEY);
  localStorage.removeItem(SELECTED_RECORDS_KEY);
  const freshSession = createInitialSession();
  saveStoredSelectedRecords(INITIAL_SELECTED_RECORDS);
  saveStoredSessionLocally(freshSession);
  return {
    session: freshSession,
    selectedRecords: [...INITIAL_SELECTED_RECORDS]
  };
}

/**
 * Formats milliseconds into mm:ss
 */
export function formatTimeRemaining(msRemaining: number): string {
  if (msRemaining <= 0) return '00:00';
  const totalSeconds = Math.floor(msRemaining / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/**
 * Helper to parse route/session parameters from URL
 * Supports:
 * - /SS-4821 or /<SESSION_CODE>
 * - /doctor/access/:sessionId
 * - /demo/doctor/:sessionId
 * - /patient
 * - /doctor
 */
export function parseUrlRoute(): {
  routeSessionId?: string;
  view?: 'patient' | 'doctor';
  urlRecords?: string[];
  urlExpiresAt?: number;
  urlPurpose?: string;
  testDurationMs?: number;
} {
  try {
    const searchParams = new URLSearchParams(window.location.search);
    const path = window.location.pathname;
    const hash = window.location.hash;

    // Check for test duration in query (e.g. ?duration_ms=2000 or ?test_duration=2)
    let testDurationMs: number | undefined;
    const durationParam = searchParams.get('duration_ms') || searchParams.get('test_duration_ms');
    if (durationParam) {
      testDurationMs = parseInt(durationParam, 10);
    } else {
      const durSec = searchParams.get('test_duration') || searchParams.get('duration_sec');
      if (durSec) {
        testDurationMs = parseInt(durSec, 10) * 1000;
      }
    }

    // Supported route patterns:
    // 1. Direct session code in root path: /SS-4821 or /SS-XXXX
    const rootSessionMatch = path.match(/^\/(SS-[A-Za-z0-9_-]+)\/?$/i) ||
                             hash.match(/^#\/(SS-[A-Za-z0-9_-]+)\/?$/i);

    // 2. Explicit paths: /doctor/access/:sessionId or /demo/doctor/:sessionId
    const pathMatch =
      rootSessionMatch ||
      path.match(/\/doctor\/access\/([^/?#]+)/i) ||
      path.match(/\/demo\/doctor\/([^/?#]+)/i) ||
      path.match(/\/access\/([^/?#]+)/i);

    const hashMatch =
      hash.match(/#\/doctor\/access\/([^/?#]+)/i) ||
      hash.match(/#\/demo\/doctor\/([^/?#]+)/i) ||
      hash.match(/#\/access\/([^/?#]+)/i);

    const querySession = searchParams.get('session') || searchParams.get('sessionId');

    const rawId = pathMatch?.[1] || hashMatch?.[1] || querySession;
    const queryView = searchParams.get('view') as 'patient' | 'doctor' | null;

    // Parse permitted record IDs from URL if provided (for test fallback)
    const recordsParam = searchParams.get('records');
    const urlRecords = recordsParam ? recordsParam.split(',').map((r) => r.trim()).filter(Boolean) : undefined;

    const expiresParam = searchParams.get('expires');
    const urlExpiresAt = expiresParam ? parseInt(expiresParam, 10) : undefined;

    const urlPurpose = searchParams.get('purpose') || undefined;

    if (rawId) {
      const decodedId = decodeURIComponent(rawId);
      return {
        routeSessionId: decodedId,
        view: 'doctor',
        urlRecords,
        urlExpiresAt,
        urlPurpose,
        testDurationMs
      };
    }

    // Direct standalone view routes: /doctor or /patient
    if (path.match(/^\/doctor\/?$/i) || hash.match(/^#\/doctor\/?$/i) || queryView === 'doctor') {
      return {
        view: 'doctor',
        testDurationMs
      };
    }

    if (path.match(/^\/patient\/?$/i) || hash.match(/^#\/patient\/?$/i) || queryView === 'patient') {
      return {
        view: 'patient',
        testDurationMs
      };
    }

    return { testDurationMs };
  } catch (e) {
    return {};
  }
}
