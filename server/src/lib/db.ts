import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { supabaseAdmin, hasSupabaseConfig } from './supabaseAdmin.js';
import {
  Profile,
  FraudCase,
  EvidenceArtifact,
  ForensicTransaction,
  TimelineEvent,
  IncidentDossier,
  FullCaseDetails
} from '../../../shared/schemas.js';

interface DatabaseSchema {
  profiles: Profile[];
  fraud_cases: FraudCase[];
  evidence_artifacts: EvidenceArtifact[];
  forensic_transactions: ForensicTransaction[];
  timeline_events: TimelineEvent[];
  incident_dossiers: IncidentDossier[];
}

const DB_FILE_PATH = path.resolve(process.cwd(), 'data_store.json');

// Ensure local persistent JSON file exists for zero-config fallback
function initLocalStore(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_FILE_PATH)) {
      const data = fs.readFileSync(DB_FILE_PATH, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Failed to read local store, re-initializing:', err);
  }

  const initial: DatabaseSchema = {
    profiles: [
      {
        id: 'demo-user-123',
        full_name: 'Rahul Sharma',
        phone_number: '+91-9876543210',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ],
    fraud_cases: [
      {
        id: 'case-demo-001',
        user_id: 'demo-user-123',
        title: 'Unauthorized UPI Collect Request Debit - Electricity Bill Pretext',
        scam_type: 'UPI_COLLECT_REQUEST_FRAUD',
        primary_payment_rail: 'UPI',
        total_financial_loss: 45000,
        currency: 'INR',
        incident_start_time: new Date(Date.now() - 36 * 3600000).toISOString(),
        incident_end_time: new Date(Date.now() - 35 * 3600000).toISOString(),
        status: 'TIMELINE_READY',
        victim_narrative: 'Received an SMS stating electricity power would be disconnected at 9:30 PM due to unpaid bill of Rs 12. Called the provided number. The person instructed me to pay Rs 10 via UPI to update bill KYC. They sent a collect request on PhonePe for Rs 45,000 disguised as refund verification. I entered PIN under duress and the money was debited immediately to suspect VPA.',
        ai_summary: 'Targeted spear-phishing and UPI collect request fraud impersonating state electricity board. Extracted UTR 423984129482 for Rs 45,000 to fraud mule VPA.',
        created_at: new Date(Date.now() - 24 * 3600000).toISOString(),
        updated_at: new Date(Date.now() - 2 * 3600000).toISOString()
      }
    ],
    evidence_artifacts: [
      {
        id: 'ev-001',
        case_id: 'case-demo-001',
        artifact_type: 'BANK_SMS',
        source_identifier: 'VK-HDFCBK',
        raw_text_content: 'Dear Customer, your HDFC Bank A/c ending with XX4102 has been debited for Rs 45,000.00 on 24-Sep-24 via UPI. Ref UTR: 423984129482. Transferred to power.discom.refund@okaxis. Call 18002586161 if unauthorized.',
        parsed_metadata: { utr: '423984129482', amount: 45000, vpa: 'power.discom.refund@okaxis' },
        created_at: new Date(Date.now() - 24 * 3600000).toISOString()
      },
      {
        id: 'ev-002',
        case_id: 'case-demo-001',
        artifact_type: 'CHAT_TRANSCRIPT',
        source_identifier: '+91-9876543210 (WhatsApp)',
        raw_text_content: 'Caller claiming to be Discom Officer Sharma: "Sir please approve the collect request of Rs 10 immediately, otherwise your substation power relay will trigger cutoff in 15 mins. Enter your security PIN on screen."',
        parsed_metadata: { phone: '+91-9876543210', sender: 'Officer Sharma' },
        created_at: new Date(Date.now() - 23 * 3600000).toISOString()
      }
    ],
    forensic_transactions: [
      {
        id: 'tx-001',
        case_id: 'case-demo-001',
        evidence_artifact_id: 'ev-001',
        transaction_reference: '423984129482',
        timestamp: new Date(Date.now() - 35 * 3600000).toISOString(),
        amount: 45000,
        sender_account_masked: 'XX4102',
        sender_bank: 'HDFC Bank',
        beneficiary_identifier: 'power.discom.refund@okaxis',
        beneficiary_bank_or_platform: 'Axis Bank UPI Rail',
        is_unauthorized: true,
        created_at: new Date(Date.now() - 24 * 3600000).toISOString()
      }
    ],
    timeline_events: [
      {
        id: 'tl-001',
        case_id: 'case-demo-001',
        timestamp: new Date(Date.now() - 36 * 3600000).toISOString(),
        stage: 'FIRST_CONTACT',
        headline: 'SMS Received Regarding Power Disconnection',
        detailed_description: 'Victim received deceptive SMS stating urgent power disconnection due to pending Rs 12 surcharge.',
        source_evidence_ids: ['ev-002'],
        involved_entities: ['VK-DISCOM-SMS', 'Victim Mobile'],
        is_verified_by_victim: true,
        sequence_order: 1,
        created_at: new Date(Date.now() - 24 * 3600000).toISOString()
      },
      {
        id: 'tl-002',
        case_id: 'case-demo-001',
        timestamp: new Date(Date.now() - 35.8 * 3600000).toISOString(),
        stage: 'MANIPULATION',
        headline: 'Psychological High-Pressure Manipulation',
        detailed_description: 'Impersonator called stating substation cut-off was imminent; demanded instant payment verification.',
        source_evidence_ids: ['ev-002'],
        involved_entities: ['+91-9876543210', 'Fraudster Sharma'],
        is_verified_by_victim: true,
        sequence_order: 2,
        created_at: new Date(Date.now() - 24 * 3600000).toISOString()
      },
      {
        id: 'tl-003',
        case_id: 'case-demo-001',
        timestamp: new Date(Date.now() - 35.5 * 3600000).toISOString(),
        stage: 'CREDENTIAL_HARVESTING',
        headline: 'UPI Collect Request Dispatched',
        detailed_description: 'Victim sent a UPI Collect Request for Rs 45,000 with deceptive remark "Refund Verification".',
        source_evidence_ids: ['ev-001'],
        involved_entities: ['power.discom.refund@okaxis', 'PhonePe Gateway'],
        is_verified_by_victim: true,
        sequence_order: 3,
        created_at: new Date(Date.now() - 24 * 3600000).toISOString()
      },
      {
        id: 'tl-004',
        case_id: 'case-demo-001',
        timestamp: new Date(Date.now() - 35 * 3600000).toISOString(),
        stage: 'UNAUTHORIZED_DEBIT',
        headline: 'Unauthorized Debit of Rs 45,000 Siphoned',
        detailed_description: 'Account XX4102 debited for Rs 45,000 under UTR 423984129482 to mule account power.discom.refund@okaxis.',
        source_evidence_ids: ['ev-001'],
        involved_entities: ['HDFC Bank', 'power.discom.refund@okaxis', 'UTR: 423984129482'],
        is_verified_by_victim: true,
        sequence_order: 4,
        created_at: new Date(Date.now() - 24 * 3600000).toISOString()
      },
      {
        id: 'tl-005',
        case_id: 'case-demo-001',
        timestamp: new Date(Date.now() - 34.5 * 3600000).toISOString(),
        stage: 'DISCOVERY',
        headline: 'Fraud Realized Upon Receiving Bank SMS',
        detailed_description: 'Victim checked account balance and realized money was deducted instead of receiving credit.',
        source_evidence_ids: ['ev-001'],
        involved_entities: ['Victim', 'HDFC Bank Alerts'],
        is_verified_by_victim: true,
        sequence_order: 5,
        created_at: new Date(Date.now() - 24 * 3600000).toISOString()
      }
    ],
    incident_dossiers: []
  };

  saveLocalStore(initial);
  return initial;
}

let memoryDb: DatabaseSchema = initLocalStore();

function saveLocalStore(data: DatabaseSchema): void {
  try {
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving local store:', err);
  }
}

export const db = {
  // Profiles
  async getProfile(userId: string): Promise<Profile | null> {
    if (hasSupabaseConfig && supabaseAdmin) {
      const { data, error } = await supabaseAdmin.from('profiles').select('*').eq('id', userId).single();
      if (!error && data) return data as Profile;
    }
    const found = memoryDb.profiles.find((p) => p.id === userId);
    return found || null;
  },

  async upsertProfile(profile: Partial<Profile> & { id: string; full_name: string }): Promise<Profile> {
    const now = new Date().toISOString();
    const newProfile: Profile = {
      id: profile.id,
      full_name: profile.full_name,
      phone_number: profile.phone_number || null,
      created_at: profile.created_at || now,
      updated_at: now
    };

    if (hasSupabaseConfig && supabaseAdmin) {
      const { data, error } = await supabaseAdmin.from('profiles').upsert(newProfile).select().single();
      if (!error && data) return data as Profile;
    }

    const idx = memoryDb.profiles.findIndex((p) => p.id === profile.id);
    if (idx >= 0) {
      memoryDb.profiles[idx] = { ...memoryDb.profiles[idx], ...newProfile };
    } else {
      memoryDb.profiles.push(newProfile);
    }
    saveLocalStore(memoryDb);
    return newProfile;
  },

  // Fraud Cases
  async getCasesForUser(userId: string): Promise<FraudCase[]> {
    if (hasSupabaseConfig && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from('fraud_cases')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (!error && data) return data as FraudCase[];
    }

    return memoryDb.fraud_cases
      .filter((c) => c.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  async getCaseById(caseId: string, userId: string): Promise<FullCaseDetails | null> {
    let fraudCase: FraudCase | null = null;
    let evidence: EvidenceArtifact[] = [];
    let transactions: ForensicTransaction[] = [];
    let timeline: TimelineEvent[] = [];
    let dossiers: IncidentDossier[] = [];

    if (hasSupabaseConfig && supabaseAdmin) {
      const { data: cData } = await supabaseAdmin
        .from('fraud_cases')
        .select('*')
        .eq('id', caseId)
        .eq('user_id', userId)
        .single();

      if (cData) {
        fraudCase = cData as FraudCase;
        const [evRes, txRes, tlRes, dsRes] = await Promise.all([
          supabaseAdmin.from('evidence_artifacts').select('*').eq('case_id', caseId),
          supabaseAdmin.from('forensic_transactions').select('*').eq('case_id', caseId),
          supabaseAdmin.from('timeline_events').select('*').eq('case_id', caseId).order('sequence_order', { ascending: true }),
          supabaseAdmin.from('incident_dossiers').select('*').eq('case_id', caseId)
        ]);

        evidence = (evRes.data as EvidenceArtifact[]) || [];
        transactions = (txRes.data as ForensicTransaction[]) || [];
        timeline = (tlRes.data as TimelineEvent[]) || [];
        dossiers = (dsRes.data as IncidentDossier[]) || [];

        return { case: fraudCase, evidence, transactions, timeline, dossiers };
      }
    }

    // Memory Store lookup
    const foundCase = memoryDb.fraud_cases.find((c) => c.id === caseId && c.user_id === userId);
    if (!foundCase) return null;

    evidence = memoryDb.evidence_artifacts.filter((e) => e.case_id === caseId);
    transactions = memoryDb.forensic_transactions.filter((t) => t.case_id === caseId);
    timeline = memoryDb.timeline_events
      .filter((tl) => tl.case_id === caseId)
      .sort((a, b) => a.sequence_order - b.sequence_order);
    dossiers = memoryDb.incident_dossiers.filter((d) => d.case_id === caseId);

    return { case: foundCase, evidence, transactions, timeline, dossiers };
  },

  async createCase(newCase: Omit<FraudCase, 'id' | 'created_at' | 'updated_at'>): Promise<FraudCase> {
    const id = uuidv4();
    const now = new Date().toISOString();
    const fullCase: FraudCase = {
      ...newCase,
      id,
      created_at: now,
      updated_at: now
    };

    if (hasSupabaseConfig && supabaseAdmin) {
      const { data, error } = await supabaseAdmin.from('fraud_cases').insert(fullCase).select().single();
      if (!error && data) return data as FraudCase;
    }

    memoryDb.fraud_cases.unshift(fullCase);
    saveLocalStore(memoryDb);
    return fullCase;
  },

  async updateCase(caseId: string, userId: string, updates: Partial<FraudCase>): Promise<FraudCase | null> {
    const now = new Date().toISOString();
    if (hasSupabaseConfig && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from('fraud_cases')
        .update({ ...updates, updated_at: now })
        .eq('id', caseId)
        .eq('user_id', userId)
        .select()
        .single();
      if (!error && data) return data as FraudCase;
    }

    const idx = memoryDb.fraud_cases.findIndex((c) => c.id === caseId && c.user_id === userId);
    if (idx === -1) return null;

    memoryDb.fraud_cases[idx] = {
      ...memoryDb.fraud_cases[idx],
      ...updates,
      updated_at: now
    };
    saveLocalStore(memoryDb);
    return memoryDb.fraud_cases[idx];
  },

  async deleteCase(caseId: string, userId: string): Promise<boolean> {
    if (hasSupabaseConfig && supabaseAdmin) {
      await supabaseAdmin.from('fraud_cases').delete().eq('id', caseId).eq('user_id', userId);
    }

    const initialLen = memoryDb.fraud_cases.length;
    memoryDb.fraud_cases = memoryDb.fraud_cases.filter((c) => !(c.id === caseId && c.user_id === userId));
    memoryDb.evidence_artifacts = memoryDb.evidence_artifacts.filter((e) => e.case_id !== caseId);
    memoryDb.forensic_transactions = memoryDb.forensic_transactions.filter((t) => t.case_id !== caseId);
    memoryDb.timeline_events = memoryDb.timeline_events.filter((tl) => tl.case_id !== caseId);
    memoryDb.incident_dossiers = memoryDb.incident_dossiers.filter((d) => d.case_id !== caseId);

    saveLocalStore(memoryDb);
    return memoryDb.fraud_cases.length < initialLen;
  },

  // Evidence
  async addEvidence(artifact: Omit<EvidenceArtifact, 'id' | 'created_at'>): Promise<EvidenceArtifact> {
    const id = uuidv4();
    const created_at = new Date().toISOString();
    const record: EvidenceArtifact = {
      ...artifact,
      id,
      created_at
    };

    if (hasSupabaseConfig && supabaseAdmin) {
      const { data, error } = await supabaseAdmin.from('evidence_artifacts').insert(record).select().single();
      if (!error && data) return data as EvidenceArtifact;
    }

    memoryDb.evidence_artifacts.push(record);
    saveLocalStore(memoryDb);
    return record;
  },

  async getEvidenceForCase(caseId: string): Promise<EvidenceArtifact[]> {
    if (hasSupabaseConfig && supabaseAdmin) {
      const { data } = await supabaseAdmin.from('evidence_artifacts').select('*').eq('case_id', caseId);
      if (data) return data as EvidenceArtifact[];
    }
    return memoryDb.evidence_artifacts.filter((e) => e.case_id === caseId);
  },

  async deleteEvidence(evidenceId: string, caseId: string): Promise<boolean> {
    if (hasSupabaseConfig && supabaseAdmin) {
      await supabaseAdmin.from('evidence_artifacts').delete().eq('id', evidenceId).eq('case_id', caseId);
    }
    const prev = memoryDb.evidence_artifacts.length;
    memoryDb.evidence_artifacts = memoryDb.evidence_artifacts.filter((e) => !(e.id === evidenceId && e.case_id === caseId));
    saveLocalStore(memoryDb);
    return memoryDb.evidence_artifacts.length < prev;
  },

  // Forensic Transactions
  async setTransactionsForCase(caseId: string, transactions: Omit<ForensicTransaction, 'id' | 'created_at'>[]): Promise<ForensicTransaction[]> {
    const created: ForensicTransaction[] = transactions.map((t) => ({
      ...t,
      id: uuidv4(),
      created_at: new Date().toISOString()
    }));

    if (hasSupabaseConfig && supabaseAdmin) {
      await supabaseAdmin.from('forensic_transactions').delete().eq('case_id', caseId);
      if (created.length > 0) {
        const { data } = await supabaseAdmin.from('forensic_transactions').insert(created).select();
        if (data) return data as ForensicTransaction[];
      }
    }

    memoryDb.forensic_transactions = memoryDb.forensic_transactions.filter((t) => t.case_id !== caseId);
    memoryDb.forensic_transactions.push(...created);
    saveLocalStore(memoryDb);
    return created;
  },

  async addTransaction(tx: Omit<ForensicTransaction, 'id' | 'created_at'>): Promise<ForensicTransaction> {
    const fullTx: ForensicTransaction = {
      ...tx,
      id: uuidv4(),
      created_at: new Date().toISOString()
    };
    if (hasSupabaseConfig && supabaseAdmin) {
      const { data } = await supabaseAdmin.from('forensic_transactions').insert(fullTx).select().single();
      if (data) return data as ForensicTransaction;
    }
    memoryDb.forensic_transactions.push(fullTx);
    saveLocalStore(memoryDb);
    return fullTx;
  },

  // Timeline Events
  async setTimelineEvents(caseId: string, events: Omit<TimelineEvent, 'id' | 'created_at'>[]): Promise<TimelineEvent[]> {
    const fullEvents: TimelineEvent[] = events.map((ev, idx) => ({
      ...ev,
      id: uuidv4(),
      sequence_order: ev.sequence_order || (idx + 1),
      created_at: new Date().toISOString()
    }));

    if (hasSupabaseConfig && supabaseAdmin) {
      await supabaseAdmin.from('timeline_events').delete().eq('case_id', caseId);
      if (fullEvents.length > 0) {
        const { data } = await supabaseAdmin.from('timeline_events').insert(fullEvents).select();
        if (data) return data as TimelineEvent[];
      }
    }

    memoryDb.timeline_events = memoryDb.timeline_events.filter((t) => t.case_id !== caseId);
    memoryDb.timeline_events.push(...fullEvents);
    saveLocalStore(memoryDb);
    return fullEvents;
  },

  async updateTimelineEvent(eventId: string, caseId: string, updates: Partial<TimelineEvent>): Promise<TimelineEvent | null> {
    if (hasSupabaseConfig && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from('timeline_events')
        .update(updates)
        .eq('id', eventId)
        .eq('case_id', caseId)
        .select()
        .single();
      if (!error && data) return data as TimelineEvent;
    }

    const idx = memoryDb.timeline_events.findIndex((e) => e.id === eventId && e.case_id === caseId);
    if (idx === -1) return null;

    memoryDb.timeline_events[idx] = {
      ...memoryDb.timeline_events[idx],
      ...updates
    };
    saveLocalStore(memoryDb);
    return memoryDb.timeline_events[idx];
  },

  async addTimelineEvent(event: Omit<TimelineEvent, 'id' | 'created_at'>): Promise<TimelineEvent> {
    const fullEvent: TimelineEvent = {
      ...event,
      id: uuidv4(),
      created_at: new Date().toISOString()
    };
    if (hasSupabaseConfig && supabaseAdmin) {
      const { data } = await supabaseAdmin.from('timeline_events').insert(fullEvent).select().single();
      if (data) return data as TimelineEvent;
    }
    memoryDb.timeline_events.push(fullEvent);
    memoryDb.timeline_events.sort((a, b) => a.sequence_order - b.sequence_order);
    saveLocalStore(memoryDb);
    return fullEvent;
  },

  // Dossiers
  async saveDossiers(caseId: string, dossiers: Omit<IncidentDossier, 'id' | 'created_at'>[]): Promise<IncidentDossier[]> {
    const fullDossiers: IncidentDossier[] = dossiers.map((d) => ({
      ...d,
      id: uuidv4(),
      created_at: new Date().toISOString()
    }));

    if (hasSupabaseConfig && supabaseAdmin) {
      await supabaseAdmin.from('incident_dossiers').delete().eq('case_id', caseId);
      const { data } = await supabaseAdmin.from('incident_dossiers').insert(fullDossiers).select();
      if (data) return data as IncidentDossier[];
    }

    memoryDb.incident_dossiers = memoryDb.incident_dossiers.filter((d) => d.case_id !== caseId);
    memoryDb.incident_dossiers.push(...fullDossiers);
    saveLocalStore(memoryDb);
    return fullDossiers;
  },

  async getDossiersForCase(caseId: string): Promise<IncidentDossier[]> {
    if (hasSupabaseConfig && supabaseAdmin) {
      const { data } = await supabaseAdmin.from('incident_dossiers').select('*').eq('case_id', caseId);
      if (data) return data as IncidentDossier[];
    }
    return memoryDb.incident_dossiers.filter((d) => d.case_id === caseId);
  }
};
