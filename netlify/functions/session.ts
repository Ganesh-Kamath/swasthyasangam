import { getStore } from "@netlify/blobs";
import { CLINICAL_RECORDS_CATALOG, generateAiInsightsForRecords } from "../../src/data/clinicalCatalog";

// In-memory fallback cache (used if Netlify Blobs store is not provisioned or during local simulation)
const memoryStore = new Map<string, any>();


// Seed default demo session
const DEFAULT_CODE = "SS-4821";
const now = Date.now();
const defaultSession = {
  sessionCode: DEFAULT_CODE,
  patientId: "pat-rahul-01",
  patientName: "Rahul Mehta",
  doctorName: "Dr. Ananya Shah",
  purpose: "Remote Cardiology Consultation",
  selectedRecordIds: ["rec-ecg-01", "rec-lipid-02", "rec-echo-03"],
  durationMinutes: 30,
  createdAt: now,
  expiresAt: now + 30 * 60 * 1000,
  revokedAt: null,
  status: "active",
  auditLog: [
    {
      event: "SESSION_CREATED",
      timestamp: now,
      detail: "Session initialized with 3 records",
      actor: "patient"
    }
  ]
};
// Use separate copies so mutations on one don't affect the other
memoryStore.set(DEFAULT_CODE, { ...defaultSession });
memoryStore.set("SS-DEMO-4821", { ...defaultSession, sessionCode: "SS-DEMO-4821" });


// Clinical Medical Records catalog for demo server-side authorization checks
const CLINICAL_RECORDS: Record<string, any> = { ...CLINICAL_RECORDS_CATALOG };

let blobsInitError: string | null = null;

async function getSessionStore() {
  try {
    return getStore({ name: "access_sessions", consistency: "strong" });
  } catch (e: any) {
    blobsInitError = e?.message || String(e);
    return null;
  }
}

async function fetchSession(code: string): Promise<any | null> {
  const cleanCode = code.trim().toUpperCase();
  const store = await getSessionStore();
  if (store) {
    try {
      const data = await store.get(cleanCode, { type: "json" });
      if (data) return data;
    } catch (e: any) {
      blobsInitError = "get failed: " + (e?.message || String(e));
    }
  }
  return memoryStore.get(cleanCode) || null;
}

async function persistSession(code: string, sessionData: any): Promise<void> {
  const cleanCode = code.trim().toUpperCase();
  memoryStore.set(cleanCode, sessionData);
  const store = await getSessionStore();
  if (store) {
    try {
      await store.setJSON(cleanCode, sessionData);
    } catch (e: any) {
      blobsInitError = "setJSON failed: " + (e?.message || String(e));
    }
  }
}

// Append an audit log entry to the session and persist
async function appendAuditEvent(
  code: string,
  session: any,
  event: string,
  detail: string,
  actor: "patient" | "doctor" | "system" = "system"
): Promise<any> {
  if (!session.auditLog) {
    session.auditLog = [];
  }
  session.auditLog.push({
    event,
    timestamp: Date.now(),
    detail,
    actor
  });
  await persistSession(code, session);
  return session;
}

// Strict Cache-Control headers to ensure zero sensitive medical data is cached or replayed
const headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS, PUT",
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  "Pragma": "no-cache",
  "Expires": "0",
  "Surrogate-Control": "no-store"
};

// -------------------------------------------------------------
// CENTRALIZED SERVER-SIDE AUTHORIZATION HELPER
// -------------------------------------------------------------
export interface AuthResult {
  authorized: boolean;
  httpStatus: number;
  status: "active" | "expired" | "revoked" | "not_found";
  message: string;
  session?: any;
}

