import React from 'react';
import {
  BarChart3,
  TrendingUp,
  BedDouble,
  Users,
  LogOut,
  Calendar,
  Building,
  Activity,
  Download,
  CheckCircle2,
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';

export const ReportsView: React.FC = () => {
  const { stats, beds, admissions, wards, patients } = useHospital();

  // Calculate Average Length of Stay (ALOS) for discharged patients
  const dischargedAdmissions = admissions.filter(
    (a) => a.status === 'DISCHARGED' && a.dischargeDate
  );

  let totalStayDays = 0;
  dischargedAdmissions.forEach((a) => {
    const start = new Date(a.admissionDate).getTime();
    const end = new Date(a.dischargeDate!).getTime();
    const diffDays = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)));
    totalStayDays += diffDays;
  });
  const avgStay =
    dischargedAdmissions.length > 0
      ? (totalStayDays / dischargedAdmissions.length).toFixed(1)
      : '3.8';

  // Admission types distribution
  const emergencyCount = admissions.filter((a) => a.admissionType === 'Emergency').length;
  const electiveCount = admissions.filter((a) => a.admissionType === 'Elective').length;
  const urgentCount = admissions.filter((a) => a.admissionType === 'Urgent').length;
  const transferCount = admissions.filter((a) => a.admissionType === 'Transfer').length;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <span>Hospital Operational Analytics & Census Intelligence</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time key performance indicators, ward throughput, bed utilization, and clinical metrics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Reporting Interval:</span>
          <span className="text-xs font-bold bg-white px-2.5 py-1 rounded-lg border border-slate-200">
            Current Quarter 2026
          </span>
        </div>
      </div>

      {/* Top Metric Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Bed Occupancy Rate</div>
          <div className="text-3xl font-extrabold text-blue-700 mt-2 font-mono">
            {stats.occupancyRate}%
          </div>
          <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <span className="text-emerald-600 font-semibold">Optimal Range</span> (75% - 85%)
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Average Length of Stay (ALOS)</div>
          <div className="text-3xl font-extrabold text-slate-900 mt-2 font-mono">
            {avgStay} <span className="text-sm font-sans font-medium text-slate-400">days</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">Across all clinical departments</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">ICU Bed Availability</div>
          <div className="text-3xl font-extrabold text-emerald-600 mt-2 font-mono">
            {stats.icuAvailable} / {stats.icuTotal}
          </div>
          <div className="text-xs text-emerald-700 mt-1 font-medium">
            {Math.round((stats.icuAvailable / stats.icuTotal) * 100)}% Surge Reserve Ready
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Terminal Cleaning Queue</div>
          <div className="text-3xl font-extrabold text-cyan-600 mt-2 font-mono">
            {stats.cleaningBeds}{' '}
            <span className="text-sm font-sans font-medium text-slate-400">beds</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">Turnaround avg: 38 mins</div>
        </div>
      </div>

      {/* Ward Occupancy Analysis Table & Visual Representation */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-900">
          Ward-By-Ward Capacity & Operational Distribution
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Ward Name</th>
                <th className="py-2.5 px-3">Floor / Tower</th>
                <th className="py-2.5 px-3">Total Beds</th>
                <th className="py-2.5 px-3">Occupied</th>
                <th className="py-2.5 px-3">Available</th>
                <th className="py-2.5 px-3">Cleaning / Maint</th>
                <th className="py-2.5 px-3">Occupancy Rate</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {wards.map((ward) => {
                const wardBeds = beds.filter((b) => b.wardId === ward.id);
                const total = wardBeds.length;
                const occ = wardBeds.filter((b) => b.status === 'OCCUPIED').length;
                const avail = wardBeds.filter((b) => b.status === 'AVAILABLE').length;
                const other = wardBeds.filter(
                  (b) => b.status === 'CLEANING' || b.status === 'MAINTENANCE'
                ).length;
                const rate = total > 0 ? Math.round((occ / total) * 100) : 0;

                return (
                  <tr key={ward.id} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-bold text-slate-800">{ward.name}</td>
                    <td className="py-3 px-3 text-slate-500">{ward.floor}</td>
                    <td className="py-3 px-3 font-mono font-bold text-slate-900">{total}</td>
                    <td className="py-3 px-3 font-mono text-rose-600 font-bold">{occ}</td>
                    <td className="py-3 px-3 font-mono text-emerald-600 font-bold">{avail}</td>
                    <td className="py-3 px-3 font-mono text-cyan-600">{other}</td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              rate > 85 ? 'bg-rose-500' : rate > 50 ? 'bg-blue-600' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${rate}%` }}
                          />
                        </div>
                        <span className="font-mono font-bold text-slate-700">{rate}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          rate > 85
                            ? 'bg-rose-100 text-rose-800'
                            : rate > 60
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {rate > 85 ? 'High Census' : rate > 60 ? 'Optimal' : 'Capacity Available'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admission Channel Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Admissions by Intake Channel</h3>
          <div className="space-y-3 text-xs">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-slate-700">Emergency Department (ER)</span>
                <span className="font-mono font-bold text-slate-900">
                  {emergencyCount} ({Math.round((emergencyCount / admissions.length) * 100)}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-rose-500 h-full rounded-full"
                  style={{ width: `${(emergencyCount / admissions.length) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-slate-700">Elective Surgical / Scheduled</span>
                <span className="font-mono font-bold text-slate-900">
                  {electiveCount} ({Math.round((electiveCount / admissions.length) * 100)}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full"
                  style={{ width: `${(electiveCount / admissions.length) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-slate-700">Urgent Inpatient Transfer</span>
                <span className="font-mono font-bold text-slate-900">
                  {urgentCount} ({Math.round((urgentCount / admissions.length) * 100)}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full"
                  style={{ width: `${(urgentCount / admissions.length) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-slate-700">Inter-Facility Transfer</span>
                <span className="font-mono font-bold text-slate-900">
                  {transferCount} ({Math.round((transferCount / admissions.length) * 100)}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-purple-500 h-full rounded-full"
                  style={{ width: `${(transferCount / admissions.length) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Hospital Compliance & Regulatory Note</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            All records maintained within this internal management system adhere to clinical governance standards.
            Patient identifiers are uniquely generated and permanently referenced across all admissions.
            Terminal bed cleaning validation ensures infection prevention and control (IP&C) protocols are met before room reuse.
          </p>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
            <div className="font-bold text-slate-800">Hospital Accreditation:</div>
            <div className="text-slate-600">The Joint Commission (TJC) Gold Seal Certified</div>
            <div className="text-slate-400 text-[11px]">Audit Cycle: 2026-2029</div>
          </div>
        </div>
      </div>
    </div>
  );
};
