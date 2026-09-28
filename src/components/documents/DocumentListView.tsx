import React, { useState } from 'react';
import { Files, Search, Filter, Eye, User, FileText, Download } from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { DocumentCategory } from '../../types/hospital';
import { Modal } from '../common/Modal';

export const DocumentListView: React.FC = () => {
  const { documents, patients, navigateToPatient } = useHospital();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [inspectDoc, setInspectDoc] = useState<any | null>(null);

  const filtered = documents.filter((doc) => {
    if (categoryFilter !== 'ALL' && doc.category !== categoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const patient = patients.find((p) => p.id === doc.patientId);
      const matchName = doc.name.toLowerCase().includes(q);
      const matchPat = patient?.fullName.toLowerCase().includes(q) || doc.patientId.toLowerCase().includes(q);
      const matchSummary = doc.summary?.toLowerCase().includes(q);
      if (!matchName && !matchPat && !matchSummary) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Files className="w-5 h-5 text-blue-600" />
            <span>Hospital Medical Documents & Diagnostics Repository</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Organized medical reports, radiology scans, lab panels, and patient consent files linked by permanent Patient ID.
          </p>
        </div>

        <div className="text-xs font-semibold text-slate-600 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
          Total Archived Documents: <strong>{documents.length}</strong>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 min-w-[280px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Document Name, Patient ID, or Clinical Keywords..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-600 shrink-0">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="py-1.5 px-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-800 outline-none"
            >
              <option value="ALL">All Categories ({documents.length})</option>
              <option value="LAB_REPORT">Lab Reports</option>
              <option value="SCAN_IMAGE">Radiology & Scans</option>
              <option value="DISCHARGE_SUMMARY">Discharge Summaries</option>
              <option value="CONSENT_FORM">Consent Forms</option>
              <option value="REFERRAL">Referral Letters</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Showing <strong>{filtered.length}</strong> records
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((doc) => {
          const patient = patients.find((p) => p.id === doc.patientId);

          return (
            <div
              key={doc.id}
              className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-blue-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wide">
                    {doc.category.replace('_', ' ')}
                  </span>
                  <span className="font-mono text-[10px] text-slate-400">{doc.uploadDate}</span>
                </div>

                <h4 className="text-xs font-bold text-slate-900 flex items-start gap-1.5 mb-1.5">
                  <FileText className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{doc.name}</span>
                </h4>

                <div
                  onClick={() => navigateToPatient(doc.patientId, 'documents')}
                  className="text-xs font-semibold text-slate-700 hover:text-blue-600 cursor-pointer flex items-center gap-1 mb-2"
                >
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>{patient?.fullName}</span>
                  <span className="font-mono text-slate-400 text-[11px]">({doc.patientId})</span>
                </div>

                {doc.summary && (
                  <p className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 line-clamp-3 leading-relaxed">
                    {doc.summary}
                  </p>
                )}
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">
                  {doc.fileType} • {doc.fileSize}
                </span>

                <button
                  onClick={() => setInspectDoc(doc)}
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-bold"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Details</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200 text-slate-400 text-xs">
          No medical documents match your search criteria.
        </div>
      )}

      {/* Inspect Document Modal */}
      {inspectDoc && (
        <Modal
          isOpen={true}
          onClose={() => setInspectDoc(null)}
          title={`Clinical Document Viewer: ${inspectDoc.name}`}
          subtitle={`${inspectDoc.category} • Uploaded on ${inspectDoc.uploadDate}`}
          maxWidth="lg"
          id="document-inspector-global-modal"
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
    </div>
  );
};
