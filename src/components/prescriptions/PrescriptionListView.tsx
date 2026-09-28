import React, { useState } from 'react';
import { Pill, Search, Filter, Plus, User, CheckCircle, Clock } from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';

interface PrescriptionListViewProps {
  onOpenAddRxModal: (patientId: string, visitId: string) => void;
}

export const PrescriptionListView: React.FC<PrescriptionListViewProps> = ({
  onOpenAddRxModal,
}) => {
  const { prescriptions, patients, admissions, navigateToPatient, canUserPerform } = useHospital();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'COMPLETED' | 'DISCONTINUED'>('ALL');

  const filtered = prescriptions.filter((rx) => {
    if (statusFilter !== 'ALL' && rx.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const patient = patients.find((p) => p.id === rx.patientId);
      const matchMed = rx.medicineName.toLowerCase().includes(q);
      const matchDoc = rx.prescribingDoctor.toLowerCase().includes(q);
      const matchPat = patient?.fullName.toLowerCase().includes(q) || rx.patientId.toLowerCase().includes(q);
      if (!matchMed && !matchDoc && !matchPat) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Pill className="w-5 h-5 text-blue-600" />
            <span>Hospital Pharmacy & Inpatient Medication Registry</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time inpatient medication administration orders, dosages, routes, and prescribing physician logs.
          </p>
        </div>

        <div className="text-xs font-semibold text-slate-600 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
          Total Orders: <strong>{prescriptions.length}</strong> (
          <strong className="text-blue-700">
            {prescriptions.filter((r) => r.status === 'ACTIVE').length} Active
          </strong>
          )
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
              placeholder="Search by Medication (e.g. Lisinopril), Patient, or Doctor..."
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
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active Orders Only</option>
              <option value="COMPLETED">Completed</option>
              <option value="DISCONTINUED">Discontinued</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-slate-500">
          Showing <strong>{filtered.length}</strong> items
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Rx ID</th>
                <th className="py-3 px-4">Patient</th>
                <th className="py-3 px-4">Medication & Strength</th>
                <th className="py-3 px-4">Route & Frequency</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Prescribed By</th>
                <th className="py-3 px-4">Date/Time</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((rx) => {
                const patient = patients.find((p) => p.id === rx.patientId);
                const isActive = rx.status === 'ACTIVE';

                return (
                  <tr
                    key={rx.id}
                    className="hover:bg-blue-50/40 transition-colors cursor-pointer group"
                    onClick={() => navigateToPatient(rx.patientId, 'prescriptions')}
                  >
                    <td className="py-3 px-4 font-mono font-bold text-blue-700">{rx.id}</td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {patient?.fullName || rx.patientId}
                      </div>
                      <div className="font-mono text-[11px] text-slate-400">{rx.patientId}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{rx.medicineName}</div>
                      <span className="font-mono text-[11px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                        {rx.dosage}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-600">
                      <div>{rx.frequency}</div>
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded">
                        {rx.route}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-600">{rx.duration}</td>

                    <td className="py-3 px-4 text-slate-800 font-medium">{rx.prescribingDoctor}</td>

                    <td className="py-3 px-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                      {rx.prescribedAt}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          isActive
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {rx.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => navigateToPatient(rx.patientId, 'prescriptions')}
                        className="px-2.5 py-1 text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
                      >
                        Patient Rx
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="p-8 text-center text-slate-400 text-xs">
            No prescriptions matching your search criteria.
          </div>
        )}
      </div>
    </div>
  );
};