export async function authorizeSession(rawCode: string): Promise<AuthResult> {
  const cleanCode = (rawCode || "").trim().toUpperCase();
  if (!cleanCode || cleanCode.includes("INVALID") || cleanCode.includes("DOES-NOT-EXIST")) {
    return {
      authorized: false,
      httpStatus: 404,
      status: "not_found",
      message: "This sharing session does not exist or is no longer available."
    };
  }

  const session = await fetchSession(cleanCode);
  if (!session) {
    return {
      authorized: false,
      httpStatus: 404,
      status: "not_found",
      message: "This sharing session does not exist or is no longer available."
    };
  }

  // 1. Check revocation
  if (session.status === "revoked" || session.revokedAt) {
    return {
      authorized: false,
      httpStatus: 403,
      status: "revoked",
      message: "This temporary sharing session has been revoked by the patient."
    };
  }

  // 2. Check expiration against authoritative SERVER TIME
  const serverNow = Date.now();
  if (serverNow >= Number(session.expiresAt)) {
    if (session.status !== "expired") {
      session.status = "expired";
      await appendAuditEvent(cleanCode, session, "SESSION_EXPIRED", "Session expiry threshold crossed — all access terminated", "system");
    }
    return {
      authorized: false,
      httpStatus: 410,
      status: "expired",
      message: "This temporary sharing session has expired."
    };
  }

  // Session is currently active and authorized
  return {
    authorized: true,
    httpStatus: 200,
    status: "active",
    message: "Session is active and authorized.",
    session
  };
}

