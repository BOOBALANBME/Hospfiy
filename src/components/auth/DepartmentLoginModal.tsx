import React, { useState } from 'react';
import {
  Building2,
  Lock,
  User as UserIcon,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Shield,
  Cpu,
  Sparkles,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { useHospital } from '../../context/HospitalContext';
import {
  HOSPITAL_CREDENTIALS,
  validateHospitalLogin,
  DepartmentCredentialInfo,
} from '../../utils/authCredentials';

interface DepartmentLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DepartmentLoginModal: React.FC<DepartmentLoginModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { currentUser, switchUser, setActiveTab } = useHospital();

  const [selectedDeptId, setSelectedDeptId] = useState<string>('WARD-ICU');
  const [username, setUsername] = useState<string>('ICU@2000');
  const [password, setPassword] = useState<string>('ABC HOSPITAL');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleDeptChange = (deptId: string) => {
    setSelectedDeptId(deptId);
    setError(null);
    setSuccessMessage(null);
    const dept = HOSPITAL_CREDENTIALS.find((d) => d.id === deptId);
    if (dept) {
      setUsername(dept.username);
      setPassword(dept.passwordHint);
    }
  };

  const handleQuickPreset = (dept: DepartmentCredentialInfo) => {
    handleDeptChange(dept.id);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const result = validateHospitalLogin(username, password, selectedDeptId);

    if (!result.success || !result.user) {
      setError(result.errorMessage || 'Invalid department credentials.');
      return;
    }

    const authenticatedUser = result.user;
    const targetDept = result.targetDepartmentId;

    // Success
    switchUser(authenticatedUser);
    setSuccessMessage(`Authenticated as ${authenticatedUser.name} (${authenticatedUser.department})`);

    setTimeout(() => {
      if (targetDept === 'DEPT-BME' || authenticatedUser.role === 'BIOMEDICAL') {
        setActiveTab('biomedical');
      } else if (targetDept && targetDept.startsWith('WARD-')) {
        setActiveTab('beds');
      }
      onClose();
    }, 600);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Department Login & Workspace Switch"
      maxWidth="md"
    >
      <div className="space-y-4">
        {/* Current Active User Banner */}
        <div className="p-3 bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-500 font-medium">Currently Logged In:</span>
            <div className="font-bold text-slate-800">{currentUser?.name}</div>
            <div className="text-[11px] text-blue-700 font-medium">{currentUser?.department}</div>
          </div>
          <span className="px-2 py-1 rounded bg-blue-600 text-white font-mono text-[10px] font-bold">
            {currentUser?.badgeNumber}
          </span>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="font-semibold">{error}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMessage && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Department Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Select Your Department
            </label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={selectedDeptId}
                onChange={(e) => handleDeptChange(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-slate-50 hover:bg-slate-100 focus:bg-white text-xs font-semibold text-slate-800 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
              >
                <optgroup label="Biomedical Engineering (0 Beds - QA Only)">
                  <option value="DEPT-BME">
                    Biomedical Engineering (Boobalan S BME - Device QA)
                  </option>
                </optgroup>
                <optgroup label="Clinical Inpatient Departments (15 Wards)">
                  {HOSPITAL_CREDENTIALS.filter((d) => d.id.startsWith('WARD-')).map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.username})
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Central Administration">
                  <option value="DEPT-ALL">ABC Hospital - Central Administration (Admin)</option>
                </optgroup>
              </select>
            </div>
          </div>

          {/* Department Username */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700">
                Department Username
              </label>
              <span className="text-[10px] text-blue-600 font-mono">Format: [DEPT]@2000</span>
            </div>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError(null);
                }}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 focus:bg-white text-xs font-semibold text-slate-900 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none font-mono"
                placeholder="e.g. ICU@2000"
                required
              />
            </div>
          </div>

          {/* Department Password */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700">
                Department Password
              </label>
              <span className="text-[10px] text-slate-500 font-mono">Pass: ABC HOSPITAL</span>
            </div>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(null);
                }}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 focus:bg-white text-xs font-semibold text-slate-900 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none font-mono"
                placeholder="Enter ABC HOSPITAL"
                required
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Login to Department</span>
            </button>
          </div>
        </form>

        {/* Quick Department Presets */}
        <div className="pt-3 border-t border-slate-100">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-blue-600" />
            <span>Fast Department Switcher:</span>
          </div>

          <div className="grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto pr-1 scrollbar-thin">
            {HOSPITAL_CREDENTIALS.map((cred) => (
              <button
                key={cred.id}
                type="button"
                onClick={() => handleQuickPreset(cred)}
                className={`p-2 rounded-lg text-left text-[11px] transition-all border flex items-center justify-between ${
                  selectedDeptId === cred.id
                    ? 'bg-blue-50 border-blue-300 text-blue-900 font-bold'
                    : 'bg-slate-50/70 hover:bg-slate-100 border-slate-200 text-slate-700'
                }`}
              >
                <span className="truncate pr-1">{cred.code}</span>
                <span className="font-mono text-[9px] text-slate-500 shrink-0">
                  {cred.username.split('@')[0]}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
};
