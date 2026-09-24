import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, LifeBuoy, PlusCircle, Settings, User, LogOut, FileText } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-6">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-950 animate-pulse"></div>
              </div>
              <div>
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-cyan-400 bg-clip-text text-transparent">
                  ShieldTrace<span className="text-cyan-400 ml-1 font-mono text-sm">AI</span>
                </span>
                <span className="block text-[10px] text-slate-400 tracking-wider font-medium uppercase">
                  Forensic Recovery & Dispute Suite
                </span>
              </div>
            </Link>

            {/* Main Links */}
            <div className="hidden md:flex items-center space-x-1 pl-4 border-l border-slate-800">
              <Link
                to="/dashboard"
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center space-x-1.5 ${
                  isActive('/dashboard')
                    ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <FileText className="h-3.5 w-3.5" />
                <span>Cases Ledger</span>
              </Link>

              <Link
                to="/cases/new"
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center space-x-1.5 ${
                  isActive('/cases/new')
                    ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <PlusCircle className="h-3.5 w-3.5 text-cyan-400" />
                <span>Report Incident</span>
              </Link>

              <Link
                to="/emergency"
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center space-x-1.5 ${
                  isActive('/emergency')
                    ? 'bg-red-500/10 text-red-300 border border-red-500/30'
                    : 'text-slate-400 hover:text-red-300 hover:bg-slate-900'
                }`}
              >
                <LifeBuoy className="h-3.5 w-3.5 text-red-400" />
                <span>Emergency Freeze</span>
              </Link>
            </div>
          </div>

          {/* User Controls & Settings */}
          <div className="flex items-center space-x-3">
            <Link
              to="/settings"
              className={`p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition ${
                isActive('/settings') ? 'bg-slate-800 text-cyan-400' : ''
              }`}
              title="Security & Redaction Settings"
            >
              <Settings className="h-4 w-4" />
            </Link>

            {user ? (
              <div className="flex items-center space-x-3 pl-2 border-l border-slate-800">
                <div className="hidden sm:block text-right">
                  <p className="text-xs font-semibold text-slate-200 leading-none">{user.full_name}</p>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">{user.email}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-cyan-400">
                  {user.full_name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <button
                  onClick={logout}
                  className="p-1.5 text-slate-500 hover:text-red-400 transition"
                  title="Sign Out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/auth/login"
                  className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-900 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/auth/register"
                  className="text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-black font-bold px-3 py-1.5 rounded-lg transition shadow-sm"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
