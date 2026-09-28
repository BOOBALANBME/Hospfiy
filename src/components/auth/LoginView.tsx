import React, { useState } from 'react';
import {
  Lock,
  User as UserIcon,
  Shield,
  ArrowRight,
  Sparkles,
  Building2,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Cpu,
  Info,
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { HospifyLogo } from '../common/HospifyLogo';
import {
  HOSPITAL_CREDENTIALS,
  validateHospitalLogin,
  DepartmentCredentialInfo,
} from '../../utils/authCredentials';

interface LoginViewProps {
  onLoginSuccess: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const { switchUser, setActiveTab } = useHospital();

  const [selectedDeptId, setSelectedDeptId] = useState<string>('DEPT-ALL');
  const [username, setUsername] = useState<string>('ABC HOSPITAL');
  const [password, setPassword] = useState<string>('ABC@2000');
  const [error, setError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState<boolean>(true);

  // When user selects a department from dropdown, auto-fill standard credentials for convenience
  const handleDeptSelect = (deptId: string) => {
    setSelectedDeptId(deptId);
    setError(null);
    const dept = HOSPITAL_CREDENTIALS.find((d) => d.id === deptId);
    if (dept) {
      setUsername(dept.username);
      setPassword(dept.passwordHint);
    }
  };

  const handleQuickCredential = (cred: DepartmentCredentialInfo) => {
    setSelectedDeptId(cred.id);
    setUsername(cred.username);
    setPassword(cred.passwordHint);
    setError(null);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const result = validateHospitalLogin(username, password, selectedDeptId);

    if (!result.success || !result.user) {
      setError(result.errorMessage || 'Invalid credentials. Please verify your login details.');
      return;
    }

    // Login successful
    switchUser(result.user);

    // If logging into Biomedical Department, route directly to Biomedical QA
    if (result.targetDepartmentId === 'DEPT-BME' || result.user.role === 'BIOMEDICAL') {
      setActiveTab('biomedical');
    } else if (result.targetDepartmentId && result.targetDepartmentId.startsWith('WARD-')) {
      setActiveTab('beds');
    } else {
      setActiveTab('dashboard');
    }

    onLoginSuccess();
  };

  return (
    <div
      className="min-h-screen flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden select-none"
      style={{
        background:
          'radial-gradient(circle at 50% 30%, #ffffff 0%, #f1f5f9 40%, #e2e8f0 80%, #cbd5e1 100%)',
      }}
    >
      {/* Background Subtle Medical Telemetry Grid */}
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(to right, #0284c7 1px, transparent 1px), linear-gradient(to bottom, #0284c7 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Ambient Pulsing Glow behind Login Card */}
      <div className="absolute w-[500px] h-[500px] rounded-full bg-cyan-400/15 blur-3xl pointer-events-none -top-20 -left-20" />
      <div className="absolute w-[500px] h-[500px] rounded-full bg-blue-500/15 blur-3xl pointer-events-none -bottom-20 -right-20" />

      <div className="w-full max-w-lg relative z-10">
        {/* Hospify Branding Header */}
        <div className="text-center mb-6">
          <div className="inline-flex justify-center mb-3">
            <HospifyLogo size="lg" showSubtitle={true} />
          </div>
          <div className="mt-1 flex items-center justify-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200 shadow-xs">
              <Shield className="w-3.5 h-3.5 text-blue-600" />
              <span>Hospital & Department Access Gateway</span>
            </span>
          </div>
        </div>

        {/* Login Form Container Card */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-[0_20px_50px_rgba(15,23,42,0.1)]">
          <div className="border-b border-slate-100 pb-4 mb-5">
            <h2 className="text-lg font-black text-slate-900 tracking-tight">
              Hospital Personnel Authentication
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Login as Hospital Admin or select your individual Clinical/Biomedical Department.
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="font-semibold">{error}</div>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {/* 1. Department Selector */}
            <div>
              <label
                htmlFor="login-department-select"
                className="block text-xs font-bold text-slate-700 mb-1.5"
              >
                1. Select Department
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  id="login-department-select"
                  value={selectedDeptId}
                  onChange={(e) => handleDeptSelect(e.target.value)}
                  className="w-full pl-10 pr-9 py-2.5 bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-xs font-semibold text-slate-900 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all cursor-pointer"
                >
                  <optgroup label="Central Administration">
                    <option value="DEPT-ALL">ABC Hospital - Central Administration (All Departments)</option>
                  </optgroup>
                  <optgroup label="Engineering & Device Inspection">
                    <option value="DEPT-BME">Biomedical Engineering & QA (Boobalan S BME - 0 Beds)</option>
                  </optgroup>
                  <optgroup label="Clinical Departments (15 Inpatient Wards)">
                    {HOSPITAL_CREDENTIALS.filter((d) => d.id.startsWith('WARD-')).map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.username})
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>
            </div>

            {/* 2. Username Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="login-username"
                  className="block text-xs font-bold text-slate-700"
                >
                  2. Username
                </label>
                <span className="text-[11px] text-blue-600 font-mono font-medium">
                  {selectedDeptId === 'DEPT-ALL'
                    ? 'Admin: ABC HOSPITAL'
                    : 'Dept: [department]@2000'}
                </span>
              </div>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="login-username"
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setError(null);
                  }}
                  placeholder="Enter ABC HOSPITAL or [department]@2000"
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-xs font-semibold text-slate-900 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all font-mono"
                  required
                />
              </div>
            </div>

            {/* 3. Password Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="login-password"
                  className="block text-xs font-bold text-slate-700"
                >
                  3. Password
                </label>
                <span className="text-[11px] text-slate-500 font-mono">
                  {selectedDeptId === 'DEPT-ALL' ? 'Pass: ABC@2000' : 'Pass: ABC HOSPITAL'}
                </span>
              </div>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(null);
                  }}
                  placeholder="Enter password"
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-xs font-semibold text-slate-900 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all font-mono"
                  required
                />
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                />
                <span className="text-xs text-slate-600 font-medium">Keep session logged in</span>
              </label>
            </div>

            {/* Login Submit Button */}
            <button
              id="submit-hospital-login-btn"
              type="submit"
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-600 hover:from-blue-800 hover:to-cyan-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer border border-blue-400/30"
            >
              <Lock className="w-4 h-4" />
              <span>Authenticate & Enter Hospify Portal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Credential Fillers for Instant Access */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Quick Login Presets (1-Click Fill):</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickCredential(HOSPITAL_CREDENTIALS[0])}
                className="p-2.5 rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100/80 text-left transition-all group"
              >
                <div className="text-[11px] font-bold text-blue-900 flex items-center justify-between">
                  <span>ABC HOSPITAL</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-600 text-white font-mono">
                    ADMIN
                  </span>
                </div>
                <div className="text-[10px] text-blue-700 font-mono mt-0.5">ABC@2000</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickCredential(HOSPITAL_CREDENTIALS[1])}
                className="p-2.5 rounded-xl border border-cyan-200 bg-cyan-50/70 hover:bg-cyan-100/80 text-left transition-all group"
              >
                <div className="text-[11px] font-bold text-cyan-900 flex items-center justify-between">
                  <span>BIOMEDICAL</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-600 text-white font-mono">
                    BME QA
                  </span>
                </div>
                <div className="text-[10px] text-cyan-700 font-mono mt-0.5">BIOMEDICAL@2000</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickCredential(HOSPITAL_CREDENTIALS[2])}
                className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left transition-all"
              >
                <div className="text-[11px] font-bold text-slate-900 flex items-center justify-between">
                  <span>ICU DEPARTMENT</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-700 text-white font-mono">
                    DOCTOR
                  </span>
                </div>
                <div className="text-[10px] text-slate-600 font-mono mt-0.5">ICU@2000</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickCredential(HOSPITAL_CREDENTIALS[3])}
                className="p-2.5 rounded-xl border border-rose-200 bg-rose-50/70 hover:bg-rose-100/80 text-left transition-all"
              >
                <div className="text-[11px] font-bold text-rose-900 flex items-center justify-between">
                  <span>EMERGENCY & TRAUMA</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-600 text-white font-mono">
                    ER HEAD
                  </span>
                </div>
                <div className="text-[10px] text-rose-700 font-mono mt-0.5">EMERGENCY@2000</div>
              </button>
            </div>

            {/* Instruction Callout Box */}
            <div className="mt-3 p-2.5 bg-slate-100/80 rounded-xl border border-slate-200 text-[11px] text-slate-600 flex items-start gap-2">
              <Info className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-800">Department Login Rules:</strong> Username is{' '}
                <span className="font-mono text-blue-700 font-bold">[department]@2000</span> (e.g.{' '}
                <code className="bg-white px-1 rounded border">ICU@2000</code>,{' '}
                <code className="bg-white px-1 rounded border">CARDIOLOGY@2000</code>,{' '}
                <code className="bg-white px-1 rounded border">BIOMEDICAL@2000</code>). Password for all
                department users is{' '}
                <span className="font-mono text-blue-700 font-bold">ABC HOSPITAL</span>.
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center mt-4 text-xs text-slate-500">
          <span>Hospify Clinical Bed & Biomedical QA Portal • Boobalan S BME</span>
        </div>
      </div>
    </div>
  );
};
