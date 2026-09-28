import React, { useState } from 'react';
import { FileHeart, HeartPulse, Plus, AlertCircle } from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { Modal } from '../common/Modal';
import { ClinicalRecord, VitalSign } from '../../types/hospital';

interface AddClinicalNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  visitId: string;
}

export const AddClinicalNoteModal: React.FC<AddClinicalNoteModalProps> = ({
  isOpen,
  onClose,
  patientId,
  visitId,
}) => {
  const { addClinicalRecord, getPatientById, currentUser } = useHospital();
  const patient = getPatientById(patientId);

  const [recordType, setRecordType] = useState<ClinicalRecord['recordType']>('DOCTOR_NOTE');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  // Optional Vitals input
  const [includeVitals, setIncludeVitals] = useState(true);
  const [hr, setHr] = useState('78');
  const [bpSys, setBpSys] = useState('122');
  const [bpDia, setBpDia] = useState('78');
  const [temp, setTemp] = useState('36.8');
  const [spo2, setSpo2] = useState('98');
  const [rr, setRr] = useState('16');

  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !content.trim()) {
      setError('Title and note content are required.');
      return;
    }

    let vitals: VitalSign | undefined = undefined;
    if (includeVitals) {
      vitals = {
        id: `VIT-${Date.now().toString().slice(-4)}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        heartRate: Number(hr) || 75,
        bloodPressureSys: Number(bpSys) || 120,
        bloodPressureDia: Number(bpDia) || 80,
        temperature: Number(temp) || 37.0,
        oxygenSaturation: Number(spo2) || 98,
        respiratoryRate: Number(rr) || 16,
        recordedBy: currentUser.name,
      };
    }

    addClinicalRecord({
      patientId,
      visitId,
      recordType,
      title: title.trim(),
      content: content.trim(),
      vitals,
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Clinical Note & Patient Progress Record"
      subtitle={`Patient: ${patient?.fullName || patientId} • Visit ${visitId}`}
      maxWidth="xl"
      id="add-clinical-note-modal"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Record Type:</label>
            <select
              value={recordType}
              onChange={(e) => setRecordType(e.target.value as any)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 outline-none focus:bg-white"
            >
              <option value="DOCTOR_NOTE">Doctor Clinical Progress Note</option>
              <option value="NURSING_NOTE">Nursing Shift Note</option>
              <option value="VITALS_LOG">Vitals Assessment Log</option>
              <option value="LAB_RESULT">Bedside Diagnostic Finding</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Author Identity:</label>
            <div className="p-2 bg-slate-100 rounded-lg border border-slate-200 font-medium text-slate-700">
              {currentUser.name} ({currentUser.role})
            </div>
          </div>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Note Title *</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Morning Attending Rounds Assessment, Post-Medication Evaluation..."
            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 outline-none focus:bg-white"
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            Clinical Documentation / Findings *
          </label>
          <textarea
            required
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Detail patient symptoms, physical exam findings, telemetry observation, and therapy response..."
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 outline-none focus:bg-white"
          />
        </div>

        {/* Vital signs section */}
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <HeartPulse className="w-4 h-4 text-rose-500" />
              <span>Attach Concurrent Vital Signs</span>
            </span>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={includeVitals}
                onChange={(e) => setIncludeVitals(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-0"
              />
              <span className="text-[11px] text-slate-600">Include Vitals</span>
            </label>
          </div>

          {includeVitals && (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
              <div>
                <label className="block text-[10px] text-slate-500 mb-0.5">HR (bpm)</label>
                <input
                  type="number"
                  value={hr}
                  onChange={(e) => setHr(e.target.value)}
                  className="w-full p-1.5 bg-white border border-slate-200 rounded text-center font-mono font-bold"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 mb-0.5">BP (Sys/Dia)</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={bpSys}
                    onChange={(e) => setBpSys(e.target.value)}
                    className="w-1/2 p-1.5 bg-white border border-slate-200 rounded text-center font-mono font-bold text-xs"
                  />
                  <span>/</span>
                  <input
                    type="number"
                    value={bpDia}
                    onChange={(e) => setBpDia(e.target.value)}
                    className="w-1/2 p-1.5 bg-white border border-slate-200 rounded text-center font-mono font-bold text-xs"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 mb-0.5">Temp (°C)</label>
                <input
                  type="text"
                  value={temp}
                  onChange={(e) => setTemp(e.target.value)}
                  className="w-full p-1.5 bg-white border border-slate-200 rounded text-center font-mono font-bold"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 mb-0.5">SpO2 (%)</label>
                <input
                  type="number"
                  value={spo2}
                  onChange={(e) => setSpo2(e.target.value)}
                  className="w-full p-1.5 bg-white border border-slate-200 rounded text-center font-mono font-bold"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 mb-0.5">RR (/min)</label>
                <input
                  type="number"
                  value={rr}
                  onChange={(e) => setRr(e.target.value)}
                  className="w-full p-1.5 bg-white border border-slate-200 rounded text-center font-mono font-bold"
                />
              </div>
            </div>
          )}
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
            className="px-5 py-2 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
          >
            Save Clinical Note
          </button>
        </div>
      </form>
    </Modal>
  );
};
