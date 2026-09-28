import React, { useState } from 'react';
import {
  LayoutDashboard,
  BedDouble,
  Users,
  UserPlus,
  FileHeart,
  Files,
  Pill,
  LogOut,
  BarChart3,
  Bell,
  ShieldCheck,
  Settings,
  ChevronRight,
  Activity,
  HeartPulse,
  Cpu,
  Building2,
  KeyRound,
  LogIn,
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { DepartmentLoginModal } from '../auth/DepartmentLoginModal';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  badgeColor?: string;
  category?: string;
}

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, stats, notifications, currentUser, canUserPerform } = useHospital();
  const [isDeptModalOpen, setIsDeptModalOpen] = useState<boolean>(false);

  const unreadNotifs = notifications.filter((n) => !n.read).length;

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      category: 'MAIN',
    },
    {
      id: 'beds',
      label: 'Bed Management',
      icon: BedDouble,
      badge: `${stats.availableBeds} Avail`,
      badgeColor: 'bg-emerald-100 text-emerald-800',
      category: 'BEDS & CAPACITY',
    },
    {
      id: 'patients',
      label: 'Patients & Records',
      icon: Users,
      badge: stats.totalPatients,
      badgeColor: 'bg-slate-100 text-slate-700',
      category: 'PATIENT CARE',
    },
    {
      id: 'admissions',
      label: 'Admissions & Intake',
      icon: UserPlus,
      badge: stats.currentAdmissions,
      badgeColor: 'bg-blue-100 text-blue-800',
      category: 'PATIENT CARE',
    },
    {
      id: 'clinical',
      label: 'Clinical Records & Vitals',
      icon: FileHeart,
      category: 'PATIENT CARE',
    },
    {
      id: 'documents',
      label: 'Medical Documents',
      icon: Files,
      category: 'PATIENT CARE',
    },
    {
      id: 'prescriptions',
      label: 'Prescriptions & Meds',
      icon: Pill,
      category: 'PATIENT CARE',
    },
    {
      id: 'discharges',
      label: 'Discharge Module',
      icon: LogOut,
      category: 'PATIENT CARE',
    },
    {
      id: 'biomedical',
      label: 'Biomedical & Device QA',
      icon: Cpu,
      badge: 'Devices',
      badgeColor: 'bg-cyan-900/60 text-cyan-300 border border-cyan-700/50',
      category: 'BIOMEDICAL ENGINEERING',
    },
    {
      id: 'reports',
      label: 'Reports & Analytics',
      icon: BarChart3,
      category: 'ADMINISTRATION',
    },
    {
      id: 'notifications',
      label: 'Internal Alerts',
      icon: Bell,
      badge: unreadNotifs > 0 ? unreadNotifs : undefined,
      badgeColor: 'bg-rose-100 text-rose-800',
      category: 'ADMINISTRATION',
    },
    {
      id: 'audit',
      label: 'Audit Trail & Logs',
      icon: ShieldCheck,
      category: 'ADMINISTRATION',
    },
    {
      id: 'settings',
      label: 'Hospital Settings',
      icon: Settings,
      category: 'ADMINISTRATION',
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 min-h-[calc(100vh-6rem)] border-r border-slate-800">
      {/* Live Hospital Telemetry Mini Card */}
      <div className="p-4 mx-3 my-3 bg-slate-800/80 rounded-xl border border-slate-700/60 shadow-inner">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
          <span className="flex items-center gap-1.5 text-blue-400">
            <HeartPulse className="w-4 h-4 animate-pulse" />
            <span>Facility Census</span>
          </span>
          <span className="text-emerald-400 font-mono">{stats.occupancyRate}% Full</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden flex">
          <div
            className="bg-rose-500 h-full transition-all duration-500"
            style={{ width: `${(stats.occupiedBeds / stats.totalBeds) * 100}%` }}
            title={`Occupied: ${stats.occupiedBeds}`}
          />
          <div
            className="bg-amber-400 h-full transition-all duration-500"
            style={{ width: `${(stats.reservedBeds / stats.totalBeds) * 100}%` }}
            title={`Reserved: ${stats.reservedBeds}`}
          />
          <div
            className="bg-cyan-400 h-full transition-all duration-500"
            style={{ width: `${(stats.cleaningBeds / stats.totalBeds) * 100}%` }}
            title={`Cleaning: ${stats.cleaningBeds}`}
          />
          <div
            className="bg-emerald-500 h-full transition-all duration-500"
            style={{ width: `${(stats.availableBeds / stats.totalBeds) * 100}%` }}
            title={`Available: ${stats.availableBeds}`}
          />
        </div>

        <div className="grid grid-cols-2 gap-2 mt-3 pt-2 border-t border-slate-700/50 text-[11px]">
          <div>
            <span className="text-slate-400">Available:</span>{' '}
            <span className="font-bold text-emerald-400 font-mono">{stats.availableBeds} Beds</span>
          </div>
          <div>
            <span className="text-slate-400">Occupied:</span>{' '}
            <span className="font-bold text-rose-400 font-mono">{stats.occupiedBeds} Beds</span>
          </div>
          <div>
            <span className="text-slate-400">Cleaning:</span>{' '}
            <span className="font-bold text-cyan-400 font-mono">{stats.cleaningBeds} Beds</span>
          </div>
          <div>
            <span className="text-slate-400">ICU Avail:</span>{' '}
            <span className="font-bold text-blue-400 font-mono">{stats.icuAvailable} Beds</span>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item, idx) => {
          const Icon = item.icon;
          const isActive =
            activeTab === item.id || (item.id === 'patients' && activeTab === 'patient-profile');

          // Group headers
          const showHeader =
            idx === 0 || item.category !== navItems[idx - 1].category;

          return (
            <React.Fragment key={item.id}>
              {showHeader && (
                <div className="pt-3 pb-1 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {item.category}
                </div>
              )}
              <button
                id={`nav-link-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-500/20'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {item.badge !== undefined && (
                    <span
                      className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                        isActive ? 'bg-blue-700 text-white' : item.badgeColor
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-80" />}
                </div>
              </button>
            </React.Fragment>
          );
        })}
      </nav>

      {/* Side Panel: Department Login / Switch Card */}
      <div className="p-3 mx-2 my-2 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-cyan-500/30 shadow-md">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1">
            <Building2 className="w-3 h-3 text-cyan-400" />
            <span>Department Portal</span>
          </span>
          <span className="px-1.5 py-0.2 rounded bg-cyan-900/60 text-cyan-300 text-[9px] font-mono border border-cyan-700/40">
            Auth
          </span>
        </div>

        <div className="text-[11px] font-bold text-white truncate mb-1">
          {currentUser.department || 'Central Administration'}
        </div>

        <button
          id="sidebar-dept-login-btn"
          type="button"
          onClick={() => setIsDeptModalOpen(true)}
          className="w-full mt-1 px-2.5 py-1.5 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 hover:text-white rounded-lg text-xs font-bold transition-all border border-cyan-500/40 flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <KeyRound className="w-3.5 h-3.5" />
          <span>Department Login</span>
        </button>
      </div>

      {/* User Session Footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/40 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-blue-400 shrink-0">
            {currentUser.name.charAt(0)}
          </div>
          <div className="overflow-hidden">
            <div className="text-white font-medium truncate">{currentUser.name}</div>
            <div className="text-slate-400 text-[11px] truncate flex items-center gap-1">
              <span>{currentUser.badgeNumber}</span>
              <span>•</span>
              <span className="text-emerald-400">Authenticated</span>
            </div>
          </div>
        </div>
      </div>

      {/* Department Login Modal */}
      <DepartmentLoginModal
        isOpen={isDeptModalOpen}
        onClose={() => setIsDeptModalOpen(false)}
      />
    </aside>
  );
};
