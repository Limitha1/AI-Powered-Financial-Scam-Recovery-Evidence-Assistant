import { z } from "zod";

// 1. Constants and Taxonomies
export const FRAUD_RAILS = [
  "UPI",
  "CREDIT_CARD",
  "DEBIT_CARD",
  "IMPS_NEFT_RTGS",
  "CRYPTO_P2P",
  "NET_BANKING"
] as const;

export type FraudRail = (typeof FRAUD_RAILS)[number];

export const INCIDENT_STATUSES = [
  "DRAFT",
  "ANALYZING",
  "TIMELINE_READY",
  "DOSSIER_GENERATED",
  "FILED_WITH_BANK",
  "FILED_OFFICIALLY",
  "RESOLVED",
  "CLOSED"
] as const;

export type IncidentStatus = (typeof INCIDENT_STATUSES)[number];

export const EVIDENCE_TYPES = [
  "BANK_SMS",
  "TRANSACTION_SCREENSHOT",
  "CHAT_TRANSCRIPT",
  "CALL_RECORDING_METADATA",
  "EMAIL_RECEIPT",
  "BANK_STATEMENT_PDF",
  "MALICIOUS_APP_INFO"
] as const;

export type EvidenceType = (typeof EVIDENCE_TYPES)[number];

export const SCAM_TYPES = [
  "UPI_COLLECT_REQUEST_FRAUD",
  "DIGITAL_ARREST_IMPERSONATION",
  "REMOTE_ACCESS_MALWARE",
  "INVESTMENT_TASK_SCAM",
  "SIM_SWAP_CREDENTIAL_STUFFING",
  "PHISHING_VISHING_CREDENTIAL_THEFT",
  "OTHER"
] as const;

export type ScamType = (typeof SCAM_TYPES)[number];

export const TIMELINE_STAGES = [
  "FIRST_CONTACT",
  "MANIPULATION",
  "CREDENTIAL_HARVESTING",
  "UNAUTHORIZED_DEBIT",
  "DISCOVERY",
  "CONTAINMENT_ATTEMPT"
] as const;

export type TimelineStage = (typeof TIMELINE_STAGES)[number];

// Scam typology metadata with descriptive titles and advice
export const SCAM_TAXONOMY_DETAILS: Record<
  ScamType,
  { name: string; description: string; commonIndicators: string[]; priorityAction: string }
> = {
  UPI_COLLECT_REQUEST_FRAUD: {
    name: "UPI Collect Request / QR Spoofing",
    description: "Fraudulent debit request disguised as cash-back, lottery prize, or refund credit requiring user PIN.",
    commonIndicators: ["SMS requesting to Approve Request", "Fake QR code sent to scan to receive money", "PIN entered expecting credit"],
    priorityAction: "Block UPI ID instantly on UPI app and initiate bank dispute within 24 hours citing zero-liability."
  },
  DIGITAL_ARREST_IMPERSONATION: {
    name: "Digital Arrest / Law Enforcement Impersonation",
    description: "Coercive psychological entrapment via fake police, CBI, ED, or customs video calls alleging illegal parcels.",
    commonIndicators: ["Fake Skype/WhatsApp video calls in uniform", "Threats of non-bailable warrants", "Demands for RTGS security deposit"],
    priorityAction: "Immediate FIR at cybercrime portal (1930) and formal RTGS recall demand to sending and beneficiary banks."
  },
  REMOTE_ACCESS_MALWARE: {
    name: "Remote-Access Tool / Malicious APK",
    description: "Installation of screen-mirroring apps (AnyDesk, QuickSupport, TeamViewer) or malicious APKs for electricity bill / KYC updates.",
    commonIndicators: ["APK sent via WhatsApp", "Request to install 9-digit code viewer", "Black screen while OTPs are stolen"],
    priorityAction: "Switch device to Airplane mode, unbind SIM, factory reset device, and immediately freeze all linked bank accounts."
  },
  INVESTMENT_TASK_SCAM: {
    name: "Telegram / Part-Time Task & Crypto Ponzi",
    description: "Pretext of Google Maps review tasks, YouTube like tasks, or fake crypto exchange dashboards with locked withdrawals.",
    commonIndicators: ["Telegram group with paid actors", "Initial ₹200-₹500 payouts", "Escalating deposits to unlock profit wallet"],
    priorityAction: "Gather all transaction UTR numbers and file complaint to freeze recipient mule bank accounts."
  },
  SIM_SWAP_CREDENTIAL_STUFFING: {
    name: "SIM Swapping / Telecom Takeover",
    description: "Unauthorized telco porting or eSIM activation allowing attackers to intercept 2FA OTPs.",
    commonIndicators: ["Sudden loss of cell network", "Email alerts for password resets", "Unrecognized logins on banking portal"],
    priorityAction: "Contact telecom carrier emergency hotline to block SIM immediately and request temporary suspension of bank netbanking."
  },
  PHISHING_VISHING_CREDENTIAL_THEFT: {
    name: "Phishing / Vishing / Search Engine Ad Scam",
    description: "Deceptive fake bank portal or spoofed customer care numbers indexed on search engine sponsored ads.",
    commonIndicators: ["Fake netbanking login page", "Caller impersonating bank fraud team", "Urgent request for CVV/OTP"],
    priorityAction: "Immediately block credit/debit card, change netbanking passwords, and issue chargeback notice."
  },
  OTHER: {
    name: "Other Financial Cyber Scam",
    description: "Other unclassified digital financial extortion, romance scam, or unauthorized fund diversion.",
    commonIndicators: ["Social engineering manipulation", "Unauthorized transaction alert"],
    priorityAction: "Log evidence, contact 1930 hotline, and notify bank nodal grievance officer."
  }
};

