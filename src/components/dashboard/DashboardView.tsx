import React from 'react';
import {
  BedDouble,
  UserPlus,
  Users,
  LogOut,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  HeartPulse,
  AlertCircle,
  Clock,
  ShieldAlert,
  CheckCircle2,
  Calendar,
  Building,
  TrendingUp,
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { StatusBadge } from '../common/Badge';
import { DashboardWardMap } from './DashboardWardMap';

interface DashboardViewProps {
  onOpenRegisterModal: () => void;
  onOpenAdmissionModal: (patientId?: string, bedId?: string, wardId?: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenRegisterModal,
  onOpenAdmissionModal,
}) => {
  const {
    stats,
    beds,
    admissions,
    wards,
    setActiveTab,
    navigateToPatient,
    navigateToBed,
    canUserPerform,
  } = useHospital();

  const recentAdmissions = admissions.slice(0, 5);
  const recentDischarges = admissions
    .filter((a) => a.status === 'DISCHARGED')
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Top Banner / Quick Action Bar */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/20 text-white backdrop-blur-xs border border-white/20">
              Live Hospital Operations
            </span>
            <span className="text-xs text-blue-200">Facility ID: STJ-OR-9002</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Clinical Census & Bed Management</h2>
          <p className="text-sm text-blue-100/90 mt-1 max-w-xl">
            Real-time tracking of 250 inpatient beds across 15 specialized medical departments
            (15–20 beds each), active admissions, patient multi-visit history, and terminal cleaning queues.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {canUserPerform('REGISTER_PATIENT') && (
            <button
              id="dashboard-register-patient-btn"
              onClick={onOpenRegisterModal}
              className="flex items-center gap-2 px-4 py-2.5 bg-white text-blue-900 hover:bg-blue-50 font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
            >
              <UserPlus className="w-4 h-4 text-blue-600" />
              <span>Register Patient</span>
            </button>
          )}

          {canUserPerform('ADMIT_PATIENT') && (
            <button
              id="dashboard-new-admission-btn"
              onClick={() => onOpenAdmissionModal()}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-400 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 border border-blue-400/40"
            >
              <BedDouble className="w-4 h-4" />
              <span>New Admission</span>
            </button>
          )}

          <button
            onClick={() => navigateToPatient('PAT-2026-00125')}
            className="flex items-center gap-2 px-3 py-2.5 bg-blue-950/60 hover:bg-blue-950 text-blue-100 font-semibold text-xs rounded-xl border border-blue-400/30 transition-all"
            title="Inspect Eleanor Bennett with 3 historical visits"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Open Demo Exemplar (PAT-2026-00125)</span>
          </button>
        </div>
      </div>

      {/* Primary Hospital Stats Grid (All requested metrics) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Total Beds */}
        <div
          onClick={() => setActiveTab('beds')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-blue-400 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Total Beds</span>
            <BedDouble className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2 font-mono">{stats.totalBeds}</div>
          <div className="text-[11px] text-slate-400 mt-1">Across 6 Wards</div>
        </div>

        {/* Available Beds */}
        <div
          onClick={() => setActiveTab('beds')}
          className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-200/80 shadow-xs hover:border-emerald-400 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-xs text-emerald-800 font-medium">
            <span>Available Beds</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-700 mt-2 font-mono">
            {stats.availableBeds}
          </div>
          <div className="text-[11px] text-emerald-600 mt-1 font-medium">Ready for admission</div>
        </div>

        {/* Occupied Beds */}
        <div
          onClick={() => setActiveTab('beds')}
          className="bg-rose-50/60 p-4 rounded-xl border border-rose-200/80 shadow-xs hover:border-rose-400 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-xs text-rose-800 font-medium">
            <span>Occupied Beds</span>
            <HeartPulse className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-extrabold text-rose-700 mt-2 font-mono">
            {stats.occupiedBeds}
          </div>
          <div className="text-[11px] text-rose-600 mt-1 font-medium">
            {stats.occupancyRate}% Total Occupancy
          </div>
        </div>

        {/* Reserved Beds */}
        <div
          onClick={() => setActiveTab('beds')}
          className="bg-amber-50/60 p-4 rounded-xl border border-amber-200/80 shadow-xs hover:border-amber-400 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-xs text-amber-800 font-medium">
            <span>Reserved</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-extrabold text-amber-700 mt-2 font-mono">
            {stats.reservedBeds}
          </div>
          <div className="text-[11px] text-amber-600 mt-1">Pending ER/Transfers</div>
        </div>

        {/* Cleaning Beds */}
        <div
          onClick={() => setActiveTab('beds')}
          className="bg-cyan-50/60 p-4 rounded-xl border border-cyan-200/80 shadow-xs hover:border-cyan-400 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-xs text-cyan-800 font-medium">
            <span>Terminal Cleaning</span>
            <Activity className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="text-2xl font-extrabold text-cyan-700 mt-2 font-mono">
            {stats.cleaningBeds}
          </div>
          <div className="text-[11px] text-cyan-600 mt-1">Sanitization queue</div>
        </div>

        {/* Maintenance */}
        <div
          onClick={() => setActiveTab('beds')}
          className="bg-purple-50/60 p-4 rounded-xl border border-purple-200/80 shadow-xs hover:border-purple-400 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-xs text-purple-800 font-medium">
            <span>Maintenance</span>
            <ShieldAlert className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-extrabold text-purple-700 mt-2 font-mono">
            {stats.maintenanceBeds}
          </div>
          <div className="text-[11px] text-purple-600 mt-1">Biomedical Work Order</div>
        </div>
      </div>

      {/* Secondary Metrics Row: Admissions & Patient Census */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Current Inpatients</div>
          <div className="text-2xl font-bold text-slate-900 mt-1 font-mono">{stats.currentAdmissions}</div>
          <div className="text-xs text-slate-500 mt-0.5">Active hospitalizations</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Today's Admissions</div>
          <div className="text-2xl font-bold text-blue-600 mt-1 font-mono">{stats.todayAdmissions}</div>
          <div className="text-xs text-blue-600 mt-0.5 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Intake activity</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Today's Discharges</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1 font-mono">{stats.todayDischarges}</div>
          <div className="text-xs text-emerald-600 mt-0.5 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Turnover processed</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Registered Patients</div>
          <div className="text-2xl font-bold text-slate-900 mt-1 font-mono">{stats.totalPatients}</div>
          <div className="text-xs text-slate-500 mt-0.5">Permanent patient IDs</div>
        </div>
      </div>

      {/* Middle Section: 15 Departments Interactive Ward Map & Floor Plan */}
      <DashboardWardMap
        onOpenRegisterModal={onOpenRegisterModal}
        onOpenAdmissionModal={onOpenAdmissionModal}
      />

      {/* Bottom Section: Recent Admissions and Recent Discharges */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Admissions Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">Recent Hospital Admissions</h3>
            </div>
            <button
              onClick={() => setActiveTab('admissions')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800"
            >
              All Admissions →
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {recentAdmissions.map((adm) => {
              return (
                <div
                  key={adm.id}
                  onClick={() => navigateToPatient(adm.patientId)}
                  className="p-3.5 hover:bg-slate-50/80 cursor-pointer transition-colors flex items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="font-bold text-slate-900 flex items-center gap-2">
                      <span className="font-mono text-blue-600">{adm.patientId}</span>
                      <span>•</span>
                      <span className="text-slate-700">{adm.wardName}</span>
                      <span className="font-mono font-semibold bg-slate-100 px-1.5 py-0.2 rounded text-[11px]">
                        {adm.bedId}
                      </span>
                    </div>
                    <div className="text-slate-500 truncate max-w-sm">
                      {adm.initialDiagnosis || adm.reasonForAdmission}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-slate-400 text-[11px]">{adm.admissionDate}</div>
                    <span
                      className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full border mt-0.5 ${
                        adm.admissionType === 'Emergency'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}
                    >
                      {adm.admissionType}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Discharges Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2">
              <LogOut className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">Recent Completed Discharges</h3>
            </div>
            <button
              onClick={() => setActiveTab('discharges')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800"
            >
              Discharge Log →
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {recentDischarges.length > 0 ? (
              recentDischarges.map((adm) => (
                <div
                  key={adm.id}
                  onClick={() => navigateToPatient(adm.patientId, 'visits')}
                  className="p-3.5 hover:bg-slate-50/80 cursor-pointer transition-colors flex items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="font-bold text-slate-900 flex items-center gap-2">
                      <span className="font-mono text-emerald-700">{adm.patientId}</span>
                      <span>•</span>
                      <span>Visit #{adm.visitNumber}</span>
                      <span className="text-slate-500 font-normal">({adm.wardName})</span>
                    </div>
                    <div className="text-slate-500 truncate max-w-sm">
                      {adm.dischargeRecord?.finalDiagnosis || adm.initialDiagnosis}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-slate-400 text-[11px]">{adm.dischargeDate}</div>
                    <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full border mt-0.5 bg-emerald-50 text-emerald-700 border-emerald-200">
                      {adm.dischargeRecord?.dischargeCondition || 'Discharged'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-sm text-slate-400">
                No recent discharges recorded today.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
