import React, { useState } from 'react';
import {
  FileText,
  Download,
  CheckCircle2,
  Calendar,
  ShieldCheck,
  Activity,
  Pill,
  FileCheck,
  UserCheck,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import {
  Patient,
  AdmissionVisit,
  ClinicalRecord,
  Prescription,
  PatientDocument,
} from '../../types/hospital';
import { generatePatientSummaryPdf, PdfSummaryOptions } from '../../utils/generatePatientSummaryPdf';

interface DownloadSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
  admissions: AdmissionVisit[];
  clinicalRecords: ClinicalRecord[];
  prescriptions: Prescription[];
  documents?: PatientDocument[];
}

export const DownloadSummaryModal: React.FC<DownloadSummaryModalProps> = ({
  isOpen,
  onClose,
  patient,
  admissions,
  clinicalRecords,
  prescriptions,
  documents = [],
}) => {
  const [selectedVisitId, setSelectedVisitId] = useState<string>('ALL');
  const [includeVitals, setIncludeVitals] = useState(true);
  const [includePrescriptions, setIncludePrescriptions] = useState(true);
  const [includeClinicalNotes, setIncludeClinicalNotes] = useState(true);
  const [includeDischarges, setIncludeDischarges] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const relevantNotes = clinicalRecords.filter((r) => {
    if (r.patientId !== patient.id) return false;
    if (selectedVisitId !== 'ALL' && r.visitId !== selectedVisitId) return false;
    return true;
  });

  const relevantRx = prescriptions.filter((r) => {
    if (r.patientId !== patient.id) return false;
    if (selectedVisitId !== 'ALL' && r.visitId !== selectedVisitId) return false;
    return true;
  });

  const handleGeneratePdf = async () => {
    try {
      setIsGenerating(true);
      setDownloadSuccess(false);

      // Brief tick for UI feedback
      await new Promise((resolve) => setTimeout(resolve, 350));

      const options: PdfSummaryOptions = {
        visitIdFilter: selectedVisitId,
        includeVitals,
        includePrescriptions,
        includeClinicalNotes,
        includeDischarges,
      };

      const doc = generatePatientSummaryPdf(
        patient,
        admissions,
        clinicalRecords,
        prescriptions,
        documents,
        options
      );

      const sanitizedName = patient.fullName.replace(/[^a-zA-Z0-9]/g, '_');
      const filename = `Hospify_MedicalSummary_${patient.id}_${sanitizedName}.pdf`;

      doc.save(filename);
      setDownloadSuccess(true);
      setTimeout(() => {
        setDownloadSuccess(false);
        onClose();
      }, 1200);
    } catch (err) {
      console.error('Failed to generate PDF summary:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Download Clinical & Visit Summary (PDF)"
      maxWidth="2xl"
    >
      <div className="space-y-5 text-slate-800">
        {/* Patient Header Card */}
        <div className="p-3.5 bg-slate-50 border border-slate-200/90 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Target Patient Record
            </div>
            <div className="text-base font-bold text-slate-900 mt-0.5">
              {patient.fullName}
            </div>
            <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
              <span className="font-mono font-semibold text-slate-700">{patient.id}</span>
              <span>•</span>
              <span>{patient.age} yrs / {patient.gender}</span>
              <span>•</span>
              <span className="font-semibold text-rose-600">Blood: {patient.bloodGroup}</span>
            </div>
          </div>
          <div className="text-right">
            <span className="px-2.5 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold">
              {admissions.length} Hospital Visits
            </span>
            <div className="text-[11px] text-slate-400 mt-1 font-mono">
              Status: {patient.status}
            </div>
          </div>
        </div>

        {/* Biomedical Engineer Verification Card */}
        <div className="p-4 bg-gradient-to-r from-sky-50 to-indigo-50 border border-sky-200 rounded-xl shadow-xs">
          <div className="flex items-start gap-3.5">
            <img
              src="/assets/boobalan_s.jpg"
              alt="Boobalan S"
              className="w-14 h-14 rounded-xl object-cover border-2 border-sky-300 shadow-sm shrink-0"
              onError={(e) => {
                // Fallback if public path isn't populated
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 bg-sky-200 text-sky-900 rounded uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5 text-sky-700" />
                  Biomedical Engineering Verification
                </span>
                <span className="text-[11px] font-mono text-sky-700 font-semibold">
                  Badge: BME-2026
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 mt-1">
                Boobalan S
              </h4>
              <p className="text-xs text-slate-600">
                Senior Biomedical Engineer • Biomedical Engineering & Medical Technology
              </p>
              <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                Certified quality sign-off: Bedside telemetry feeds, cardiac monitors, and vital sign logs in this PDF dossier are verified against hospital calibration standards.
              </p>
            </div>
          </div>
        </div>

        {/* Visit Scope Selection */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Report Scope (Hospital Visit)
          </label>
          <select
            id="pdf-visit-scope-select"
            value={selectedVisitId}
            onChange={(e) => setSelectedVisitId(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">
              All Hospital Visits ({admissions.length} recorded admissions & discharges)
            </option>
            {admissions.map((adm) => (
              <option key={adm.id} value={adm.id}>
                Visit #{adm.visitNumber} ({adm.id}) - {adm.wardName}, Bed {adm.bedId} [{adm.status}]
              </option>
            ))}
          </select>
        </div>

        {/* Sections to Include */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-2">
            Clinical Sections to Include
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <label className="flex items-center gap-2.5 p-2.5 bg-white border border-slate-200 rounded-lg text-xs cursor-pointer hover:bg-slate-50">
              <input
                type="checkbox"
                checked={includeClinicalNotes}
                onChange={(e) => setIncludeClinicalNotes(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
              <div className="flex-1">
                <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-blue-600" />
                  <span>Clinical Progress Notes</span>
                </div>
                <div className="text-[11px] text-slate-500">
                  {relevantNotes.length} doctor & nursing entries
                </div>
              </div>
            </label>

            <label className="flex items-center gap-2.5 p-2.5 bg-white border border-slate-200 rounded-lg text-xs cursor-pointer hover:bg-slate-50">
              <input
                type="checkbox"
                checked={includeVitals}
                onChange={(e) => setIncludeVitals(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
              <div className="flex-1">
                <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-rose-500" />
                  <span>Bedside Vital Signs</span>
                </div>
                <div className="text-[11px] text-slate-500">
                  Blood pressure, heart rate, SpO2, temp
                </div>
              </div>
            </label>

            <label className="flex items-center gap-2.5 p-2.5 bg-white border border-slate-200 rounded-lg text-xs cursor-pointer hover:bg-slate-50">
              <input
                type="checkbox"
                checked={includePrescriptions}
                onChange={(e) => setIncludePrescriptions(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
              <div className="flex-1">
                <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <Pill className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Prescription & Med Orders</span>
                </div>
                <div className="text-[11px] text-slate-500">
                  {relevantRx.length} active & past medications
                </div>
              </div>
            </label>

            <label className="flex items-center gap-2.5 p-2.5 bg-white border border-slate-200 rounded-lg text-xs cursor-pointer hover:bg-slate-50">
              <input
                type="checkbox"
                checked={includeDischarges}
                onChange={(e) => setIncludeDischarges(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
              <div className="flex-1">
                <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Discharge Summaries</span>
                </div>
                <div className="text-[11px] text-slate-500">
                  Clinical outcome, instructions & sign-offs
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <UserCheck className="w-4 h-4 text-emerald-600" />
            <span>Format: Standard A4 Clinical Dossier</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isGenerating}
              className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-semibold transition-colors"
            >
              Cancel
            </button>

            <button
              id="confirm-generate-pdf-btn"
              type="button"
              onClick={handleGeneratePdf}
              disabled={isGenerating}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-xs transition-colors ${
                downloadSuccess
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Compiling PDF...</span>
                </>
              ) : downloadSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Downloaded!</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Generate & Download PDF</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
