-- ====================================================================
-- ShieldTrace AI: Forensic Scam Recovery & Evidence Assistant
-- Database Schema: PostgreSQL / Supabase
-- ====================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS & PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone_number TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. FRAUD CASES
CREATE TABLE IF NOT EXISTS public.fraud_cases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    scam_type TEXT NOT NULL,
    primary_payment_rail TEXT NOT NULL,
    total_financial_loss NUMERIC(14, 2) DEFAULT 0.00 NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR' NOT NULL,
    incident_start_time TIMESTAMPTZ,
    incident_end_time TIMESTAMPTZ,
    status TEXT DEFAULT 'DRAFT' NOT NULL,
    victim_narrative TEXT,
    ai_summary TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. EVIDENCE ARTIFACTS
CREATE TABLE IF NOT EXISTS public.evidence_artifacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID NOT NULL REFERENCES public.fraud_cases(id) ON DELETE CASCADE,
    artifact_type TEXT NOT NULL,
    source_identifier TEXT, -- e.g. "SMS from VK-HDFCBK" or "+91-9876543210"
    raw_text_content TEXT,
    file_storage_path TEXT,
    file_mime_type TEXT,
    file_size_bytes BIGINT,
    parsed_metadata JSONB DEFAULT '{}'::jsonb NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. FORENSIC TRANSACTIONS (Reconciled entries)
CREATE TABLE IF NOT EXISTS public.forensic_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID NOT NULL REFERENCES public.fraud_cases(id) ON DELETE CASCADE,
    evidence_artifact_id UUID REFERENCES public.evidence_artifacts(id) ON DELETE SET NULL,
    transaction_reference TEXT, -- UTR, RRN, or Txn ID
    timestamp TIMESTAMPTZ NOT NULL,
    amount NUMERIC(14, 2) NOT NULL,
    sender_account_masked TEXT,
    sender_bank TEXT,
    beneficiary_identifier TEXT, -- VPA, Account Number, Wallet ID
    beneficiary_bank_or_platform TEXT,
    is_unauthorized BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 5. TIMELINE EVENTS
CREATE TABLE IF NOT EXISTS public.timeline_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID NOT NULL REFERENCES public.fraud_cases(id) ON DELETE CASCADE,
    timestamp TIMESTAMPTZ NOT NULL,
    stage TEXT NOT NULL, -- 'FIRST_CONTACT', 'MANIPULATION', 'CREDENTIAL_HARVESTING', 'UNAUTHORIZED_DEBIT', 'DISCOVERY', 'CONTAINMENT_ATTEMPT'
    headline TEXT NOT NULL,
    detailed_description TEXT NOT NULL,
    source_evidence_ids UUID[] DEFAULT ARRAY[]::UUID[],
    involved_entities TEXT[] DEFAULT ARRAY[]::TEXT[],
    is_verified_by_victim BOOLEAN DEFAULT FALSE NOT NULL,
    sequence_order INT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 6. GENERATED DOSSIERS
CREATE TABLE IF NOT EXISTS public.incident_dossiers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID NOT NULL REFERENCES public.fraud_cases(id) ON DELETE CASCADE,
    dossier_type TEXT NOT NULL, -- 'BANK_FORMAL_DISPUTE', 'CYBERCRIME_PORTAL_BRIEF', 'LEGAL_TIMELINE_EXPORT'
    content_markdown TEXT NOT NULL,
    generated_json JSONB DEFAULT '{}'::jsonb NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_fraud_cases_user ON public.fraud_cases(user_id);
CREATE INDEX IF NOT EXISTS idx_evidence_case ON public.evidence_artifacts(case_id);
CREATE INDEX IF NOT EXISTS idx_timeline_case ON public.timeline_events(case_id, sequence_order);
CREATE INDEX IF NOT EXISTS idx_txns_case ON public.forensic_transactions(case_id);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fraud_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evidence_artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forensic_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incident_dossiers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if re-running
DROP POLICY IF EXISTS "Users view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users operate on own cases" ON public.fraud_cases;
DROP POLICY IF EXISTS "Users access own evidence" ON public.evidence_artifacts;
DROP POLICY IF EXISTS "Users access own forensic txns" ON public.forensic_transactions;
DROP POLICY IF EXISTS "Users access own timeline" ON public.timeline_events;
DROP POLICY IF EXISTS "Users access own dossiers" ON public.incident_dossiers;

-- Profiles: Only owners can read/modify
CREATE POLICY "Users view own profile" ON public.profiles
    FOR ALL USING (auth.uid() = id);

-- Fraud Cases: Tenant isolated
CREATE POLICY "Users operate on own cases" ON public.fraud_cases
    FOR ALL USING (auth.uid() = user_id);

-- Evidence Artifacts: Inherited case ownership
CREATE POLICY "Users access own evidence" ON public.evidence_artifacts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.fraud_cases
            WHERE fraud_cases.id = evidence_artifacts.case_id
            AND fraud_cases.user_id = auth.uid()
        )
    );

-- Forensic Transactions: Inherited case ownership
CREATE POLICY "Users access own forensic txns" ON public.forensic_transactions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.fraud_cases
            WHERE fraud_cases.id = forensic_transactions.case_id
            AND fraud_cases.user_id = auth.uid()
        )
    );

-- Timeline Events: Inherited case ownership
CREATE POLICY "Users access own timeline" ON public.timeline_events
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.fraud_cases
            WHERE fraud_cases.id = timeline_events.case_id
            AND fraud_cases.user_id = auth.uid()
        )
    );

-- Dossiers: Inherited case ownership
CREATE POLICY "Users access own dossiers" ON public.incident_dossiers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.fraud_cases
            WHERE fraud_cases.id = incident_dossiers.case_id
            AND fraud_cases.user_id = auth.uid()
        )
    );
