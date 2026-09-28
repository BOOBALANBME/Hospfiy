import React, { useState } from 'react';
import {
  LogOut,
  Search,
  Filter,
  CheckCircle,
  Eye,
  Calendar,
  Printer,
  FileText,
  User,
  Brush,
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { DischargeRecord } from '../../types/hospital';
import { Modal } from '../common/Modal';

export const DischargeListView: React.FC = () => {
  const { admissions, patients, beds, navigateToPatient } = useHospital();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<{
    adm: any;
    disc: DischargeRecord;
    patient: any;
  } | null>(null);

  // Collect all discharged admissions
  const dischargedList = admissions
    .filter((a) => a.status === 'DISCHARGED' && a.dischargeRecord)
    .sort((a, b) => new Date(b.dischargeDate || '').getTime() - new Date(a.dischargeDate || '').getTime());

  const filtered = dischargedList.filter(({ dischargeRecord: disc, patientId, bedId }) => {
    if (!disc) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const patient = patients.find((p) => p.id === patientId);
      const matchPat = patient?.fullName.toLowerCase().includes(q) || patientId.toLowerCase().includes(q);
      const matchBed = bedId.toLowerCase().includes(q);
      const matchDoc = disc.approvedBy.toLowerCase().includes(q);
      const matchDiag = disc.finalDiagnosis.toLowerCase().includes(q);
      const matchId = disc.id.toLowerCase().includes(q);
      if (!matchPat && !matchBed && !matchDoc && !matchDiag && !matchId) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <LogOut className="w-5 h-5 text-emerald-600" />
            <span>Discharge Registry & Summary Archives</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Permanent repository of clinical discharge records, take-home medication instructions,
            and terminal bed sanitation logs.
          </p>
        </div>

        <div className="text-xs font-semibold text-slate-600 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-xs">
          Total Discharges Completed: <strong className="text-emerald-700">{dischargedList.length}</strong>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[280px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Patient ID, Patient Name, Bed, Diagnosis, or Approving Doctor..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 focus:bg-white"
          />
        </div>
      </div>

      {/* Discharged Records Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((adm) => {
          const disc = adm.dischargeRecord!;
          const patient = patients.find((p) => p.id === adm.patientId);
          const bed = beds.find((b) => b.id === adm.bedId);

          return (
            <div
              key={disc.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-blue-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {disc.id}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500">
                      Visit #{adm.visitNumber} ({adm.id})
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {disc.dischargeDate}
                  </span>
                </div>

                {/* Patient and Bed info */}
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3
                      onClick={() => navigateToPatient(adm.patientId)}
                      className="text-sm font-bold text-slate-900 hover:text-blue-600 cursor-pointer flex items-center gap-1.5"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      <span>{patient?.fullName}</span>
                      <span className="font-mono text-xs text-blue-600 font-normal">
                        ({adm.patientId})
                      </span>
                    </h3>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {adm.wardName} • Bed{' '}
                      <span className="font-mono font-semibold text-slate-700">{adm.bedId}</span>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {disc.dischargeCondition}
                  </span>
                </div>

                {/* Clinical Snapshot */}
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1.5 text-xs">
                  <div>
                    <span className="font-semibold text-slate-600">Final Diagnosis:</span>
                    <div className="font-bold text-slate-900">{disc.finalDiagnosis}</div>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-600">Treatment Summary:</span>
                    <div className="text-slate-700 line-clamp-2">{disc.treatmentSummary}</div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400">
                  Approved: <strong className="text-slate-600">{disc.approvedBy}</strong>
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedRecord({ adm, disc, patient })}
                    className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg transition-colors flex items-center gap-1 border border-blue-200"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Formal Summary</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200 text-slate-400 text-xs">
          No discharge records match your search criteria.
        </div>
      )}

      {/* Formal Discharge Summary Print / Inspection Modal */}
      {selectedRecord && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedRecord(null)}
          title={`Hospital Discharge Summary • ${selectedRecord.disc.id}`}
          subtitle={`Hospify • Inpatient Visit #${selectedRecord.adm.visitNumber}`}
          maxWidth="2xl"
          id="discharge-summary-viewer-modal"
        >
          <div className="space-y-4 text-xs">
            {/* Header document card */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div>
                  <div className="text-xs uppercase font-extrabold text-blue-900 tracking-wider">
                    Official Clinical Discharge Certificate
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Admission Date: {selectedRecord.adm.admissionDate} | Discharge Date:{' '}
                    {selectedRecord.disc.dischargeDate}
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                    {selectedRecord.disc.dischargeCondition}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
                <div>
                  <span className="text-slate-400">Patient Legal Name:</span>
                  <div className="font-bold text-slate-900">{selectedRecord.patient?.fullName}</div>
                </div>
                <div>
                  <span className="text-slate-400">Permanent ID:</span>
                  <div className="font-mono font-bold text-blue-700">
                    {selectedRecord.patient?.id}
                  </div>
                </div>
                <div>
                  <span className="text-slate-400">Ward & Bed:</span>
                  <div className="font-bold text-slate-900">
                    {selectedRecord.adm.wardName} ({selectedRecord.adm.bedId})
                  </div>
                </div>
                <div>
                  <span className="text-slate-400">Blood Group:</span>
                  <div className="font-mono font-bold text-slate-800">
                    {selectedRecord.patient?.bloodGroup}
                  </div>
                </div>
              </div>
            </div>

            {/* Diagnostic Content */}
            <div className="space-y-3">
              <div>
                <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                  1. Final Primary Diagnosis
                </span>
                <p className="mt-1 p-2.5 bg-blue-50/50 rounded-lg border border-blue-100 font-semibold text-slate-900">
                  {selectedRecord.disc.finalDiagnosis}
                </p>
              </div>

              <div>
                <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                  2. Clinical Summary of Inpatient Course
                </span>
                <p className="mt-1 p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-slate-700 leading-relaxed">
                  {selectedRecord.disc.clinicalSummary}
                </p>
              </div>

              <div>
                <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                  3. Treatments & Interventions Administered
                </span>
                <p className="mt-1 p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-slate-700 leading-relaxed">
                  {selectedRecord.disc.treatmentSummary}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                    4. Discharge Medications
                  </span>
                  <p className="mt-1 p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-slate-700">
                    {selectedRecord.disc.medicationInstructions}
                  </p>
                </div>
                <div>
                  <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                    5. Follow-Up Plan & Precautions
                  </span>
                  <p className="mt-1 p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-slate-700">
                    {selectedRecord.disc.followUpInstructions}
                  </p>
                </div>
              </div>
            </div>

            {/* Signature & Attestation */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <div>
                Approving Physician: <strong className="text-slate-800">{selectedRecord.disc.approvedBy}</strong>
              </div>
              <div className="font-mono text-[10px]">
                SIGNATURE_VERIFIED // SECURE_ARCHIVE
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs"
              >
                Close Certificate
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
