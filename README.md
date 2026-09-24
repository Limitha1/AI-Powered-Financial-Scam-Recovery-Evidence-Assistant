# ShieldTrace AI — Financial Scam Recovery & Evidence Assistant

> **AI-Powered Digital Financial Forensics & Statutory Dispute Recovery Assistant**  
> Empowering fraud victims to ingest multi-channel transactional artifacts, extract forensic identifiers using Gemini 2.5 Structured Outputs, reconstruct immutable chronological timelines, and generate audit-ready dispute dossiers for banks and statutory cybercrime reporting portals.

---

## 🛡️ Problem Statement
Victims of digital financial fraud (UPI scams, phishing, unauthorized fund sweeps, remote-access screen-sharing APKs, SIM swapping, and digital arrest coercions) face fragmentation of forensic proof across bank SMS alerts, payment gateway IDs, chat transcripts, and emails. 

**ShieldTrace AI** ingests multi-channel artifacts, isolates the scam vector, reconciles transactional discrepancies (UTR/RRN, beneficiary VPAs, sender accounts), and generates standardized formal dispute dossiers citing central banking zero-liability regulations.

---

## ⚡ Core Features

- **Multi-Source Artifact Ingestion Engine**: Accepts multi-format attachments (PNG/JPG payment screenshots, PDF statements) and raw text dumps (SMS notifications, WhatsApp/Telegram transcripts, email headers).
- **Zero-Leak Client-Side PII Redaction Guard**: Real-time regex-based masking of 16-digit card PANs (`XXXX-XXXX-XXXX-1234`), CVVs, UPI PINs, passwords, and OTPs before submission to server or LLM.
- **Gemini 2.5 Flash Structured Forensics**:
  - **Pipeline A (Entity Extraction)**: Structured extraction of transaction references (UTR/RRN), sender/receiver account tails, beneficiary VPAs, phone numbers, and threat categories.
  - **Pipeline B (Timeline Synthesis)**: Minute-by-minute chronological reconstruction across stages (`FIRST_CONTACT` → `MANIPULATION` → `CREDENTIAL_HARVESTING` → `UNAUTHORIZED_DEBIT` → `DISCOVERY` → `CONTAINMENT_ATTEMPT`).
  - **Pipeline C (Statutory Dispute Dossier)**: Formal Bank Dispute Letter citing Reserve Bank of India (RBI) Circular DBR.No.Leg.BC.78/09.07.005/2017-18 (Zero-Liability protection) and Cybercrime Police Brief.
- **Emergency 1-Click Freeze Guide**: Immediate USSD codes (`*99*4#` for universal UPI disable), bank SMS card block syntaxes, 1930 Cybercrime Helpline guidance, and remote malware containment protocols.
- **Forensic Ledger & Interactive Timeline**: High-density discrepancy ledger with victim verification switches and milestone editing.
- **Official PDF Export**: Generates court- and bank-admissible formatted dispute dossier PDFs.
- **Statutory Countdown Clocks**: Real-time countdown timers for the crucial 24-hour zero-liability dispute window and 72-hour secondary window.
- **Tenant Isolation & Right to be Forgotten**: Cryptographic tenant session isolation and GDPR/DPDP-compliant permanent data purge.

---

## 🏗️ Architecture & Technology Stack

- **Frontend**: React 18 with Vite + TypeScript (`strict: true`), Tailwind CSS, Lucide React, DOMPurify.
- **Backend**: Node.js (v20+ LTS) with Express.js and TypeScript.
- **AI Core**: Google Gen AI SDK (`@google/genai`) with model `gemini-2.5-flash` using strict `responseSchema` & `responseMimeType: "application/json"`.
- **Validation**: Shared Zod schemas (`shared/schemas.ts`).
- **Database & Storage**: Supabase PostgreSQL with Row Level Security (RLS) & resilient fallback store.
- **Document Generation**: PDFKit streaming engine.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v20+ LTS)
- npm

### Installation
```bash
# Clone the repository
git clone https://github.com/Limitha1/AI-Powered-Financial-Scam-Recovery-Evidence-Assistant.git
cd AI-Powered-Financial-Scam-Recovery-Evidence-Assistant

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### Running Locally
```bash
# Terminal 1: Start Backend (Port 5000)
cd server
npm run dev

# Terminal 2: Start Frontend (Port 5173)
cd client
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔒 Security & Privacy
ShieldTrace AI is architected with a privacy-first posture:
1. **Client-Side Redaction**: Sensitive card credentials and PINs are masked in the browser before network transmission.
2. **Encrypted Evidence Vault**: Evidence artifacts and reconstructed timelines are tenant-isolated.
3. **Right to be Forgotten**: One-click complete cryptographic data wipe permanently purges all records.

---

## 📜 License
MIT License. Developed for digital financial consumer protection and forensic recovery.
