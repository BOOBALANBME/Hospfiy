import React, { useState, useEffect } from 'react';
import {
  BedDouble,
  Building2,
  Layers,
  DoorOpen,
  CheckCircle2,
  AlertCircle,
  Plus,
  Tag,
  Stethoscope,
  Info,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { useHospital } from '../../context/HospitalContext';
import { BedType, BedStatus } from '../../types/hospital';

interface AddBedModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultWardId?: string;
}

const BED_TYPES: { value: BedType; label: string }[] = [
  { value: 'STANDARD', label: 'Standard Inpatient Bed' },
  { value: 'ICU', label: 'Intensive Care Unit (ICU) Bed' },
  { value: 'CARDIAC', label: 'Cardiac Care (CCU) Bed' },
  { value: 'ISOLATION', label: 'Negative Pressure Isolation Bed' },
  { value: 'PEDIATRIC', label: 'Pediatric Care Bed' },
  { value: 'SURGICAL', label: 'Post-Op Surgical Bed' },
  { value: 'MATERNITY', label: 'Maternity & Delivery Bed' },
  { value: 'DIALYSIS', label: 'Hemodialysis Specialty Bed' },
  { value: 'ONCOLOGY', label: 'Oncology Ward Bed' },
  { value: 'ORTHOPEDIC', label: 'Orthopedic Traction Bed' },
  { value: 'REHAB', label: 'Rehabilitation Bed' },
];

const COMMON_AMENITIES = [
  'Central O2 Port',
  'Vacuum Suction',
  'Patient Monitor Mount',
  'Ventilator Air Line',
  'IV Infusion Pole',
  'Motorized Height Control',
  'Nurse Call System',
  'Anti-decubitus Air Mattress',
];

