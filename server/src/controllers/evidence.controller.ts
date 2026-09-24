import { Request, Response } from 'express';
import { db } from '../lib/db.js';
import { redactSensitiveText } from '../lib/redactor.js';
import { IngestTextEvidenceSchema } from '../../../shared/schemas.js';

export async function ingestTextEvidence(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.id || 'demo-user-123';
    const caseId = req.params.id;

    // Verify case ownership
    const caseDetails = await db.getCaseById(caseId, userId);
    if (!caseDetails) {
      res.status(404).json({ error: 'Case not found or access denied.' });
      return;
    }

    const parseResult = IngestTextEvidenceSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: 'Validation failed', details: parseResult.error.flatten() });
      return;
    }

    const { artifact_type, source_identifier, raw_text_content } = parseResult.data;

    // PII Redaction Guard pass before storing
    const { redactedText, redactionsCount, detectedTypes } = redactSensitiveText(raw_text_content);

    const artifact = await db.addEvidence({
      case_id: caseId,
      artifact_type,
      source_identifier,
      raw_text_content: redactedText,
      file_storage_path: null,
      file_mime_type: 'text/plain',
      file_size_bytes: Buffer.byteLength(redactedText, 'utf8'),
      parsed_metadata: {
        redactionsApplied: redactionsCount,
        detectedSensitiveTypes: detectedTypes,
        sanitizedAt: new Date().toISOString()
      }
    });

    res.status(201).json(artifact);
  } catch (err) {
    res.status(500).json({ error: 'Failed to ingest text evidence', details: String(err) });
  }
}

export async function uploadEvidenceFile(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.id || 'demo-user-123';
    const caseId = req.params.id;

    // Verify case ownership
    const caseDetails = await db.getCaseById(caseId, userId);
    if (!caseDetails) {
      res.status(404).json({ error: 'Case not found or access denied.' });
      return;
    }

    const file = req.file;
    if (!file) {
      res.status(400).json({ error: 'No file uploaded.' });
      return;
    }

    const sourceIdentifier = (req.body.source_identifier as string) || file.originalname;
    const artifactType = (req.body.artifact_type as string) || 'TRANSACTION_SCREENSHOT';

    // Simulated OCR extraction for image/PDF or text read
    let extractedText = `[Uploaded File: ${file.originalname}]`;
    if (file.mimetype.includes('text')) {
      const rawText = file.buffer ? file.buffer.toString('utf-8') : '';
      const { redactedText } = redactSensitiveText(rawText);
      extractedText = redactedText;
    } else {
      extractedText = `Visual Forensic Artifact: ${file.originalname} (${file.mimetype}, ${(file.size / 1024).toFixed(1)} KB)`;
    }

    const storagePath = `/uploads/${file.filename || file.originalname}`;

    const artifact = await db.addEvidence({
      case_id: caseId,
      artifact_type: artifactType as any,
      source_identifier: sourceIdentifier,
      raw_text_content: extractedText,
      file_storage_path: storagePath,
      file_mime_type: file.mimetype,
      file_size_bytes: file.size,
      parsed_metadata: {
        originalFilename: file.originalname,
        uploadedAt: new Date().toISOString()
      }
    });

    res.status(201).json(artifact);
  } catch (err) {
    res.status(500).json({ error: 'Failed to upload evidence file', details: String(err) });
  }
}

export async function deleteEvidence(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.id || 'demo-user-123';
    const { id: caseId, evidenceId } = req.params;

    const caseDetails = await db.getCaseById(caseId, userId);
    if (!caseDetails) {
      res.status(404).json({ error: 'Case not found or access denied.' });
      return;
    }

    const success = await db.deleteEvidence(evidenceId, caseId);
    if (!success) {
      res.status(404).json({ error: 'Evidence item not found.' });
      return;
    }

    res.json({ message: 'Evidence item deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete evidence item', details: String(err) });
  }
}