export default async function handler(req: Request) {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }

  const url = new URL(req.url);
  const originalPath = req.headers.get("x-nf-original-pathname") || req.headers.get("x-original-url") || "";
  const path = originalPath || url.pathname;
  const actionParam = url.searchParams.get("action");
  const codeParam = url.searchParams.get("code");
  const idParam = url.searchParams.get("id");

  // Determine action, session code, and resource ID
  let action = actionParam || "";
  let sessionCode = codeParam || "";
  let resourceId = idParam || "";

  const createMatch = path.match(/\/api\/session\/create/i);
  const revokeMatch = path.match(/\/api\/session\/([^/?#]+)\/revoke/i);
  const expireMatch = path.match(/\/api\/session\/([^/?#]+)\/expire/i);
  const recordsMatch = path.match(/\/api\/session\/([^/?#]+)\/records/i);
  const reportMatch = path.match(/\/api\/session\/([^/?#]+)\/report\/([^/?#]+)/i);
  const documentMatch = path.match(/\/api\/session\/([^/?#]+)\/document\/([^/?#]+)/i);
  const insightsMatch = path.match(/\/api\/session\/([^/?#]+)\/insights/i);
  const auditMatch = path.match(/\/api\/session\/([^/?#]+)\/audit/i);
  const getMatch = path.match(/\/api\/session\/([^/?#]+)/i);

  if (!action) {
    if (createMatch) {
      action = "create";
    } else if (revokeMatch) {
      action = "revoke";
      sessionCode = revokeMatch[1];
    } else if (expireMatch) {
      action = "expire";
      sessionCode = expireMatch[1];
    } else if (recordsMatch) {
      action = "records";
      sessionCode = recordsMatch[1];
    } else if (reportMatch) {
      action = "report";
      sessionCode = reportMatch[1];
      resourceId = reportMatch[2];
    } else if (documentMatch) {
      action = "document";
      sessionCode = documentMatch[1];
      resourceId = documentMatch[2];
    } else if (insightsMatch) {
      action = "insights";
      sessionCode = insightsMatch[1];
    } else if (auditMatch) {
      action = "audit";
      sessionCode = auditMatch[1];
    } else if (getMatch && !path.includes("/create")) {
      action = "get";
      sessionCode = getMatch[1];
    }
  }

  if (sessionCode) {
    sessionCode = sessionCode.trim().toUpperCase();
  }

  if (sessionCode === "DEBUG-BLOBS") {
    const store = await getSessionStore();
    return new Response(JSON.stringify({ blobsInitError, hasBlobs: Boolean(store) }), { status: 200, headers });
  }

  // -------------------------------------------------------------
  // 1. CREATE SESSION: POST /api/session/create
  // -------------------------------------------------------------
  if (action === "create" || (req.method === "POST" && !sessionCode)) {
    try {
      const body = await req.json().catch(() => ({}));
      const selectedRecordIds = Array.isArray(body.selectedRecordIds) && body.selectedRecordIds.length > 0
        ? body.selectedRecordIds
        : ["rec-ecg-01", "rec-lipid-02", "rec-echo-03"];

      const durationMinutes = Number(body.durationMinutes) || 30;
      const purpose = body.purpose || "Remote Cardiology Consultation";
      const overrideMs = body.overrideMs ? Number(body.overrideMs) : undefined;
      const durationMs = overrideMs || durationMinutes * 60 * 1000;

      const code = (body.sessionCode || "SS-4821").trim().toUpperCase();
      const currentTime = Date.now();
      const expiresAt = currentTime + durationMs;

      const newSession = {
        sessionCode: code,
        patientId: body.patientId || "pat-rahul-01",
        patientName: body.patientName || "Rahul Mehta",
        doctorName: body.doctorName || "Dr. Ananya Shah",
        purpose,
        selectedRecordIds,
        durationMinutes,
        createdAt: currentTime,
        expiresAt,
        revokedAt: null,
        status: "active",
        auditLog: [
          {
            event: "SESSION_CREATED",
            timestamp: currentTime,
            detail: `Session created with ${selectedRecordIds.length} authorized record(s) for ${purpose}`,
            actor: "patient"
          }
        ]
      };

      await persistSession(code, newSession);

      const origin = url.origin && !url.origin.includes("localhost")
        ? url.origin
        : "https://swasthyasangam.netlify.app";

      const accessUrl = `${origin}/${code}`;

      return new Response(
        JSON.stringify({
          sessionCode: code,
          accessUrl,
          expiresAt,
          status: "active",
          selectedRecordIds
        }),
        { status: 200, headers }
      );
    } catch (err: any) {
      return new Response(JSON.stringify({ error: err?.message || "Failed to create session" }), {
        status: 400,
        headers
      });
    }
  }

  // -------------------------------------------------------------
  // 2. REVOKE SESSION: POST /api/session/:sessionCode/revoke
  // -------------------------------------------------------------
  if (action === "revoke" || (req.method === "POST" && path.includes("/revoke"))) {
    if (!sessionCode) {
      return new Response(JSON.stringify({ error: "Missing session code" }), { status: 400, headers });
    }

    const session = await fetchSession(sessionCode);
    if (!session) {
      return new Response(JSON.stringify({ error: "Session not found", status: "not_found" }), {
        status: 404,
        headers
      });
    }

    session.status = "revoked";
    session.revokedAt = Date.now();
    await appendAuditEvent(sessionCode, session, "SESSION_REVOKED", "Patient immediately revoked consultation access — all doctor access terminated", "patient");

    return new Response(JSON.stringify({ ok: true, sessionCode: session.sessionCode, status: "revoked" }), {
      status: 200,
      headers
    });
  }

  // -------------------------------------------------------------
  // 3. SIMULATE EXPIRY: POST /api/session/:sessionCode/expire
  // -------------------------------------------------------------
  if (action === "expire" || (req.method === "POST" && path.includes("/expire"))) {
    if (!sessionCode) {
      return new Response(JSON.stringify({ error: "Missing session code" }), { status: 400, headers });
    }

    const session = await fetchSession(sessionCode);
    if (!session) {
      return new Response(JSON.stringify({ error: "Session not found", status: "not_found" }), {
        status: 404,
        headers
      });
    }

    const body = await req.json().catch(() => ({}));
    const seconds = Number(body.seconds) || 15;
    const serverNow = Date.now();
    session.expiresAt = serverNow + seconds * 1000;
    session.status = "active";
    session.revokedAt = null;

    await appendAuditEvent(sessionCode, session, "EXPIRY_SIMULATED", `Demo: session expiry fast-forwarded to ${seconds}s from now`, "patient");

    return new Response(
      JSON.stringify({
        ok: true,
        sessionCode: session.sessionCode,
        expiresAt: session.expiresAt,
        seconds,
        status: "active"
      }),
      { status: 200, headers }
    );
  }

  // -------------------------------------------------------------
  // 4. PROTECTED ENDPOINT: GET /api/session/:sessionCode/records
  // -------------------------------------------------------------
  if (action === "records") {
    const auth = await authorizeSession(sessionCode);
    if (!auth.authorized) {
      return new Response(
        JSON.stringify({
          status: auth.status,
          message: auth.message
        }),
        { status: auth.httpStatus, headers }
      );
    }

    // Record SESSION_ACCESSED event — debounced: only log if no event in the last 60 seconds
    const session = auth.session!;
    const recentAccess = (session.auditLog || [])
      .filter((e: any) => e.event === "SESSION_ACCESSED")
      .sort((a: any, b: any) => b.timestamp - a.timestamp)[0];
    const sixtySecondsAgo = Date.now() - 60_000;
    if (!recentAccess || recentAccess.timestamp < sixtySecondsAgo) {
      await appendAuditEvent(sessionCode, session, "SESSION_ACCESSED", `Doctor accessed session — ${session.selectedRecordIds?.length || 0} record(s) authorized`, "doctor");
    }


    const selectedIds = session.selectedRecordIds || [];
    const authorizedRecords = selectedIds.map((id: string) => CLINICAL_RECORDS[id]).filter(Boolean);

    return new Response(
      JSON.stringify({
        sessionCode: session.sessionCode,
        records: authorizedRecords
      }),
      { status: 200, headers }
    );
  }

  // -------------------------------------------------------------
  // 5. PROTECTED ENDPOINT: GET /api/session/:sessionCode/report/:id & /document/:id
  // -------------------------------------------------------------
  if (action === "report" || action === "document") {
    const auth = await authorizeSession(sessionCode);
    if (!auth.authorized) {
      return new Response(
        JSON.stringify({
          status: auth.status,
          message: auth.message
        }),
        { status: auth.httpStatus, headers }
      );
    }

    const selectedIds = auth.session.selectedRecordIds || [];
    if (!selectedIds.includes(resourceId)) {
      return new Response(
        JSON.stringify({
          status: "unauthorized",
          message: "The requested medical report was not authorized for this consultation."
        }),
        { status: 403, headers }
      );
    }

    const report = CLINICAL_RECORDS[resourceId];
    if (!report) {
      return new Response(
        JSON.stringify({
          status: "not_found",
          message: "Report not found."
        }),
        { status: 404, headers }
      );
    }

    // Record RECORD_VIEWED event
    const session = auth.session!;
    await appendAuditEvent(sessionCode, session, "RECORD_VIEWED", `Doctor viewed: "${report.title}" (${report.category})`, "doctor");

    return new Response(
      JSON.stringify({
        sessionCode: session.sessionCode,
        report
      }),
      { status: 200, headers }
    );
  }

  // -------------------------------------------------------------
  // 6. PROTECTED ENDPOINT: GET /api/session/:sessionCode/insights
  // -------------------------------------------------------------
  if (action === "insights") {
    const auth = await authorizeSession(sessionCode);
    if (!auth.authorized) {
      return new Response(
        JSON.stringify({
          status: auth.status,
          message: auth.message
        }),
        { status: auth.httpStatus, headers }
      );
    }

    const selectedIds = auth.session.selectedRecordIds || [];
    const insights = generateAiInsightsForRecords(selectedIds);

    // Record INSIGHTS_GENERATED event (no sensitive data in audit log)
    const session = auth.session!;
    await appendAuditEvent(sessionCode, session, "INSIGHTS_GENERATED", `Clinical summary generated for ${selectedIds.length} authorized record(s)`, "doctor");

    return new Response(
      JSON.stringify({
        sessionCode: session.sessionCode,
        insights
      }),
      { status: 200, headers }
    );
  }

  // -------------------------------------------------------------
  // 7. AUDIT TRAIL ENDPOINT: GET /api/session/:sessionCode/audit
  //    Returns the full audit log for the patient to review.
  //    The session code itself acts as the credential (patient knows their own code).
  // -------------------------------------------------------------
  if (action === "audit") {
    const cleanCode = sessionCode.trim().toUpperCase();
    const session = await fetchSession(cleanCode);

    if (!session) {
      return new Response(
        JSON.stringify({ status: "not_found", message: "Session not found." }),
        { status: 404, headers }
      );
    }

    const auditLog = session.auditLog || [];
    return new Response(
      JSON.stringify({
        sessionCode: session.sessionCode,
        patientId: session.patientId,
        doctorName: session.doctorName || "Dr. Ananya Shah",
        purpose: session.purpose || "Remote Cardiology Consultation",
        selectedRecordIds: session.selectedRecordIds || session.recordIds || [],
        sessionStatus: session.status,
        createdAt: session.createdAt,
        expiresAt: session.expiresAt,
        revokedAt: session.revokedAt || null,
        auditLog
      }),
      { status: 200, headers }
    );
  }

  // -------------------------------------------------------------
  // 8. GET SESSION: GET /api/session/:sessionCode
  // -------------------------------------------------------------
  if (sessionCode) {
    const auth = await authorizeSession(sessionCode);
    if (!auth.authorized) {
      return new Response(
        JSON.stringify({
          status: auth.status,
          message: auth.message
        }),
        { status: auth.httpStatus, headers }
      );
    }

    return new Response(JSON.stringify(auth.session), { status: 200, headers });
  }

  return new Response(JSON.stringify({ error: "Invalid endpoint" }), { status: 400, headers });
}
