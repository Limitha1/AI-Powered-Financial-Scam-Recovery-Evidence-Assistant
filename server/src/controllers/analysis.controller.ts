import { Request, Response } from 'express';
import { db } from '../lib/db.js';
import { executeForensicExtraction, executeTimelineSynthesis } from '../lib/gemini.js';
import {
  UpdateTimelineEventSchema,
  CreateTimelineEventSchema,
  AddForensicTransactionSchema,
  ScamType
} from '../../../shared/schemas.js';

export async function analyzeCaseEvidence(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.id || 'demo-user-123';
    const caseId = req.params.id;

    const caseDetails = await db.getCaseById(caseId, userId);
    if (!caseDetails) {
      res.status(404).json({ error: 'Case not found or access denied.' });
      return;
    }

    const { case: fraudCase, evidence } = caseDetails;

    // Run Gemini 2.5 Flash Structured Extraction
    const extractionResult = await executeForensicExtraction(
      evidence,
      fraudCase.victim_narrative || '',
      fraudCase.scam_type
    );

    // Reconcile and save extracted transactions
    const newTransactions = extractionResult.extracted_transactions.map((tx) => ({
      case_id: caseId,
      evidence_artifact_id: evidence[0]?.id || null,
      transaction_reference: tx.transaction_reference,
      timestamp: tx.timestamp || new Date().toISOString(),
      amount: tx.amount,
      sender_account_masked: tx.sender_account_tail || 'XX' + Math.floor(1000 + Math.random() * 9000),
      sender_bank: tx.sender_bank || 'Primary Bank',
      beneficiary_identifier: tx.beneficiary_identifier,
      beneficiary_bank_or_platform: tx.beneficiary_platform || 'Payment Aggregator',
      is_unauthorized: true
    }));

    const savedTxns = await db.setTransactionsForCase(caseId, newTransactions);

    // Calculate reconciled loss
    const totalReconciledLoss = savedTxns.reduce((acc, curr) => acc + curr.amount, 0);

    // Update case with parsed scam category and summary
    const updatedCase = await db.updateCase(caseId, userId, {
      scam_type: (extractionResult.scam_category as ScamType) || fraudCase.scam_type,
      total_financial_loss: totalReconciledLoss > 0 ? totalReconciledLoss : fraudCase.total_financial_loss,
      ai_summary: extractionResult.summary_of_fraud,
      status: 'TIMELINE_READY'
    });

    res.json({
      extraction: extractionResult,
      transactions: savedTxns,
      case: updatedCase
    });
  } catch (err) {
    res.status(500).json({ error: 'Forensic extraction analysis failed', details: String(err) });
  }
}

export async function generateTimeline(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.id || 'demo-user-123';
    const caseId = req.params.id;

    const caseDetails = await db.getCaseById(caseId, userId);
    if (!caseDetails) {
      res.status(404).json({ error: 'Case not found or access denied.' });
      return;
    }

    const { case: fraudCase, evidence, transactions } = caseDetails;

    // Run Gemini 2.5 Flash Structured Synthesis
    const timelineResult = await executeTimelineSynthesis(
      evidence,
      transactions,
      fraudCase.victim_narrative || '',
      fraudCase.scam_type
    );

    const timelineEvents = timelineResult.events.map((evt, idx) => ({
      case_id: caseId,
      timestamp: evt.timestamp || new Date(Date.now() - (timelineResult.events.length - idx) * 1800000).toISOString(),
      stage: evt.stage,
      headline: evt.headline,
      detailed_description: evt.description,
      source_evidence_ids: evidence.map((e) => e.id),
      involved_entities: evt.involved_entities || [],
      is_verified_by_victim: false,
      sequence_order: idx + 1
    }));

    const savedEvents = await db.setTimelineEvents(caseId, timelineEvents);
    await db.updateCase(caseId, userId, { status: 'TIMELINE_READY' });

    res.json(savedEvents);
  } catch (err) {
    res.status(500).json({ error: 'Forensic timeline synthesis failed', details: String(err) });
  }
}

export async function updateTimelineEvent(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.id || 'demo-user-123';
    const { id: caseId, eventId } = req.params;

    const caseDetails = await db.getCaseById(caseId, userId);
    if (!caseDetails) {
      res.status(404).json({ error: 'Case not found or access denied.' });
      return;
    }

    const parseResult = UpdateTimelineEventSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: 'Validation failed', details: parseResult.error.flatten() });
      return;
    }

    const updated = await db.updateTimelineEvent(eventId, caseId, parseResult.data);
    if (!updated) {
      res.status(404).json({ error: 'Timeline event not found.' });
      return;
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update timeline event', details: String(err) });
  }
}

export async function createTimelineEvent(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.id || 'demo-user-123';
    const caseId = req.params.id;

    const caseDetails = await db.getCaseById(caseId, userId);
    if (!caseDetails) {
      res.status(404).json({ error: 'Case not found or access denied.' });
      return;
    }

    const parseResult = CreateTimelineEventSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: 'Validation failed', details: parseResult.error.flatten() });
      return;
    }

    const currentCount = caseDetails.timeline.length;
    const newEvent = await db.addTimelineEvent({
      case_id: caseId,
      ...parseResult.data,
      sequence_order: currentCount + 1
    });

    res.status(201).json(newEvent);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create timeline event', details: String(err) });
  }
}

export async function addForensicTransaction(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.id || 'demo-user-123';
    const caseId = req.params.id;

    const caseDetails = await db.getCaseById(caseId, userId);
    if (!caseDetails) {
      res.status(404).json({ error: 'Case not found or access denied.' });
      return;
    }

    const parseResult = AddForensicTransactionSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: 'Validation failed', details: parseResult.error.flatten() });
      return;
    }

    const newTx = await db.addTransaction({
      case_id: caseId,
      ...parseResult.data
    });

    // Update case total loss
    const allTxns = [...caseDetails.transactions, newTx];
    const totalLoss = allTxns.reduce((sum, t) => sum + t.amount, 0);
    await db.updateCase(caseId, userId, { total_financial_loss: totalLoss });

    res.status(201).json(newTx);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add forensic transaction', details: String(err) });
  }
}
