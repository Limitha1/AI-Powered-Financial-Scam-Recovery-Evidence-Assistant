import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { EmergencyBanner } from './components/common/EmergencyBanner.js';
import { Navbar } from './components/common/Navbar.js';
import { LandingPage } from './pages/LandingPage.js';
import { EmergencyGuide } from './pages/EmergencyGuide.js';
import { AuthLogin } from './pages/AuthLogin.js';
import { AuthRegister } from './pages/AuthRegister.js';
import { Dashboard } from './pages/Dashboard.js';
import { CaseIntakeWizard } from './pages/CaseIntakeWizard.js';
import { CaseWorkspace } from './pages/CaseWorkspace.js';
import { SettingsPage } from './pages/SettingsPage.js';

const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#080C15] text-slate-100">
      <EmergencyBanner />
      <Navbar />

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/emergency" element={<EmergencyGuide />} />
          <Route path="/auth/login" element={<AuthLogin />} />
          <Route path="/auth/register" element={<AuthRegister />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/cases/new" element={<CaseIntakeWizard />} />
          <Route path="/cases/:id" element={<CaseWorkspace />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <footer className="border-t border-slate-900 bg-slate-950/80 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-400">ShieldTrace AI</span>
            <span>•</span>
            <span>Digital Financial Forensics & Statutory Dispute Recovery Assistant</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-emerald-400 font-mono">Zero-Leak PII Guard Active</span>
            <span>•</span>
            <span className="font-mono">Central Banking Ombudsman Compatible</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <AppLayout />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
