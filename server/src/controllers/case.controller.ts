import { Request, Response } from 'express';
import { db } from '../lib/db.js';
import { CreateCaseSchema, UpdateCaseSchema } from '../../../shared/schemas.js';

export async function createCase(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.id || 'demo-user-123';

    const parseResult = CreateCaseSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: 'Validation failed', details: parseResult.error.flatten() });
      return;
    }

    const {
      title,
      scam_type,
      primary_payment_rail,
      estimated_loss,
      currency,
      incident_start_time,
      incident_end_time,
      victim_narrative
    } = parseResult.data;

    const newCase = await db.createCase({
      user_id: userId,
      title,
      scam_type,
      primary_payment_rail,
      total_financial_loss: estimated_loss,
      currency: currency || 'INR',
      incident_start_time: incident_start_time || new Date().toISOString(),
      incident_end_time: incident_end_time || null,
      status: 'DRAFT',
      victim_narrative,
      ai_summary: null
    });

    res.status(201).json(newCase);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create fraud case', details: String(err) });
  }
}

export async function getCases(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.id || 'demo-user-123';
    const cases = await db.getCasesForUser(userId);
    res.json(cases);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch cases', details: String(err) });
  }
}

export async function getCaseById(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.id || 'demo-user-123';
    const caseId = req.params.id;

    const fullDetails = await db.getCaseById(caseId, userId);
    if (!fullDetails) {
      res.status(404).json({ error: 'Case not found or access denied.' });
      return;
    }

    res.json(fullDetails);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve case details', details: String(err) });
  }
}

export async function updateCase(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.id || 'demo-user-123';
    const caseId = req.params.id;

    const parseResult = UpdateCaseSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: 'Validation failed', details: parseResult.error.flatten() });
      return;
    }

    const updated = await db.updateCase(caseId, userId, parseResult.data);
    if (!updated) {
      res.status(404).json({ error: 'Case not found or access denied.' });
      return;
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update case', details: String(err) });
  }
}

export async function deleteCase(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.id || 'demo-user-123';
    const caseId = req.params.id;

    const deleted = await db.deleteCase(caseId, userId);
    if (!deleted) {
      res.status(404).json({ error: 'Case not found or access denied.' });
      return;
    }

    res.json({ message: 'Case and all associated forensic evidence permanently deleted (Right to be Forgotten).' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete case', details: String(err) });
  }
}
