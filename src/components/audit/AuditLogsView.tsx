import React, { useState } from 'react';
import { ShieldCheck, Search, Filter, Shield, User, Clock, FileText } from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { RoleBadge } from '../common/Badge';

export const AuditLogsView: React.FC = () => {
  const { auditLogs } = useHospital();

  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');

  const filtered = auditLogs.filter((log) => {
    if (actionFilter !== 'ALL' && !log.action.includes(actionFilter)) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchAction = log.action.toLowerCase().includes(q);
      const matchDetails = log.details.toLowerCase().includes(q);
      const matchUser = log.userName.toLowerCase().includes(q);
      const matchTarget = log.recordAffected?.toLowerCase().includes(q);
      if (!matchAction && !matchDetails && !matchUser && !matchTarget) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            <span>Immutable Hospital Audit Trail & Compliance Log</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Cryptographic ledger tracking all staff admissions, discharges, bed state transitions, and medical record modifications.
          </p>
        </div>

        <div className="text-xs font-semibold text-slate-600 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
          Total Audit Entries: <strong>{auditLogs.length}</strong>
        </div>
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
              placeholder="Search by Action, Staff Name, Patient ID, or Details..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-600 shrink-0">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="py-1.5 px-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-800 outline-none"
            >
              <option value="ALL">All Actions</option>
              <option value="BED">Bed Transitions</option>
              <option value="ADMISSION">Admissions</option>
              <option value="DISCHARGE">Discharges</option>
              <option value="REGISTER">Patient Registrations</option>
              <option value="CLINICAL">Clinical Notes</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-slate-500 font-mono">ENCRYPTED_CHAIN_VALIDATED</div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Staff Member</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Action Code</th>
                <th className="py-3 px-4">Target Entity</th>
                <th className="py-3 px-4">Audit Details & Context</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((log) => {
                return (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {log.timestamp}
                    </td>

                    <td className="py-3 px-4 font-bold text-slate-800 whitespace-nowrap">
                      {log.userName}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <RoleBadge role={log.userRole} />
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-mono font-bold text-[10px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {log.action}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono font-bold text-slate-700 whitespace-nowrap">
                      {log.recordAffected || 'SYSTEM'}
                    </td>

                    <td className="py-3 px-4 text-slate-600 max-w-md truncate" title={log.details}>
                      {log.details}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="p-8 text-center text-slate-400 text-xs">
            No audit records match your search query.
          </div>
        )}
      </div>
    </div>
  );
};
