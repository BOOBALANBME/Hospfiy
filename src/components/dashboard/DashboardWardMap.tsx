import React, { useState, useMemo } from 'react';
import {
  Building,
  BedDouble,
  UserPlus,
  Users,
  Activity,
  HeartPulse,
  Brain,
  Bone,
  Baby,
  Scissors,
  Shield,
  Droplet,
  Wind,
  Apple,
  Eye,
  Accessibility,
  Flame,
  Stethoscope,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Search,
  Filter,
  RefreshCw,
  ChevronRight,
  Phone,
  UserCheck,
  Wrench,
  Sparkles,
  ArrowRight,
  Cpu,
  Plus,
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { Bed, BedStatus, Ward } from '../../types/hospital';
import { StatusBadge } from '../common/Badge';
import { DEPARTMENTS_METADATA } from '../../data/departmentsData';
import { AddBedModal } from '../beds/AddBedModal';
import { AddDeviceModal } from '../biomedical/AddDeviceModal';

interface DashboardWardMapProps {
  onOpenRegisterModal: () => void;
  onOpenAdmissionModal: (patientId?: string, bedId?: string, wardId?: string) => void;
}

export const DashboardWardMap: React.FC<DashboardWardMapProps> = ({
  onOpenRegisterModal,
  onOpenAdmissionModal,
}) => {
  const {
    wards,
    beds,
    devices,
    updateBedStatus,
    navigateToPatient,
    navigateToBed,
    canUserPerform,
    currentUser,
    setActiveTab,
  } = useHospital();

  // Active selected department id. If null, displays the 15-department grid overview.
  const [selectedWardId, setSelectedWardId] = useState<string | null>('WARD-ICU');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [departmentCategory, setDepartmentCategory] = useState<string>('ALL');
  const [isAddBedOpen, setIsAddBedOpen] = useState<boolean>(false);
  const [isAddDeviceOpen, setIsAddDeviceOpen] = useState<boolean>(false);

  // Map icons helper
  const getDepartmentIcon = (wardId: string) => {
    switch (wardId) {
      case 'WARD-ICU':
        return <Activity className="w-5 h-5 text-rose-600" />;
      case 'WARD-EMERGENCY':
        return <Flame className="w-5 h-5 text-red-600" />;
      case 'WARD-CARDIO':
        return <HeartPulse className="w-5 h-5 text-pink-600" />;
      case 'WARD-NEURO':
        return <Brain className="w-5 h-5 text-indigo-600" />;
      case 'WARD-ORTHO':
        return <Bone className="w-5 h-5 text-amber-600" />;
      case 'WARD-PED':
        return <Baby className="w-5 h-5 text-sky-600" />;
      case 'WARD-MAT':
        return <HeartPulse className="w-5 h-5 text-fuchsia-600" />;
      case 'WARD-SUR':
        return <Scissors className="w-5 h-5 text-blue-600" />;
      case 'WARD-GEN-A':
        return <Stethoscope className="w-5 h-5 text-emerald-600" />;
      case 'WARD-ONCO':
        return <Shield className="w-5 h-5 text-violet-600" />;
      case 'WARD-NEPHRO':
        return <Droplet className="w-5 h-5 text-teal-600" />;
      case 'WARD-PULMO':
        return <Wind className="w-5 h-5 text-cyan-600" />;
      case 'WARD-GASTRO':
        return <Apple className="w-5 h-5 text-orange-600" />;
      case 'WARD-ENT-EYE':
        return <Eye className="w-5 h-5 text-lime-600" />;
      case 'WARD-REHAB':
        return <Accessibility className="w-5 h-5 text-slate-600" />;
      default:
        return <Building className="w-5 h-5 text-blue-600" />;
    }
  };

  // Active ward object
  const activeWard = useMemo(() => {
    if (!selectedWardId) return null;
    return wards.find((w) => w.id === selectedWardId) || wards[0];
  }, [selectedWardId, wards]);

  // Beds in current selected ward
  const activeWardBeds = useMemo(() => {
    if (!selectedWardId) return [];
    return beds.filter((b) => b.wardId === selectedWardId);
  }, [selectedWardId, beds]);

  // Filtered beds inside active ward
  const filteredActiveWardBeds = useMemo(() => {
    return activeWardBeds.filter((bed) => {
      if (statusFilter !== 'ALL' && bed.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchId = bed.id.toLowerCase().includes(q);
        const matchRoom = bed.roomNumber.toLowerCase().includes(q);
        const matchPatient = bed.currentPatientName?.toLowerCase().includes(q);
        const matchNotes = bed.notes?.toLowerCase().includes(q);
        if (!matchId && !matchRoom && !matchPatient && !matchNotes) return false;
      }
      return true;
    });
  }, [activeWardBeds, statusFilter, searchQuery]);

  // Department counts & statistics map
  const departmentStats = useMemo(() => {
    return wards.map((ward) => {
      const wardBeds = beds.filter((b) => b.wardId === ward.id);
      const total = wardBeds.length;
      const occupied = wardBeds.filter((b) => b.status === 'OCCUPIED').length;
      const available = wardBeds.filter((b) => b.status === 'AVAILABLE').length;
      const cleaning = wardBeds.filter((b) => b.status === 'CLEANING').length;
      const maintenance = wardBeds.filter((b) => b.status === 'MAINTENANCE').length;
      const reserved = wardBeds.filter((b) => b.status === 'RESERVED').length;
      const occupancyRate = total > 0 ? Math.round((occupied / total) * 100) : 0;
      const meta = DEPARTMENTS_METADATA[ward.id];

      return {
        ...ward,
        total,
        occupied,
        available,
        cleaning,
        maintenance,
        reserved,
        occupancyRate,
        meta,
      };
    });
  }, [wards, beds]);

  // Filter departments for the overview grid
  const filteredDepartments = useMemo(() => {
    return departmentStats.filter((dept) => {
      if (departmentCategory === 'CRITICAL' && !['WARD-ICU', 'WARD-EMERGENCY', 'WARD-CARDIO'].includes(dept.id)) {
        return false;
      }
      if (departmentCategory === 'SURGICAL' && !['WARD-SUR', 'WARD-ORTHO', 'WARD-ENT-EYE', 'WARD-MAT'].includes(dept.id)) {
        return false;
      }
      if (departmentCategory === 'MEDICAL' && !['WARD-GEN-A', 'WARD-PULMO', 'WARD-NEPHRO', 'WARD-GASTRO', 'WARD-ONCO'].includes(dept.id)) {
        return false;
      }
      if (departmentCategory === 'SPECIALIZED' && !['WARD-PED', 'WARD-NEURO', 'WARD-REHAB'].includes(dept.id)) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = dept.name.toLowerCase().includes(q);
        const matchFloor = dept.floor.toLowerCase().includes(q);
        const matchBuilding = dept.building.toLowerCase().includes(q);
        const matchNurse = dept.headNurse?.toLowerCase().includes(q);
        if (!matchName && !matchFloor && !matchBuilding && !matchNurse) return false;
      }
      return true;
    });
  }, [departmentStats, departmentCategory, searchQuery]);

  // Active ward stats
  const activeWardStat = useMemo(() => {
    if (!activeWard) return null;
    return departmentStats.find((d) => d.id === activeWard.id);
  }, [activeWard, departmentStats]);

  // Quick action: mark cleaning bed as available
  const handleMarkBedReady = (bedId: string) => {
    updateBedStatus(bedId, 'AVAILABLE', 'Terminal sanitation complete. Verified ready by nursing supervisor.');
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden" id="dashboard-ward-map-container">
      {/* Top Header & Context Actions */}
      <div className="p-5 border-b border-slate-200 bg-slate-50/70">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
                15 Clinical Departments
              </span>
              <span className="text-xs text-slate-500 font-medium">
                250 Beds Total (15–20 Beds per Department)
              </span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mt-1 flex items-center gap-2">
              <Building className="w-5 h-5 text-blue-600" />
              Live Department & Ward Floor Map
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Select any department to step inside and view room layouts, individual bed occupancy, clinical telemetries, and rapid admissions.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              id="ward-map-new-patient-btn"
              onClick={onOpenRegisterModal}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Register New Patient</span>
            </button>

            {selectedWardId && (
              <button
                id="ward-map-admit-to-ward-btn"
                onClick={() => onOpenAdmissionModal(undefined, undefined, selectedWardId)}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm transition-all cursor-pointer"
              >
                <BedDouble className="w-4 h-4" />
                <span>+ Admit to Ward</span>
              </button>
            )}

            {selectedWardId && (
              <button
                id="ward-map-add-bed-btn"
                onClick={() => setIsAddBedOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Bed</span>
              </button>
            )}

            {selectedWardId && (
              <button
                id="ward-map-add-device-btn"
                onClick={() => setIsAddDeviceOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-cyan-700 text-white hover:bg-cyan-600 shadow-sm transition-all cursor-pointer"
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>+ Add Device</span>
              </button>
            )}

            {selectedWardId ? (
              <button
                onClick={() => setSelectedWardId(null)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
              >
                <span>View All 15 Departments</span>
              </button>
            ) : null}
          </div>
        </div>

        {/* 15 Departments Interactive Selector Bar */}
        <div className="mt-4 pt-4 border-t border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Select Department to Enter Bed Map:
            </span>
            <span className="text-xs text-slate-500 font-mono">
              {wards.length} Departments Configured
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
            <button
              onClick={() => setSelectedWardId(null)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer border ${
                selectedWardId === null
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              Overview (All 15)
            </button>

            {/* Dedicated Biomedical Engineering & Device QA Button */}
            <button
              onClick={() => setActiveTab('biomedical')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer bg-gradient-to-r from-blue-900 to-slate-900 text-cyan-300 border border-cyan-500/40 hover:border-cyan-400 shadow-xs"
              title="Biomedical Department: No Patients Admitted • Only Device Testing & Calibration"
            >
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>Biomedical QA (Device Testing)</span>
              <span className="px-1.5 py-0.2 rounded-md text-[10px] font-mono bg-cyan-400/20 text-cyan-200 font-bold">
                {devices.length} Devices
              </span>
            </button>

            {departmentStats.map((dept) => {
              const isSelected = selectedWardId === dept.id;
              const hasAlert = dept.occupancyRate >= 85;

              return (
                <button
                  key={dept.id}
                  id={`ward-tab-${dept.id}`}
                  onClick={() => {
                    setSelectedWardId(dept.id);
                    setStatusFilter('ALL');
                  }}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                >
                  <span className="shrink-0">{getDepartmentIcon(dept.id)}</span>
                  <span className="truncate max-w-[130px]">{dept.name}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono font-bold ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : hasAlert
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {dept.available}/{dept.total} Avail
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main View Area: Either Inside a Specific Department OR All 15 Departments Overview */}
      {selectedWardId && activeWard && activeWardStat ? (
        /* INSIDE THE SELECTED DEPARTMENT - BED FLOOR MAP */
        <div className="p-5 space-y-5">
          {/* Active Department Header Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-2xl p-5 text-white shadow-md">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="p-3 bg-white/10 rounded-xl backdrop-blur-xs border border-white/15 shrink-0">
                  {getDepartmentIcon(activeWard.id)}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                      {activeWard.building} • {activeWard.floor}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-white/10 text-white/90">
                      {activeWard.type}
                    </span>
                    <span className="text-xs text-slate-300 font-mono">
                      Head Nurse: {activeWard.headNurse} ({activeWard.contactExtension})
                    </span>
                  </div>
                  <h4 className="text-2xl font-bold tracking-tight mt-1 text-white">
                    {activeWard.name}
                  </h4>
                  <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                    {DEPARTMENTS_METADATA[activeWard.id]?.description ||
                      'Specialized inpatient clinical unit with 24/7 dedicated nursing staff and telemetry monitoring.'}
                  </p>
                </div>
              </div>

              {/* Department Statistics Box */}
              <div className="flex items-center gap-3 shrink-0 bg-white/10 p-3.5 rounded-xl border border-white/15">
                <div className="text-center px-2">
                  <div className="text-xl font-bold font-mono text-emerald-400">
                    {activeWardStat.available}
                  </div>
                  <div className="text-[10px] text-slate-300 uppercase tracking-wider font-semibold">
                    Available
                  </div>
                </div>
                <div className="w-px h-8 bg-white/20" />
                <div className="text-center px-2">
                  <div className="text-xl font-bold font-mono text-rose-400">
                    {activeWardStat.occupied}
                  </div>
                  <div className="text-[10px] text-slate-300 uppercase tracking-wider font-semibold">
                    Occupied
                  </div>
                </div>
                <div className="w-px h-8 bg-white/20" />
                <div className="text-center px-2">
                  <div className="text-xl font-bold font-mono text-cyan-300">
                    {activeWardStat.cleaning}
                  </div>
                  <div className="text-[10px] text-slate-300 uppercase tracking-wider font-semibold">
                    Cleaning
                  </div>
                </div>
                <div className="w-px h-8 bg-white/20" />
                <div className="text-center px-2">
                  <div className="text-xl font-bold font-mono text-amber-300">
                    {activeWardStat.maintenance}
                  </div>
                  <div className="text-[10px] text-slate-300 uppercase tracking-wider font-semibold">
                    Maint
                  </div>
                </div>
                <div className="w-px h-8 bg-white/20" />
                <div className="text-center px-2">
                  <div className="text-xl font-bold font-mono text-white">
                    {activeWardStat.total}
                  </div>
                  <div className="text-[10px] text-slate-300 uppercase tracking-wider font-semibold">
                    Total Beds
                  </div>
                </div>
              </div>
            </div>

            {/* Department Clinical Specialties Tags */}
            {DEPARTMENTS_METADATA[activeWard.id]?.specialties && (
              <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] text-slate-400 font-semibold mr-1">
                  Clinical Capabilities:
                </span>
                {DEPARTMENTS_METADATA[activeWard.id].specialties.map((spec, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded text-[10px] font-medium bg-white/10 text-slate-200 border border-white/10"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Filters & Search Within Department */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
            {/* Status Filter Chips */}
            <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === 'ALL'
                    ? 'bg-slate-900 text-white'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                All Beds ({activeWardStat.total})
              </button>
              <button
                onClick={() => setStatusFilter('AVAILABLE')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === 'AVAILABLE'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50'
                }`}
              >
                Available ({activeWardStat.available})
              </button>
              <button
                onClick={() => setStatusFilter('OCCUPIED')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === 'OCCUPIED'
                    ? 'bg-rose-600 text-white'
                    : 'bg-white text-rose-700 border border-rose-200 hover:bg-rose-50'
                }`}
              >
                Occupied ({activeWardStat.occupied})
              </button>
              <button
                onClick={() => setStatusFilter('CLEANING')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === 'CLEANING'
                    ? 'bg-cyan-600 text-white'
                    : 'bg-white text-cyan-700 border border-cyan-200 hover:bg-cyan-50'
                }`}
              >
                Cleaning ({activeWardStat.cleaning})
              </button>
              <button
                onClick={() => setStatusFilter('MAINTENANCE')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === 'MAINTENANCE'
                    ? 'bg-amber-600 text-white'
                    : 'bg-white text-amber-700 border border-amber-200 hover:bg-amber-50'
                }`}
              >
                Maintenance ({activeWardStat.maintenance})
              </button>
            </div>

            {/* Search Box */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search bed, room, patient..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-blue-500"
              />
            </div>
          </div>

          {/* Bed Cards Grid: All 15 to 20 beds of this department */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredActiveWardBeds.map((bed) => {
              const isOccupied = bed.status === 'OCCUPIED';
              const isAvailable = bed.status === 'AVAILABLE';
              const isCleaning = bed.status === 'CLEANING';
              const isMaintenance = bed.status === 'MAINTENANCE';
              const isReserved = bed.status === 'RESERVED';

              return (
                <div
                  key={bed.id}
                  id={`ward-bed-card-${bed.id}`}
                  className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                    isOccupied
                      ? 'bg-rose-50/40 border-rose-200 hover:border-rose-400 hover:shadow-xs'
                      : isAvailable
                      ? 'bg-emerald-50/40 border-emerald-200 hover:border-emerald-400 hover:shadow-xs'
                      : isCleaning
                      ? 'bg-cyan-50/40 border-cyan-200 hover:border-cyan-400'
                      : isMaintenance
                      ? 'bg-amber-50/40 border-amber-200 hover:border-amber-400'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div>
                    {/* Card Top: Bed ID & Status */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-base font-bold text-slate-900">
                          {bed.id}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-white text-slate-700 border border-slate-200 font-mono">
                          {bed.bedType}
                        </span>
                      </div>
                      <StatusBadge status={bed.status} size="sm" />
                    </div>

                    {/* Room and Location */}
                    <div className="text-xs text-slate-600 mb-2 flex items-center justify-between">
                      <span className="font-semibold text-slate-800">{bed.roomNumber}</span>
                      <span className="text-[11px] text-slate-400 font-mono">{activeWard.floor}</span>
                    </div>

                    {/* Middle Section: Occupant or Availability Status */}
                    {isOccupied && bed.currentPatientName ? (
                      <div className="p-2.5 bg-white rounded-lg border border-rose-200/80 mb-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700">
                            Current Inpatient
                          </span>
                          {bed.currentAdmissionId && (
                            <span className="text-[10px] font-mono text-slate-500">
                              {bed.currentAdmissionId}
                            </span>
                          )}
                        </div>
                        <div className="text-sm font-bold text-slate-900 mt-0.5">
                          {bed.currentPatientName}
                        </div>
                        {bed.currentPatientId && (
                          <button
                            onClick={() => navigateToPatient(bed.currentPatientId!)}
                            className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 hover:underline mt-0.5 inline-flex items-center gap-1"
                          >
                            <span>MRN: {bed.currentPatientId}</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ) : isAvailable ? (
                      <div className="p-2.5 bg-white rounded-lg border border-emerald-200/80 mb-2">
                        <div className="flex items-center gap-1.5 text-emerald-700 text-xs font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Sanitized & Ready</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                          {bed.notes || 'Bed ready for immediate clinical assignment.'}
                        </p>
                      </div>
                    ) : isCleaning ? (
                      <div className="p-2.5 bg-white rounded-lg border border-cyan-200/80 mb-2">
                        <div className="flex items-center gap-1.5 text-cyan-700 text-xs font-bold">
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Sanitization in Progress</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Terminal UV-C sterilization queue.
                        </p>
                      </div>
                    ) : isMaintenance ? (
                      <div className="p-2.5 bg-white rounded-lg border border-amber-200/80 mb-2">
                        <div className="flex items-center gap-1.5 text-amber-700 text-xs font-bold">
                          <Wrench className="w-3.5 h-3.5" />
                          <span>Biomedical Service</span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-0.5">
                          Assigned: Boobalan S (BME-2026)
                        </p>
                      </div>
                    ) : (
                      <div className="p-2.5 bg-white rounded-lg border border-slate-200 mb-2 text-xs text-slate-500">
                        {bed.notes || 'Reserved for pending inbound intake.'}
                      </div>
                    )}

                    {/* Assigned Equipment tags */}
                    {bed.equipmentAssigned && bed.equipmentAssigned.length > 0 && (
                      <div className="mt-1 space-y-1">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Telemetry & Devices:
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {bed.equipmentAssigned.map((eq, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] font-medium bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-600 truncate max-w-full"
                            >
                              {eq}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Bottom: Direct Action Buttons */}
                  <div className="mt-3 pt-3 border-t border-slate-200 flex items-center justify-between gap-2">
                    {isAvailable ? (
                      <button
                        id={`btn-admit-${bed.id}`}
                        onClick={() => onOpenAdmissionModal(undefined, bed.id, bed.wardId)}
                        className="w-full py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Admit Patient Here</span>
                      </button>
                    ) : isOccupied ? (
                      <div className="flex items-center gap-1.5 w-full">
                        <button
                          onClick={() => {
                            if (bed.currentPatientId) {
                              navigateToPatient(bed.currentPatientId);
                            }
                          }}
                          className="w-full py-1.5 px-2 bg-slate-900 hover:bg-blue-900 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>View Patient</span>
                        </button>
                      </div>
                    ) : isCleaning ? (
                      <button
                        onClick={() => handleMarkBedReady(bed.id)}
                        className="w-full py-1.5 px-2 bg-cyan-700 hover:bg-cyan-800 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Mark Ready</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => navigateToBed(bed.id)}
                        className="w-full py-1.5 px-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <span>View Bed Log</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {filteredActiveWardBeds.length === 0 && (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200">
              <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-800">No beds match current filters</p>
              <p className="text-xs text-slate-500 mt-1">
                Try resetting your search query or selecting "All Beds".
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('ALL');
                }}
                className="mt-3 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold"
              >
                Reset Filters
              </button>
            </div>
          )}

          {/* Quick Registration Helper Banner at bottom of Ward Map */}
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 text-white rounded-lg">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-slate-900">
                  Admitting an Unregistered Inpatient to {activeWard.name}?
                </h5>
                <p className="text-xs text-slate-600">
                  Register the new patient into the hospital directory first, then return to assign their bed.
                </p>
              </div>
            </div>
            <button
              onClick={onOpenRegisterModal}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs shrink-0 cursor-pointer"
            >
              + Register New Patient
            </button>
          </div>
        </div>
      ) : (
        /* ALL 15 DEPARTMENTS OVERVIEW GRID */
        <div className="p-5 space-y-5">
          {/* Category Filter Chips & Search */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
              <button
                onClick={() => setDepartmentCategory('ALL')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  departmentCategory === 'ALL'
                    ? 'bg-slate-900 text-white'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                All 15 Departments
              </button>
              <button
                onClick={() => setDepartmentCategory('CRITICAL')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  departmentCategory === 'CRITICAL'
                    ? 'bg-rose-600 text-white'
                    : 'bg-white text-rose-700 border border-rose-200 hover:bg-rose-50'
                }`}
              >
                Critical & Emergency
              </button>
              <button
                onClick={() => setDepartmentCategory('SURGICAL')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  departmentCategory === 'SURGICAL'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-blue-700 border border-blue-200 hover:bg-blue-50'
                }`}
              >
                Surgical & Trauma
              </button>
              <button
                onClick={() => setDepartmentCategory('MEDICAL')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  departmentCategory === 'MEDICAL'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50'
                }`}
              >
                Internal Medicine
              </button>
              <button
                onClick={() => setDepartmentCategory('SPECIALIZED')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  departmentCategory === 'SPECIALIZED'
                    ? 'bg-purple-600 text-white'
                    : 'bg-white text-purple-700 border border-purple-200 hover:bg-purple-50'
                }`}
              >
                Pediatrics & Neuro
              </button>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search department name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-blue-500"
              />
            </div>
          </div>

          {/* Biomedical Engineering Department Notice & QA Card */}
          <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 rounded-2xl p-5 text-white shadow-lg border border-cyan-500/30">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div className="space-y-1.5 max-w-2xl">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-300 font-bold text-[11px] rounded-md border border-cyan-400/40 uppercase tracking-wider flex items-center gap-1">
                    <Cpu className="w-3.5 h-3.5" />
                    Biomedical Engineering (BME)
                  </span>
                  <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-300 font-bold text-[11px] rounded-md border border-cyan-500/40">
                    225 Registered Medical Devices (15 per Department)
                  </span>
                  <span className="px-2 py-0.5 bg-white/10 text-slate-300 text-[11px] font-mono rounded">
                    Lead BME: Boobalan S (BME-QA-001)
                  </span>
                </div>
                <h3 className="text-base font-black text-white">
                  Medical Device Inventory, Procurement Records & Quality Assurance
                </h3>
                <p className="text-xs text-slate-200">
                  Comprehensive biomedical tracking for 225 active medical devices across all 15 hospital departments. Complete procurement history, purchase dates, manufacturer warranty, and certified calibration statuses.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-2.5 shrink-0 w-full lg:w-auto">
                <div className="bg-black/30 p-2.5 rounded-xl border border-white/10 text-center px-4 w-full sm:w-auto">
                  <div className="text-lg font-black text-cyan-300 font-mono">
                    {devices.filter((d) => d.status === 'WORKING_PROPERLY').length}/{devices.length}
                  </div>
                  <div className="text-[10px] text-slate-300 font-semibold uppercase">
                    Working Properly
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('biomedical')}
                  className="w-full sm:w-auto px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 border border-cyan-300/40"
                >
                  <Wrench className="w-4 h-4" />
                  <span>Launch Device QA Console</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* 15 Departments Bento Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDepartments.map((dept, idx) => {
              const isHighOccupancy = dept.occupancyRate >= 80;

              return (
                <div
                  key={dept.id}
                  id={`dept-overview-card-${dept.id}`}
                  className="bg-white rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all p-4 flex flex-col justify-between"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-slate-100 rounded-lg shrink-0">
                          {getDepartmentIcon(dept.id)}
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Dept #{idx + 1} • {dept.building}
                          </span>
                          <h4 className="text-sm font-bold text-slate-900 leading-snug">
                            {dept.name}
                          </h4>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold font-mono bg-blue-50 text-blue-800 border border-blue-200 shrink-0">
                        {dept.total} Beds
                      </span>
                    </div>

                    <div className="text-xs text-slate-500 mb-3 flex items-center justify-between">
                      <span>{dept.floor}</span>
                      <span className="text-slate-600 font-medium">
                        Head: {dept.headNurse}
                      </span>
                    </div>

                    {/* Occupancy Bar */}
                    <div className="space-y-1 mb-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">Occupancy:</span>
                        <span className="font-mono font-bold text-slate-900">
                          {dept.occupied} / {dept.total} beds ({dept.occupancyRate}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isHighOccupancy ? 'bg-rose-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${dept.occupancyRate}%` }}
                        />
                      </div>
                    </div>

                    {/* Breakdown Badges */}
                    <div className="grid grid-cols-4 gap-1.5 text-center text-[10px] font-mono bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <div>
                        <div className="text-emerald-700 font-bold">{dept.available}</div>
                        <div className="text-slate-500">Avail</div>
                      </div>
                      <div>
                        <div className="text-rose-700 font-bold">{dept.occupied}</div>
                        <div className="text-slate-500">Occ</div>
                      </div>
                      <div>
                        <div className="text-cyan-700 font-bold">{dept.cleaning}</div>
                        <div className="text-slate-500">Clean</div>
                      </div>
                      <div>
                        <div className="text-amber-700 font-bold">{dept.maintenance}</div>
                        <div className="text-slate-500">Maint</div>
                      </div>
                    </div>
                  </div>

                  {/* Enter Button */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setSelectedWardId(dept.id)}
                      className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <BedDouble className="w-3.5 h-3.5" />
                      <span>Enter Ward Map ({dept.total} Beds) →</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Bed Modal */}
      <AddBedModal
        isOpen={isAddBedOpen}
        onClose={() => setIsAddBedOpen(false)}
        defaultWardId={selectedWardId || undefined}
      />

      {/* Add Device Modal */}
      <AddDeviceModal
        isOpen={isAddDeviceOpen}
        onClose={() => setIsAddDeviceOpen(false)}
        defaultWardId={selectedWardId || undefined}
      />
    </div>
  );
};
