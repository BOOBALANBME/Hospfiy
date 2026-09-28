import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bell,
  LogOut,
  Hospital,
  ChevronDown,
  UserCheck,
  CheckCircle,
  Clock,
  Sparkles,
  BedDouble,
  User as UserIcon,
  X,
  Play,
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { RoleBadge } from '../common/Badge';
import { HospifyLogo } from '../common/HospifyLogo';

interface HeaderProps {
  onLogout?: () => void;
  onReplayIntro?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onLogout, onReplayIntro }) => {
  const {
    currentUser,
    allUsers,
    switchUser,
    logout,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    patients,
    beds,
    navigateToPatient,
    navigateToBed,
    setActiveTab,
  } = useHospital();

  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const unreadNotifs = notifications.filter((n) => !n.read);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchResults(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search matches
  const trimmed = searchQuery.trim().toLowerCase();
  const matchedPatients = trimmed
    ? patients.filter(
        (p) =>
          p.id.toLowerCase().includes(trimmed) ||
          p.fullName.toLowerCase().includes(trimmed) ||
          p.phone.includes(trimmed) ||
          p.bloodGroup.toLowerCase().includes(trimmed)
      ).slice(0, 5)
    : [];

  const matchedBeds = trimmed
    ? beds.filter(
        (b) =>
          b.id.toLowerCase().includes(trimmed) ||
          b.wardName.toLowerCase().includes(trimmed) ||
          b.roomNumber.toLowerCase().includes(trimmed) ||
          (b.currentPatientName && b.currentPatientName.toLowerCase().includes(trimmed))
      ).slice(0, 5)
    : [];

  const hasResults = matchedPatients.length > 0 || matchedBeds.length > 0;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      {/* Top Demo Data Notice Bar */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1 px-4 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-white">Hospify</span>
          <span className="text-slate-400">| Internal Clinical Network</span>
          <span className="hidden sm:inline-block px-1.5 py-0.2 bg-amber-900/60 text-amber-300 rounded text-[10px] font-medium border border-amber-700/50">
            Fictional Demo Environment
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-slate-400">
          <span className="hidden md:inline">Current Facility Time: 2026-09-21 23:05</span>
          <span className="text-emerald-400 font-mono">ENCRYPTED NODE #882</span>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="px-4 lg:px-6 h-16 flex items-center justify-between gap-4">
        {/* Hospify Hospital Branding & Replay Trigger */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onReplayIntro}
            className="group flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100/80 transition-all text-left"
            title="Click to replay Hospify Logo Intro Animation"
          >
            <HospifyLogo size="sm" showSubtitle={true} />
            <span className="hidden xl:inline-flex items-center gap-1 text-[10px] font-semibold text-slate-400 group-hover:text-blue-600 bg-slate-100 group-hover:bg-blue-50 px-2 py-0.5 rounded-full border border-slate-200 transition-colors">
              <Play className="w-2.5 h-2.5 fill-current" />
              Replay Intro
            </span>
          </button>
        </div>

        {/* Global Search Bar */}
        <div ref={searchRef} className="relative flex-1 max-w-xl mx-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="global-hospital-search"
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchResults(true);
              }}
              onFocus={() => setShowSearchResults(true)}
              placeholder="Search by Patient ID (e.g. PAT-2026-00125), Name, Bed (ICU-01), Ward..."
              className="w-full pl-10 pr-9 py-2 bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-sm text-slate-800 placeholder-slate-400 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Search Dropdown Results */}
          {showSearchResults && trimmed && (
            <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 max-h-96 overflow-y-auto">
              {hasResults ? (
                <>
                  {matchedPatients.length > 0 && (
                    <div className="px-3 py-1.5">
                      <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1 px-1">
                        Patients ({matchedPatients.length})
                      </div>
                      {matchedPatients.map((p) => (
                        <div
                          key={p.id}
                          onClick={() => {
                            navigateToPatient(p.id);
                            setShowSearchResults(false);
                            setSearchQuery('');
                          }}
                          className="flex items-center justify-between p-2 hover:bg-blue-50/70 rounded-lg cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                              <UserIcon className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                                <span>{p.fullName}</span>
                                <span className="font-mono text-xs text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                                  {p.id}
                                </span>
                              </div>
                              <div className="text-xs text-slate-500">
                                {p.age} yrs • {p.gender} • Blood: {p.bloodGroup} • Status:{' '}
                                <span className="font-medium text-slate-700">{p.status}</span>
                              </div>
                            </div>
                          </div>
                          {p.allergies.length > 0 && (
                            <span className="text-[10px] text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                              {p.allergies[0]}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {matchedBeds.length > 0 && (
                    <div className="px-3 py-1.5 border-t border-slate-100">
                      <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1 px-1 mt-1">
                        Beds ({matchedBeds.length})
                      </div>
                      {matchedBeds.map((b) => (
                        <div
                          key={b.id}
                          onClick={() => {
                            navigateToBed(b.id);
                            setShowSearchResults(false);
                            setSearchQuery('');
                          }}
                          className="flex items-center justify-between p-2 hover:bg-emerald-50/70 rounded-lg cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                              <BedDouble className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                                <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded">
                                  {b.id}
                                </span>
                                <span>{b.wardName}</span>
                                <span className="text-xs text-slate-400">({b.roomNumber})</span>
                              </div>
                              <div className="text-xs text-slate-500">
                                {b.currentPatientName ? (
                                  <span className="text-slate-700">Occupied by: {b.currentPatientName}</span>
                                ) : (
                                  <span>{b.bedType} Bed</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                              b.status === 'AVAILABLE'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : b.status === 'OCCUPIED'
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : b.status === 'CLEANING'
                                ? 'bg-cyan-50 text-cyan-700 border-cyan-200'
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            {b.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="p-4 text-center text-sm text-slate-500">
                  No matching patients or beds found for "{searchQuery}"
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Action Icons & Role Switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Action: Search Eleanor Bennett exemplar directly */}
          <button
            onClick={() => navigateToPatient('PAT-2026-00125')}
            title="Jump directly to Eleanor Bennett (Exemplar Patient with 3 Visits)"
            className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-medium border border-blue-200 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Exemplar: PAT-2026-00125</span>
          </button>

          {/* Notifications Dropdown */}
          <div ref={notifRef} className="relative">
            <button
              id="notifications-bell-btn"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="View notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifs.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                  {unreadNotifs.length}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-slate-200 py-3 z-50">
                <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900">Hospital Internal Alerts</h4>
                    <span className="text-xs bg-slate-100 px-2 py-0.5 rounded-full font-medium text-slate-600">
                      {unreadNotifs.length} unread
                    </span>
                  </div>
                  {unreadNotifs.length > 0 && (
                    <button
                      onClick={markAllNotificationsAsRead}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                  {notifications.slice(0, 8).map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => {
                        markNotificationAsRead(notif.id);
                        if (notif.relatedPatientId) {
                          navigateToPatient(notif.relatedPatientId);
                          setShowNotifications(false);
                        } else if (notif.relatedBedId) {
                          navigateToBed(notif.relatedBedId);
                          setShowNotifications(false);
                        } else {
                          setActiveTab('notifications');
                          setShowNotifications(false);
                        }
                      }}
                      className={`p-3 text-xs hover:bg-slate-50 cursor-pointer transition-colors ${
                        !notif.read ? 'bg-blue-50/40' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-semibold text-slate-800">{notif.title}</div>
                        <span className="text-[10px] text-slate-400 shrink-0">{notif.timestamp}</span>
                      </div>
                      <p className="text-slate-600 mt-1 line-clamp-2 leading-relaxed">{notif.message}</p>
                    </div>
                  ))}
                </div>

                <div className="px-4 pt-2 border-t border-slate-100 text-center">
                  <button
                    onClick={() => {
                      setActiveTab('notifications');
                      setShowNotifications(false);
                    }}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                  >
                    View All Hospital Notifications →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User & Role Switcher */}
          <div ref={userMenuRef} className="relative">
            <button
              id="user-profile-menu-btn"
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-300 shrink-0"
              />
              <div className="text-left hidden md:block">
                <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <span>{currentUser.name}</span>
                  <RoleBadge role={currentUser.role} />
                </div>
                <div className="text-[11px] text-slate-500 truncate max-w-[130px]">
                  {currentUser.department}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </button>

            {/* Role Switcher Menu */}
            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-2xl border border-slate-200 py-2 z-50">
                <div className="px-4 py-2 border-b border-slate-100">
                  <div className="text-xs text-slate-500 font-medium">Logged in as</div>
                  <div className="text-sm font-bold text-slate-900">{currentUser.name}</div>
                  <div className="text-xs text-slate-500">{currentUser.email}</div>
                  <div className="mt-1">
                    <RoleBadge role={currentUser.role} />
                  </div>
                </div>

                <div className="px-3 py-2">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1 flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Switch Role (Demo Simulation)</span>
                  </div>
                  {allUsers.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => {
                        switchUser(user);
                        setShowUserMenu(false);
                      }}
                      className={`w-full text-left p-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                        currentUser.id === user.id
                          ? 'bg-blue-50 text-blue-900 font-semibold'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                        <div>
                          <div>{user.name}</div>
                          <div className="text-[10px] text-slate-500">{user.department}</div>
                        </div>
                      </div>
                      <RoleBadge role={user.role} />
                    </button>
                  ))}
                </div>

                <div className="border-t border-slate-100 pt-1 mt-1 px-2">
                  <button
                    onClick={() => {
                      logout();
                      setShowUserMenu(false);
                      onLogout?.();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
