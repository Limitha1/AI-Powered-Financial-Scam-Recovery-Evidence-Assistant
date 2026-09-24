import { Request, Response } from 'express';
import { db } from '../lib/db.js';
import { executeDossierGeneration } from '../lib/gemini.js';
import { generateDossierPdfStream } from '../lib/pdfGenerator.js';

export async function generateDossier(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.id || 'demo-user-123';
    const caseId = req.params.id;

    const caseDetails = await db.getCaseById(caseId, userId);
    if (!caseDetails) {
      res.status(404).json({ error: 'Case not found or access denied.' });
      return;
    }

    const { case: fraudCase, transactions, timeline } = caseDetails;
    let profile = await db.getProfile(userId);
    if (!profile) {
      profile = {
        id: userId,
        full_name: req.user?.full_name || 'Victim Complainant',
        phone_number: '+91-9876543210',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    }

    // Generate formal dispute letter, cybercrime brief, and checklist
    const dossierData = await executeDossierGeneration(
      fraudCase,
      transactions,
      timeline,
      profile
    );

    const newDossiers = [
      {
        case_id: caseId,
        dossier_type: 'BANK_FORMAL_DISPUTE' as const,
        content_markdown: dossierData.formal_bank_dispute_letter,
        generated_json: { checklist: dossierData.immediate_recovery_checklist }
      },
      {
        case_id: caseId,
        dossier_type: 'CYBERCRIME_PORTAL_BRIEF' as const,
        content_markdown: dossierData.cybercrime_portal_narrative,
        generated_json: { checklist: dossierData.immediate_recovery_checklist }
      }
    ];

    const savedDossiers = await db.saveDossiers(caseId, newDossiers);
    await db.updateCase(caseId, userId, { status: 'DOSSIER_GENERATED' });

    res.json({
      dossiers: savedDossiers,
      recovery_checklist: dossierData.immediate_recovery_checklist
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate dispute dossier', details: String(err) });
  }
}

export async function exportPdf(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.id || 'demo-user-123';
    const caseId = req.params.id;

    const caseDetails = await db.getCaseById(caseId, userId);
    if (!caseDetails) {
      res.status(404).json({ error: 'Case not found or access denied.' });
      return;
    }

    let profile = await db.getProfile(userId);
    if (!profile) {
      profile = {
        id: userId,
        full_name: req.user?.full_name || 'Victim Complainant',
        phone_number: '+91-9876543210',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    }

    generateDossierPdfStream(
      {
        caseData: caseDetails.case,
        transactions: caseDetails.transactions,
        timeline: caseDetails.timeline,
        profile,
        dossiers: caseDetails.dossiers
      },
      res
    );
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate PDF dossier', details: String(err) });
  }
}
