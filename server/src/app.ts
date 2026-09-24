import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import apiRouter from './routes/api.js';

dotenv.config();

const app = express();

// Middleware: Support CORS for any origin in production or local development
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static uploads serving
const uploadsDir = path.resolve(process.cwd(), 'uploads');
app.use('/uploads', express.static(uploadsDir));

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ONLINE',
    system: 'ShieldTrace AI Core',
    timestamp: new Date().toISOString(),
    gemini_connected: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here'),
    environment: process.env.NODE_ENV || 'production'
  });
});

// Root API test
app.get('/api', (_req, res) => {
  res.json({
    status: 'ONLINE',
    message: 'ShieldTrace AI API Gateway'
  });
});

// Master API Routes
app.use('/api', apiRouter);

// Global Error Handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[ShieldTrace Server Error]:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    timestamp: new Date().toISOString()
  });
});

export default app;