// 2. Input Validation Schemas
export const CreateCaseSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(120),
  scam_type: z.enum(SCAM_TYPES),
  primary_payment_rail: z.enum(FRAUD_RAILS),
  estimated_loss: z.number().nonnegative("Loss amount cannot be negative"),
  currency: z.string().length(3).default("INR"),
  incident_start_time: z.string().optional(),
  incident_end_time: z.string().optional(),
  victim_narrative: z.string().min(20, "Please describe what happened in as much detail as possible.")
});

export type CreateCaseInput = z.infer<typeof CreateCaseSchema>;

export const UpdateCaseSchema = CreateCaseSchema.partial().extend({
  status: z.enum(INCIDENT_STATUSES).optional(),
  ai_summary: z.string().optional()
});

export type UpdateCaseInput = z.infer<typeof UpdateCaseSchema>;

export const IngestTextEvidenceSchema = z.object({
  artifact_type: z.enum([
    "BANK_SMS",
    "CHAT_TRANSCRIPT",
    "EMAIL_RECEIPT",
    "CALL_RECORDING_METADATA",
    "MALICIOUS_APP_INFO"
  ]),
  source_identifier: z.string().min(2, "Sender or source ID is required"),
  raw_text_content: z.string().min(10, "Evidence text must contain meaningful content")
});

export type IngestTextEvidenceInput = z.infer<typeof IngestTextEvidenceSchema>;

export const UpdateTimelineEventSchema = z.object({
  stage: z.enum(TIMELINE_STAGES).optional(),
  timestamp: z.string().optional(),
  headline: z.string().min(3, "Headline must be at least 3 characters"),
  detailed_description: z.string().min(5, "Description must be at least 5 characters"),
  is_verified_by_victim: z.boolean(),
  involved_entities: z.array(z.string()).optional()
});

export type UpdateTimelineEventInput = z.infer<typeof UpdateTimelineEventSchema>;

export const CreateTimelineEventSchema = z.object({
  stage: z.enum(TIMELINE_STAGES),
  timestamp: z.string(),
  headline: z.string().min(3),
  detailed_description: z.string().min(5),
  involved_entities: z.array(z.string()).default([]),
  source_evidence_ids: z.array(z.string()).default([]),
  is_verified_by_victim: z.boolean().default(true)
});

export type CreateTimelineEventInput = z.infer<typeof CreateTimelineEventSchema>;

