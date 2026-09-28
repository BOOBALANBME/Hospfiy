import React from 'react';
import { BedStatus } from '../../types/hospital';

interface StatusBadgeProps {
  status: BedStatus | string;
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showDot = true,
}) => {
  let bgClass = 'bg-slate-100 text-slate-700 border-slate-200';
  let dotClass = 'bg-slate-400';

  switch (status) {
    case 'AVAILABLE':
      bgClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      dotClass = 'bg-emerald-500';
      break;
    case 'OCCUPIED':
      bgClass = 'bg-rose-50 text-rose-700 border-rose-200';
      dotClass = 'bg-rose-500';
      break;
    case 'RESERVED':
      bgClass = 'bg-amber-50 text-amber-700 border-amber-200';
      dotClass = 'bg-amber-500';
      break;
    case 'CLEANING':
      bgClass = 'bg-cyan-50 text-cyan-700 border-cyan-200';
      dotClass = 'bg-cyan-500 animate-pulse';
      break;
    case 'MAINTENANCE':
      bgClass = 'bg-purple-50 text-purple-700 border-purple-200';
      dotClass = 'bg-purple-500';
      break;
    case 'ACTIVE':
    case 'Inpatient':
      bgClass = 'bg-blue-50 text-blue-700 border-blue-200';
      dotClass = 'bg-blue-500';
      break;
    case 'DISCHARGED':
    case 'Discharged':
    case 'COMPLETED':
      bgClass = 'bg-slate-50 text-slate-600 border-slate-200';
      dotClass = 'bg-slate-400';
      break;
    case 'Outpatient':
      bgClass = 'bg-teal-50 text-teal-700 border-teal-200';
      dotClass = 'bg-teal-500';
      break;
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${sizeClasses[size]} ${bgClass}`}
    >
      {showDot && <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />}
      {status}
    </span>
  );
};

export const RoleBadge: React.FC<{ role: string }> = ({ role }) => {
  const styles: Record<string, string> = {
    ADMIN: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    DOCTOR: 'bg-sky-100 text-sky-800 border-sky-200',
    NURSE: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    RECEPTION: 'bg-amber-100 text-amber-800 border-amber-200',
    BIOMEDICAL: 'bg-purple-100 text-purple-800 border-purple-200',
  };

  return (
    <span
      className={`text-[11px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-md border ${
        styles[role] || 'bg-slate-100 text-slate-700 border-slate-200'
      }`}
    >
      {role}
    </span>
  );
};
