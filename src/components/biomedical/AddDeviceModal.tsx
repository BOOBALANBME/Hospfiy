import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Building2,
  Factory,
  Calendar,
  ShieldCheck,
  Tag,
  BedDouble,
  CheckCircle2,
  AlertCircle,
  Plus,
  Coins,
  Activity,
  Zap,
  Bell,
  BatteryCharging,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { useHospital } from '../../context/HospitalContext';
import { DeviceWorkingStatus } from '../../types/hospital';

interface AddDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultWardId?: string;
}

const CATEGORIES = [
  'Ventilator',
  'Patient Monitor',
  'Infusion Pump',
  'Defibrillator',
  'Dialysis Machine',
  'Diagnostic & Imaging',
  'Surgical Equipment',
  'Respiratory & Suction',
] as const;

const POPULAR_COMPANIES = [
  'Mindray Medical',
  'GE Healthcare',
  'Philips Healthcare',
  'Medtronic',
  'Dräger Medical',
  'Schiller India',
  'Siemens Healthineers',
  'Baxter Healthcare',
  'B. Braun Medical',
  'ResMed Medical',
  'Nihon Kohden',
  'Fresenius Medical Care',
  'Hamilton Medical',
  'Olympus Medical',
  'Stryker Endoscopy',
];