export const AddForensicTransactionSchema = z.object({
  transaction_reference: z.string().min(3, "Transaction reference / UTR is required"),
  timestamp: z.string(),
  amount: z.number().positive("Amount must be greater than zero"),
  sender_account_masked: z.string().optional(),
  sender_bank: z.string().optional(),
  beneficiary_identifier: z.string().min(2, "Beneficiary VPA / Account is required"),
  beneficiary_bank_or_platform: z.string().optional(),
  is_unauthorized: z.boolean().default(true),
  evidence_artifact_id: z.string().optional()
});

export type AddForensicTransactionInput = z.infer<typeof AddForensicTransactionSchema>;

// 3. Database Entity Models
export interface Profile {
  id: string;
  full_name: string;
  phone_number?: string | null;
  created_at: string;
  updated_at: string;
}

export interface FraudCase {
  id: string;
  user_id: string;
  title: string;
  scam_type: ScamType;
  primary_payment_rail: FraudRail;
  total_financial_loss: number;
  currency: string;
  incident_start_time?: string | null;
  incident_end_time?: string | null;
  status: IncidentStatus;
  victim_narrative?: string | null;
  ai_summary?: string | null;
  created_at: string;
  updated_at: string;
}

export interface EvidenceArtifact {
  id: string;
  case_id: string;
  artifact_type: EvidenceType;
  source_identifier?: string | null;
  raw_text_content?: string | null;
  file_storage_path?: string | null;
  file_mime_type?: string | null;
  file_size_bytes?: number | null;
  parsed_metadata: Record<string, unknown>;
  created_at: string;
}

export interface ForensicTransaction {
  id: string;
  case_id: string;
  evidence_artifact_id?: string | null;
  transaction_reference: string;
  timestamp: string;
  amount: number;
  sender_account_masked?: string | null;
  sender_bank?: string | null;
  beneficiary_identifier: string;
  beneficiary_bank_or_platform?: string | null;
  is_unauthorized: boolean;
  created_at: string;
}

export interface TimelineEvent {
  id: string;
  case_id: string;
  timestamp: string;
  stage: TimelineStage;
  headline: string;
  detailed_description: string;
  source_evidence_ids: string[];
  involved_entities?: string[];
  is_verified_by_victim: boolean;
  sequence_order: number;
  created_at: string;
}

export interface IncidentDossier {
  id: string;
  case_id: string;
  dossier_type: "BANK_FORMAL_DISPUTE" | "CYBERCRIME_PORTAL_BRIEF" | "LEGAL_TIMELINE_EXPORT";
  content_markdown: string;
  generated_json: Record<string, unknown>;
  created_at: string;
}

// 4. AI Structured Output Types
export interface ScammerIdentifiers {
  phone_numbers: string[];
  vpa_handles: string[];
  urls: string[];
  apps_mentioned: string[];
}

export interface ExtractedTransaction {
  transaction_reference: string;
  timestamp: string;
  amount: number;
  currency?: string;
  sender_bank?: string;
  sender_account_tail?: string;
  beneficiary_identifier: string;
  beneficiary_platform?: string;
}

export interface ForensicExtractionResult {
  scam_category: string;
  scammer_identifiers: ScammerIdentifiers;
  extracted_transactions: ExtractedTransaction[];
  summary_of_fraud: string;
}

export interface SynthesizedTimelineEvent {
  timestamp: string;
  stage: TimelineStage;
  headline: string;
  description: string;
  involved_entities: string[];
}

export interface TimelineSynthesisResult {
  events: SynthesizedTimelineEvent[];
}

export interface RecoveryChecklistItem {
  target: string;
  action_required: string;
  urgency_window: string;
}

export interface DossierGenerationResult {
  formal_bank_dispute_letter: string;
  cybercrime_portal_narrative: string;
  immediate_recovery_checklist: RecoveryChecklistItem[];
}

// 5. Complete Case Data Response
export interface FullCaseDetails {
  case: FraudCase;
  evidence: EvidenceArtifact[];
  transactions: ForensicTransaction[];
  timeline: TimelineEvent[];
  dossiers: IncidentDossier[];
}
