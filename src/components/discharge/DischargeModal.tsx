import React, { useState, useEffect } from 'react';
import {
  LogOut,
  CheckCircle,
  AlertCircle,
  Brush,
  Sparkles,
  BedDouble,
  ShieldCheck,
  Calendar,
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { Modal } from '../common/Modal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { DischargeRecord } from '../../types/hospital';

interface DischargeModalProps {
  isOpen: boolean;
  onClose: () => void;
  admissionId: string;
  onDischargeCompleted?: (record: DischargeRecord) => void;
}

export const DischargeModal: React.FC<DischargeModalProps> = ({
  isOpen,
  onClose,
  admissionId,
  onDischargeCompleted,
}) => {
  const {
    admissions,
    getPatientById,
    processDischarge,
    currentUser,
  } = useHospital();

  const admission = admissions.find((a) => a.id === admissionId);
  const patient = admission ? getPatientById(admission.patientId) : undefined;

  const [dischargeCondition, setDischargeCondition] = useState<DischargeRecord['dischargeCondition']>('Stable');
  const [finalDiagnosis, setFinalDiagnosis] = useState('');
  const [clinicalSummary, setClinicalSummary] = useState('');
  const [treatmentSummary, setTreatmentSummary] = useState('');
  const [medicationInstructions, setMedicationInstructions] = useState('');
  const [followUpInstructions, setFollowUpInstructions] = useState('');
  const [approvedBy, setApprovedBy] = useState(currentUser.name);
  const [dischargeNotes, setDischargeNotes] = useState('Patient educated on discharge medications and follow-up plan.');

  const [error, setError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState<boolean>(false);

  // Auto-fill defaults from admission
  useEffect(() => {
    if (admission) {
      setFinalDiagnosis(admission.initialDiagnosis || '');
      setClinicalSummary(
        `Patient admitted on ${admission.admissionDate} for ${admission.reasonForAdmission}. Inpatient treatment protocol administered with resolution of acute symptoms.`
      );
      setTreatmentSummary('Standard clinical care protocol, supportive hydration, and targeted pharmacotherapy.');
      setMedicationInstructions('Continue prescribed oral discharge regimen for 14 days as directed.');
      setFollowUpInstructions('Follow up at Outpatient Specialist Clinic in 7-10 days. Return immediately to Emergency if symptoms recur.');
      setApprovedBy(admission.attendingDoctor || currentUser.name);
    }
  }, [admission, currentUser]);

  if (!admission || !patient) {
    return null;
  }

  const handlePreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!finalDiagnosis.trim()) {
      setError('Final Diagnosis is required to generate the official discharge summary.');
      return;
    }

    if (!clinicalSummary.trim() || !treatmentSummary.trim()) {
      setError('Clinical and treatment summaries are required medical documentation.');
      return;
    }

    setShowConfirm(true);
  };

  const handleExecuteDischarge = () => {
    const result = processDischarge({
      admissionId: admission.id,
      finalDiagnosis: finalDiagnosis.trim(),
      clinicalSummary: clinicalSummary.trim(),
      treatmentSummary: treatmentSummary.trim(),
      medicationInstructions: medicationInstructions.trim(),
      followUpInstructions: followUpInstructions.trim(),
      dischargeCondition,
      dischargeNotes: dischargeNotes.trim(),
    });

    if (!result.success) {
      setError(result.message);
      setShowConfirm(false);
      return;
    }

    setShowConfirm(false);
    onClose();

    if (onDischargeCompleted && result.dischargeRecord) {
      onDischargeCompleted(result.dischargeRecord);
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Clinical Patient Discharge & Terminal Bed Sanitization"
        subtitle={`Discharge Visit #${admission.visitNumber} (${admission.id}) • Bed ${admission.bedId}`}
        maxWidth="2xl"
        id="clinical-discharge-modal"
      >
        <form onSubmit={handlePreSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Admission & Patient Snapshot */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2 mb-2">
              <div className="font-bold text-slate-900 text-sm">
                {patient.fullName}{' '}
                <span className="font-mono text-blue-700 font-semibold">({patient.id})</span>
              </div>
              <div className="font-mono text-slate-500">
                Admitted: {admission.admissionDate}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
              <div>
                <span className="text-slate-400">Current Bed:</span>
                <div className="font-bold text-slate-800">{admission.bedId}</div>
              </div>
              <div>
                <span className="text-slate-400">Ward:</span>
                <div className="font-bold text-slate-800">{admission.wardName}</div>
              </div>
              <div>
                <span className="text-slate-400">Initial Diagnosis:</span>
                <div className="font-bold text-slate-800 truncate">{admission.initialDiagnosis}</div>
              </div>
              <div>
                <span className="text-slate-400">Attending:</span>
                <div className="font-bold text-slate-800 truncate">{admission.attendingDoctor}</div>
              </div>
            </div>
          </div>

          {/* Discharge Condition & Final Diagnosis */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Discharge Medical Condition *
              </label>
              <select
                value={dischargeCondition}
                onChange={(e) => setDischargeCondition(e.target.value as any)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white outline-none font-semibold"
              >
                <option value="Recovered">Recovered - Full Resolution</option>
                <option value="Improved">Improved - Continuing Home Recovery</option>
                <option value="Stable">Stable - Maintenance Phase</option>
                <option value="Transferred">Transferred to Specialized Facility</option>
                <option value="Against Medical Advice">Against Medical Advice (AMA)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Approving Physician *
              </label>
              <input
                type="text"
                required
                value={approvedBy}
                onChange={(e) => setApprovedBy(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Final Clinical Diagnosis *
              </label>
              <input
                type="text"
                required
                value={finalDiagnosis}
                onChange={(e) => setFinalDiagnosis(e.target.value)}
                placeholder="e.g. Unstable Angina, stabilized post-medication adjustments"
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white outline-none"
              />
            </div>
          </div>

          {/* Clinical & Treatment Summary */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Clinical Inpatient Summary:
              </label>
              <textarea
                value={clinicalSummary}
                onChange={(e) => setClinicalSummary(e.target.value)}
                rows={2}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Treatment & Procedure Summary:
              </label>
              <textarea
                value={treatmentSummary}
                onChange={(e) => setTreatmentSummary(e.target.value)}
                rows={2}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Take-Home Medication Instructions:
                </label>
                <textarea
                  value={medicationInstructions}
                  onChange={(e) => setMedicationInstructions(e.target.value)}
                  rows={2}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Outpatient Follow-Up Instructions:
                </label>
                <textarea
                  value={followUpInstructions}
                  onChange={(e) => setFollowUpInstructions(e.target.value)}
                  rows={2}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white outline-none"
                />
              </div>
            </div>
          </div>

          {/* Mandatory Bed Workflow Highlight */}
          <div className="p-3.5 bg-cyan-50/80 rounded-xl border border-cyan-200 text-xs text-cyan-900 flex items-start gap-2.5">
            <Brush className="w-5 h-5 text-cyan-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold">Bed Turnover Automated Safety Step:</div>
              <p className="mt-0.5 text-[11px] leading-relaxed">
                Upon finalizing this discharge, Bed <strong>{admission.bedId}</strong> will
                automatically transition from <strong className="text-rose-700">OCCUPIED</strong> to{' '}
                <strong className="text-cyan-800">CLEANING</strong>. It cannot be occupied by another
                patient until environmental housekeeping completes terminal disinfection.
              </p>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200"
            >
              Cancel
            </button>
            <button
              id="confirm-discharge-btn"
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            >
              <LogOut className="w-4 h-4" />
              <span>Finalize Discharge Summary</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showConfirm}
        title="Confirm Patient Discharge"
        message={`Are you sure you want to finalize discharge for ${patient.fullName} (${patient.id}) from Bed ${admission.bedId}? The admission will be marked as DISCHARGED and the bed will be flagged for terminal cleaning.`}
        confirmLabel="Confirm Discharge & Release Bed"
        confirmVariant="danger"
        onConfirm={handleExecuteDischarge}
        onCancel={() => setShowConfirm(false)}
      />
    </>
  );
};
