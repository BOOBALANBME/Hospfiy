import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const PORT = 3000;
const DB_FILE_PATH = path.join(process.cwd(), 'data', 'cloud_hospital_db.json');

// Ensure data directory exists
if (!fs.existsSync(path.join(process.cwd(), 'data'))) {
  fs.mkdirSync(path.join(process.cwd(), 'data'), { recursive: true });
}

// In-memory + persisted cloud database
interface CloudDatabase {
  patients: any[];
  beds: any[];
  devices: any[];
  admissions: any[];
  auditLogs: any[];
  lastUpdated: string;
}

let cloudDb: CloudDatabase = {
  patients: [],
  beds: [],
  devices: [],
  admissions: [],
  auditLogs: [],
  lastUpdated: new Date().toISOString(),
};

// Load existing cloud db from disk if available
try {
  if (fs.existsSync(DB_FILE_PATH)) {
    const raw = fs.readFileSync(DB_FILE_PATH, 'utf-8');
    cloudDb = JSON.parse(raw);
  }
} catch (e) {
  console.warn('Failed to load cloud db file, starting fresh:', e);
}

function saveCloudDb() {
  try {
    cloudDb.lastUpdated = new Date().toISOString();
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(cloudDb, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving cloud db:', err);
  }
}

// Lazy initialization of Gemini client
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({ apiKey });
  }
  return geminiClient;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  // --- API Routes (MUST BE BEFORE VITE MIDDLEWARE) ---

  // Health check
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'Hospify PWA Cloud Server',
      timestamp: new Date().toISOString(),
      offlineCapable: true,
      records: {
        patients: cloudDb.patients.length,
        beds: cloudDb.beds.length,
        devices: cloudDb.devices.length,
      },
    });
  });

  // Pull latest cloud data
  app.get('/api/sync/pull', (req: Request, res: Response) => {
    res.json({
      success: true,
      serverTime: new Date().toISOString(),
      patients: cloudDb.patients,
      beds: cloudDb.beds,
      devices: cloudDb.devices,
      admissions: cloudDb.admissions,
      auditLogs: cloudDb.auditLogs.slice(-50),
    });
  });

  // Push local offline mutations to cloud database
  app.post('/api/sync/push', (req: Request, res: Response) => {
    const { mutations } = req.body;
    if (!Array.isArray(mutations)) {
      return res.status(400).json({ error: 'mutations array required' });
    }

    let appliedCount = 0;
    for (const m of mutations) {
      const { entity, action, entityId, payload } = m;
      if (!entity || !payload) continue;

      if (entity === 'patients') {
        const idx = cloudDb.patients.findIndex((p: any) => p.id === entityId);
        if (action === 'DELETE') {
          if (idx !== -1) cloudDb.patients.splice(idx, 1);
        } else if (idx !== -1) {
          cloudDb.patients[idx] = { ...cloudDb.patients[idx], ...payload };
        } else {
          cloudDb.patients.push(payload);
        }
        appliedCount++;
      } else if (entity === 'beds') {
        const idx = cloudDb.beds.findIndex((b: any) => b.id === entityId);
        if (action === 'DELETE') {
          if (idx !== -1) cloudDb.beds.splice(idx, 1);
        } else if (idx !== -1) {
          cloudDb.beds[idx] = { ...cloudDb.beds[idx], ...payload };
        } else {
          cloudDb.beds.push(payload);
        }
        appliedCount++;
      } else if (entity === 'devices') {
        const idx = cloudDb.devices.findIndex((d: any) => d.id === entityId);
        if (action === 'DELETE') {
          if (idx !== -1) cloudDb.devices.splice(idx, 1);
        } else if (idx !== -1) {
          cloudDb.devices[idx] = { ...cloudDb.devices[idx], ...payload };
        } else {
          cloudDb.devices.push(payload);
        }
        appliedCount++;
      } else if (entity === 'admissions') {
        const idx = cloudDb.admissions.findIndex((a: any) => a.id === entityId);
        if (action === 'DELETE') {
          if (idx !== -1) cloudDb.admissions.splice(idx, 1);
        } else if (idx !== -1) {
          cloudDb.admissions[idx] = { ...cloudDb.admissions[idx], ...payload };
        } else {
          cloudDb.admissions.push(payload);
        }
        appliedCount++;
      } else if (entity === 'auditLogs') {
        cloudDb.auditLogs.push(payload);
        appliedCount++;
      }
    }

    saveCloudDb();

    res.json({
      success: true,
      processedCount: appliedCount,
      serverTime: new Date().toISOString(),
    });
  });

  // Server-side Gemini AI Clinical Assistant Route
  app.post('/api/gemini/clinical-assistant', async (req: Request, res: Response) => {
    try {
      const ai = getGeminiClient();
      if (!ai) {
        return res.status(503).json({
          error: 'GEMINI_API_KEY environment variable is not configured.',
          fallback: true,
        });
      }

      const { prompt, context } = req.body;
      const model = 'gemini-2.5-flash';

      const response = await ai.models.generateContent({
        model,
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `You are BioNutriSense & Hospify Medical Clinical AI Assistant.
Context: ${JSON.stringify(context || {})}
Request: ${prompt || 'Analyze clinical data'}
Provide a concise, scientifically accurate, empathetic response with actionable advice and medical disclaimer.`,
              },
            ],
          },
        ],
      });

      res.json({ text: response.text });
    } catch (err: any) {
      console.error('Gemini API server error:', err);
      res.status(500).json({ error: err?.message || 'Failed to process AI request' });
    }
  });

  // --- Static Asset Serving & SPA Fallback ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Hospify PWA server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
