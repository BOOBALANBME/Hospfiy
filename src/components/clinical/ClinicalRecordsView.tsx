import React, { useState } from 'react';
import { FileHeart, Search, Filter, Plus, HeartPulse, User, Clock } from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { ClinicalRecord } from '../../types/hospital';

interface ClinicalRecordsViewProps {
  onOpenAddNoteModal: (patientId: string, visitId: string) => void;
}

export const ClinicalRecordsView: React.FC<ClinicalRecordsViewProps> = ({
  onOpenAddNoteModal,
}) => {
  const { clinicalRecords, patients, admissions, navigateToPatient } = useHospital();

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  const filtered = clinicalRecords.filter((rec) => {
    if (typeFilter !== 'ALL' && rec.recordType !== typeFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const patient = patients.find((p) => p.id === rec.patientId);
      const matchTitle = rec.title.toLowerCase().includes(q);
      const matchContent = rec.content.toLowerCase().includes(q);
      const matchAuthor = rec.authorName.toLowerCase().includes(q);
      const matchPat = patient?.fullName.toLowerCase().includes(q) || rec.patientId.toLowerCase().includes(q);
      if (!matchTitle && !matchContent && !matchAuthor && !matchPat) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileHeart className="w-5 h-5 text-blue-600" />
            <span>Clinical Progress Notes & Vitals Registry</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time multi-disciplinary clinical entries: Doctor assessment rounds, Nursing shift notes, and bedside vital signs.
          </p>
        </div>

        <div className="text-xs font-semibold text-slate-600 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
          Total Clinical Records: <strong>{clinicalRecords.length}</strong>
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
              placeholder="Search by Note Title, Patient, Doctor, or Clinical keywords..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-600 shrink-0">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="py-1.5 px-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-800 outline-none"
            >
              <option value="ALL">All Clinical Note Types</option>
              <option value="DOCTOR_NOTE">Doctor Notes</option>
              <option value="NURSING_NOTE">Nursing Shift Notes</option>
              <option value="VITALS_LOG">Vitals Logs</option>
              <option value="LAB_RESULT">Diagnostic Results</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Showing <strong>{filtered.length}</strong> clinical entries
        </div>
      </div>

      {/* List */}
      <div className="space-y-4">
        {filtered.map((rec) => {
          const patient = patients.find((p) => p.id === rec.patientId);

          return (
            <div
              key={rec.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-blue-300 transition-all space-y-3"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide ${
                      rec.recordType === 'DOCTOR_NOTE'
                        ? 'bg-blue-100 text-blue-800'
                        : rec.recordType === 'NURSING_NOTE'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}
                  >
                    {rec.recordType.replace('_', ' ')}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900">{rec.title}</h3>
                </div>

                <div className="text-xs text-slate-400 font-mono">{rec.timestamp}</div>
              </div>

              {/* Patient link */}
              <div
                onClick={() => navigateToPatient(rec.patientId, 'clinical')}
                className="text-xs font-semibold text-slate-700 hover:text-blue-600 cursor-pointer flex items-center gap-2"
              >
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Patient: {patient?.fullName}</span>
                <span className="font-mono text-blue-600 font-normal">({rec.patientId})</span>
                <span>•</span>
                <span className="text-slate-400 font-mono">Visit: {rec.visitId}</span>
              </div>

              {/* Content */}
              <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50/70 p-3 rounded-lg border border-slate-100">
                {rec.content}
              </p>

              {/* Attached Vitals */}
              {rec.vitals && (
                <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs">
                  <div className="text-[11px] font-bold text-slate-600 mb-1.5 flex items-center gap-1.5">
                    <HeartPulse className="w-4 h-4 text-rose-500" />
                    <span>Bedside Vital Signs Captured:</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
                    <div className="bg-slate-50 p-2 rounded">
                      <div className="text-[10px] text-slate-400">Heart Rate</div>
                      <div className="font-bold text-slate-900 font-mono">
                        {rec.vitals.heartRate} bpm
                      </div>
                    </div>
                    <div className="bg-slate-50 p-2 rounded">
                      <div className="text-[10px] text-slate-400">Blood Pressure</div>
                      <div className="font-bold text-slate-900 font-mono">
                        {rec.vitals.bloodPressureSys}/{rec.vitals.bloodPressureDia}
                      </div>
                    </div>
                    <div className="bg-slate-50 p-2 rounded">
                      <div className="text-[10px] text-slate-400">Temperature</div>
                      <div className="font-bold text-slate-900 font-mono">
                        {rec.vitals.temperature} °C
                      </div>
                    </div>
                    <div className="bg-slate-50 p-2 rounded">
                      <div className="text-[10px] text-slate-400">Oxygen Saturation</div>
                      <div className="font-bold text-slate-900 font-mono">
                        {rec.vitals.oxygenSaturation}%
                      </div>
                    </div>
                    <div className="bg-slate-50 p-2 rounded">
                      <div className="text-[10px] text-slate-400">Resp. Rate</div>
                      <div className="font-bold text-slate-900 font-mono">
                        {rec.vitals.respiratoryRate}/min
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Author footer */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>
                  Recorded by: <strong className="text-slate-600">{rec.authorName}</strong> (
                  {rec.authorRole})
                </span>
                <button
                  onClick={() => navigateToPatient(rec.patientId, 'clinical')}
                  className="font-semibold text-blue-600 hover:text-blue-800"
                >
                  View in Patient History →
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200 text-slate-400 text-xs">
          No clinical records match your search criteria.
        </div>
      )}
    </div>
  );
};
