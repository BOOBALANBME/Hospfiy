import React, { useState } from 'react';
import {
  Users,
  Search,
  UserPlus,
  BedDouble,
  FileText,
  AlertTriangle,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { StatusBadge } from '../common/Badge';

interface PatientListViewProps {
  onOpenRegisterModal: () => void;
  onOpenAdmissionModal: (patientId?: string) => void;
}

export const PatientListView: React.FC<PatientListViewProps> = ({
  onOpenRegisterModal,
  onOpenAdmissionModal,
}) => {
  const {
    patients,
    admissions,
    navigateToPatient,
    canUserPerform,
  } = useHospital();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Inpatient' | 'Outpatient' | 'Discharged'>('ALL');

  // Filter logic
  const filteredPatients = patients.filter((p) => {
    if (statusFilter !== 'ALL' && p.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = p.id.toLowerCase().includes(q);
      const matchName = p.fullName.toLowerCase().includes(q);
      const matchPhone = p.phone.includes(q);
      const matchBlood = p.bloodGroup.toLowerCase().includes(q);
      if (!matchId && !matchName && !matchPhone && !matchBlood) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span>Master Patient Index & Records</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Permanent Patient ID repository. All admissions, discharge summaries, and medical history
            remain linked.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {canUserPerform('REGISTER_PATIENT') && (
            <button
              id="patient-list-register-btn"
              onClick={onOpenRegisterModal}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              <span>Register New Patient</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 min-w-[280px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="patient-list-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Patient ID (PAT-2026-00125), Name, Phone, Blood Group..."
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
              <option value="ALL">All Statuses ({patients.length})</option>
              <option value="Inpatient">Inpatient (Active)</option>
              <option value="Outpatient">Outpatient</option>
              <option value="Discharged">Discharged</option>
            </select>
          </div>
        </div>

        {/* Quick Exemplar Patient Button */}
        <button
          onClick={() => navigateToPatient('PAT-2026-00125')}
          className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-lg text-xs font-semibold flex items-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>Inspect Eleanor Bennett (3 Visits History)</span>
        </button>
      </div>

      {/* Patient Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Patient ID</th>
                <th className="py-3 px-4">Full Name</th>
                <th className="py-3 px-4">Age / Gender</th>
                <th className="py-3 px-4">Blood Group</th>
                <th className="py-3 px-4">Allergies</th>
                <th className="py-3 px-4">Current Bed / Ward</th>
                <th className="py-3 px-4">Total Visits</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPatients.map((patient) => {
                const patientVisits = admissions.filter((a) => a.patientId === patient.id);
                const activeVisit = patientVisits.find((a) => a.status === 'ACTIVE');

                return (
                  <tr
                    key={patient.id}
                    className="hover:bg-blue-50/40 transition-colors cursor-pointer group"
                    onClick={() => navigateToPatient(patient.id)}
                  >
                    {/* Patient ID */}
                    <td className="py-3 px-4 font-mono font-bold text-blue-600 whitespace-nowrap">
                      {patient.id}
                    </td>

                    {/* Name & Phone */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {patient.fullName}
                      </div>
                      <div className="text-[11px] text-slate-400">{patient.phone}</div>
                    </td>

                    {/* Age / Gender */}
                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                      {patient.age} yrs • {patient.gender}
                    </td>

                    {/* Blood Group */}
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {patient.bloodGroup}
                      </span>
                    </td>

                    {/* Allergies */}
                    <td className="py-3 px-4 max-w-xs">
                      {patient.allergies && patient.allergies.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {patient.allergies.slice(0, 2).map((allg, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200 truncate max-w-[130px]"
                            >
                              {allg}
                            </span>
                          ))}
                          {patient.allergies.length > 2 && (
                            <span className="text-[10px] text-slate-400 font-medium">
                              +{patient.allergies.length - 2}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px]">None known</span>
                      )}
                    </td>

                    {/* Active Bed / Ward */}
                    <td className="py-3 px-4">
                      {activeVisit ? (
                        <div>
                          <span className="font-mono font-bold text-slate-900 bg-rose-50 text-rose-700 border border-rose-200 px-1.5 py-0.5 rounded text-[11px]">
                            {activeVisit.bedId}
                          </span>
                          <span className="text-slate-600 text-[11px] ml-1.5">
                            {activeVisit.wardName}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px]">No active bed</span>
                      )}
                    </td>

                    {/* Visits count */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                        {patientVisits.length} {patientVisits.length === 1 ? 'Visit' : 'Visits'}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-4">
                      <StatusBadge status={patient.status} size="sm" />
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => navigateToPatient(patient.id)}
                          className="px-2.5 py-1 text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
                        >
                          View Profile
                        </button>

                        {!activeVisit && canUserPerform('ADMIT_PATIENT') && (
                          <button
                            onClick={() => onOpenAdmissionModal(patient.id)}
                            className="px-2.5 py-1 text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg shadow-xs transition-colors"
                          >
                            Admit
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

        {filteredPatients.length === 0 && (
          <div className="p-8 text-center text-slate-400 text-xs">
            No registered patients matching your search criteria.
          </div>
        )}
      </div>
    </div>
  );
};
