import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { requireAuth } from '../middleware/auth.middleware.js';
import { standardApiLimiter, aiForensicLimiter } from '../middleware/rateLimit.middleware.js';
import * as authCtrl from '../controllers/auth.controller.js';
import * as caseCtrl from '../controllers/case.controller.js';
import * as evidenceCtrl from '../controllers/evidence.controller.js';
import * as analysisCtrl from '../controllers/analysis.controller.js';
import * as dossierCtrl from '../controllers/dossier.controller.js';
import { redactSensitiveText } from '../lib/redactor.js';

const router = Router();

// Multer disk storage setup for evidence uploads
const uploadDir = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 } // 25 MB limit
});

// Apply standard rate limiter
router.use(standardApiLimiter);

// 1. Authentication Routes
router.post('/auth/register', authCtrl.register);
router.post('/auth/login', authCtrl.login);
router.get('/auth/me', requireAuth, authCtrl.getMe);

// 2. Fraud Case Management
router.post('/cases', requireAuth, caseCtrl.createCase);
router.get('/cases', requireAuth, caseCtrl.getCases);
router.get('/cases/:id', requireAuth, caseCtrl.getCaseById);
router.patch('/cases/:id', requireAuth, caseCtrl.updateCase);
router.delete('/cases/:id', requireAuth, caseCtrl.deleteCase);

// 3. Evidence Artifact Ingestion
router.post('/cases/:id/evidence/text', requireAuth, evidenceCtrl.ingestTextEvidence);
router.post(
  '/cases/:id/evidence/upload',
  requireAuth,
  upload.single('file'),
  evidenceCtrl.uploadEvidenceFile
);
router.delete('/cases/:id/evidence/:evidenceId', requireAuth, evidenceCtrl.deleteEvidence);

// 4. AI Forensics & Timeline Synthesis
router.post('/cases/:id/analyze', requireAuth, aiForensicLimiter, analysisCtrl.analyzeCaseEvidence);
router.post('/cases/:id/timeline/generate', requireAuth, aiForensicLimiter, analysisCtrl.generateTimeline);
router.patch('/cases/:id/timeline/:eventId', requireAuth, analysisCtrl.updateTimelineEvent);
router.post('/cases/:id/timeline/custom', requireAuth, analysisCtrl.createTimelineEvent);
router.post('/cases/:id/transactions', requireAuth, analysisCtrl.addForensicTransaction);

// 5. Formal Dispute Dossier & PDF Export
router.post('/cases/:id/dossier/generate', requireAuth, aiForensicLimiter, dossierCtrl.generateDossier);
router.get('/cases/:id/dossier/export-pdf', requireAuth, dossierCtrl.exportPdf);

// 6. Security & Redaction Playground
router.post('/redact/preview', (req: Request, res: Response) => {
  const { text } = req.body;
  if (!text) {
    res.status(400).json({ error: 'Text input is required' });
    return;
  }
  const result = redactSensitiveText(text);
  res.json(result);
});

export default router;
