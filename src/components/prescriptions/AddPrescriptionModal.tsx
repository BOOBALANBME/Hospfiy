import React, { useState } from 'react';
import { Pill, AlertCircle, Plus } from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { Modal } from '../common/Modal';

interface AddPrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  visitId: string;
}

export const AddPrescriptionModal: React.FC<AddPrescriptionModalProps> = ({
  isOpen,
  onClose,
  patientId,
  visitId,
}) => {
  const { addPrescription, getPatientById, currentUser } = useHospital();
  const patient = getPatientById(patientId);

  const [medicineName, setMedicineName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('Once daily (OD)');
  const [duration, setDuration] = useState('7 days');
  const [route, setRoute] = useState<'Oral' | 'IV' | 'IM' | 'Subcutaneous' | 'Inhalation' | 'Topical'>('Oral');
  const [instructions, setInstructions] = useState('Take with food. Monitor blood pressure.');

  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!medicineName.trim() || !dosage.trim()) {
      setError('Medication name and dosage are mandatory.');
      return;
    }

    addPrescription({
      patientId,
      visitId,
      medicineName: medicineName.trim(),
      dosage: dosage.trim(),
      frequency,
      duration,
      route,
      instructions: instructions.trim(),
      status: 'ACTIVE',
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Issue Inpatient Prescription Order"
      subtitle={`Patient: ${patient?.fullName || patientId} • Visit ${visitId}`}
      maxWidth="lg"
      id="add-prescription-modal"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Allergy Warning check */}
        {patient?.allergies && patient.allergies.length > 0 && (
          <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-900 text-[11px]">
            <strong>Patient Allergy Alert:</strong>{' '}
            <span className="font-bold">{patient.allergies.join(', ')}</span>. Verify cross-reactivity
            before ordering.
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Medication Name & Generic *
            </label>
            <input
              type="text"
              required
              value={medicineName}
              onChange={(e) => setMedicineName(e.target.value)}
              placeholder="e.g. Lisinopril, Metoprolol Tartrate, Ceftriaxone..."
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 outline-none focus:bg-white"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Dosage & Strength *</label>
            <input
              type="text"
              required
              value={dosage}
              onChange={(e) => setDosage(e.target.value)}
              placeholder="e.g. 10mg, 500mg, 1g in 100ml NS..."
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 outline-none focus:bg-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Administration Route:</label>
            <select
              value={route}
              onChange={(e) => setRoute(e.target.value as any)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 outline-none focus:bg-white font-medium"
            >
              <option value="Oral">Oral (PO)</option>
              <option value="IV">Intravenous (IV)</option>
              <option value="IM">Intramuscular (IM)</option>
              <option value="Subcutaneous">Subcutaneous (SC)</option>
              <option value="Inhalation">Inhalation</option>
              <option value="Topical">Topical</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Frequency:</label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 outline-none focus:bg-white"
            >
              <option value="Once daily (OD)">Once daily (OD)</option>
              <option value="Twice daily (BID)">Twice daily (BID)</option>
              <option value="Three times daily (TID)">Three times daily (TID)</option>
              <option value="Four times daily (QID)">Four times daily (QID)</option>
              <option value="Every 8 hours (q8h)">Every 8 hours (q8h)</option>
              <option value="As needed (PRN)">As needed (PRN)</option>
              <option value="At bedtime (QHS)">At bedtime (QHS)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Duration:</label>
            <input
              type="text"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="e.g. 5 days, 14 days, Duration of stay..."
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 outline-none focus:bg-white"
            />
          </div>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            Clinical Nursing / Administration Instructions:
          </label>
          <textarea
            rows={2}
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="e.g. Administer with morning meal, hold if systolic BP < 100 mmHg..."
            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 outline-none focus:bg-white"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200 font-semibold"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Pill className="w-4 h-4" />
            <span>Sign & Authorize Order</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
