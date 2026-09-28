import React, { useState, useEffect } from 'react';
import {
  Settings,
  Building,
  RefreshCw,
  ShieldCheck,
  Database,
  Users,
  CheckCircle2,
  AlertTriangle,
  Wifi,
  WifiOff,
  HardDrive,
  Cloud,
  Smartphone,
  Download,
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { RoleBadge } from '../common/Badge';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { syncService } from '../../lib/syncService';
import { getPendingSyncCount } from '../../lib/indexedDb';
import { PWAInstallButton } from '../common/PWAInstallButton';

export const SettingsView: React.FC = () => {
  const { wards, beds, patients, devices, admissions, currentUser, resetToDemoData } = useHospital();
  const [resetConfirm, setResetConfirm] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const isOnline = useOnlineStatus();
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(0);
  const [isManualSyncing, setIsManualSyncing] = useState<boolean>(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  useEffect(() => {
    const updateCount = async () => {
      try {
        const count = await getPendingSyncCount();
        setPendingSyncCount(count);
      } catch {
        // ignore
      }
    };
    updateCount();
    const interval = setInterval(updateCount, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleManualSyncNow = async () => {
    if (!isOnline) {
      setSyncFeedback('Cannot sync: Device is offline. Local changes will sync automatically once connected.');
      setTimeout(() => setSyncFeedback(null), 5000);
      return;
    }
    setIsManualSyncing(true);
    setSyncFeedback(null);
    try {
      const res = await syncService.triggerSync();
      const count = await getPendingSyncCount();
      setPendingSyncCount(count);
      setSyncFeedback(
        res.success
          ? `Cloud sync completed successfully at ${res.lastSyncedAt || 'now'}.`
          : `Sync completed with warning: ${res.error || 'Server unreachable'}`
      );
    } catch (e: any) {
      setSyncFeedback(`Sync failed: ${e?.message || 'Network error'}`);
    } finally {
      setIsManualSyncing(false);
      setTimeout(() => setSyncFeedback(null), 5000);
    }
  };

  const handleReset = () => {
    resetToDemoData();
    setResetConfirm(false);
    setResetSuccess(true);
    setTimeout(() => setResetSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-600" />
            <span>Hospital System Settings & Infrastructure</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Internal facility configurations, departmental hierarchy, and data management.
          </p>
        </div>
      </div>

      {resetSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Demo dataset successfully refreshed with all 30+ beds, exemplar patients, and clinical visits!</span>
        </div>
      )}

      {/* Hospital Identity Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Building className="w-4 h-4 text-blue-600" />
          <span>Facility Profile: Hospify</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400">Hospital National ID</span>
            <div className="font-mono font-bold text-slate-900 mt-0.5">HOSP-US-90214-OR</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400">Total Inpatient Beds Configured</span>
            <div className="font-mono font-bold text-slate-900 mt-0.5">{beds.length} Standard Beds</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400">Clinical Wards & Units</span>
            <div className="font-mono font-bold text-slate-900 mt-0.5">{wards.length} Operating Wards</div>
          </div>
        </div>
      </div>

      {/* PWA & Offline-First Infrastructure Card */}
      <div className="bg-white rounded-2xl border border-blue-200 p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-blue-600" />
              <span>Progressive Web App (PWA) & Offline Storage Engine</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Service Worker runtime caching, client-side IndexedDB persistence, and bi-directional cloud synchronization.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                isOnline
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse'
              }`}
            >
              {isOnline ? (
                <>
                  <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Network: Online</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-amber-600" />
                  <span>Network: Offline Mode</span>
                </>
              )}
            </span>
          </div>
        </div>

        {/* Storage Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-slate-400 text-[11px]">IndexedDB Patients</span>
            <div className="font-bold text-slate-900 mt-1 text-sm">{patients.length} Cached</div>
            <div className="text-[10px] text-emerald-600 mt-0.5 font-medium">✓ Local Replica Active</div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-slate-400 text-[11px]">IndexedDB Beds</span>
            <div className="font-bold text-slate-900 mt-1 text-sm">{beds.length} Cached</div>
            <div className="text-[10px] text-emerald-600 mt-0.5 font-medium">✓ All Wards Stored</div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-slate-400 text-[11px]">Medical Devices</span>
            <div className="font-bold text-slate-900 mt-1 text-sm">{devices.length} Tracked</div>
            <div className="text-[10px] text-emerald-600 mt-0.5 font-medium">✓ BME Telemetry</div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-slate-400 text-[11px]">Pending Sync Queue</span>
            <div className={`font-bold mt-1 text-sm ${pendingSyncCount > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
              {pendingSyncCount} Item{pendingSyncCount === 1 ? '' : 's'}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              {pendingSyncCount > 0 ? 'Queued for cloud push' : 'In Sync with Cloud'}
            </div>
          </div>
        </div>

        {/* Sync Controls & PWA Install */}
        <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={handleManualSyncNow}
              disabled={isManualSyncing}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isManualSyncing ? 'animate-spin' : ''}`} />
              <span>{isManualSyncing ? 'Syncing with Cloud...' : 'Synchronize Now with Cloud'}</span>
            </button>
            <span className="text-xs text-slate-500">Auto-sync runs automatically every 30s when online.</span>
          </div>

          <div className="flex items-center gap-2">
            <PWAInstallButton variant="header" />
          </div>
        </div>

        {syncFeedback && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800 font-medium">
            {syncFeedback}
          </div>
        )}
      </div>

      {/* Role Permission Matrix Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          <span>Role-Based Access Control (RBAC) Privilege Matrix</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Role</th>
                <th className="py-2.5 px-3">Patient Registration</th>
                <th className="py-2.5 px-3">Admit to Bed</th>
                <th className="py-2.5 px-3">Bed Status Change</th>
                <th className="py-2.5 px-3">Clinical Notes</th>
                <th className="py-2.5 px-3">Prescriptions</th>
                <th className="py-2.5 px-3">Discharge</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-2.5 px-3 font-bold text-slate-800">
                  <RoleBadge role="Hospital Admin" />
                </td>
                <td className="py-2.5 px-3 text-emerald-600 font-bold">✓ Full</td>
                <td className="py-2.5 px-3 text-emerald-600 font-bold">✓ Full</td>
                <td className="py-2.5 px-3 text-emerald-600 font-bold">✓ Full</td>
                <td className="py-2.5 px-3 text-emerald-600 font-bold">✓ Full</td>
                <td className="py-2.5 px-3 text-emerald-600 font-bold">✓ Full</td>
                <td className="py-2.5 px-3 text-emerald-600 font-bold">✓ Full</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-slate-800">
                  <RoleBadge role="Doctor" />
                </td>
                <td className="py-2.5 px-3 text-slate-400">View only</td>
                <td className="py-2.5 px-3 text-emerald-600 font-bold">✓ Full</td>
                <td className="py-2.5 px-3 text-slate-400">View only</td>
                <td className="py-2.5 px-3 text-emerald-600 font-bold">✓ Full</td>
                <td className="py-2.5 px-3 text-emerald-600 font-bold">✓ Full</td>
                <td className="py-2.5 px-3 text-emerald-600 font-bold">✓ Full</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-slate-800">
                  <RoleBadge role="Nurse" />
                </td>
                <td className="py-2.5 px-3 text-slate-400">View only</td>
                <td className="py-2.5 px-3 text-slate-400">Assisted</td>
                <td className="py-2.5 px-3 text-emerald-600 font-bold">✓ Cleaning/Avail</td>
                <td className="py-2.5 px-3 text-emerald-600 font-bold">✓ Nursing Notes</td>
                <td className="py-2.5 px-3 text-slate-400">View only</td>
                <td className="py-2.5 px-3 text-slate-400">View only</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-slate-800">
                  <RoleBadge role="Reception / Admission" />
                </td>
                <td className="py-2.5 px-3 text-emerald-600 font-bold">✓ Full</td>
                <td className="py-2.5 px-3 text-emerald-600 font-bold">✓ Full</td>
                <td className="py-2.5 px-3 text-slate-400">View only</td>
                <td className="py-2.5 px-3 text-slate-400">View only</td>
                <td className="py-2.5 px-3 text-slate-400">View only</td>
                <td className="py-2.5 px-3 text-slate-400">View only</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-slate-800">
                  <RoleBadge role="Biomedical / Support" />
                </td>
                <td className="py-2.5 px-3 text-slate-400">None</td>
                <td className="py-2.5 px-3 text-slate-400">None</td>
                <td className="py-2.5 px-3 text-emerald-600 font-bold">✓ Maintenance Only</td>
                <td className="py-2.5 px-3 text-slate-400">None</td>
                <td className="py-2.5 px-3 text-slate-400">None</td>
                <td className="py-2.5 px-3 text-slate-400">None</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Demo Reset Card */}
      <div className="bg-white rounded-2xl border border-rose-200 p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-rose-900 flex items-center gap-2">
          <Database className="w-4 h-4 text-rose-600" />
          <span>Demo Data Management & Reset</span>
        </h3>
        <p className="text-xs text-slate-600">
          Restore the sample clinical dataset to the initial baseline (36 beds, exemplar multi-visit patient PAT-2026-00125, test admissions, and pharmacy records).
        </p>

        {resetConfirm ? (
          <div className="p-4 bg-rose-50 rounded-xl border border-rose-200 space-y-3">
            <div className="text-xs font-bold text-rose-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>Are you sure you want to reset all mock hospital data?</span>
            </div>
            <p className="text-xs text-rose-700">
              This will overwrite current local changes and restore the pristine demo records.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg shadow-xs"
              >
                Yes, Reset Database
              </button>
              <button
                onClick={() => setResetConfirm(false)}
                className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-lg border border-slate-200"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setResetConfirm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 font-bold text-xs rounded-xl transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reset Demo Hospital Data</span>
          </button>
        )}
      </div>
    </div>
  );
};
