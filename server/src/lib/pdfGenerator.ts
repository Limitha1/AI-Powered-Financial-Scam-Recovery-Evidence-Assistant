import PDFDocument from 'pdfkit';
import { Response } from 'express';
import {
  FraudCase,
  ForensicTransaction,
  TimelineEvent,
  Profile,
  IncidentDossier
} from '../../../shared/schemas.js';

interface DossierPdfPayload {
  caseData: FraudCase;
  transactions: ForensicTransaction[];
  timeline: TimelineEvent[];
  profile: Profile;
  dossiers: IncidentDossier[];
}

export function generateDossierPdfStream(
  payload: DossierPdfPayload,
  res: Response
): void {
  const { caseData, transactions, timeline, profile, dossiers } = payload;

  const doc = new PDFDocument({
    size: 'A4',
    margin: 40,
    info: {
      Title: `ShieldTrace_Dossier_${caseData.id}`,
      Author: 'ShieldTrace AI Forensic Platform',
      Subject: `Dispute Dossier - ${caseData.scam_type}`,
      Keywords: 'Banking Dispute, Zero Liability, Cybercrime FIR, UTR Ledger'
    }
  });

  // Set response headers for streaming PDF download
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="ShieldTrace_Dispute_Dossier_${caseData.id}.pdf"`
  );

  doc.pipe(res);

  // --- BRANDING & HEADER ---
  doc.rect(40, 40, 515, 60).fill('#0F172A');

  doc.fillColor('#06B6D4').fontSize(18).font('Helvetica-Bold')
    .text('SHIELDTRACE AI', 55, 52);
  doc.fillColor('#94A3B8').fontSize(9).font('Helvetica')
    .text('DIGITAL FINANCIAL FORENSICS & STATUTORY DISPUTE DOSSIER', 55, 74);
  doc.fillColor('#EF4444').fontSize(9).font('Helvetica-Bold')
    .text('AUDIT-READY DISPUTE PACKET', 400, 52, { align: 'right', width: 140 });
  doc.fillColor('#E2E8F0').fontSize(8).font('Helvetica')
    .text(`CASE ID: ${caseData.id.slice(0, 16)}...`, 400, 68, { align: 'right', width: 140 });

  doc.moveDown(3);

  // --- METADATA SECTION ---
  doc.fillColor('#0F172A').fontSize(14).font('Helvetica-Bold')
    .text('INCIDENT & COMPLAINANT PARTICULARS', 40, 120);

  doc.strokeColor('#CBD5E1').lineWidth(1)
    .moveTo(40, 138).lineTo(555, 138).stroke();

  let y = 148;
  const drawMetaRow = (label1: string, val1: string, label2: string, val2: string) => {
    doc.fillColor('#475569').fontSize(9).font('Helvetica-Bold').text(label1, 40, y);
    doc.fillColor('#0F172A').fontSize(9).font('Helvetica').text(val1, 140, y);

    doc.fillColor('#475569').fontSize(9).font('Helvetica-Bold').text(label2, 310, y);
    doc.fillColor('#0F172A').fontSize(9).font('Helvetica').text(val2, 420, y);
    y += 18;
  };

  drawMetaRow('Complainant:', profile.full_name, 'Contact Phone:', profile.phone_number || 'N/A');
  drawMetaRow('Scam Typology:', caseData.scam_type.replace(/_/g, ' '), 'Payment Rail:', caseData.primary_payment_rail);
  drawMetaRow('Total Disputed Loss:', `${caseData.currency} ${caseData.total_financial_loss.toLocaleString('en-IN')}`, 'Incident Date:', new Date(caseData.incident_start_time || caseData.created_at).toLocaleDateString('en-IN'));
  drawMetaRow('Statutory Deadline:', 'Within 3 Days (RBI Zero-Liab)', 'Current Status:', caseData.status);

  y += 10;

  // --- FORENSIC TRANSACTIONS LEDGER ---
  doc.fillColor('#0F172A').fontSize(13).font('Helvetica-Bold')
    .text('RECONCILED FORENSIC TRANSACTION LEDGER', 40, y);
  y += 18;

  // Table header
  doc.rect(40, y, 515, 20).fill('#F1F5F9');
  doc.fillColor('#334155').fontSize(8).font('Helvetica-Bold');
  doc.text('#', 45, y + 5);
  doc.text('UTR / RRN REFERENCE', 65, y + 5);
  doc.text('AMOUNT', 190, y + 5);
  doc.text('DEBIT SOURCE', 260, y + 5);
  doc.text('DESTINATION BENEFICIARY', 370, y + 5);
  doc.text('STATUS', 495, y + 5);
  y += 22;

  if (transactions.length === 0) {
    doc.fillColor('#64748B').fontSize(8).font('Helvetica-Oblique')
      .text('No explicit transaction artifacts cataloged. Disputed loss reported from primary narrative.', 45, y);
    y += 20;
  } else {
    transactions.forEach((tx, idx) => {
      doc.rect(40, y, 515, 18).fill(idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC');
      doc.fillColor('#0F172A').fontSize(8).font('Helvetica');
      doc.text(`${idx + 1}`, 45, y + 4);
      doc.font('Helvetica-Bold').text(tx.transaction_reference, 65, y + 4).font('Helvetica');
      doc.text(`INR ${tx.amount.toLocaleString('en-IN')}`, 190, y + 4);
      doc.text(`${tx.sender_bank || 'Victim Bank'} (${tx.sender_account_masked || 'Primary'})`, 260, y + 4);
      doc.text(tx.beneficiary_identifier, 370, y + 4);
      doc.fillColor('#DC2626').text('UNAUTHORIZED', 495, y + 4);
      y += 18;
    });
  }

  y += 15;

  // --- RECONSTRUCTED TIMELINE ---
  doc.fillColor('#0F172A').fontSize(13).font('Helvetica-Bold')
    .text('CHRONOLOGICAL FORENSIC TIMELINE', 40, y);
  y += 18;

  timeline.slice(0, 6).forEach((evt, idx) => {
    if (y > 700) {
      doc.addPage();
      y = 50;
    }

    doc.circle(48, y + 6, 4).fill('#06B6D4');
    doc.fillColor('#0284C7').fontSize(8).font('Helvetica-Bold')
      .text(`[${evt.stage}] ${new Date(evt.timestamp).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}`, 60, y + 2);
    y += 12;

    doc.fillColor('#0F172A').fontSize(9).font('Helvetica-Bold')
      .text(evt.headline, 60, y);
    y += 13;

    doc.fillColor('#475569').fontSize(8).font('Helvetica')
      .text(evt.detailed_description, 60, y, { width: 490 });
    y += 20;
  });

  // --- FORMAL BANK DISPUTE LETTER ---
  doc.addPage();
  y = 50;

  doc.fillColor('#0F172A').fontSize(14).font('Helvetica-Bold')
    .text('FORMAL DISPUTE LETTER (BANK NODAL OFFICER)', 40, y);
  y += 20;

  const bankDossier = dossiers.find((d) => d.dossier_type === 'BANK_FORMAL_DISPUTE');
  const letterBody = bankDossier ? bankDossier.content_markdown : `
To: The Principal Nodal Officer / Fraud Risk Cell
Subject: Formal Dispute of Unauthorized Electronic Transactions under RBI Zero-Liability Guidelines.

I hereby dispute the unauthorized fund transfers totaling INR ${caseData.total_financial_loss.toLocaleString('en-IN')}.
Under Reserve Bank of India Circular DBR.No.Leg.BC.78/09.07.005/2017-18, customer liability is ZERO when reported promptly.

Demand is hereby placed to:
1. Immediately issue a grievance ticket number.
2. Mark a debit lien on suspect beneficiary accounts.
3. Initiate transaction recall through NPCI.
`;

  // Clean markdown formatting for raw text rendering
  const cleanLetter = letterBody
    .replace(/^#+\s/gm, '')
    .replace(/\*\*/g, '')
    .replace(/\*/g, '');

  doc.fillColor('#1E293B').fontSize(9).font('Helvetica')
    .text(cleanLetter, 40, y, { width: 515, lineGap: 3 });

  // --- STATUTORY DECLARATION & SIGNATURE ---
  doc.moveDown(2);
  const signatureY = Math.min(doc.y + 20, 720);

  doc.strokeColor('#CBD5E1').lineWidth(1)
    .moveTo(40, signatureY).lineTo(240, signatureY).stroke();

  doc.fillColor('#0F172A').fontSize(9).font('Helvetica-Bold')
    .text(profile.full_name, 40, signatureY + 5);
  doc.fillColor('#64748B').fontSize(8).font('Helvetica')
    .text('Complainant Signature & Declaration', 40, signatureY + 18);
  doc.text(`Digital Verification Timestamp: ${new Date().toISOString()}`, 40, signatureY + 28);

  doc.end();
}
