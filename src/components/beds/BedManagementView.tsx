import React, { useState } from 'react';
import {
  BedDouble,
  Filter,
  Search,
  CheckCircle,
  AlertCircle,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Building,
  User,
  Activity,
  Layers,
  Wrench,
  Brush,
  Plus,
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { Bed, BedStatus } from '../../types/hospital';
import { StatusBadge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { AddBedModal } from './AddBedModal';

export const BedManagementView: React.FC = () => {
  const {
    beds,
    wards,
    updateBedStatus,
    navigateToPatient,
    canUserPerform,
    selectedBedId,
    setSelectedBedId,
  } = useHospital();

  const [selectedWard, setSelectedWard] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isAddBedModalOpen, setIsAddBedModalOpen] = useState<boolean>(false);

  // Status update modal state
  const [editingBed, setEditingBed] = useState<Bed | null>(null);
  const [targetStatus, setTargetStatus] = useState<BedStatus>('AVAILABLE');
  const [statusNotes, setStatusNotes] = useState<string>('');
  const [statusError, setStatusError] = useState<string | null>(null);
  const [statusSuccess, setStatusSuccess] = useState<string | null>(null);

  // Filter beds
  const filteredBeds = beds.filter((b) => {
    if (selectedWard !== 'ALL' && b.wardId !== selectedWard) return false;
    if (selectedStatus !== 'ALL' && b.status !== selectedStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = b.id.toLowerCase().includes(q);
      const matchRoom = b.roomNumber.toLowerCase().includes(q);
      const matchPatient = b.currentPatientName?.toLowerCase().includes(q);
      const matchWard = b.wardName.toLowerCase().includes(q);
      if (!matchId && !matchRoom && !matchPatient && !matchWard) return false;
    }
    return true;
  });

  const handleOpenStatusModal = (bed: Bed) => {
    setEditingBed(bed);
    setTargetStatus(bed.status);
    setStatusNotes(bed.notes || '');
    setStatusError(null);
    setStatusSuccess(null);
  };

  const handleApplyStatusChange = () => {
    if (!editingBed) return;
    setStatusError(null);
    setStatusSuccess(null);

    const result = updateBedStatus(editingBed.id, targetStatus, statusNotes);
    if (!result.success) {
      setStatusError(result.message);
    } else {
      setStatusSuccess(result.message);
      setTimeout(() => {
        setEditingBed(null);
      }, 900);
    }
  };

  // Status counts
  const totalAvailable = beds.filter((b) => b.status === 'AVAILABLE').length;
  const totalOccupied = beds.filter((b) => b.status === 'OCCUPIED').length;
  const totalReserved = beds.filter((b) => b.status === 'RESERVED').length;
  const totalCleaning = beds.filter((b) => b.status === 'CLEANING').length;
  const totalMaintenance = beds.filter((b) => b.status === 'MAINTENANCE').length;

  return (
    <div className="space-y-6">
      {/* Title & Stats Ribbon */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BedDouble className="w-5 h-5 text-blue-600" />
            <span>Hospital Bed Management & Census</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Hierarchy: Hospify → Buildings → Floors → Wards → Rooms → Beds
          </p>
        </div>

        {/* Quick status counters */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={() => setSelectedStatus('AVAILABLE')}
            className={`px-3 py-1.5 rounded-lg border font-medium transition-all ${
              selectedStatus === 'AVAILABLE'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            Available: <strong>{totalAvailable}</strong>
          </button>

          <button
            onClick={() => setSelectedStatus('OCCUPIED')}
            className={`px-3 py-1.5 rounded-lg border font-medium transition-all ${
              selectedStatus === 'OCCUPIED'
                ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
            }`}
          >
            Occupied: <strong>{totalOccupied}</strong>
          </button>

          <button
            onClick={() => setSelectedStatus('RESERVED')}
            className={`px-3 py-1.5 rounded-lg border font-medium transition-all ${
              selectedStatus === 'RESERVED'
                ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
            }`}
          >
            Reserved: <strong>{totalReserved}</strong>
          </button>

          <button
            onClick={() => setSelectedStatus('CLEANING')}
            className={`px-3 py-1.5 rounded-lg border font-medium transition-all ${
              selectedStatus === 'CLEANING'
                ? 'bg-cyan-600 text-white border-cyan-600 shadow-xs'
                : 'bg-cyan-50 text-cyan-800 border-cyan-200 hover:bg-cyan-100'
            }`}
          >
            Cleaning: <strong>{totalCleaning}</strong>
          </button>

          <button
            onClick={() => setSelectedStatus('MAINTENANCE')}
            className={`px-3 py-1.5 rounded-lg border font-medium transition-all ${
              selectedStatus === 'MAINTENANCE'
                ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                : 'bg-purple-50 text-purple-800 border-purple-200 hover:bg-purple-100'
            }`}
          >
            Maintenance: <strong>{totalMaintenance}</strong>
          </button>

          {selectedStatus !== 'ALL' && (
            <button
              onClick={() => setSelectedStatus('ALL')}
              className="px-2 py-1.5 text-xs text-slate-500 hover:text-slate-700 underline"
            >
              Reset filter
            </button>
          )}

          <button
            id="open-add-bed-modal-btn"
            onClick={() => setIsAddBedModalOpen(true)}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 ml-auto sm:ml-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add Bed</span>
          </button>
        </div>
      </div>

      {/* Mandatory Workflow Banner */}
      <div className="p-3.5 bg-blue-50/70 rounded-xl border border-blue-200/80 text-xs text-blue-900 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px]">
            i
          </div>
          <div>
            <span className="font-bold">Standard Hospital Bed Status Workflow:</span>
            <span className="ml-2 text-slate-600">
              <strong className="text-emerald-700">Available</strong> →{' '}
              <strong className="text-amber-700">Reserved</strong> →{' '}
              <strong className="text-rose-700">Occupied</strong> →{' '}
              <strong className="text-cyan-700">Discharged to Cleaning</strong> →{' '}
              <strong className="text-emerald-700">Sanitized to Available</strong>
            </span>
          </div>
        </div>
        <div className="text-[11px] text-blue-700 font-medium">
          *Discharge process automatically transitions beds to CLEANING
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Ward Selector */}
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="font-semibold">Ward:</span>
            <select
              id="bed-ward-filter-select"
              value={selectedWard}
              onChange={(e) => setSelectedWard(e.target.value)}
              className="py-1.5 px-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-800 text-xs focus:ring-2 focus:ring-blue-100 outline-none"
            >
              <option value="ALL">All Departments ({wards.length} Departments)</option>
              {wards.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} ({w.floor})
                </option>
              ))}
            </select>
          </div>

          {/* Status Selector */}
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span className="font-semibold">Status:</span>
            <select
              id="bed-status-filter-select"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="py-1.5 px-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-800 text-xs focus:ring-2 focus:ring-blue-100 outline-none"
            >
              <option value="ALL">All Statuses ({beds.length})</option>
              <option value="AVAILABLE">Available</option>
              <option value="OCCUPIED">Occupied</option>
              <option value="RESERVED">Reserved</option>
              <option value="CLEANING">Cleaning</option>
              <option value="MAINTENANCE">Maintenance</option>
            </select>
          </div>
        </div>

        {/* Search */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search bed ID, room, or patient..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 focus:bg-white"
          />
        </div>
      </div>

      {/* Bed Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredBeds.map((bed) => {
          const isOccupied = bed.status === 'OCCUPIED';
          const isCleaning = bed.status === 'CLEANING';
          const isAvailable = bed.status === 'AVAILABLE';
          const isReserved = bed.status === 'RESERVED';
          const isMaintenance = bed.status === 'MAINTENANCE';

          const cardBorder = isOccupied
            ? 'border-rose-200 bg-rose-50/20'
            : isCleaning
            ? 'border-cyan-200 bg-cyan-50/20'
            : isAvailable
            ? 'border-emerald-200 bg-emerald-50/20'
            : isReserved
            ? 'border-amber-200 bg-amber-50/20'
            : 'border-purple-200 bg-purple-50/20';

          return (
            <div
              key={bed.id}
              className={`p-4 rounded-xl border bg-white shadow-xs hover:shadow-md transition-all flex flex-col justify-between ${cardBorder}`}
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-extrabold text-slate-900">
                      {bed.id}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                      {bed.bedType}
                    </span>
                  </div>
                  <StatusBadge status={bed.status} size="sm" />
                </div>

                {/* Location hierarchy */}
                <div className="text-xs text-slate-600 space-y-0.5 mb-3">
                  <div className="font-semibold text-slate-800">{bed.wardName}</div>
                  <div className="text-[11px] text-slate-400 flex items-center justify-between">
                    <span>{bed.roomNumber}</span>
                    <span>{bed.floor}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">{bed.building}</div>
                </div>

                {/* Occupant / Status Detail */}
                <div className="min-h-[52px] pt-2 border-t border-slate-100 text-xs">
                  {isOccupied && bed.currentPatientName ? (
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-slate-400 font-medium">Occupied by:</span>
                        <span className="font-mono text-[10px] text-rose-700 bg-rose-50 px-1 rounded">
                          {bed.currentPatientId}
                        </span>
                      </div>
                      <div
                        onClick={() => bed.currentPatientId && navigateToPatient(bed.currentPatientId)}
                        className="font-bold text-slate-900 hover:text-blue-600 cursor-pointer mt-0.5 truncate flex items-center gap-1"
                      >
                        <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{bed.currentPatientName}</span>
                      </div>
                    </div>
                  ) : isCleaning ? (
                    <div className="text-cyan-700 text-[11px] flex items-start gap-1.5">
                      <Brush className="w-3.5 h-3.5 mt-0.5 shrink-0 animate-bounce" />
                      <span>{bed.notes || 'Terminal disinfection & sterilization underway.'}</span>
                    </div>
                  ) : isMaintenance ? (
                    <div className="text-purple-700 text-[11px] flex items-start gap-1.5">
                      <Wrench className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                      <span>{bed.notes || 'Biomedical engineering maintenance & telemetry calibration (Lead: Boobalan S, BME-2026).'}</span>
                    </div>
                  ) : isReserved ? (
                    <div className="text-amber-700 text-[11px] flex items-start gap-1.5">
                      <Clock className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                      <span>{bed.notes || 'Reserved for pending inbound transfer.'}</span>
                    </div>
                  ) : (
                    <div className="text-emerald-700 text-[11px] flex items-start gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                      <span>Sanitized and fully prepared for patient intake.</span>
                    </div>
                  )}
                </div>

                {/* Equipment tag if present */}
                {bed.equipmentAssigned && bed.equipmentAssigned.length > 0 && (
                  <div className="mt-2 text-[10px] text-slate-500 bg-slate-50 p-1.5 rounded border border-slate-200/60 truncate">
                    <strong>Eq:</strong> {bed.equipmentAssigned.join(', ')}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <span className="text-[10px] text-slate-400">
                  Updated: {bed.lastUpdated ? bed.lastUpdated.split(' ')[1] : '--:--'}
                </span>

                <div className="flex items-center gap-1.5">
                  {canUserPerform('UPDATE_BED_STATUS') && (
                    <button
                      id={`update-bed-status-${bed.id}`}
                      onClick={() => handleOpenStatusModal(bed)}
                      className="px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition-colors border border-slate-200"
                    >
                      Update Status
                    </button>
                  )}

                  {isOccupied && bed.currentPatientId && (
                    <button
                      onClick={() => navigateToPatient(bed.currentPatientId!)}
                      className="px-2 py-1 text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
                      title="View Patient Profile"
                    >
                      Profile
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredBeds.length === 0 && (
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200 text-slate-400">
          <BedDouble className="w-10 h-10 mx-auto text-slate-300 mb-2" />
          <h3 className="text-sm font-semibold text-slate-700">No beds match your filter</h3>
          <p className="text-xs text-slate-400 mt-1">Try resetting the ward or status filter.</p>
        </div>
      )}

      {/* Bed Status Update Workflow Modal */}
      {editingBed && (
        <Modal
          isOpen={true}
          onClose={() => setEditingBed(null)}
          title={`Update Bed Status: ${editingBed.id}`}
          subtitle={`${editingBed.wardName} • ${editingBed.roomNumber}`}
          maxWidth="md"
          id="bed-status-update-modal"
        >
          <div className="space-y-4">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="text-slate-500">Current Status:</span>
                <StatusBadge status={editingBed.status} size="sm" />
              </div>
              {editingBed.currentPatientName && (
                <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                  <span className="text-slate-500">Current Occupant:</span>
                  <span className="font-bold text-slate-800">
                    {editingBed.currentPatientName} ({editingBed.currentPatientId})
                  </span>
                </div>
              )}
            </div>

            {/* Target Status Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Select New Status:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['AVAILABLE', 'RESERVED', 'OCCUPIED', 'CLEANING', 'MAINTENANCE'] as BedStatus[]).map(
                  (st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setTargetStatus(st)}
                      className={`p-2.5 rounded-lg border text-xs font-semibold text-left transition-all ${
                        targetStatus === st
                          ? 'ring-2 ring-blue-500 border-blue-500 bg-blue-50/40 text-blue-950 font-bold'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{st}</span>
                        {targetStatus === st && <CheckCircle className="w-4 h-4 text-blue-600" />}
                      </div>
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Status Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Clinical/Housekeeping Notes (Optional):
              </label>
              <textarea
                value={statusNotes}
                onChange={(e) => setStatusNotes(e.target.value)}
                placeholder="e.g. UV disinfection cycle completed, BioMed actuator serviced..."
                rows={2}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none"
              />
            </div>

            {/* Error or Success Notice */}
            {statusError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                <span>{statusError}</span>
              </div>
            )}

            {statusSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-start gap-2">
                <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                <span>{statusSuccess}</span>
              </div>
            )}

            {/* Workflow Guideline note */}
            <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded border border-slate-200">
              <strong>Clinical Guardrail:</strong> Occupied beds cannot be made Available directly.
              They must undergo clinical discharge, followed by terminal cleaning, before return to
              service.
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingBed(null)}
                className="px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200"
              >
                Cancel
              </button>
              <button
                id="apply-bed-status-btn"
                type="button"
                onClick={handleApplyStatusChange}
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
              >
                Confirm Status Transition
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add New Hospital Bed Modal */}
      <AddBedModal
        isOpen={isAddBedModalOpen}
        onClose={() => setIsAddBedModalOpen(false)}
        defaultWardId={selectedWard !== 'ALL' ? selectedWard : undefined}
      />
    </div>
  );
};
