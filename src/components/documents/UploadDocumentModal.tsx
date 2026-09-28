import React, { useState } from 'react';
import { Files, Upload, AlertCircle, CheckCircle, FileText } from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { Modal } from '../common/Modal';
import { DocumentCategory } from '../../types/hospital';

interface UploadDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  visitId: string;
}

export const UploadDocumentModal: React.FC<UploadDocumentModalProps> = ({
  isOpen,
  onClose,
  patientId,
  visitId,
}) => {
  const { uploadDocument, getPatientById, currentUser } = useHospital();
  const patient = getPatientById(patientId);

  const [name, setName] = useState('');
  const [category, setCategory] = useState<DocumentCategory>('Laboratory Report');
  const [fileType, setFileType] = useState('PDF');
  const [summary, setSummary] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Document title is required.');
      return;
    }

    uploadDocument({
      patientId,
      visitId,
      name: name.trim(),
      category,
      fileType,
      fileSize: '1.4 MB',
      summary: summary.trim() || undefined,
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Upload & Archive Clinical Document"
      subtitle={`Patient: ${patient?.fullName || patientId} • Visit ${visitId}`}
      maxWidth="lg"
      id="upload-document-modal"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Drag and drop / File attachment area */}
        <div className="p-6 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50/60 text-center hover:bg-slate-50 transition-colors cursor-pointer">
          <Upload className="w-8 h-8 text-blue-500 mx-auto mb-2" />
          <div className="font-semibold text-slate-800">
            Click to select or drag and drop medical reports
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Accepts DICOM, PDF, JPEG, PNG, HL7 / FHIR documents up to 50MB
          </p>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            Official Document Name / Title *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. 12-Lead Electrocardiogram, Brain MRI T1/T2 Axial Scan..."
            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 outline-none focus:bg-white"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Document Category:
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 outline-none focus:bg-white font-medium"
            >
              <option value="Laboratory Report">Lab Report (Hematology, Biochem)</option>
              <option value="X-Ray">Radiology Scan (X-Ray)</option>
              <option value="CT Report">CT Scan Report</option>
              <option value="MRI Report">MRI Report</option>
              <option value="Discharge Summary">Discharge Summary</option>
              <option value="Consent Document">Signed Informed Consent</option>
              <option value="Insurance Document">Insurance Document / ID Proof</option>
              <option value="Other">Other Clinical Record</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Format Type:</label>
            <select
              value={fileType}
              onChange={(e) => setFileType(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 outline-none focus:bg-white font-mono"
            >
              <option value="PDF">PDF Medical Document</option>
              <option value="DICOM">DICOM Imaging Package</option>
              <option value="JPEG">High-Res Image (JPEG)</option>
              <option value="XML">HL7 / CDA XML File</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            Clinical Summary / Impression (Optional):
          </label>
          <textarea
            rows={3}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Key diagnostic impressions, radiologist notes, or pathology conclusions..."
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
            <Files className="w-4 h-4" />
            <span>Upload & Link to Patient Record</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