export const AddDeviceModal: React.FC<AddDeviceModalProps> = ({
  isOpen,
  onClose,
  defaultWardId,
}) => {
  const { wards, beds, devices, addDevice, currentUser } = useHospital();

  const [assignedWardId, setAssignedWardId] = useState<string>('WARD-ICU');
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>('Ventilator');
  const [name, setName] = useState<string>('Mindray SV300 ICU Mechanical Ventilator');
  const [company, setCompany] = useState<string>('Mindray Medical');
  const [modelNumber, setModelNumber] = useState<string>('SV-300-PRO');
  const [serialNumber, setSerialNumber] = useState<string>('');
  const [purchaseDate, setPurchaseDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [purchaseCost, setPurchaseCost] = useState<string>('₹14,50,000');
  const [warrantyExpiry, setWarrantyExpiry] = useState<string>('2029-06-30');
  const [supplier, setSupplier] = useState<string>('TransAsia Bio-Med Systems Ltd');
  const [assignedBedId, setAssignedBedId] = useState<string>('');
  const [status, setStatus] = useState<DeviceWorkingStatus>('WORKING_PROPERLY');
  const [electricalSafetyPassed, setElectricalSafetyPassed] = useState<boolean>(true);
  const [calibrationPassed, setCalibrationPassed] = useState<boolean>(true);
  const [alarmFunctional, setAlarmFunctional] = useState<boolean>(true);
  const [batteryBackupPercent, setBatteryBackupPercent] = useState<number>(100);
  const [notes, setNotes] = useState<string>('Newly commissioned and certified by Biomedical Engineering.');

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Filter available beds for the selected department
  const availableWardBeds = beds.filter((b) => b.wardId === assignedWardId);

  // When category changes, suggest sensible defaults
  const handleCategoryChange = (newCat: (typeof CATEGORIES)[number]) => {
    setCategory(newCat);
    if (newCat === 'Ventilator') {
      setName('Mindray SV300 ICU Mechanical Ventilator');
      setCompany('Mindray Medical');
      setModelNumber('SV-300-PRO');
      setPurchaseCost('₹14,50,000');
    } else if (newCat === 'Patient Monitor') {
      setName('Philips IntelliVue Multi-Para Monitor');
      setCompany('Philips Healthcare');
      setModelNumber('MX750-ICU');
      setPurchaseCost('₹4,85,000');
    } else if (newCat === 'Infusion Pump') {
      setName('B. Braun Perfusor Space Infusion Syringe Pump');
      setCompany('B. Braun Medical');
      setModelNumber('Space-P1');
      setPurchaseCost('₹1,45,000');
    } else if (newCat === 'Defibrillator') {
      setName('Schiller Defigard Biphasic Defibrillator');
      setCompany('Schiller India');
      setModelNumber('DG-5000');
      setPurchaseCost('₹6,80,000');
    } else if (newCat === 'Dialysis Machine') {
      setName('Fresenius 5008S CorDiax High-Flux Hemodialysis System');
      setCompany('Fresenius Medical Care');
      setModelNumber('5008S-CF');
      setPurchaseCost('₹18,50,000');
    } else if (newCat === 'Diagnostic & Imaging') {
      setName('GE Healthcare Vivid Ultrasound Scanner');
      setCompany('GE Healthcare');
      setModelNumber('Vivid-T8');
      setPurchaseCost('₹22,00,000');
    } else if (newCat === 'Surgical Equipment') {
      setName('Medtronic Valleylab FT10 Electrosurgical Generator');
      setCompany('Medtronic');
      setModelNumber('VL-FT10');
      setPurchaseCost('₹11,20,000');
    } else {
      setName('Dräger Medical Suction & Respiratory Unit');
      setCompany('Dräger Medical');
      setModelNumber('VarioVac-P');
      setPurchaseCost('₹2,10,000');
    }
  };

  // Generate random serial number on mount/change
  useEffect(() => {
    const randomSN = `SN-${Math.floor(100000 + Math.random() * 900000)}`;
    setSerialNumber(randomSN);
  }, [category, assignedWardId]);

  useEffect(() => {
    if (defaultWardId && wards.some((w) => w.id === defaultWardId)) {
      setAssignedWardId(defaultWardId);
    }
  }, [defaultWardId, wards, isOpen]);

  useEffect(() => {
    if (availableWardBeds.length > 0 && !assignedBedId) {
      setAssignedBedId(availableWardBeds[0].id);
    }
  }, [availableWardBeds, assignedBedId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!name.trim()) {
      setError('Please provide the device name.');
      return;
    }

    if (!company.trim()) {
      setError('Please specify the manufacturer / company.');
      return;
    }

    const selectedWardObj = wards.find((w) => w.id === assignedWardId);
    if (!selectedWardObj) {
      setError('Please select a valid target department.');
      return;
    }

    // Auto-generate ID if needed
    const deptPrefix = selectedWardObj.id.replace('WARD-', '').slice(0, 4);
    const countInWard = devices.filter((d) => d.assignedWardId === selectedWardObj.id).length;
    const generatedId = `DEV-${deptPrefix}-${String(countInWard + 1).padStart(2, '0')}`;

    const result = addDevice({
      id: generatedId,
      name: name.trim(),
      company: company.trim(),
      modelNumber: modelNumber.trim() || 'MOD-STD',
      serialNumber: serialNumber.trim() || `SN-${Date.now().toString().slice(-6)}`,
      category,
      purchaseDate: purchaseDate || new Date().toISOString().slice(0, 10),
      purchaseCost: purchaseCost.trim() || '₹1,50,000',
      warrantyExpiry: warrantyExpiry.trim() || '2029-12-31',
      supplier: supplier.trim() || 'Certified OEM Vendor',
      assignedWardId: selectedWardObj.id,
      assignedWardName: selectedWardObj.name,
      assignedBedId: assignedBedId || 'BME-BENCH-1',
      status,
      electricalSafetyPassed,
      calibrationPassed,
      alarmFunctional,
      batteryBackupPercent: Number(batteryBackupPercent) || 100,
      notes: notes.trim() || undefined,
      lastCheckedBy: currentUser?.name || 'Biomedical Engineer',
      lastCheckedBadge: currentUser?.badgeNumber || 'BME-001',
      lastCheckedDate: new Date().toISOString().replace('T', ' ').slice(0, 16),
      nextScheduledCheck: '2026-12-31',
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
      title="Register & Add Medical Device"
      subtitle="Commission biomedical equipment with manufacturer, purchase record, and department assignment"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold">Cannot Register Device</div>
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

        {/* Department & Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
              <span>Target Hospital Department *</span>
            </label>
            <select
              value={assignedWardId}
              onChange={(e) => setAssignedWardId(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none font-medium"
            >
              {wards.map((w) => {
                const count = devices.filter((d) => d.assignedWardId === w.id).length;
                return (
                  <option key={w.id} value={w.id}>
                    {w.name} ({count} devices registered)
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-blue-600" />
              <span>Equipment Category *</span>
            </label>
            <select
              value={category}
              onChange={(e) =>
                handleCategoryChange(e.target.value as (typeof CATEGORIES)[number])
              }
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none font-medium"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Device Name */}
        <div>
          <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-blue-600" />
            <span>Equipment / Model Name *</span>
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Mindray SV300 ICU Mechanical Ventilator"
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-semibold focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none"
          />
        </div>

        {/* Company / Manufacturer & Model */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Factory className="w-3.5 h-3.5 text-blue-600" />
              <span>Manufacturer / Company *</span>
            </label>
            <input
              type="text"
              required
              list="company-suggestions"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. Mindray, GE Healthcare, Philips"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none font-medium"
            />
            <datalist id="company-suggestions">
              {POPULAR_COMPANIES.map((comp) => (
                <option key={comp} value={comp} />
              ))}
            </datalist>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Model Number & Serial Number *
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                required
                value={modelNumber}
                onChange={(e) => setModelNumber(e.target.value)}
                placeholder="Model: SV-300"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono text-[11px] focus:bg-white outline-none"
              />
              <input
                type="text"
                required
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                placeholder="SN-12345"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono text-[11px] focus:bg-white outline-none"
              />
            </div>
          </div>
        </div>

        {/* Procurement Record: Date & Cost (Epo Vangunathu & Company) */}
        <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 space-y-2.5">
          <div className="text-[11px] font-bold text-blue-900 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            <span>Procurement & Purchase Metadata</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-600 font-medium mb-1">
                Purchase Date *
              </label>
              <input
                type="date"
                required
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-900 font-mono text-[11px] outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">
                Purchase Cost (INR) *
              </label>
              <input
                type="text"
                required
                value={purchaseCost}
                onChange={(e) => setPurchaseCost(e.target.value)}
                placeholder="e.g. ₹14,50,000"
                className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-900 font-mono text-[11px] outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">
                Warranty Expiry
              </label>
              <input
                type="text"
                value={warrantyExpiry}
                onChange={(e) => setWarrantyExpiry(e.target.value)}
                placeholder="e.g. 2029-06-30"
                className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-900 font-mono text-[11px] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-600 font-medium mb-1">
              Authorized Supplier / Distributor
            </label>
            <input
              type="text"
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              placeholder="e.g. Apex Biomedical Services India Pvt Ltd"
              className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-900 text-[11px] outline-none"
            />
          </div>
        </div>

        {/* Assigned Bed & Operational Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <BedDouble className="w-3.5 h-3.5 text-blue-600" />
              <span>Assigned Bed in {wards.find((w) => w.id === assignedWardId)?.name}</span>
            </label>
            <select
              value={assignedBedId}
              onChange={(e) => setAssignedBedId(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white outline-none font-mono font-medium"
            >
              <option value="BME-BENCH-1">BME-BENCH-1 (Biomedical Reserve)</option>
              {availableWardBeds.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.id} ({b.bedType} • Room {b.roomNumber})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-blue-600" />
              <span>Initial QA Status *</span>
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as DeviceWorkingStatus)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white outline-none"
            >
              <option value="WORKING_PROPERLY">Working Properly (Passed QA)</option>
              <option value="NEEDS_CALIBRATION">Needs Calibration</option>
              <option value="UNDER_MAINTENANCE">Under Maintenance</option>
              <option value="FAULT_DETECTED">Fault Detected</option>
            </select>
          </div>
        </div>

        {/* 4 Technical QA Checkboxes */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
          <div className="text-[11px] font-bold text-slate-700">Initial Bench QA Checks</div>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <label className="flex items-center gap-2 cursor-pointer p-1.5 bg-white rounded border border-slate-200">
              <input
                type="checkbox"
                checked={electricalSafetyPassed}
                onChange={(e) => setElectricalSafetyPassed(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-blue-600"
              />
              <Zap className="w-3.5 h-3.5 text-emerald-600" />
              <span>Electrical Ground Passed</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer p-1.5 bg-white rounded border border-slate-200">
              <input
                type="checkbox"
                checked={calibrationPassed}
                onChange={(e) => setCalibrationPassed(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-blue-600"
              />
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Calibration Certified</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer p-1.5 bg-white rounded border border-slate-200">
              <input
                type="checkbox"
                checked={alarmFunctional}
                onChange={(e) => setAlarmFunctional(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-blue-600"
              />
              <Bell className="w-3.5 h-3.5 text-blue-600" />
              <span>Alarms Functional</span>
            </label>

            <div className="flex items-center gap-2 p-1.5 bg-white rounded border border-slate-200">
              <BatteryCharging className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Battery:</span>
              <input
                type="number"
                min="0"
                max="100"
                value={batteryBackupPercent}
                onChange={(e) => setBatteryBackupPercent(Number(e.target.value))}
                className="w-14 p-0.5 border border-slate-200 rounded font-mono text-center outline-none"
              />
              <span>%</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block font-bold text-slate-700 mb-1">
            Biomedical Inspection Notes
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white outline-none resize-none"
          />
        </div>

        {/* Submit */}
        <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
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
            <span>Confirm & Register Device</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
