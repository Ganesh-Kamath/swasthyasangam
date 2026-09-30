import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { CLINICAL_RECORDS_CATALOG, generateAiInsightsForRecords } from './src/data/clinicalCatalog.ts';

const sessionStore: Record<string, any> = {};

// Seed default demo session
const now = Date.now();
const seedDefault = {
  id: 'session-default',
  sessionId: 'SS-4821',
  sessionCode: 'SS-4821',
  patientId: 'pat-rahul-01',
  patientName: 'Rahul Mehta',
  doctorId: 'doc-ananya-01',
  doctorName: 'Dr. Ananya Shah',
  purpose: 'Cardiology consultation',
  recordIds: ['rec-ecg-01', 'rec-lipid-02', 'rec-echo-03'],
  selectedRecordIds: ['rec-ecg-01', 'rec-lipid-02', 'rec-echo-03'],
  durationMinutes: 30,
  createdAt: now,
  expiresAt: now + 30 * 60 * 1000,
  revokedAt: null,
  status: 'active'
};
sessionStore['SS-4821'] = seedDefault;
sessionStore['SS-DEMO-4821'] = { ...seedDefault, sessionId: 'SS-DEMO-4821', sessionCode: 'SS-DEMO-4821' };

const CLINICAL_RECORDS: Record<string, any> = { ...CLINICAL_RECORDS_CATALOG };

const securityHeaders = {
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
  'Surrogate-Control': 'no-store'
};

function authorizeSession(code: string): {
  authorized: boolean;
  httpStatus: number;
  status: 'active' | 'expired' | 'revoked' | 'not_found';
  message: string;
  session?: any;
} {
  const cleanCode = (code || '').trim().toUpperCase();
  if (!cleanCode || cleanCode.includes('INVALID') || cleanCode.includes('DOES-NOT-EXIST')) {
    return {
      authorized: false,
      httpStatus: 404,
      status: 'not_found',
      message: 'This sharing session does not exist or is no longer available.'
    };
  }

  const session = sessionStore[cleanCode];
  if (!session) {
    return {
      authorized: false,
      httpStatus: 404,
      status: 'not_found',
      message: 'This sharing session does not exist or is no longer available.'
    };
  }

  if (session.status === 'revoked' || session.revokedAt) {
    return {
      authorized: false,
      httpStatus: 403,
      status: 'revoked',
      message: 'This temporary sharing session has been revoked by the patient.'
    };
  }

  const serverNow = Date.now();
  if (serverNow >= Number(session.expiresAt)) {
    session.status = 'expired';
    session.selectedRecordIds = [];
    session.recordIds = [];
    return {
      authorized: false,
      httpStatus: 410,
      status: 'expired',
      message: 'This temporary sharing session has expired.'
    };
  }

  return {
    authorized: true,
    httpStatus: 200,
    status: 'active',
    message: 'Session is active and authorized.',
    session
  };
}

