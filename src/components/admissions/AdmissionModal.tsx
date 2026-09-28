import React, { useState, useEffect } from 'react';
import {
  BedDouble,
  UserPlus,
  CheckCircle,
  AlertCircle,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { Modal } from '../common/Modal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { Bed } from '../../types/hospital';

interface AdmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedPatientId?: string;
  preselectedBedId?: string;
  preselectedWardId?: string;
  onOpenRegisterModal?: () => void;
  onAdmissionCreated?: (admissionId: string) => void;
}

export const AdmissionModal: React.FC<AdmissionModalProps> = ({
  isOpen,
  onClose,
  preselectedPatientId,
  preselectedBedId,
  preselectedWardId,
  onOpenRegisterModal,
  onAdmissionCreated,
}) => {
  const {
    patients,
    wards,
    beds,
    admissions,
    createAdmission,
    getPatientById,
    getAdmissionsByPatient,
    currentUser,
  } = useHospital();

  const [selectedPatientId, setSelectedPatientId] = useState<string>(preselectedPatientId || '');
  const [selectedWardId, setSelectedWardId] = useState<string>(preselectedWardId || 'WARD-ICU');
  const [selectedBedId, setSelectedBedId] = useState<string>(preselectedBedId || '');
  const [admissionType, setAdmissionType] = useState<'Emergency' | 'Elective' | 'Urgent' | 'Transfer'>('Emergency');
  const [attendingDoctor, setAttendingDoctor] = useState<string>('Dr. Robert Sterling, MD');
  const [department, setDepartment] = useState<string>('General Medicine');
  const [reasonForAdmission, setReasonForAdmission] = useState<string>('');
  const [initialDiagnosis, setInitialDiagnosis] = useState<string>('');
  const [initialClinicalNotes, setInitialClinicalNotes] = useState<string>('');

  const [error, setError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState<boolean>(false);

  // Sync preselected patient
  useEffect(() => {
    if (preselectedPatientId) {
      setSelectedPatientId(preselectedPatientId);
    } else if (patients.length > 0 && !selectedPatientId) {
      setSelectedPatientId(patients[0].id);
    }
  }, [preselectedPatientId, patients]);

  // Sync preselected bed and ward
  useEffect(() => {
    if (preselectedBedId) {
      const targetBed = beds.find((b) => b.id === preselectedBedId);
      if (targetBed) {
        setSelectedWardId(targetBed.wardId);
        setSelectedBedId(targetBed.id);
        const wardObj = wards.find((w) => w.id === targetBed.wardId);
        if (wardObj) setDepartment(wardObj.name);
      }
    } else if (preselectedWardId) {
      setSelectedWardId(preselectedWardId);
      const wardObj = wards.find((w) => w.id === preselectedWardId);
      if (wardObj) setDepartment(wardObj.name);
    }
  }, [preselectedBedId, preselectedWardId, beds, wards]);

  // Current selected patient object
  const patient = selectedPatientId ? getPatientById(selectedPatientId) : undefined;
  const previousAdmissions = selectedPatientId ? getAdmissionsByPatient(selectedPatientId) : [];
  const nextVisitNumber = previousAdmissions.length + 1;

  // Filter available beds for chosen ward
  const wardBeds = beds.filter((b) => b.wardId === selectedWardId);
  const availableBeds = wardBeds.filter((b) => b.status === 'AVAILABLE');

  // Set default bed when ward changes if current bed not available in ward
  useEffect(() => {
    if (selectedBedId) {
      const matchInWard = availableBeds.find((b) => b.id === selectedBedId);
      if (matchInWard) return;
    }
    if (availableBeds.length > 0) {
      setSelectedBedId(availableBeds[0].id);
    } else {
      setSelectedBedId('');
    }
  }, [selectedWardId, beds]);

  const handlePreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedPatientId) {
      setError('Please select a registered patient.');
      return;
    }

    if (!selectedBedId) {
      setError(`No beds are currently AVAILABLE in this ward. Please select a ward with available capacity.`);
      return;
    }

    if (!reasonForAdmission.trim() || !initialDiagnosis.trim()) {
      setError('Reason for admission and initial diagnosis are mandatory clinical fields.');
      return;
    }

    // Check if patient already has an active admission
    const activeExisting = previousAdmissions.find((a) => a.status === 'ACTIVE');
    if (activeExisting) {
      setError(`Patient already has an active admission in Bed ${activeExisting.bedId} (${activeExisting.wardName}). Please discharge or transfer first.`);
      return;
    }

    setShowConfirm(true);
  };

  const handleExecuteAdmission = () => {
    const wardObj = wards.find((w) => w.id === selectedWardId);
    const wardName = wardObj ? wardObj.name : 'Inpatient Ward';

    const result = createAdmission({
      patientId: selectedPatientId,
      bedId: selectedBedId,
      wardId: selectedWardId,
      admissionType,
      attendingDoctor,
      department,
      reasonForAdmission: reasonForAdmission.trim(),
      initialDiagnosis: initialDiagnosis.trim(),
      initialClinicalNotes: initialClinicalNotes.trim() || 'Admitted to inpatient bed service.',
    });

    if (!result.success) {
      setError(result.message);
      setShowConfirm(false);
      return;
    }

    setShowConfirm(false);
    onClose();
    if (onAdmissionCreated && result.admissionId) {
      onAdmissionCreated(result.admissionId);
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Inpatient Bed Admission Intake"
        subtitle="Reserve and Occupy Hospital Bed with Verified Patient ID"
        maxWidth="2xl"
        id="admission-intake-modal"
      >
        <form onSubmit={handlePreSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Patient Selection & History Lookup */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-800">
                1. Select Registered Patient:
              </label>
              {patient && (
                <span className="text-[11px] font-bold text-blue-700 font-mono bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  This Admission will be Visit #{nextVisitNumber}
                </span>
              )}
            </div>

            <select
              id="admission-patient-select"
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 font-semibold focus:ring-2 focus:ring-blue-100 outline-none"
            >
              <option value="">-- Choose Patient from Registry --</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.id} — {p.fullName} ({p.age}y, {p.gender}, Blood: {p.bloodGroup}) [
                  {p.status}]
                </option>
              ))}
            </select>

            <div className="flex items-center justify-between text-xs pt-0.5">
              <span className="text-[11px] text-slate-500">
                Patient not yet registered in system?
              </span>
              {onOpenRegisterModal && (
                <button
                  type="button"
                  id="admission-open-register-btn"
                  onClick={onOpenRegisterModal}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>+ Register New Patient</span>
                </button>
              )}
            </div>

            {patient && (
              <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-xs flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">{patient.fullName}</div>
                  <div className="text-[11px] text-slate-500">
                    DOB: {patient.dob} • Allergies:{' '}
                    <strong className="text-rose-600 font-semibold">
                      {patient.allergies?.join(', ') || 'NKDA'}
                    </strong>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] text-slate-400">Previous Visits</div>
                  <div className="font-bold text-slate-800 font-mono">
                    {previousAdmissions.length} on file
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Ward & Bed Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                2. Target Ward / Floor:
              </label>
              <select
                id="admission-ward-select"
                value={selectedWardId}
                onChange={(e) => setSelectedWardId(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white outline-none"
              >
                {wards.map((w) => {
                  const availCount = beds.filter(
                    (b) => b.wardId === w.id && b.status === 'AVAILABLE'
                  ).length;
                  return (
                    <option key={w.id} value={w.id}>
                      {w.name} ({availCount} beds available)
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                3. Available Bed Selection:
              </label>
              <select
                id="admission-bed-select"
                value={selectedBedId}
                onChange={(e) => setSelectedBedId(e.target.value)}
                disabled={availableBeds.length === 0}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:bg-white outline-none disabled:bg-slate-100"
              >
                {availableBeds.length > 0 ? (
                  availableBeds.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.id} ({b.roomNumber} • {b.bedType}) - AVAILABLE
                    </option>
                  ))
                ) : (
                  <option value="">No available beds in this ward</option>
                )}
              </select>
              {availableBeds.length === 0 && (
                <div className="text-[10px] text-rose-600 mt-0.5">
                  No beds available in selected ward. Choose another ward.
                </div>
              )}
            </div>
          </div>

          {/* Admission Type & Attending Doctor */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Admission Type:
              </label>
              <select
                value={admissionType}
                onChange={(e) => setAdmissionType(e.target.value as any)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white outline-none"
              >
                <option value="Emergency">Emergency</option>
                <option value="Elective">Elective</option>
                <option value="Urgent">Urgent</option>
                <option value="Transfer">Transfer</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Attending Physician:
              </label>
              <select
                value={attendingDoctor}
                onChange={(e) => setAttendingDoctor(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white outline-none"
              >
                <option value="Dr. Robert Sterling, MD">Dr. Robert Sterling, MD (Cardio)</option>
                <option value="Dr. Priya Patel, MD">Dr. Priya Patel, MD (Intensive Care)</option>
                <option value="Dr. Marcus Vance, DO">Dr. Marcus Vance, DO (Emergency)</option>
                <option value="Dr. Sarah Lin, MD">Dr. Sarah Lin, MD (Internal Med)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Clinical Department:
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white outline-none"
              />
            </div>
          </div>

          {/* Clinical Justification */}
          <div className="space-y-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Primary Reason for Admission *
              </label>
              <input
                type="text"
                required
                value={reasonForAdmission}
                onChange={(e) => setReasonForAdmission(e.target.value)}
                placeholder="e.g. Acute exacerbation of chest pain, desaturation, post-operative monitoring..."
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Initial Working Diagnosis *
              </label>
              <input
                type="text"
                required
                value={initialDiagnosis}
                onChange={(e) => setInitialDiagnosis(e.target.value)}
                placeholder="e.g. Acute Coronary Syndrome, rule out NSTEMI..."
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Initial Admission Clinical Instructions:
              </label>
              <textarea
                value={initialClinicalNotes}
                onChange={(e) => setInitialClinicalNotes(e.target.value)}
                placeholder="e.g. Continuous telemetry, vitals q2h, strict NPO until cardiology rounds..."
                rows={2}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white outline-none"
              />
            </div>
          </div>

          {/* Workflow Notice */}
          <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-emerald-900 text-[11px] space-y-0.5">
            <span className="font-bold">Bed Management Side-Effect:</span>
            <p>
              Confirming admission will instantly transition Bed <strong>{selectedBedId || '...'}</strong>{' '}
              to <strong className="text-rose-700">OCCUPIED</strong>, set patient status to{' '}
              <strong>Inpatient</strong>, and log an immutable entry into the hospital audit trail.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200"
            >
              Cancel
            </button>
            <button
              id="confirm-admission-submit-btn"
              type="submit"
              disabled={!selectedBedId}
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            >
              <BedDouble className="w-4 h-4" />
              <span>Admit to Bed</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Mandatory Safety Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showConfirm}
        title="Confirm Inpatient Bed Admission"
        message={`Are you sure you want to admit ${patient?.fullName} (${selectedPatientId}) to Bed ${selectedBedId} (${selectedWardId})? This will mark the bed as OCCUPIED and initiate Inpatient Visit #${nextVisitNumber}.`}
        confirmLabel="Confirm & Admit Patient"
        confirmVariant="primary"
        onConfirm={handleExecuteAdmission}
        onCancel={() => setShowConfirm(false)}
      />
    </>
  );
};
