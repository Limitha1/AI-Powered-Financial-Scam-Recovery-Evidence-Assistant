import {
  FraudCase,
  FullCaseDetails,
  CreateCaseInput,
  UpdateCaseInput,
  IngestTextEvidenceInput,
  EvidenceArtifact,
  ForensicTransaction,
  TimelineEvent,
  UpdateTimelineEventInput,
  CreateTimelineEventInput,
  AddForensicTransactionInput,
  DossierGenerationResult,
  UserSession
} from '../types/index.js';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('shieldtrace_token') || 'demo-session-token';
  return {
    Authorization: `Bearer ${token}`
  };
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorMsg = `API Error ${res.status}: ${res.statusText}`;
    try {
      const errorJson = await res.json();
      errorMsg = errorJson.error || errorJson.message || errorMsg;
    } catch {
      // ignored
    }
    throw new Error(errorMsg);
  }
  return res.json();
}

export const api = {
  // Auth
  async login(email: string, password: string): Promise<{ token: string; user: UserSession }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return handleResponse(res);
  },

  async register(email: string, password: string, full_name: string, phone_number?: string): Promise<{ token: string; user: UserSession }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, full_name, phone_number })
    });
    return handleResponse(res);
  },

  async getMe(): Promise<{ user: UserSession }> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeader()
    });
    return handleResponse(res);
  },

  // Cases
  async getCases(): Promise<FraudCase[]> {
    const res = await fetch(`${API_BASE}/cases`, {
      headers: getAuthHeader()
    });
    return handleResponse(res);
  },

  async getCaseById(caseId: string): Promise<FullCaseDetails> {
    const res = await fetch(`${API_BASE}/cases/${caseId}`, {
      headers: getAuthHeader()
    });
    return handleResponse(res);
  },

  async createCase(data: CreateCaseInput): Promise<FraudCase> {
    const res = await fetch(`${API_BASE}/cases`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async updateCase(caseId: string, updates: UpdateCaseInput): Promise<FraudCase> {
    const res = await fetch(`${API_BASE}/cases/${caseId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(updates)
    });
    return handleResponse(res);
  },

  async deleteCase(caseId: string): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/cases/${caseId}`, {
      method: 'DELETE',
      headers: getAuthHeader()
    });
    return handleResponse(res);
  },

  // Evidence
  async ingestTextEvidence(caseId: string, data: IngestTextEvidenceInput): Promise<EvidenceArtifact> {
    const res = await fetch(`${API_BASE}/cases/${caseId}/evidence/text`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async uploadEvidenceFile(caseId: string, formData: FormData): Promise<EvidenceArtifact> {
    const res = await fetch(`${API_BASE}/cases/${caseId}/evidence/upload`, {
      method: 'POST',
      headers: getAuthHeader(), // Let browser set Content-Type with multipart boundary
      body: formData
    });
    return handleResponse(res);
  },

  async deleteEvidence(caseId: string, evidenceId: string): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/cases/${caseId}/evidence/${evidenceId}`, {
      method: 'DELETE',
      headers: getAuthHeader()
    });
    return handleResponse(res);
  },

  // AI Forensics & Timeline
  async analyzeEvidence(caseId: string): Promise<{
    extraction: any;
    transactions: ForensicTransaction[];
    case: FraudCase;
  }> {
    const res = await fetch(`${API_BASE}/cases/${caseId}/analyze`, {
      method: 'POST',
      headers: getAuthHeader()
    });
    return handleResponse(res);
  },

  async generateTimeline(caseId: string): Promise<TimelineEvent[]> {
    const res = await fetch(`${API_BASE}/cases/${caseId}/timeline/generate`, {
      method: 'POST',
      headers: getAuthHeader()
    });
    return handleResponse(res);
  },

  async updateTimelineEvent(
    caseId: string,
    eventId: string,
    updates: UpdateTimelineEventInput
  ): Promise<TimelineEvent> {
    const res = await fetch(`${API_BASE}/cases/${caseId}/timeline/${eventId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(updates)
    });
    return handleResponse(res);
  },

  async createTimelineEvent(caseId: string, data: CreateTimelineEventInput): Promise<TimelineEvent> {
    const res = await fetch(`${API_BASE}/cases/${caseId}/timeline/custom`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async addForensicTransaction(caseId: string, data: AddForensicTransactionInput): Promise<ForensicTransaction> {
    const res = await fetch(`${API_BASE}/cases/${caseId}/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  // Dossier & PDF Export
  async generateDossier(caseId: string): Promise<{
    dossiers: any[];
    recovery_checklist: DossierGenerationResult['immediate_recovery_checklist'];
  }> {
    const res = await fetch(`${API_BASE}/cases/${caseId}/dossier/generate`, {
      method: 'POST',
      headers: getAuthHeader()
    });
    return handleResponse(res);
  },

  async downloadDossierPdf(caseId: string): Promise<void> {
    const res = await fetch(`${API_BASE}/cases/${caseId}/dossier/export-pdf`, {
      headers: getAuthHeader()
    });
    if (!res.ok) throw new Error('Failed to generate PDF dossier');
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ShieldTrace_Dispute_Dossier_${caseId}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },

  async previewRedact(text: string): Promise<{ redactedText: string; redactionsCount: number; detectedTypes: string[] }> {
    const res = await fetch(`${API_BASE}/redact/preview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    return handleResponse(res);
  }
};
