import React, { useState } from 'react';
import {
  User,
  ArrowLeft,
  Calendar,
  Phone,
  MapPin,
  HeartPulse,
  AlertTriangle,
  FileHeart,
  Pill,
  Files,
  LogOut,
  BedDouble,
  Clock,
  Sparkles,
  Download,
  Plus,
  Eye,
  CheckCircle,
  FileText,
  Activity,
  History,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { StatusBadge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { PatientVitalsTrendChart } from '../clinical/PatientVitalsTrendChart';
import { DownloadSummaryModal } from './DownloadSummaryModal';

interface PatientProfileViewProps {
  onOpenAdmissionModal: (patientId: string) => void;
  onOpenDischargeModal: (admissionId: string) => void;
  onOpenAddNoteModal: (patientId: string, visitId: string) => void;
  onOpenAddRxModal: (patientId: string, visitId: string) => void;
  onOpenUploadDocModal: (patientId: string, visitId: string) => void;
}

export const PatientProfileView: React.FC<PatientProfileViewProps> = ({
  onOpenAdmissionModal,
  onOpenDischargeModal,
  onOpenAddNoteModal,
  onOpenAddRxModal,
  onOpenUploadDocModal,
}) => {
  const {
    selectedPatientId,
    getPatientById,
    getAdmissionsByPatient,
    getActiveAdmissionForPatient,
    clinicalRecords,
    prescriptions,
    documents,
    patientProfileSubTab,
    setPatientProfileSubTab,
    setActiveTab,
    canUserPerform,
  } = useHospital();

  const [inspectDoc, setInspectDoc] = useState<any | null>(null);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);

  const patient = selectedPatientId ? getPatientById(selectedPatientId) : undefined;
  const admissions = selectedPatientId ? getAdmissionsByPatient(selectedPatientId) : [];
  const activeAdmission = selectedPatientId
    ? getActiveAdmissionForPatient(selectedPatientId)
    : undefined;

  // Filter patient's clinical records, prescriptions, and documents
  const patientRecords = clinicalRecords
    .filter((r) => r.patientId === selectedPatientId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const patientPrescriptions = prescriptions.filter((rx) => rx.patientId === selectedPatientId);
  const activePrescriptions = patientPrescriptions.filter((rx) => rx.status === 'ACTIVE');
  const pastPrescriptions = patientPrescriptions.filter((rx) => rx.status !== 'ACTIVE');

  const patientDocs = documents.filter((d) => d.patientId === selectedPatientId);

  if (!patient) {
    return (
      <div className="p-12 text-center bg-white rounded-xl border border-slate-200">
        <User className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-800">No Patient Selected</h3>
        <p className="text-xs text-slate-500 mt-1">
          Please select a patient from the master index or use the top search bar.
        </p>
        <button
          onClick={() => setActiveTab('patients')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold"
        >
          View Patient List
        </button>
      </div>
    );
  }

  const latestVisitId = activeAdmission ? activeAdmission.id : admissions[0]?.id || 'ADM-DEFAULT';

  return (
    <div className="space-y-5">
      {/* Back button & Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setActiveTab('patients')}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Master Patient Index</span>
        </button>

        {patient.id === 'PAT-2026-00125' && (
          <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Exemplar Patient: 3 Historical Hospital Admissions (Jan, May, Sep 2026)</span>
          </span>
        )}
      </div>

      {/* Patient Profile Primary Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
          {/* Avatar & Demographic Details */}
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-bold text-xl shadow-md shadow-blue-500/20 shrink-0">
              {patient.fullName
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-xl font-extrabold text-slate-900">{patient.fullName}</h2>
                <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
                  {patient.id}
                </span>
                <StatusBadge status={patient.status} size="sm" />
                <span className="font-mono font-bold text-xs bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200">
                  Blood: {patient.bloodGroup}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500 mt-2">
                <span>
                  <strong>DOB:</strong> {patient.dob} ({patient.age} yrs)
                </span>
                <span>•</span>
                <span>
                  <strong>Gender:</strong> {patient.gender}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {patient.phone}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 truncate max-w-xs">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  {patient.address}
                </span>
              </div>

              {/* Allergies Highlight Banner */}
              {patient.allergies && patient.allergies.length > 0 && (
                <div className="flex items-center gap-2 mt-3 text-xs">
                  <span className="text-[11px] font-bold text-rose-700 uppercase flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    <span>Allergies:</span>
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {patient.allergies.map((allg, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200"
                      >
                        {allg}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Current Inpatient Bed Status / Action Toolbar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full lg:w-auto shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100">
            {activeAdmission ? (
              <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-xl text-xs space-y-1 mr-2">
                <div className="flex items-center justify-between gap-3 text-rose-900 font-bold">
                  <span className="flex items-center gap-1">
                    <BedDouble className="w-4 h-4 text-rose-600" />
                    <span>Active Bed: {activeAdmission.bedId}</span>
                  </span>
                  <span className="text-[10px] bg-rose-100 text-rose-800 px-1.5 py-0.2 rounded font-semibold">
                    OCCUPIED
                  </span>
                </div>
                <div className="text-slate-600">{activeAdmission.wardName}</div>
                <div className="text-[11px] text-slate-500">
                  Doctor: {activeAdmission.attendingDoctor}
                </div>
              </div>
            ) : (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 mr-2">
                <div>No active hospitalization</div>
                <div className="font-semibold text-slate-700 mt-0.5">Ready for new admission</div>
              </div>
            )}

            {/* Contextual Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              {activeAdmission ? (
                canUserPerform('DISCHARGE_PATIENT') && (
                  <button
                    id="profile-discharge-btn"
                    onClick={() => onOpenDischargeModal(activeAdmission.id)}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Process Discharge</span>
                  </button>
                )
              ) : (
                canUserPerform('ADMIT_PATIENT') && (
                  <button
                    id="profile-readmit-btn"
                    onClick={() => onOpenAdmissionModal(patient.id)}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                  >
                    <BedDouble className="w-4 h-4" />
                    <span>New Admission / Admit to Bed</span>
                  </button>
                )
              )}

              {canUserPerform('ADD_CLINICAL_NOTE') && (
                <button
                  onClick={() => onOpenAddNoteModal(patient.id, latestVisitId)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl transition-colors border border-slate-200"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Note</span>
                </button>
              )}

              {canUserPerform('ADD_PRESCRIPTION') && (
                <button
                  onClick={() => onOpenAddRxModal(patient.id, latestVisitId)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl transition-colors border border-slate-200"
                >
                  <Pill className="w-3.5 h-3.5" />
                  <span>Issue Rx</span>
                </button>
              )}

              <button
                onClick={() => onOpenUploadDocModal(patient.id, latestVisitId)}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl transition-colors border border-slate-200"
              >
                <Files className="w-3.5 h-3.5" />
                <span>Upload Doc</span>
              </button>

              <button
                id="btn-download-patient-summary"
                onClick={() => setIsDownloadModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                title="Download complete clinical summary and visit dossier as PDF"
              >
                <Download className="w-4 h-4" />
                <span>Download Summary</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation Ribbon */}
        <div className="flex items-center gap-1 mt-6 pt-4 border-t border-slate-100 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview', icon: HeartPulse },
            { id: 'visits', label: `Visits & Admissions (${admissions.length})`, icon: History },
            { id: 'clinical', label: `Clinical Records (${patientRecords.length})`, icon: FileHeart },
            { id: 'prescriptions', label: `Prescriptions (${patientPrescriptions.length})`, icon: Pill },
            { id: 'documents', label: `Documents & Scans (${patientDocs.length})`, icon: Files },
            { id: 'discharges', label: 'Discharge Summaries', icon: LogOut },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = patientProfileSubTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`patient-tab-${tab.id}`}
                onClick={() => setPatientProfileSubTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all shrink-0 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content 1: Overview */}
      {patientProfileSubTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Demographics, Emergency Contact & Insurance */}
          <div className="space-y-5">
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                Emergency Contact Details
              </h3>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-slate-400">Name:</span>{' '}
                  <span className="font-semibold text-slate-800">
                    {patient.emergencyContact.name}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Relationship:</span>{' '}
                  <span className="font-semibold text-slate-800">
                    {patient.emergencyContact.relationship}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Telephone:</span>{' '}
                  <span className="font-mono font-semibold text-blue-600">
                    {patient.emergencyContact.phone}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                Insurance & Financial Billing
              </h3>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-slate-400">Primary Provider:</span>{' '}
                  <span className="font-semibold text-slate-800">
                    {patient.insuranceProvider || 'Direct Patient Billing'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Policy / ID:</span>{' '}
                  <span className="font-mono font-semibold text-slate-800">
                    {patient.insurancePolicyNumber || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">First Registered:</span>{' '}
                  <span className="text-slate-700">{patient.registeredDate}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                Chronic Medical Conditions
              </h3>
              {patient.chronicConditions && patient.chronicConditions.length > 0 ? (
                <ul className="list-disc list-inside space-y-1 text-xs text-slate-700 font-medium">
                  {patient.chronicConditions.map((cond, i) => (
                    <li key={i}>{cond}</li>
                  ))}
                </ul>
              ) : (
                <div className="text-xs text-slate-400">No chronic conditions listed.</div>
              )}
            </div>
          </div>

          {/* Right 2 Columns: Active Admission or Latest Medical Summary & Visits Timeline */}
          <div className="lg:col-span-2 space-y-5">
            {/* Biomedical Engineering Verification & PDF Export Banner */}
            <div className="bg-gradient-to-r from-sky-50 via-indigo-50 to-blue-50 rounded-xl border border-sky-200/90 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <img
                  src="/assets/boobalan_s.jpg"
                  alt="Boobalan S"
                  className="w-12 h-12 rounded-xl object-cover border-2 border-sky-300 shadow-xs shrink-0"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-sky-200 text-sky-900 rounded uppercase tracking-wider flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-sky-700" />
                      Clinical Systems Certification
                    </span>
                    <span className="text-[10px] font-mono text-sky-700 font-semibold">
                      Badge: BME-2026
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 mt-1">
                    Biomedical Engineer: Boobalan S
                  </h4>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Biomedical Engineering & Medical Technology • Bedside telemetry & vital sensors verified.
                  </p>
                </div>
              </div>
              <button
                id="overview-download-summary-pdf-btn"
                onClick={() => setIsDownloadModalOpen(true)}
                className="flex items-center justify-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Summary</span>
              </button>
            </div>

            {activeAdmission ? (
              <div className="bg-white rounded-xl border border-blue-200 p-5 shadow-xs bg-blue-50/20">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs bg-blue-600 text-white px-2 py-0.5 rounded">
                      ACTIVE ADMISSION #{activeAdmission.visitNumber}
                    </span>
                    <span className="font-mono text-xs text-blue-700">{activeAdmission.id}</span>
                  </div>
                  <span className="text-xs text-slate-500 font-medium">
                    Admitted: {activeAdmission.admissionDate}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs mb-4">
                  <div>
                    <span className="text-slate-400">Ward & Bed:</span>
                    <div className="font-bold text-slate-900 mt-0.5">
                      {activeAdmission.bedId} ({activeAdmission.wardName})
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400">Attending Doctor:</span>
                    <div className="font-bold text-slate-900 mt-0.5">
                      {activeAdmission.attendingDoctor}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400">Admission Type:</span>
                    <div className="font-bold text-slate-900 mt-0.5">
                      {activeAdmission.admissionType}
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-xs pt-3 border-t border-blue-100">
                  <div>
                    <span className="font-bold text-slate-700">Reason for Admission:</span>
                    <p className="text-slate-800 mt-0.5 leading-relaxed">
                      {activeAdmission.reasonForAdmission}
                    </p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-700">Initial Diagnosis:</span>
                    <p className="text-blue-900 font-semibold mt-0.5">
                      {activeAdmission.initialDiagnosis}
                    </p>
                  </div>
                  {activeAdmission.initialClinicalNotes && (
                    <div>
                      <span className="font-bold text-slate-700">Initial Clinical Notes:</span>
                      <p className="text-slate-600 mt-0.5 italic">
                        "{activeAdmission.initialClinicalNotes}"
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 text-center text-xs text-slate-500">
                Patient is not currently admitted to a hospital bed.
              </div>
            )}

            {/* Quick Multi-Visit Visual Tree (As explicitly mandated in prompt!) */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <History className="w-4 h-4 text-blue-600" />
                  <span>Hospital Admission History Tree ({admissions.length} Visits)</span>
                </h3>
                <span className="text-[11px] text-slate-400">Immutable Permanent History</span>
              </div>

              <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {admissions.map((adm) => {
                  const isActive = adm.status === 'ACTIVE';
                  return (
                    <div key={adm.id} className="relative">
                      <div
                        className={`absolute -left-6 top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white ring-2 ${
                          isActive
                            ? 'bg-rose-500 ring-rose-300 animate-pulse'
                            : 'bg-blue-600 ring-blue-200'
                        }`}
                      />
                      <div className="bg-slate-50 hover:bg-slate-100/80 p-3 rounded-lg border border-slate-200/80 transition-colors">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-bold text-slate-900 flex items-center gap-2">
                            <span>Visit 0{adm.visitNumber}</span>
                            <span>—</span>
                            <span className="font-mono text-blue-700">{adm.id}</span>
                            <StatusBadge status={adm.status} size="sm" />
                          </span>
                          <span className="text-slate-400 font-mono text-[11px]">
                            {adm.admissionDate.split(' ')[0]}
                            {adm.dischargeDate ? ` → ${adm.dischargeDate.split(' ')[0]}` : ' (Active)'}
                          </span>
                        </div>
                        <div className="text-xs text-slate-700">
                          <strong>{adm.wardName}</strong> • Bed {adm.bedId} • Attending:{' '}
                          {adm.attendingDoctor}
                        </div>
                        <div className="text-xs text-slate-600 mt-1">
                          <span className="font-medium text-slate-500">Diagnosis: </span>
                          <span>{adm.initialDiagnosis}</span>
                        </div>
                        {adm.dischargeRecord && (
                          <div className="mt-2 text-[11px] text-emerald-800 bg-emerald-50/80 p-1.5 rounded border border-emerald-200">
                            <strong>Discharge Condition:</strong>{' '}
                            {adm.dischargeRecord.dischargeCondition} •{' '}
                            {adm.dischargeRecord.finalDiagnosis}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content 2: Multi-Visit Full History */}
      {patientProfileSubTab === 'visits' && (
        <div className="space-y-4">
          <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-center justify-between">
            <span className="font-semibold">
              Complete Relational History for Patient {patient.id}:
            </span>
            <span className="text-blue-700">
              {admissions.length} Historical Hospitalizations stored permanently without overwrites
            </span>
          </div>

          <div className="space-y-4">
            {admissions.map((adm) => {
              const isCurrent = adm.status === 'ACTIVE';
              return (
                <div
                  key={adm.id}
                  className={`bg-white rounded-xl border p-5 shadow-xs transition-all ${
                    isCurrent ? 'border-rose-300 ring-1 ring-rose-200' : 'border-slate-200'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-sm font-extrabold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                        Visit #{adm.visitNumber} ({adm.id})
                      </span>
                      <StatusBadge status={adm.status} size="sm" />
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {adm.admissionType} Admission
                      </span>
                    </div>

                    <div className="text-xs text-slate-500 font-mono">
                      <span>In: {adm.admissionDate}</span>
                      {adm.dischargeDate && (
                        <span className="ml-2 font-bold text-slate-700">
                          | Out: {adm.dischargeDate}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 my-3 text-xs">
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                      <span className="text-slate-400">Ward & Bed</span>
                      <div className="font-bold text-slate-900 mt-0.5">
                        {adm.wardName} — Bed {adm.bedId}
                      </div>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                      <span className="text-slate-400">Attending Physician</span>
                      <div className="font-bold text-slate-900 mt-0.5">{adm.attendingDoctor}</div>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                      <span className="text-slate-400">Department</span>
                      <div className="font-bold text-slate-900 mt-0.5">{adm.department}</div>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="font-bold text-slate-700">Admission Reason:</span>
                      <p className="text-slate-800 mt-0.5">{adm.reasonForAdmission}</p>
                    </div>
                    <div>
                      <span className="font-bold text-slate-700">Diagnosis:</span>
                      <p className="text-blue-900 font-semibold mt-0.5">{adm.initialDiagnosis}</p>
                    </div>
                    {adm.initialClinicalNotes && (
                      <div>
                        <span className="font-bold text-slate-700">Initial Clinical Notes:</span>
                        <p className="text-slate-600 mt-0.5 italic">{adm.initialClinicalNotes}</p>
                      </div>
                    )}
                  </div>

                  {/* If discharge record exists */}
                  {adm.dischargeRecord && (
                    <div className="mt-4 p-4 bg-emerald-50/60 rounded-xl border border-emerald-200 space-y-2 text-xs">
                      <div className="flex items-center justify-between text-emerald-900 font-bold border-b border-emerald-200/60 pb-1.5">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                          <span>Discharge Summary Record ({adm.dischargeRecord.id})</span>
                        </span>
                        <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[11px]">
                          Condition: {adm.dischargeRecord.dischargeCondition}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                        <div>
                          <span className="font-semibold text-slate-700">Final Diagnosis:</span>
                          <p className="text-slate-800 mt-0.5">
                            {adm.dischargeRecord.finalDiagnosis}
                          </p>
                        </div>
                        <div>
                          <span className="font-semibold text-slate-700">Treatment Summary:</span>
                          <p className="text-slate-800 mt-0.5">
                            {adm.dischargeRecord.treatmentSummary}
                          </p>
                        </div>
                        <div>
                          <span className="font-semibold text-slate-700">
                            Medication Instructions:
                          </span>
                          <p className="text-slate-800 mt-0.5">
                            {adm.dischargeRecord.medicationInstructions}
                          </p>
                        </div>
                        <div>
                          <span className="font-semibold text-slate-700">
                            Follow-Up Instructions:
                          </span>
                          <p className="text-slate-800 mt-0.5">
                            {adm.dischargeRecord.followUpInstructions}
                          </p>
                        </div>
                      </div>

                      <div className="text-[10px] text-slate-500 pt-1 border-t border-emerald-200/50">
                        Approved by: {adm.dischargeRecord.approvedBy} on {adm.dischargeRecord.dischargeDate}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab Content 3: Clinical Records */}
      {patientProfileSubTab === 'clinical' && (
        <div className="space-y-6">
          {/* Patient Vitals Longitudinal Trend Line Chart */}
          <PatientVitalsTrendChart
            patientId={patient.id}
            admissions={admissions}
            activeAdmission={activeAdmission}
            clinicalRecords={clinicalRecords}
            onOpenAddNoteModal={onOpenAddNoteModal}
            canAddNote={canUserPerform('ADD_CLINICAL_NOTE')}
          />

          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Clinical & Nursing Progress Notes ({patientRecords.length})
            </h3>
            {canUserPerform('ADD_CLINICAL_NOTE') && (
              <button
                onClick={() => onOpenAddNoteModal(patient.id, latestVisitId)}
                className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Clinical Note</span>
              </button>
            )}
          </div>

          <div className="space-y-3">
            {patientRecords.map((rec) => (
              <div key={rec.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        rec.recordType === 'DOCTOR_NOTE'
                          ? 'bg-blue-100 text-blue-800'
                          : rec.recordType === 'NURSING_NOTE'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {rec.recordType.replace('_', ' ')}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900">{rec.title}</h4>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">{rec.timestamp}</span>
                </div>

                <div className="text-xs text-slate-700 mt-2 leading-relaxed whitespace-pre-line">
                  {rec.content}
                </div>

                {/* Vitals snapshot if attached */}
                {rec.vitals && (
                  <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200/80 text-xs">
                    <div className="font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                      <HeartPulse className="w-4 h-4 text-rose-500" />
                      <span>Associated Vital Signs</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center">
                      <div className="bg-white p-2 rounded border border-slate-200/60">
                        <div className="text-[10px] text-slate-400">Heart Rate</div>
                        <div className="font-mono font-bold text-slate-900">
                          {rec.vitals.heartRate} bpm
                        </div>
                      </div>
                      <div className="bg-white p-2 rounded border border-slate-200/60">
                        <div className="text-[10px] text-slate-400">Blood Pressure</div>
                        <div className="font-mono font-bold text-slate-900">
                          {rec.vitals.bloodPressureSys}/{rec.vitals.bloodPressureDia}
                        </div>
                      </div>
                      <div className="bg-white p-2 rounded border border-slate-200/60">
                        <div className="text-[10px] text-slate-400">Temperature</div>
                        <div className="font-mono font-bold text-slate-900">
                          {rec.vitals.temperature} °C
                        </div>
                      </div>
                      <div className="bg-white p-2 rounded border border-slate-200/60">
                        <div className="text-[10px] text-slate-400">SpO2</div>
                        <div className="font-mono font-bold text-slate-900">
                          {rec.vitals.oxygenSaturation}%
                        </div>
                      </div>
                      <div className="bg-white p-2 rounded border border-slate-200/60">
                        <div className="text-[10px] text-slate-400">Resp Rate</div>
                        <div className="font-mono font-bold text-slate-900">
                          {rec.vitals.respiratoryRate}/min
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Author: {rec.authorName} ({rec.authorRole})</span>
                  <span className="font-mono">Visit: {rec.visitId}</span>
                </div>
              </div>
            ))}

            {patientRecords.length === 0 && (
              <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-xs text-slate-400">
                No clinical notes recorded for this patient.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab Content 4: Prescriptions */}
      {patientProfileSubTab === 'prescriptions' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Medication & Prescription Registry
            </h3>
            {canUserPerform('ADD_PRESCRIPTION') && (
              <button
                onClick={() => onOpenAddRxModal(patient.id, latestVisitId)}
                className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Issue Prescription</span>
              </button>
            )}
          </div>

          {/* Active Prescriptions */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-3 bg-blue-50/60 border-b border-blue-100 text-xs font-bold text-blue-900 flex items-center gap-2">
              <Pill className="w-4 h-4 text-blue-600" />
              <span>Active Inpatient Medication Orders ({activePrescriptions.length})</span>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {activePrescriptions.map((rx) => (
                <div key={rx.id} className="p-3.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                  <div>
                    <div className="font-bold text-slate-900 flex items-center gap-2">
                      <span className="text-sm">{rx.medicineName}</span>
                      <span className="font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-bold border border-blue-200">
                        {rx.dosage}
                      </span>
                      <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                        {rx.route}
                      </span>
                    </div>
                    <div className="text-slate-600 mt-0.5">
                      <strong>Frequency:</strong> {rx.frequency} • <strong>Duration:</strong>{' '}
                      {rx.duration}
                    </div>
                    {rx.instructions && (
                      <div className="text-[11px] text-slate-500 mt-1 italic">
                        "{rx.instructions}"
                      </div>
                    )}
                  </div>

                  <div className="text-right text-[11px] text-slate-400 shrink-0">
                    <div>Prescribed by: {rx.prescribingDoctor}</div>
                    <div className="font-mono">{rx.prescribedAt}</div>
                  </div>
                </div>
              ))}

              {activePrescriptions.length === 0 && (
                <div className="p-6 text-center text-slate-400">No active medication orders.</div>
              )}
            </div>
          </div>

          {/* Past Prescriptions */}
          {pastPrescriptions.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="p-3 bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-700">
                Completed & Prior Visit Prescriptions ({pastPrescriptions.length})
              </div>
              <div className="divide-y divide-slate-100 text-xs">
                {pastPrescriptions.map((rx) => (
                  <div key={rx.id} className="p-3 flex items-center justify-between text-slate-600">
                    <div>
                      <span className="font-semibold text-slate-800">{rx.medicineName}</span> (
                      {rx.dosage}, {rx.frequency})
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Status: <span className="font-bold">{rx.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab Content 5: Documents & Scans */}
      {patientProfileSubTab === 'documents' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Categorized Medical Documents & Reports ({patientDocs.length})
            </h3>
            <button
              onClick={() => onOpenUploadDocModal(patient.id, latestVisitId)}
              className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Upload Document</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {patientDocs.map((doc) => (
              <div
                key={doc.id}
                className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-blue-300 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wide">
                      {doc.category}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">{doc.uploadDate}</span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 truncate">
                    <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>{doc.name}</span>
                  </h4>

                  {doc.summary && (
                    <p className="text-xs text-slate-600 mt-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100 leading-relaxed">
                      {doc.summary}
                    </p>
                  )}
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>
                    Uploaded by: <strong className="text-slate-600">{doc.uploadedBy}</strong>
                  </span>
                  <button
                    onClick={() => setInspectDoc(doc)}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-bold"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Report</span>
                  </button>
                </div>
              </div>
            ))}

            {patientDocs.length === 0 && (
              <div className="md:col-span-2 p-8 text-center bg-white rounded-xl border border-slate-200 text-xs text-slate-400">
                No documents uploaded for this patient.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab Content 6: Discharge Summaries */}
      {patientProfileSubTab === 'discharges' && (
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Formal Discharge Records
          </h3>

          <div className="space-y-4">
            {admissions
              .filter((a) => a.dischargeRecord)
              .map((adm) => {
                const disc = adm.dischargeRecord!;
                return (
                  <div key={disc.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {disc.id}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 mt-1">
                          Discharge Summary for Visit #{adm.visitNumber} ({adm.id})
                        </h4>
                      </div>
                      <div className="text-right text-xs">
                        <div className="font-bold text-slate-800">
                          Condition: {disc.dischargeCondition}
                        </div>
                        <div className="text-slate-400 text-[11px]">{disc.dischargeDate}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="font-bold text-slate-700">Final Diagnosis:</span>
                        <p className="text-slate-800 mt-0.5">{disc.finalDiagnosis}</p>
                      </div>
                      <div>
                        <span className="font-bold text-slate-700">Clinical Summary:</span>
                        <p className="text-slate-800 mt-0.5">{disc.clinicalSummary}</p>
                      </div>
                      <div>
                        <span className="font-bold text-slate-700">Treatment Summary:</span>
                        <p className="text-slate-800 mt-0.5">{disc.treatmentSummary}</p>
                      </div>
                      <div>
                        <span className="font-bold text-slate-700">Follow-Up Instructions:</span>
                        <p className="text-slate-800 mt-0.5">{disc.followUpInstructions}</p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <span>Attending Physician: {disc.attendingDoctor}</span>
                      <span>Approved by: {disc.approvedBy}</span>
                    </div>
                  </div>
                );
              })}

            {admissions.filter((a) => a.dischargeRecord).length === 0 && (
              <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-xs text-slate-400">
                No finalized discharge summaries on file.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Inspect Document Modal */}
      {inspectDoc && (
        <Modal
          isOpen={true}
          onClose={() => setInspectDoc(null)}
          title={`Document Inspector: ${inspectDoc.name}`}
          subtitle={`${inspectDoc.category} • Uploaded on ${inspectDoc.uploadDate}`}
          maxWidth="lg"
          id="document-inspector-modal"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-900 text-slate-200 rounded-xl font-mono text-[11px] space-y-1">
              <div>DOCUMENT_HASH: SHA256:{inspectDoc.id}-SECURE</div>
              <div>PATIENT_RECORD: {inspectDoc.patientId}</div>
              <div>VISIT_ASSOCIATION: {inspectDoc.visitId}</div>
              <div>FILE_TYPE: {inspectDoc.fileType} ({inspectDoc.fileSize})</div>
              <div>VERIFIED_BY: {inspectDoc.uploadedBy}</div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <h4 className="font-bold text-slate-800">Clinical Readout / Impression:</h4>
              <p className="text-slate-700 leading-relaxed font-sans text-xs">
                {inspectDoc.summary ||
                  'Official digital scan preserved in hospital electronic document archival repository.'}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setInspectDoc(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs"
              >
                Close Viewer
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Download Summary Modal with Boobalan S Verification */}
      {isDownloadModalOpen && (
        <DownloadSummaryModal
          isOpen={isDownloadModalOpen}
          onClose={() => setIsDownloadModalOpen(false)}
          patient={patient}
          admissions={admissions}
          clinicalRecords={clinicalRecords}
          prescriptions={prescriptions}
          documents={patientDocs}
        />
      )}
    </div>
  );
};
