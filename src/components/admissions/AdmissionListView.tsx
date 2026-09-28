import React, { useState } from 'react';
import {
  UserPlus,
  BedDouble,
  Search,
  Filter,
  LogOut,
  Calendar,
  CheckCircle,
  Eye,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { StatusBadge } from '../common/Badge';

interface AdmissionListViewProps {
  onOpenAdmissionModal: (patientId?: string) => void;
  onOpenDischargeModal: (admissionId: string) => void;
}

export const AdmissionListView: React.FC<AdmissionListViewProps> = ({
  onOpenAdmissionModal,
  onOpenDischargeModal,
}) => {
  const {
    admissions,
    patients,
    wards,
    navigateToPatient,
    canUserPerform,
  } = useHospital();

  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'DISCHARGED'>('ACTIVE');
  const [wardFilter, setWardFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredAdmissions = admissions.filter((adm) => {
    if (statusFilter !== 'ALL' && adm.status !== statusFilter) return false;
    if (wardFilter !== 'ALL' && adm.wardId !== wardFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const patient = patients.find((p) => p.id === adm.patientId);
      const matchId = adm.id.toLowerCase().includes(q);
      const matchPatId = adm.patientId.toLowerCase().includes(q);
      const matchPatName = patient?.fullName.toLowerCase().includes(q);
      const matchBed = adm.bedId.toLowerCase().includes(q);
      const matchDoctor = adm.attendingDoctor.toLowerCase().includes(q);
      const matchDiagnosis = adm.initialDiagnosis.toLowerCase().includes(q);
      if (!matchId && !matchPatId && !matchPatName && !matchBed && !matchDoctor && !matchDiagnosis)
        return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Title Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-blue-600" />
            <span>Hospital Admissions & Inpatient Census</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Active bed occupants, admission details, attending physicians, and previous visit logs.
          </p>
        </div>

        {canUserPerform('ADMIT_PATIENT') && (
          <button
            id="admissions-create-new-btn"
            onClick={() => onOpenAdmissionModal()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
          >
            <BedDouble className="w-4 h-4" />
            <span>New Inpatient Admission</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 min-w-[280px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Patient Name, ID, Bed (e.g. ICU-01), Doctor..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-600 shrink-0">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="py-1.5 px-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-800 outline-none"
            >
              <option value="ACTIVE">Active Inpatients Only</option>
              <option value="DISCHARGED">Discharged Records</option>
              <option value="ALL">All Admissions ({admissions.length})</option>
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-600 shrink-0">
            <select
              value={wardFilter}
              onChange={(e) => setWardFilter(e.target.value)}
              className="py-1.5 px-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-800 outline-none"
            >
              <option value="ALL">All Wards</option>
              {wards.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Showing <strong>{filteredAdmissions.length}</strong> admissions
        </div>
      </div>

      {/* Admissions Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Admission ID</th>
                <th className="py-3 px-4">Patient & ID</th>
                <th className="py-3 px-4">Ward & Bed</th>
                <th className="py-3 px-4">Visit #</th>
                <th className="py-3 px-4">Admission Date</th>
                <th className="py-3 px-4">Attending Physician</th>
                <th className="py-3 px-4">Working Diagnosis</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAdmissions.map((adm) => {
                const patient = patients.find((p) => p.id === adm.patientId);
                const isActive = adm.status === 'ACTIVE';

                return (
                  <tr
                    key={adm.id}
                    className="hover:bg-blue-50/40 transition-colors cursor-pointer group"
                    onClick={() => navigateToPatient(adm.patientId)}
                  >
                    <td className="py-3 px-4 font-mono font-bold text-blue-700 whitespace-nowrap">
                      {adm.id}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {patient?.fullName || 'Unknown Patient'}
                      </div>
                      <div className="font-mono text-[11px] text-slate-400">{adm.patientId}</div>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {adm.bedId}
                      </span>
                      <div className="text-[11px] text-slate-500 mt-0.5">{adm.wardName}</div>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-mono font-bold text-slate-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        Visit #{adm.visitNumber}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                      <div>{adm.admissionDate.split(' ')[0]}</div>
                      <div className="text-[10px] text-slate-400">
                        {adm.admissionDate.split(' ')[1]}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-slate-800 font-medium">
                      {adm.attendingDoctor}
                    </td>

                    <td className="py-3 px-4 max-w-xs truncate text-slate-600" title={adm.initialDiagnosis}>
                      {adm.initialDiagnosis}
                    </td>

                    <td className="py-3 px-4">
                      <StatusBadge status={adm.status} size="sm" />
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => navigateToPatient(adm.patientId)}
                          className="px-2.5 py-1 text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
                        >
                          Profile
                        </button>

                        {isActive && canUserPerform('DISCHARGE_PATIENT') && (
                          <button
                            id={`discharge-btn-${adm.id}`}
                            onClick={() => onOpenDischargeModal(adm.id)}
                            className="px-2.5 py-1 text-xs font-semibold bg-rose-600 text-white hover:bg-rose-700 rounded-lg shadow-xs transition-colors flex items-center gap-1"
                          >
                            <LogOut className="w-3.5 h-3.5" />
                            <span>Discharge</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredAdmissions.length === 0 && (
          <div className="p-8 text-center text-slate-400 text-xs">
            No admission records match your filter criteria.
          </div>
        )}
      </div>
    </div>
  );
};