export const AddBedModal: React.FC<AddBedModalProps> = ({
  isOpen,
  onClose,
  defaultWardId,
}) => {
  const { wards, beds, addBed } = useHospital();

  const [wardId, setWardId] = useState<string>('WARD-ICU');
  const [bedId, setBedId] = useState<string>('');
  const [roomNumber, setRoomNumber] = useState<string>('RM-101');
  const [bedType, setBedType] = useState<BedType>('ICU');
  const [status, setStatus] = useState<BedStatus>('AVAILABLE');
  const [building, setBuilding] = useState<string>('Building A (Critical Care)');
  const [floor, setFloor] = useState<string>('Floor 2');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([
    'Central O2 Port',
    'Vacuum Suction',
    'Nurse Call System',
  ]);
  const [notes, setNotes] = useState<string>('');

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Auto update ward metadata and suggested bed ID
  useEffect(() => {
    const selectedWardObj = wards.find((w) => w.id === wardId);
    if (selectedWardObj) {
      setBuilding(selectedWardObj.building || 'Building A');
      setFloor(selectedWardObj.floor || 'Floor 1');

      // Auto-suggest next bed ID
      const prefix = selectedWardObj.id.replace('WARD-', '').slice(0, 4);
      const bedsInWard = beds.filter((b) => b.wardId === selectedWardObj.id);
      const nextNum = bedsInWard.length + 1;
      setBedId(`${prefix}-${String(nextNum).padStart(2, '0')}`);
      setRoomNumber(`RM-${selectedWardObj.floor.replace(/\D/g, '') || '1'}0${Math.min(nextNum, 9)}`);

      if (selectedWardObj.id === 'WARD-ICU') {
        setBedType('ICU');
      } else if (selectedWardObj.id === 'WARD-CCU') {
        setBedType('CARDIAC');
      } else if (selectedWardObj.id === 'WARD-PED') {
        setBedType('PEDIATRIC');
      } else if (selectedWardObj.id === 'WARD-SURG') {
        setBedType('SURGICAL');
      } else if (selectedWardObj.id === 'WARD-MAT') {
        setBedType('MATERNITY');
      } else if (selectedWardObj.id === 'WARD-DIAL') {
        setBedType('DIALYSIS');
      } else {
        setBedType('STANDARD');
      }
    }
  }, [wardId, wards, beds]);

  useEffect(() => {
    if (defaultWardId && wards.some((w) => w.id === defaultWardId)) {
      setWardId(defaultWardId);
    }
  }, [defaultWardId, wards, isOpen]);

  const toggleAmenity = (item: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(item) ? prev.filter((a) => a !== item) : [...prev, item]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!bedId.trim()) {
      setError('Please provide a valid Bed Code or ID (e.g. ICU-16).');
      return;
    }

    const selectedWardObj = wards.find((w) => w.id === wardId);
    if (!selectedWardObj) {
      setError('Please select a valid hospital department / ward.');
      return;
    }

    const result = addBed({
      id: bedId.trim().toUpperCase(),
      wardId: selectedWardObj.id,
      wardName: selectedWardObj.name,
      building,
      floor,
      roomNumber: roomNumber.trim() || 'RM-101',
      bedType,
      status,
      equipmentAssigned: selectedAmenities,
      notes: notes.trim() || undefined,
    });

    if (!result.success) {
      setError(result.message);
    } else {
      setSuccess(result.message);
      setTimeout(() => {
        onClose();
        setSuccess(null);
      }, 1200);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Commission & Add Hospital Bed"
      subtitle="Expand hospital capacity by adding a verified clinical bed to any ward"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold">Cannot Add Bed</div>
              <div>{error}</div>
            </div>
          </div>
        )}

        {success && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <div className="font-bold">{success}</div>
          </div>
        )}

        {/* Department / Ward Selection */}
        <div>
          <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-blue-600" />
            <span>Target Department / Ward *</span>
          </label>
          <select
            value={wardId}
            onChange={(e) => setWardId(e.target.value)}
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none font-medium"
          >
            {wards.map((w) => {
              const bedCount = beds.filter((b) => b.wardId === w.id).length;
              return (
                <option key={w.id} value={w.id}>
                  {w.name} ({w.building} • {w.floor} • Current: {bedCount} beds)
                </option>
              );
            })}
          </select>
        </div>

        {/* Bed ID & Room Number */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <BedDouble className="w-3.5 h-3.5 text-blue-600" />
              <span>Bed Code / Identifier *</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. ICU-16, GEN-21"
              value={bedId}
              onChange={(e) => setBedId(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono font-bold focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none uppercase"
            />
            <span className="text-[10px] text-slate-400 mt-0.5 block">
              Auto-formatted uniquely per department
            </span>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <DoorOpen className="w-3.5 h-3.5 text-blue-600" />
              <span>Room / Cubicle Number *</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. RM-204, Bay 3"
              value={roomNumber}
              onChange={(e) => setRoomNumber(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none"
            />
          </div>
        </div>

        {/* Bed Type & Initial Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Stethoscope className="w-3.5 h-3.5 text-blue-600" />
              <span>Clinical Bed Category *</span>
            </label>
            <select
              value={bedType}
              onChange={(e) => setBedType(e.target.value as BedType)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none"
            >
              {BED_TYPES.map((bt) => (
                <option key={bt.value} value={bt.value}>
                  {bt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              <span>Initial Operational Status *</span>
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as BedStatus)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none"
            >
              <option value="AVAILABLE">Available (Ready for Admission)</option>
              <option value="CLEANING">Cleaning & Sanitization in Progress</option>
              <option value="MAINTENANCE">Maintenance / Bench Setup</option>
              <option value="RESERVED">Reserved</option>
            </select>
          </div>
        </div>

        {/* Building & Floor */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Building Location</label>
            <input
              type="text"
              value={building}
              onChange={(e) => setBuilding(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white outline-none"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Floor Level</label>
            <input
              type="text"
              value={floor}
              onChange={(e) => setFloor(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white outline-none"
            />
          </div>
        </div>

        {/* Assigned Amenities & Equipment Badges */}
        <div>
          <label className="block font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-blue-600" />
            <span>Bedside Installed Equipment & Infrastructure</span>
          </label>
          <div className="flex flex-wrap gap-1.5">
            {COMMON_AMENITIES.map((amenity) => {
              const isSelected = selectedAmenities.includes(amenity);
              return (
                <button
                  type="button"
                  key={amenity}
                  onClick={() => toggleAmenity(amenity)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all flex items-center gap-1 border ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span>{isSelected ? '✓' : '+'}</span>
                  <span>{amenity}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Clinical / Location Notes */}
        <div>
          <label className="block font-bold text-slate-700 mb-1">
            Clinical Notes & Observations (Optional)
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Next to nurse station, equipped with dual high-pressure oxygen regulator..."
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white outline-none resize-none"
          />
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
            <Info className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <span>Immediately updates hospital census and bed map.</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold shadow-xs transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Confirm & Add Bed</span>
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