function demoSessionSyncPlugin(): Plugin {
  return {
    name: 'demo-session-sync',
    configureServer(server) {
      server.middlewares.use((req: any, res: any, next: any) => {
        const url = new URL(req.url || '', 'http://localhost');
        const pathname = url.pathname;

        // 1. POST /api/session/create
        if (pathname === '/api/session/create' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk: any) => { body += chunk; });
          req.on('end', () => {
            try {
              const data = JSON.parse(body || '{}');
              const code = (data.sessionCode || 'SS-4821').trim().toUpperCase();
              const durationMinutes = Number(data.durationMinutes) || 30;
              const durationMs = data.overrideMs ? Number(data.overrideMs) : durationMinutes * 60 * 1000;
              const curTime = Date.now();
              const expiresAt = curTime + durationMs;
              const selectedRecordIds = data.selectedRecordIds || data.recordIds || ['rec-ecg-01', 'rec-lipid-02', 'rec-echo-03'];

              const session = {
                id: `session-${curTime}`,
                sessionId: code,
                sessionCode: code,
                patientId: data.patientId || 'pat-rahul-01',
                patientName: data.patientName || 'Rahul Mehta',
                doctorId: data.doctorId || 'doc-ananya-01',
                doctorName: data.doctorName || 'Dr. Ananya Shah',
                purpose: data.purpose || 'Cardiology consultation',
                recordIds: selectedRecordIds,
                selectedRecordIds,
                durationMinutes,
                createdAt: curTime,
                expiresAt,
                revokedAt: null,
                status: 'active'
              };

              sessionStore[code] = session;
              res.writeHead(200, securityHeaders);
              res.end(JSON.stringify({
                sessionCode: code,
                accessUrl: `https://swasthyasangam.netlify.app/${code}`,
                expiresAt,
                status: 'active',
                selectedRecordIds
              }));
            } catch (e: any) {
              res.writeHead(400, securityHeaders);
              res.end(JSON.stringify({ error: e.message }));
            }
          });
          return;
        }

        // 2. POST /api/session/:code/revoke
        const revokeMatch = pathname.match(/\/api\/session\/([^/?#]+)\/revoke/i);
        if (revokeMatch && req.method === 'POST') {
          const code = decodeURIComponent(revokeMatch[1]).trim().toUpperCase();
          const session = sessionStore[code];
          if (session) {
            session.status = 'revoked';
            session.revokedAt = Date.now();
            session.selectedRecordIds = [];
            session.recordIds = [];
            res.writeHead(200, securityHeaders);
            res.end(JSON.stringify({ ok: true, sessionCode: code, status: 'revoked' }));
          } else {
            res.writeHead(404, securityHeaders);
            res.end(JSON.stringify({ error: 'Session not found', status: 'not_found' }));
          }
          return;
        }

        // 3. POST /api/session/:code/expire
        const expireMatch = pathname.match(/\/api\/session\/([^/?#]+)\/expire/i);
        if (expireMatch && req.method === 'POST') {
          const code = decodeURIComponent(expireMatch[1]).trim().toUpperCase();
          const session = sessionStore[code];
          if (session) {
            let body = '';
            req.on('data', (chunk: any) => { body += chunk; });
            req.on('end', () => {
              try {
                const data = JSON.parse(body || '{}');
                const seconds = Number(data.seconds) || 15;
                const serverNow = Date.now();
                session.expiresAt = serverNow + seconds * 1000;
                session.status = 'active';
                session.revokedAt = null;
                res.writeHead(200, securityHeaders);
                res.end(JSON.stringify({ ok: true, sessionCode: code, expiresAt: session.expiresAt, seconds, status: 'active' }));
              } catch (e: any) {
                res.writeHead(400, securityHeaders);
                res.end(JSON.stringify({ error: e.message }));
              }
            });
          } else {
            res.writeHead(404, securityHeaders);
            res.end(JSON.stringify({ error: 'Session not found', status: 'not_found' }));
          }
          return;
        }

        // 4. GET /api/session/:code/records
        const recordsMatch = pathname.match(/\/api\/session\/([^/?#]+)\/records/i);
        if (recordsMatch && req.method === 'GET') {
          const code = decodeURIComponent(recordsMatch[1]).trim().toUpperCase();
          const auth = authorizeSession(code);
          if (!auth.authorized) {
            res.writeHead(auth.httpStatus, securityHeaders);
            res.end(JSON.stringify({ status: auth.status, message: auth.message }));
            return;
          }

          const selectedIds = auth.session.selectedRecordIds || auth.session.recordIds || [];
          const authorizedRecords = selectedIds.map((id: string) => CLINICAL_RECORDS[id]).filter(Boolean);
          res.writeHead(200, securityHeaders);
          res.end(JSON.stringify({ sessionCode: code, records: authorizedRecords }));
          return;
        }

        // 5. GET /api/session/:code/report/:id or /document/:id
        const reportMatch = pathname.match(/\/api\/session\/([^/?#]+)\/(?:report|document)\/([^/?#]+)/i);
        if (reportMatch && req.method === 'GET') {
          const code = decodeURIComponent(reportMatch[1]).trim().toUpperCase();
          const resourceId = decodeURIComponent(reportMatch[2]).trim();
          const auth = authorizeSession(code);
          if (!auth.authorized) {
            res.writeHead(auth.httpStatus, securityHeaders);
            res.end(JSON.stringify({ status: auth.status, message: auth.message }));
            return;
          }

          const selectedIds = auth.session.selectedRecordIds || auth.session.recordIds || [];
          if (!selectedIds.includes(resourceId)) {
            res.writeHead(403, securityHeaders);
            res.end(JSON.stringify({ status: 'unauthorized', message: 'Record not authorized for this consultation' }));
            return;
          }

          const report = CLINICAL_RECORDS[resourceId];
          if (!report) {
            res.writeHead(404, securityHeaders);
            res.end(JSON.stringify({ status: 'not_found', message: 'Report not found' }));
            return;
          }

          res.writeHead(200, securityHeaders);
          res.end(JSON.stringify({ sessionCode: code, report }));
          return;
        }

        // 6. GET / POST /api/session/:code/insights
        const insightsMatch = pathname.match(/\/api\/session\/([^/?#]+)\/insights/i);
        if (insightsMatch && (req.method === 'GET' || req.method === 'POST')) {
          const code = decodeURIComponent(insightsMatch[1]).trim().toUpperCase();
          const auth = authorizeSession(code);
          if (!auth.authorized) {
            res.writeHead(auth.httpStatus, securityHeaders);
            res.end(JSON.stringify({ status: auth.status, message: auth.message }));
            return;
          }

          const selectedIds = auth.session.selectedRecordIds || auth.session.recordIds || [];
          const insights = generateAiInsightsForRecords(selectedIds);

          res.writeHead(200, securityHeaders);
          res.end(JSON.stringify({ sessionCode: code, insights }));
          return;
        }

        // 7. GET /api/session/:code
        const getMatch = pathname.match(/\/api\/session\/([^/?#]+)/i);
        if (getMatch && req.method === 'GET' && !pathname.includes('/create')) {
          const code = decodeURIComponent(getMatch[1]).trim().toUpperCase();
          const auth = authorizeSession(code);
          if (!auth.authorized) {
            res.writeHead(auth.httpStatus, securityHeaders);
            res.end(JSON.stringify({ status: auth.status, message: auth.message }));
            return;
          }

          res.writeHead(200, securityHeaders);
          res.end(JSON.stringify(auth.session));
          return;
        }

        // Legacy /api/sync-session compatibility
        if (pathname.startsWith('/api/sync-session')) {
          if (req.method === 'POST') {
            let body = '';
            req.on('data', (chunk: any) => { body += chunk; });
            req.on('end', () => {
              try {
                const session = JSON.parse(body);
                if (session && (session.sessionId || session.sessionCode)) {
                  const key = (session.sessionId || session.sessionCode).toUpperCase();
                  sessionStore[key] = {
                    ...session,
                    sessionId: key,
                    sessionCode: key,
                    recordIds: session.recordIds || session.selectedRecordIds,
                    selectedRecordIds: session.selectedRecordIds || session.recordIds
                  };
                }
                res.writeHead(200, securityHeaders);
                res.end(JSON.stringify({ ok: true }));
              } catch (e) {
                res.writeHead(400);
                res.end();
              }
            });
            return;
          } else if (req.method === 'GET') {
            const id = url.searchParams.get('id')?.toUpperCase();
            const session = id ? sessionStore[id] : null;
            res.writeHead(200, securityHeaders);
            res.end(JSON.stringify(session || null));
            return;
          }
        }

        next();
      });
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), demoSessionSyncPlugin()],
  server: {
    port: 3000,
    open: false
  }
});
