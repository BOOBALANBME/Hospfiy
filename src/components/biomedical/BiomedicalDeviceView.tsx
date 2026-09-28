import React, { useState, useMemo } from 'react';
import {
  Cpu,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  Search,
  Filter,
  ShieldCheck,
  Zap,
  Activity,
  BatteryCharging,
  Bell,
  RefreshCw,
  Building2,
  BedDouble,
  UserCheck,
  XCircle,
  FileText,
  AlertCircle,
  Play,
  RotateCcw,
  Calendar,
  Factory,
  Tag,
  LayoutGrid,
  Table as TableIcon,
  BadgeDollarSign,
  Check,
  Plus,
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { MedicalDevice, DeviceWorkingStatus } from '../../types/hospital';
import { AddDeviceModal } from './AddDeviceModal';

export const BiomedicalDeviceView: React.FC = () => {
  const {
    devices,
    verifyDeviceWorking,
    reportDeviceFault,
    wards,
    beds,
    currentUser,
    navigateToBed,
    setActiveTab,
  } = useHospital();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWard, setSelectedWard] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedCompany, setSelectedCompany] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [isAddDeviceModalOpen, setIsAddDeviceModalOpen] = useState<boolean>(false);

  // Diagnostic testing modal state
  const [testingDevice, setTestingDevice] = useState<MedicalDevice | null>(null);
  const [diagnosticStep, setDiagnosticStep] = useState<number>(0);
  const [isDiagnosticRunning, setIsDiagnosticRunning] = useState<boolean>(false);
  const [diagnosticResults, setDiagnosticResults] = useState<{
    electrical: boolean;
    calibration: boolean;
    alarms: boolean;
    battery: boolean;
  }>({
    electrical: true,
    calibration: true,
    alarms: true,
    battery: true,
  });

  // Fault reporting modal state
  const [faultDevice, setFaultDevice] = useState<MedicalDevice | null>(null);
  const [faultReason, setFaultReason] = useState('');
  const [putBedOnMaintenance, setPutBedOnMaintenance] = useState(true);

  // Success toast / action confirmation
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotificationMsg(msg);
    setTimeout(() => setNotificationMsg(null), 4000);
  };

  // Distinct manufacturer companies across all devices
  const companies = useMemo(() => {
    const set = new Set<string>();
    devices.forEach((d) => {
      if (d.company) set.add(d.company);
    });
    return Array.from(set).sort();
  }, [devices]);

  // Filtered devices
  const filteredDevices = useMemo(() => {
    return devices.filter((dev) => {
      // Search filter
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        dev.name.toLowerCase().includes(q) ||
        (dev.company && dev.company.toLowerCase().includes(q)) ||
        dev.modelNumber.toLowerCase().includes(q) ||
        dev.serialNumber.toLowerCase().includes(q) ||
        dev.assignedBedId.toLowerCase().includes(q) ||
        dev.assignedWardName.toLowerCase().includes(q) ||
        (dev.purchaseDate && dev.purchaseDate.includes(q)) ||
        (dev.supplier && dev.supplier.toLowerCase().includes(q));

      // Ward filter
      const matchWard = selectedWard === 'ALL' || dev.assignedWardId === selectedWard;

      // Category filter
      const matchCategory = selectedCategory === 'ALL' || dev.category === selectedCategory;

      // Status filter
      const matchStatus = selectedStatus === 'ALL' || dev.status === selectedStatus;

      // Company / Manufacturer filter
      const matchCompany = selectedCompany === 'ALL' || dev.company === selectedCompany;

      return matchSearch && matchWard && matchCategory && matchStatus && matchCompany;
    });
  }, [devices, searchQuery, selectedWard, selectedCategory, selectedStatus, selectedCompany]);

  // Statistics
  const totalCount = devices.length;
  const workingCount = devices.filter((d) => d.status === 'WORKING_PROPERLY').length;
  const calibrationCount = devices.filter((d) => d.status === 'NEEDS_CALIBRATION').length;
  const faultCount = devices.filter((d) => d.status === 'UNDER_MAINTENANCE' || d.status === 'FAULT_DETECTED').length;
  const complianceRate = totalCount > 0 ? Math.round((workingCount / totalCount) * 100) : 100;

  // Run real-time diagnostic simulation
  const startDiagnosticTest = (device: MedicalDevice) => {
    setTestingDevice(device);
    setDiagnosticStep(1);
    setIsDiagnosticRunning(true);
    setDiagnosticResults({
      electrical: true,
      calibration: true,
      alarms: true,
      battery: true,
    });

    // Step-by-step test progression
    setTimeout(() => {
      setDiagnosticStep(2);
      setTimeout(() => {
        setDiagnosticStep(3);
        setTimeout(() => {
          setDiagnosticStep(4);
          setTimeout(() => {
            setDiagnosticStep(5); // Complete
            setIsDiagnosticRunning(false);
          }, 600);
        }, 600);
      }, 600);
    }, 600);
  };

  const handleFinishDiagnosticPass = () => {
    if (!testingDevice) return;
    verifyDeviceWorking(
      testingDevice.id,
      currentUser.name,
      currentUser.badgeNumber,
      `Full 4-point biomedical diagnostic check completed. Electrical safety, telemetry, transducer calibration, and alarms 100% operational.`
    );
    showNotification(`Device ${testingDevice.name} verified and certified WORKING PROPERLY.`);
    setTestingDevice(null);
    setDiagnosticStep(0);
  };

  const handleQuickVerify = (device: MedicalDevice) => {
    verifyDeviceWorking(
      device.id,
      currentUser.name,
      currentUser.badgeNumber,
      `Routine working condition check: Device certified operational by ${currentUser.name} (${currentUser.badgeNumber}).`
    );
    showNotification(`Device ${device.name} verified WORKING PROPERLY.`);
  };

  const handleReportFaultSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!faultDevice || !faultReason.trim()) return;
    reportDeviceFault(faultDevice.id, faultReason.trim(), putBedOnMaintenance);
    showNotification(`Fault logged for ${faultDevice.name}. Bed ${faultDevice.assignedBedId} placed on biomedical hold.`);
    setFaultDevice(null);
    setFaultReason('');
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notificationMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{notificationMsg}</span>
        </div>
      )}

      {/* Top Banner: Fleet Overview & Procurement Record Management */}
      <div className="p-5 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl shadow-lg border border-blue-800/80">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-1 bg-cyan-400/20 text-cyan-300 font-bold text-xs rounded-md border border-cyan-400/40 uppercase tracking-wider flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5" />
                225 Active Medical Devices (15 per Department)
              </span>
              <span className="px-2.5 py-1 bg-emerald-400/20 text-emerald-300 font-bold text-xs rounded-md border border-emerald-400/40 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                Procurement & Warranty Verified
              </span>
              <span className="px-2 py-0.5 bg-blue-500/30 text-blue-200 text-[11px] rounded font-mono">
                Lead BME: Boobalan S (BME-2026)
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              Biomedical Engineering & Medical Device QA Console
            </h2>

            <p className="text-xs text-blue-100/90 max-w-3xl leading-relaxed">
              Complete equipment inventory across all 15 clinical departments (15 dedicated devices per department). Inspect device manufacturer details, procurement dates, warranty duration, safety calibrations, and bed assignments.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2 shrink-0">
            <button
              id="open-add-device-modal-btn"
              onClick={() => setIsAddDeviceModalOpen(true)}
              className="w-full sm:w-auto px-4 py-2.5 bg-blue-500 hover:bg-blue-400 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 border border-blue-300/30"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Medical Device</span>
            </button>
            <button
              onClick={() => {
                // Quick run verification on all needs calibration
                const needCal = devices.filter((d) => d.status === 'NEEDS_CALIBRATION');
                needCal.forEach((d) => verifyDeviceWorking(d.id, currentUser.name, currentUser.badgeNumber, 'Batch calibration check passed.'));
                showNotification(`Calibrated & verified ${needCal.length} pending devices.`);
              }}
              className="w-full sm:w-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 border border-emerald-400/30"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Verify All Operational</span>
            </button>
            <button
              onClick={() => setActiveTab('beds')}
              className="w-full sm:w-auto px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 border border-white/10"
            >
              <BedDouble className="w-4 h-4" />
              <span>View Clinical Beds</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
            <span>Total Tracked Devices</span>
            <Cpu className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">{totalCount}</div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <span>Across 15 Clinical Wards</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-emerald-700 text-xs font-semibold mb-1">
            <span>Working Properly (Pass)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 font-mono">{workingCount}</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">
            {complianceRate}% Operational Readiness
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-amber-700 text-xs font-semibold mb-1">
            <span>Calibration Due</span>
            <RefreshCw className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600 font-mono">{calibrationCount}</div>
          <div className="text-[11px] text-amber-600 mt-1">
            Routine Bench Check Needed
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-rose-700 text-xs font-semibold mb-1">
            <span>Fault / Maintenance</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-rose-600 font-mono">{faultCount}</div>
          <div className="text-[11px] text-rose-600 mt-1">
            Under BME Servicing
          </div>
        </div>
      </div>

      {/* 15 Departments Fleet Selector Bar (15 Devices per Department) */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-bold text-slate-800">
              Department Fleet Filter (15 Medical Devices per Department)
            </span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
            15 Hospital Departments • 225 Certified Devices
          </span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          <button
            onClick={() => setSelectedWard('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
              selectedWard === 'ALL'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <span>All Departments</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                selectedWard === 'ALL' ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {devices.length}
            </span>
          </button>

          {wards.map((ward) => {
            const deptDeviceCount = devices.filter((d) => d.assignedWardId === ward.id).length;
            const isSelected = selectedWard === ward.id;
            return (
              <button
                key={ward.id}
                onClick={() => setSelectedWard(ward.id)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : 'bg-slate-50 border border-slate-200/80 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>{ward.name}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                    isSelected ? 'bg-blue-700 text-white' : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {deptDeviceCount}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by device model, company/manufacturer, purchase date, bed ID, or serial number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none"
            />
          </div>

          {/* Quick Filter Selectors */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Ward Filter */}
            <select
              value={selectedWard}
              onChange={(e) => setSelectedWard(e.target.value)}
              className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 outline-none"
            >
              <option value="ALL">All Departments ({wards.length})</option>
              {wards.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} (15 devices)
                </option>
              ))}
            </select>

            {/* Manufacturer / Company Filter */}
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 outline-none"
            >
              <option value="ALL">All Manufacturers ({companies.length})</option>
              {companies.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 outline-none"
            >
              <option value="ALL">All Device Types</option>
              <option value="Ventilator">Ventilators</option>
              <option value="Patient Monitor">Patient Monitors</option>
              <option value="Infusion Pump">Infusion Pumps</option>
              <option value="Defibrillator">Defibrillators</option>
              <option value="Dialysis Machine">Dialysis Systems</option>
              <option value="Diagnostic & Imaging">Diagnostic & Imaging</option>
              <option value="Respiratory & Suction">Respiratory & Suction</option>
              <option value="Surgical Equipment">Surgical Units</option>
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 outline-none"
            >
              <option value="ALL">All Working Statuses</option>
              <option value="WORKING_PROPERLY">Working Properly (Pass)</option>
              <option value="NEEDS_CALIBRATION">Needs Calibration</option>
              <option value="UNDER_MAINTENANCE">Under Maintenance</option>
              <option value="FAULT_DETECTED">Fault Detected</option>
            </select>

            {/* View Mode Toggle: Grid vs Table */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 shrink-0">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-2 py-1 rounded text-xs flex items-center gap-1 transition-all ${
                  viewMode === 'grid'
                    ? 'bg-white text-blue-600 font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Cards Grid View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Cards</span>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-2 py-1 rounded text-xs flex items-center gap-1 transition-all ${
                  viewMode === 'table'
                    ? 'bg-white text-blue-600 font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Detailed Procurement Register Table"
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Table</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <div>
            Showing <strong className="text-slate-800">{filteredDevices.length}</strong> devices{' '}
            {selectedWard !== 'ALL' && `in ${wards.find((w) => w.id === selectedWard)?.name}`}
            {selectedCompany !== 'ALL' && ` • Manufactured by ${selectedCompany}`}
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              Verified Working
            </span>
            <span className="flex items-center gap-1 text-[11px] text-amber-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
              Calibration Due
            </span>
            <span className="flex items-center gap-1 text-[11px] text-rose-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
              Fault
            </span>
          </div>
        </div>
      </div>

      {/* VIEW MODE: TABLE REGISTER */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <tr>
                  <th className="p-3">Device & Model</th>
                  <th className="p-3">Company / Manufacturer</th>
                  <th className="p-3">Purchase Date & Cost</th>
                  <th className="p-3">Warranty & Supplier</th>
                  <th className="p-3">Department & Bed</th>
                  <th className="p-3">Safety & QA Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDevices.map((device) => {
                  const isWorking = device.status === 'WORKING_PROPERLY';
                  const isCalib = device.status === 'NEEDS_CALIBRATION';
                  const isFault = device.status === 'FAULT_DETECTED' || device.status === 'UNDER_MAINTENANCE';

                  return (
                    <tr key={device.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3">
                        <div className="font-bold text-slate-900">{device.name}</div>
                        <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                          <span className="px-1.5 py-0.2 bg-blue-50 text-blue-700 rounded font-semibold text-[10px]">
                            {device.modelNumber}
                          </span>
                          <span>SN: {device.serialNumber}</span>
                        </div>
                      </td>

                      <td className="p-3">
                        <div className="font-bold text-slate-800 flex items-center gap-1.5">
                          <Factory className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span>{device.company || 'Certified OEM'}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {device.category}
                        </div>
                      </td>

                      <td className="p-3">
                        <div className="flex items-center gap-1 text-slate-700 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{device.purchaseDate || '2023-01-15'}</span>
                        </div>
                        {device.purchaseCost && (
                          <div className="text-[11px] font-mono font-bold text-emerald-700 mt-0.5">
                            {device.purchaseCost}
                          </div>
                        )}
                      </td>

                      <td className="p-3">
                        <div className="flex items-center gap-1 text-slate-700">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Exp: {device.warrantyExpiry || 'Active'}</span>
                        </div>
                        {device.supplier && (
                          <div className="text-[10px] text-slate-400 truncate max-w-[150px] mt-0.5">
                            {device.supplier}
                          </div>
                        )}
                      </td>

                      <td className="p-3">
                        <div className="font-medium text-slate-800 truncate max-w-[150px]">
                          {device.assignedWardName}
                        </div>
                        <button
                          onClick={() => {
                            if (device.assignedBedId && device.assignedBedId !== 'BME-BENCH-1') {
                              navigateToBed(device.assignedBedId);
                            }
                          }}
                          className="font-mono text-[11px] text-blue-600 hover:underline flex items-center gap-1 mt-0.5"
                        >
                          <BedDouble className="w-3 h-3" />
                          <span>{device.assignedBedId}</span>
                        </button>
                      </td>

                      <td className="p-3">
                        {isWorking && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-md border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Pass
                          </span>
                        )}
                        {isCalib && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-800 text-[11px] font-bold rounded-md border border-amber-200">
                            <RefreshCw className="w-3 h-3 text-amber-600" />
                            Calib Due
                          </span>
                        )}
                        {isFault && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-100 text-rose-800 text-[11px] font-bold rounded-md border border-rose-200">
                            <AlertTriangle className="w-3 h-3 text-rose-600" />
                            Fault
                          </span>
                        )}
                        <div className="text-[10px] text-slate-400 mt-1">
                          Bat: {device.batteryBackupPercent}%
                        </div>
                      </td>

                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => startDiagnosticTest(device)}
                            className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors"
                            title="Run Diagnostic"
                          >
                            <Play className="w-3.5 h-3.5" />
                          </button>
                          {!isWorking ? (
                            <button
                              onClick={() => handleQuickVerify(device)}
                              className="px-2 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold rounded-lg text-[10px] border border-emerald-300 transition-colors"
                              title="Pass Verification"
                            >
                              Pass
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setFaultDevice(device);
                                setFaultReason('');
                              }}
                              className="p-1.5 bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-700 rounded-lg transition-colors"
                              title="Report Fault"
                            >
                              <AlertTriangle className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* VIEW MODE: CARDS GRID */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDevices.map((device) => {
            const isWorking = device.status === 'WORKING_PROPERLY';
            const isCalib = device.status === 'NEEDS_CALIBRATION';
            const isFault = device.status === 'FAULT_DETECTED' || device.status === 'UNDER_MAINTENANCE';

            return (
              <div
                key={device.id}
                className={`p-4 rounded-xl border transition-all hover:shadow-md bg-white flex flex-col justify-between ${
                  isWorking
                    ? 'border-slate-200'
                    : isCalib
                    ? 'border-amber-300 ring-1 ring-amber-100 bg-amber-50/20'
                    : 'border-rose-300 ring-1 ring-rose-100 bg-rose-50/20'
                }`}
              >
                <div className="space-y-3">
                  {/* Header: Name, Model, Category, Working Status */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold rounded uppercase">
                          {device.category}
                        </span>
                        <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-mono rounded font-semibold">
                          {device.modelNumber}
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm mt-1 leading-snug">
                        {device.name}
                      </h3>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        SN: {device.serialNumber}
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div>
                      {isWorking && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-lg border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Working Properly
                        </span>
                      )}
                      {isCalib && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 text-amber-800 text-[11px] font-bold rounded-lg border border-amber-200">
                          <RefreshCw className="w-3.5 h-3.5 text-amber-600" />
                          Needs Calibration
                        </span>
                      )}
                      {isFault && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-100 text-rose-800 text-[11px] font-bold rounded-lg border border-rose-200">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                          Fault Detected
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Company / Manufacturer & Purchase Details */}
                  <div className="p-2.5 bg-blue-50/40 rounded-lg border border-blue-100 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold text-slate-800">
                        <Factory className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>{device.company || 'Certified MedTech OEM'}</span>
                      </div>
                      {device.purchaseCost && (
                        <span className="font-mono font-bold text-slate-700 bg-white px-1.5 py-0.5 rounded border border-slate-200 text-[10px]">
                          {device.purchaseCost}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 text-[11px] text-slate-600 pt-1 border-t border-blue-100/60">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="text-slate-500">Purchased:</span>
                        <strong className="text-slate-800 font-mono">
                          {device.purchaseDate || '2023-01-15'}
                        </strong>
                      </div>
                      <div className="flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span className="text-slate-500">Warranty:</span>
                        <strong className="text-slate-800 font-mono">
                          {device.warrantyExpiry || 'Active'}
                        </strong>
                      </div>
                    </div>
                    {device.supplier && (
                      <div className="text-[10px] text-slate-500 flex items-center gap-1 pt-0.5">
                        <Tag className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">Supplier: {device.supplier}</span>
                      </div>
                    )}
                  </div>

                  {/* Assigned Location: Ward & Bed */}
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate max-w-[170px]" title={device.assignedWardName}>
                        {device.assignedWardName}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        if (device.assignedBedId && device.assignedBedId !== 'BME-BENCH-1') {
                          navigateToBed(device.assignedBedId);
                        }
                      }}
                      className="font-mono font-bold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 shrink-0"
                    >
                      <BedDouble className="w-3.5 h-3.5" />
                      <span>{device.assignedBedId}</span>
                    </button>
                  </div>

                  {/* 4 Technical QA Indicators */}
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="flex items-center gap-1.5 p-1.5 bg-slate-50 rounded border border-slate-100">
                      <Zap
                        className={`w-3.5 h-3.5 ${
                          device.electricalSafetyPassed ? 'text-emerald-500' : 'text-rose-500'
                        }`}
                      />
                      <span className="text-slate-600">Electrical Ground:</span>
                      <strong
                        className={
                          device.electricalSafetyPassed ? 'text-emerald-700' : 'text-rose-700'
                        }
                      >
                        {device.electricalSafetyPassed ? 'Passed' : 'Fail'}
                      </strong>
                    </div>

                    <div className="flex items-center gap-1.5 p-1.5 bg-slate-50 rounded border border-slate-100">
                      <Activity
                        className={`w-3.5 h-3.5 ${
                          device.calibrationPassed ? 'text-emerald-500' : 'text-amber-500'
                        }`}
                      />
                      <span className="text-slate-600">Calibration:</span>
                      <strong
                        className={device.calibrationPassed ? 'text-emerald-700' : 'text-amber-700'}
                      >
                        {device.calibrationPassed ? 'Certified' : 'Due'}
                      </strong>
                    </div>

                    <div className="flex items-center gap-1.5 p-1.5 bg-slate-50 rounded border border-slate-100">
                      <Bell
                        className={`w-3.5 h-3.5 ${
                          device.alarmFunctional ? 'text-emerald-500' : 'text-rose-500'
                        }`}
                      />
                      <span className="text-slate-600">Alarms:</span>
                      <strong
                        className={device.alarmFunctional ? 'text-emerald-700' : 'text-rose-700'}
                      >
                        {device.alarmFunctional ? 'Tested OK' : 'Fault'}
                      </strong>
                    </div>

                    <div className="flex items-center gap-1.5 p-1.5 bg-slate-50 rounded border border-slate-100">
                      <BatteryCharging className="w-3.5 h-3.5 text-blue-500" />
                      <span className="text-slate-600">Battery:</span>
                      <strong className="text-slate-800 font-mono">
                        {device.batteryBackupPercent}%
                      </strong>
                    </div>
                  </div>

                  {/* Notes & Last Inspection */}
                  {device.notes && (
                    <p className="text-[11px] text-slate-600 bg-slate-50/80 p-2 rounded border border-slate-100 italic">
                      "{device.notes}"
                    </p>
                  )}

                  <div className="text-[10px] text-slate-400 pt-1 flex items-center justify-between border-t border-slate-100">
                    <span>
                      Last Checked:{' '}
                      <strong className="text-slate-600 font-medium">
                        {device.lastCheckedDate}
                      </strong>
                    </span>
                    <span className="font-mono text-slate-500">
                      By: {device.lastCheckedBy} ({device.lastCheckedBadge})
                    </span>
                  </div>
                </div>

                {/* Actions: "Check Device Working Condition" & "Report Fault" */}
                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center gap-2">
                  <button
                    onClick={() => startDiagnosticTest(device)}
                    className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5"
                    title="Run real-time diagnostic test"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Run Diagnostic Check</span>
                  </button>

                  {!isWorking ? (
                    <button
                      onClick={() => handleQuickVerify(device)}
                      className="py-2 px-3 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg text-xs font-bold transition-all border border-emerald-300"
                      title="Mark device working properly"
                    >
                      Pass
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setFaultDevice(device);
                        setFaultReason('');
                      }}
                      className="py-2 px-2.5 bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-700 rounded-lg text-xs font-semibold transition-all border border-slate-200 hover:border-rose-300"
                      title="Report device problem or defect"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {filteredDevices.length === 0 && (
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200 text-slate-500 space-y-2">
          <Wrench className="w-10 h-10 mx-auto text-slate-300" />
          <h4 className="font-bold text-slate-800 text-sm">No Medical Devices Found</h4>
          <p className="text-xs">Adjust your search query or department filters to see devices.</p>
        </div>
      )}

      {/* DIAGNOSTIC CHECK MODAL */}
      {testingDevice && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <Cpu className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">
                    Biomedical Device Working Condition Check
                  </h3>
                  <p className="text-[11px] text-slate-300">
                    {testingDevice.name} • {testingDevice.assignedBedId}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setTestingDevice(null)}
                className="text-slate-400 hover:text-white text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Diagnostic Steps & Verification Body */}
            <div className="p-5 space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-center justify-between">
                <div>
                  <div className="font-bold">Medical Device Quality Assurance Protocol</div>
                  <div className="text-[11px] text-blue-700">
                    Testing technician: <strong>{currentUser.name}</strong> ({currentUser.badgeNumber})
                  </div>
                </div>
                <span className="font-mono text-xs bg-white px-2 py-0.5 rounded border border-blue-200 text-blue-800 font-bold">
                  BME STD-2026
                </span>
              </div>

              {/* Progress Steps */}
              <div className="space-y-2.5">
                {/* Step 1: Electrical Grounding */}
                <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 text-xs">
                  <div className="flex items-center gap-2.5">
                    <Zap className="w-4 h-4 text-amber-500" />
                    <div>
                      <div className="font-bold text-slate-800">
                        1. Electrical Ground & Leakage Current Test
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Earth impedance &lt; 0.2 Ω • Chassis leakage &lt; 100 µA
                      </div>
                    </div>
                  </div>
                  <div>
                    {diagnosticStep >= 2 ? (
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> PASS
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] rounded animate-pulse">
                        Testing...
                      </span>
                    )}
                  </div>
                </div>

                {/* Step 2: Sensor & Calibration */}
                <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 text-xs">
                  <div className="flex items-center gap-2.5">
                    <Activity className="w-4 h-4 text-blue-500" />
                    <div>
                      <div className="font-bold text-slate-800">
                        2. Transducer & Sensor Calibration Accuracy
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Signal response, zero-offset, and multi-channel telemetry
                      </div>
                    </div>
                  </div>
                  <div>
                    {diagnosticStep >= 3 ? (
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> PASS
                      </span>
                    ) : diagnosticStep === 2 ? (
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 font-bold text-[10px] rounded animate-pulse">
                        Verifying...
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400">Pending</span>
                    )}
                  </div>
                </div>

                {/* Step 3: Emergency Audible & Visual Alarm */}
                <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 text-xs">
                  <div className="flex items-center gap-2.5">
                    <Bell className="w-4 h-4 text-rose-500" />
                    <div>
                      <div className="font-bold text-slate-800">
                        3. Emergency Audio-Visual Alarm Verification
                      </div>
                      <div className="text-[11px] text-slate-500">
                        High/medium priority pitch and LED flashing annunciator
                      </div>
                    </div>
                  </div>
                  <div>
                    {diagnosticStep >= 4 ? (
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> PASS
                      </span>
                    ) : diagnosticStep === 3 ? (
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 font-bold text-[10px] rounded animate-pulse">
                        Chime Check...
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400">Pending</span>
                    )}
                  </div>
                </div>

                {/* Step 4: Battery & Power Fallback */}
                <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 text-xs">
                  <div className="flex items-center gap-2.5">
                    <BatteryCharging className="w-4 h-4 text-emerald-500" />
                    <div>
                      <div className="font-bold text-slate-800">
                        4. Battery Backup & UPS Redundancy Test
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Automatic switchover on AC power loss &gt; 4 hours
                      </div>
                    </div>
                  </div>
                  <div>
                    {diagnosticStep >= 5 ? (
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> PASS (98%)
                      </span>
                    ) : diagnosticStep === 4 ? (
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 font-bold text-[10px] rounded animate-pulse">
                        Discharging...
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400">Pending</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Completion Banner */}
              {diagnosticStep >= 5 && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-3 animate-in fade-in">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                  <div>
                    <strong className="block font-bold">
                      All Diagnostic Tests Passed!
                    </strong>
                    <span>
                      Device is 100% operational, calibrated, and certified safe for clinical bedside use.
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                onClick={() => setTestingDevice(null)}
                className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold"
              >
                Close
              </button>
              {diagnosticStep >= 5 ? (
                <button
                  onClick={handleFinishDiagnosticPass}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Certify Working Properly</span>
                </button>
              ) : (
                <button
                  disabled
                  className="px-4 py-2 bg-slate-300 text-slate-500 rounded-xl text-xs font-semibold cursor-not-allowed flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Diagnosing...</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* FAULT REPORTING MODAL */}
      {faultDevice && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleReportFaultSubmit}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200"
          >
            <div className="p-4 bg-rose-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-300" />
                <h3 className="font-bold text-sm">Report Device Malfunction / Fault</h3>
              </div>
              <button
                type="button"
                onClick={() => setFaultDevice(null)}
                className="text-rose-200 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900">
                Flagging fault on <strong>{faultDevice.name}</strong> (Assigned to bed{' '}
                <strong>{faultDevice.assignedBedId}</strong> in {faultDevice.assignedWardName}).
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Describe Problem / Fault:
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g., Sensor drift exceeding ±5%, intermittent power cord disconnect, low battery alarm trigger..."
                  value={faultReason}
                  onChange={(e) => setFaultReason(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-rose-200 outline-none"
                />
              </div>

              <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <input
                  type="checkbox"
                  id="put-bed-maint"
                  checked={putBedOnMaintenance}
                  onChange={(e) => setPutBedOnMaintenance(e.target.checked)}
                  className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4"
                />
                <label htmlFor="put-bed-maint" className="text-xs text-slate-700">
                  Put Bed <strong>{faultDevice.assignedBedId}</strong> under{' '}
                  <span className="text-rose-600 font-bold">MAINTENANCE</span> status until device is certified working.
                </label>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setFaultDevice(null)}
                className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Submit Fault & Flag Bed</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add New Medical Device Modal */}
      <AddDeviceModal
        isOpen={isAddDeviceModalOpen}
        onClose={() => setIsAddDeviceModalOpen(false)}
        defaultWardId={selectedWard !== 'ALL' ? selectedWard : undefined}
      />
    </div>
  );
};
