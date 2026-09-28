import React, { useState, useMemo } from 'react';
import {
  HeartPulse,
  Activity,
  Thermometer,
  Wind,
  Plus,
  TrendingDown,
  TrendingUp,
  Clock,
  UserCheck,
  Calendar,
  Layers,
  ChevronDown,
  Info,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { AdmissionVisit, ClinicalRecord } from '../../types/hospital';

interface PatientVitalsTrendChartProps {
  patientId: string;
  admissions: AdmissionVisit[];
  activeAdmission?: AdmissionVisit;
  clinicalRecords: ClinicalRecord[];
  onOpenAddNoteModal: (patientId: string, visitId: string) => void;
  canAddNote: boolean;
}

type MetricMode = 'CARDIO' | 'RESPIRATORY' | 'TEMPERATURE' | 'ALL';

export const PatientVitalsTrendChart: React.FC<PatientVitalsTrendChartProps> = ({
  patientId,
  admissions,
  activeAdmission,
  clinicalRecords,
  onOpenAddNoteModal,
  canAddNote,
}) => {
  // Default to active admission, or the first admission in list, or 'ALL'
  const defaultVisitId = activeAdmission?.id || admissions[0]?.id || 'ALL';
  const [selectedVisitId, setSelectedVisitId] = useState<string>(defaultVisitId);
  const [metricMode, setMetricMode] = useState<MetricMode>('CARDIO');
  const [showDataTable, setShowDataTable] = useState<boolean>(false);

  // Selected admission metadata
  const selectedAdmission = useMemo(() => {
    if (selectedVisitId === 'ALL') return null;
    return admissions.find((a) => a.id === selectedVisitId);
  }, [admissions, selectedVisitId]);

  // Extract records with vitals for the selected visit (or all)
  const chartData = useMemo(() => {
    const relevantRecords = clinicalRecords.filter((rec) => {
      if (rec.patientId !== patientId) return false;
      if (!rec.vitals) return false;
      if (selectedVisitId !== 'ALL' && rec.visitId !== selectedVisitId) return false;
      return true;
    });

    // Sort chronologically (oldest to newest for proper left-to-right timeline)
    const sorted = [...relevantRecords].sort((a, b) => {
      const timeA = new Date(a.vitals?.timestamp || a.timestamp).getTime();
      const timeB = new Date(b.vitals?.timestamp || b.timestamp).getTime();
      return timeA - timeB;
    });

    return sorted.map((rec, index) => {
      const v = rec.vitals!;
      const rawTime = v.timestamp || rec.timestamp;
      // Format short label: "MM/DD HH:mm"
      const dateParts = rawTime.split(' ');
      const dateStr = dateParts[0] || '';
      const timeStr = dateParts[1] || '';
      const shortDate = dateStr.length >= 10 ? `${dateStr.slice(5)} ${timeStr}` : rawTime;

      return {
        id: rec.id,
        index: index + 1,
        timestamp: rawTime,
        shortTime: timeStr || shortDate,
        displayLabel: shortDate,
        visitId: rec.visitId,
        heartRate: v.heartRate,
        bloodPressureSys: v.bloodPressureSys,
        bloodPressureDia: v.bloodPressureDia,
        temperature: v.temperature,
        respiratoryRate: v.respiratoryRate,
        oxygenSaturation: v.oxygenSaturation,
        recordedBy: v.recordedBy || rec.authorName,
        noteTitle: rec.title,
        recordType: rec.recordType,
      };
    });
  }, [clinicalRecords, patientId, selectedVisitId]);

  // Latest reading for KPI cards
  const latestVitals = chartData.length > 0 ? chartData[chartData.length - 1] : null;
  const previousVitals = chartData.length > 1 ? chartData[chartData.length - 2] : null;

  // Helpers for clinical ranges
  const getBpCategory = (sys?: number, dia?: number) => {
    if (!sys || !dia) return { label: 'Unknown', color: 'text-slate-600 bg-slate-100' };
    if (sys < 120 && dia < 80) return { label: 'Optimal Normal', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    if (sys <= 129 && dia < 80) return { label: 'Elevated BP', color: 'text-amber-700 bg-amber-50 border-amber-200' };
    if (sys <= 139 || dia <= 89) return { label: 'Stage 1 HTN', color: 'text-orange-700 bg-orange-50 border-orange-200' };
    return { label: 'Stage 2 HTN', color: 'text-rose-700 bg-rose-50 border-rose-200' };
  };

  const getHeartRateCategory = (hr?: number) => {
    if (!hr) return { label: 'Unknown', color: 'text-slate-600 bg-slate-100' };
    if (hr < 60) return { label: 'Bradycardia (<60)', color: 'text-amber-700 bg-amber-50 border-amber-200' };
    if (hr <= 100) return { label: 'Normal Sinus', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    return { label: 'Tachycardia (>100)', color: 'text-rose-700 bg-rose-50 border-rose-200' };
  };

  const getSpo2Category = (spo2?: number) => {
    if (!spo2) return { label: 'Unknown', color: 'text-slate-600 bg-slate-100' };
    if (spo2 >= 95) return { label: 'Normal Room Air', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    if (spo2 >= 90) return { label: 'Mild Hypoxia', color: 'text-amber-700 bg-amber-50 border-amber-200' };
    return { label: 'Hypoxemia (<90%)', color: 'text-rose-700 bg-rose-50 border-rose-200' };
  };

  const getTempCategory = (t?: number) => {
    if (!t) return { label: 'Unknown', color: 'text-slate-600 bg-slate-100' };
    if (t >= 38.0) return { label: 'Febrile / Fever', color: 'text-rose-700 bg-rose-50 border-rose-200' };
    if (t >= 37.5) return { label: 'Low Grade Fever', color: 'text-amber-700 bg-amber-50 border-amber-200' };
    if (t < 36.0) return { label: 'Hypothermic', color: 'text-blue-700 bg-blue-50 border-blue-200' };
    return { label: 'Afebrile (Normal)', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
  };

  // Custom Chart Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white p-3.5 rounded-xl shadow-xl border border-slate-700 text-xs min-w-[240px] space-y-2">
          <div className="flex items-center justify-between border-b border-slate-700 pb-1.5">
            <span className="font-mono font-bold text-blue-300">{data.timestamp}</span>
            <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded font-mono">
              {data.visitId}
            </span>
          </div>

          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                <span>Blood Pressure:</span>
              </span>
              <span className="font-mono font-bold text-white">
                {data.bloodPressureSys}/{data.bloodPressureDia} <span className="text-[10px] text-slate-400">mmHg</span>
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-300 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-400 inline-block" />
                <span>Heart Rate (Pulse):</span>
              </span>
              <span className="font-mono font-bold text-white">
                {data.heartRate} <span className="text-[10px] text-slate-400">bpm</span>
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-300 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
                <span>Oxygen (SpO2):</span>
              </span>
              <span className="font-mono font-bold text-white">
                {data.oxygenSaturation}%
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-300 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
                <span>Temperature:</span>
              </span>
              <span className="font-mono font-bold text-white">
                {data.temperature} °C
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-300 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-400 inline-block" />
                <span>Resp Rate:</span>
              </span>
              <span className="font-mono font-bold text-white">
                {data.respiratoryRate}/min
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-700/80 text-[11px] text-slate-400">
            <div>Recorded by: <strong className="text-slate-200">{data.recordedBy}</strong></div>
            <div className="italic truncate max-w-[220px] text-slate-300">"{data.noteTitle}"</div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6">
      {/* Header bar with Visit Selection & Controls */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-50 via-blue-50/20 to-slate-50 border-b border-slate-200">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-blue-600 text-white shadow-xs">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span>Patient Vital Signs Longitudinal Trend</span>
                  <span className="text-[11px] font-normal text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                    {chartData.length} Readings Logged
                  </span>
                </h3>
                <p className="text-xs text-slate-500">
                  Chronological vitals progression (Blood Pressure, Heart Rate, SpO2, Temp) for selected hospital stay
                </p>
              </div>
            </div>
          </div>

          {/* Controls: Visit Selector & Record Button */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Visit Selector Dropdown */}
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 shadow-2xs">
              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-xs font-semibold text-slate-600 shrink-0">Selected Visit:</span>
              <select
                id="vitals-visit-selector"
                value={selectedVisitId}
                onChange={(e) => setSelectedVisitId(e.target.value)}
                className="text-xs font-bold text-blue-700 bg-transparent outline-none cursor-pointer pr-2"
              >
                {admissions.map((adm) => (
                  <option key={adm.id} value={adm.id}>
                    Visit #{adm.visitNumber} ({adm.id}) — {adm.wardName} {adm.status === 'ACTIVE' ? '● ACTIVE' : '✓ Discharged'}
                  </option>
                ))}
                {admissions.length > 1 && (
                  <option value="ALL">All Hospital Visits Timeline ({admissions.length} Visits)</option>
                )}
              </select>
            </div>

            {/* Metric Mode Toggle */}
            <div className="flex items-center p-0.5 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setMetricMode('CARDIO')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  metricMode === 'CARDIO'
                    ? 'bg-white text-blue-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                BP & Pulse
              </button>
              <button
                type="button"
                onClick={() => setMetricMode('RESPIRATORY')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  metricMode === 'RESPIRATORY'
                    ? 'bg-white text-emerald-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                SpO2 & Resp
              </button>
              <button
                type="button"
                onClick={() => setMetricMode('TEMPERATURE')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  metricMode === 'TEMPERATURE'
                    ? 'bg-white text-amber-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Temp
              </button>
              <button
                type="button"
                onClick={() => setMetricMode('ALL')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  metricMode === 'ALL'
                    ? 'bg-white text-purple-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All
              </button>
            </div>

            {/* Add Note/Vitals Button */}
            {canAddNote && (
              <button
                id="record-bedside-vitals-btn"
                type="button"
                onClick={() =>
                  onOpenAddNoteModal(
                    patientId,
                    selectedVisitId === 'ALL' ? defaultVisitId : selectedVisitId
                  )
                }
                className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Record Vitals</span>
              </button>
            )}
          </div>
        </div>

        {/* Selected Visit Context Banner */}
        {selectedAdmission && (
          <div className="mt-3 pt-3 border-t border-slate-200/70 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2">
            <div className="flex flex-wrap items-center gap-3">
              <span>
                <strong>Ward:</strong> {selectedAdmission.wardName} (Bed {selectedAdmission.bedId})
              </span>
              <span>•</span>
              <span>
                <strong>Physician:</strong> {selectedAdmission.attendingDoctor}
              </span>
              <span>•</span>
              <span>
                <strong>Diagnosis:</strong> {selectedAdmission.initialDiagnosis}
              </span>
            </div>
            <div className="font-mono text-[11px] text-slate-500">
              Admission: {selectedAdmission.admissionDate}
              {selectedAdmission.dischargeDate ? ` → Discharged: ${selectedAdmission.dischargeDate}` : ' (Currently Admitted)'}
            </div>
          </div>
        )}
      </div>

      {/* Latest Vitals KPI Summary Strip */}
      {latestVitals ? (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-px bg-slate-200 border-b border-slate-200 text-xs">
          {/* Blood Pressure Card */}
          <div className="bg-white p-3.5 hover:bg-slate-50/80 transition-colors">
            <div className="text-[11px] font-semibold text-slate-500 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
                <span>Blood Pressure</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">mmHg</span>
            </div>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-lg font-extrabold text-slate-900 font-mono">
                {latestVitals.bloodPressureSys}/{latestVitals.bloodPressureDia}
              </span>
              {previousVitals && (
                <span className="text-[10px] text-slate-400 flex items-center">
                  {latestVitals.bloodPressureSys < previousVitals.bloodPressureSys ? (
                    <TrendingDown className="w-3 h-3 text-emerald-600" />
                  ) : latestVitals.bloodPressureSys > previousVitals.bloodPressureSys ? (
                    <TrendingUp className="w-3 h-3 text-rose-600" />
                  ) : null}
                </span>
              )}
            </div>
            <div className="mt-1">
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                  getBpCategory(latestVitals.bloodPressureSys, latestVitals.bloodPressureDia).color
                }`}
              >
                {getBpCategory(latestVitals.bloodPressureSys, latestVitals.bloodPressureDia).label}
              </span>
            </div>
          </div>

          {/* Heart Rate Card */}
          <div className="bg-white p-3.5 hover:bg-slate-50/80 transition-colors">
            <div className="text-[11px] font-semibold text-slate-500 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <HeartPulse className="w-3.5 h-3.5 text-blue-500" />
                <span>Heart Rate</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">bpm</span>
            </div>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-lg font-extrabold text-slate-900 font-mono">
                {latestVitals.heartRate}
              </span>
              {previousVitals && (
                <span className="text-[10px] text-slate-400 flex items-center">
                  {latestVitals.heartRate < previousVitals.heartRate ? (
                    <TrendingDown className="w-3 h-3 text-blue-600" />
                  ) : latestVitals.heartRate > previousVitals.heartRate ? (
                    <TrendingUp className="w-3 h-3 text-rose-600" />
                  ) : null}
                </span>
              )}
            </div>
            <div className="mt-1">
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                  getHeartRateCategory(latestVitals.heartRate).color
                }`}
              >
                {getHeartRateCategory(latestVitals.heartRate).label}
              </span>
            </div>
          </div>

          {/* Oxygen Saturation Card */}
          <div className="bg-white p-3.5 hover:bg-slate-50/80 transition-colors">
            <div className="text-[11px] font-semibold text-slate-500 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                <span>SpO2 Oxygen</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">%</span>
            </div>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-lg font-extrabold text-slate-900 font-mono">
                {latestVitals.oxygenSaturation}%
              </span>
            </div>
            <div className="mt-1">
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                  getSpo2Category(latestVitals.oxygenSaturation).color
                }`}
              >
                {getSpo2Category(latestVitals.oxygenSaturation).label}
              </span>
            </div>
          </div>

          {/* Temperature Card */}
          <div className="bg-white p-3.5 hover:bg-slate-50/80 transition-colors">
            <div className="text-[11px] font-semibold text-slate-500 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Thermometer className="w-3.5 h-3.5 text-amber-500" />
                <span>Body Temp</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">°C</span>
            </div>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-lg font-extrabold text-slate-900 font-mono">
                {latestVitals.temperature}
              </span>
            </div>
            <div className="mt-1">
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                  getTempCategory(latestVitals.temperature).color
                }`}
              >
                {getTempCategory(latestVitals.temperature).label}
              </span>
            </div>
          </div>

          {/* Respiratory Rate Card */}
          <div className="bg-white p-3.5 hover:bg-slate-50/80 transition-colors col-span-2 sm:col-span-1">
            <div className="text-[11px] font-semibold text-slate-500 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Wind className="w-3.5 h-3.5 text-purple-500" />
                <span>Resp Rate</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">/min</span>
            </div>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-lg font-extrabold text-slate-900 font-mono">
                {latestVitals.respiratoryRate}
              </span>
            </div>
            <div className="mt-1 text-[10px] text-slate-500 truncate" title={`Recorded by ${latestVitals.recordedBy}`}>
              By {latestVitals.recordedBy}
            </div>
          </div>
        </div>
      ) : null}

      {/* Main Chart Area */}
      <div className="p-4 sm:p-6">
        {chartData.length === 0 ? (
          <div className="py-12 px-4 text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
            <HeartPulse className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-800">No Vitals Recorded for Selected Visit</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              No bedside vital signs have been logged for visit{' '}
              <span className="font-mono font-bold text-slate-700">{selectedVisitId}</span> yet.
              Add a clinical or nursing progress note with vitals to start tracking.
            </p>
            {canAddNote && (
              <button
                type="button"
                onClick={() =>
                  onOpenAddNoteModal(
                    patientId,
                    selectedVisitId === 'ALL' ? defaultVisitId : selectedVisitId
                  )
                }
                className="mt-3.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Record First Vital Sign Reading</span>
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Chart Container */}
            <div className="h-[300px] sm:h-[340px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 15, right: 20, left: 0, bottom: 25 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />

                  <XAxis
                    dataKey="shortTime"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tick={{ fill: '#64748b' }}
                  />

                  {/* Y-Axis configuration based on metric mode */}
                  {metricMode === 'CARDIO' && (
                    <YAxis
                      domain={[40, 180]}
                      stroke="#94a3b8"
                      fontSize={11}
                      tickLine={false}
                      axisLine={{ stroke: '#cbd5e1' }}
                      tick={{ fill: '#64748b' }}
                      label={{
                        value: 'mmHg / bpm',
                        angle: -90,
                        position: 'insideLeft',
                        fontSize: 10,
                        fill: '#94a3b8',
                      }}
                    />
                  )}

                  {metricMode === 'RESPIRATORY' && (
                    <YAxis
                      domain={[10, 100]}
                      stroke="#94a3b8"
                      fontSize={11}
                      tickLine={false}
                      axisLine={{ stroke: '#cbd5e1' }}
                      tick={{ fill: '#64748b' }}
                      label={{
                        value: '% SpO2 / breaths',
                        angle: -90,
                        position: 'insideLeft',
                        fontSize: 10,
                        fill: '#94a3b8',
                      }}
                    />
                  )}

                  {metricMode === 'TEMPERATURE' && (
                    <YAxis
                      domain={[35.0, 40.0]}
                      stroke="#94a3b8"
                      fontSize={11}
                      tickLine={false}
                      axisLine={{ stroke: '#cbd5e1' }}
                      tick={{ fill: '#64748b' }}
                      label={{
                        value: 'Temperature (°C)',
                        angle: -90,
                        position: 'insideLeft',
                        fontSize: 10,
                        fill: '#94a3b8',
                      }}
                    />
                  )}

                  {metricMode === 'ALL' && (
                    <YAxis
                      domain={[10, 180]}
                      stroke="#94a3b8"
                      fontSize={11}
                      tickLine={false}
                      axisLine={{ stroke: '#cbd5e1' }}
                      tick={{ fill: '#64748b' }}
                    />
                  )}

                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    verticalAlign="top"
                    height={36}
                    wrapperStyle={{ fontSize: '11px', fontWeight: 600, paddingBottom: '8px' }}
                  />

                  {/* Reference Lines for clinical thresholds */}
                  {metricMode === 'CARDIO' && (
                    <>
                      <ReferenceLine
                        y={120}
                        stroke="#f43f5e"
                        strokeDasharray="4 4"
                        strokeOpacity={0.5}
                        label={{
                          value: 'Sys Normal (<120)',
                          fill: '#f43f5e',
                          fontSize: 9,
                          position: 'insideTopRight',
                        }}
                      />
                      <ReferenceLine
                        y={80}
                        stroke="#f97316"
                        strokeDasharray="4 4"
                        strokeOpacity={0.4}
                        label={{
                          value: 'Dia Normal (<80)',
                          fill: '#f97316',
                          fontSize: 9,
                          position: 'insideTopRight',
                        }}
                      />
                      <ReferenceLine
                        y={100}
                        stroke="#3b82f6"
                        strokeDasharray="4 4"
                        strokeOpacity={0.4}
                        label={{
                          value: 'Max Normal HR (100)',
                          fill: '#3b82f6',
                          fontSize: 9,
                          position: 'insideTopRight',
                        }}
                      />
                    </>
                  )}

                  {metricMode === 'RESPIRATORY' && (
                    <ReferenceLine
                      y={95}
                      stroke="#059669"
                      strokeDasharray="4 4"
                      strokeOpacity={0.6}
                      label={{
                        value: 'Target SpO2 ≥95%',
                        fill: '#059669',
                        fontSize: 9,
                        position: 'insideTopRight',
                      }}
                    />
                  )}

                  {/* CARDIO or ALL Lines */}
                  {(metricMode === 'CARDIO' || metricMode === 'ALL') && (
                    <>
                      <Line
                        type="monotone"
                        dataKey="bloodPressureSys"
                        name="BP Systolic (mmHg)"
                        stroke="#e11d48"
                        strokeWidth={2.5}
                        dot={{ r: 4, fill: '#e11d48', stroke: '#ffffff', strokeWidth: 2 }}
                        activeDot={{ r: 6, stroke: '#ffffff', strokeWidth: 2 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="bloodPressureDia"
                        name="BP Diastolic (mmHg)"
                        stroke="#ea580c"
                        strokeWidth={2.2}
                        dot={{ r: 4, fill: '#ea580c', stroke: '#ffffff', strokeWidth: 2 }}
                        activeDot={{ r: 6, stroke: '#ffffff', strokeWidth: 2 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="heartRate"
                        name="Heart Rate (bpm)"
                        stroke="#2563eb"
                        strokeWidth={2.5}
                        dot={{ r: 4, fill: '#2563eb', stroke: '#ffffff', strokeWidth: 2 }}
                        activeDot={{ r: 6, stroke: '#ffffff', strokeWidth: 2 }}
                      />
                    </>
                  )}

                  {/* RESPIRATORY or ALL Lines */}
                  {(metricMode === 'RESPIRATORY' || metricMode === 'ALL') && (
                    <>
                      <Line
                        type="monotone"
                        dataKey="oxygenSaturation"
                        name="SpO2 (%)"
                        stroke="#059669"
                        strokeWidth={2.5}
                        dot={{ r: 4, fill: '#059669', stroke: '#ffffff', strokeWidth: 2 }}
                        activeDot={{ r: 6, stroke: '#ffffff', strokeWidth: 2 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="respiratoryRate"
                        name="Resp Rate (/min)"
                        stroke="#7c3aed"
                        strokeWidth={2}
                        dot={{ r: 3.5, fill: '#7c3aed', stroke: '#ffffff', strokeWidth: 2 }}
                        activeDot={{ r: 5, stroke: '#ffffff', strokeWidth: 2 }}
                      />
                    </>
                  )}

                  {/* TEMPERATURE or ALL Lines */}
                  {(metricMode === 'TEMPERATURE' || metricMode === 'ALL') && (
                    <Line
                      type="monotone"
                      dataKey="temperature"
                      name="Temperature (°C)"
                      stroke="#d97706"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: '#d97706', stroke: '#ffffff', strokeWidth: 2 }}
                      activeDot={{ r: 6, stroke: '#ffffff', strokeWidth: 2 }}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Quick Chart Legends & Actions */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
              <div className="flex flex-wrap items-center gap-3 text-slate-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-1 rounded-full bg-[#e11d48]" />
                  <span>Systolic</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-1 rounded-full bg-[#ea580c]" />
                  <span>Diastolic</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-1 rounded-full bg-[#2563eb]" />
                  <span>Pulse / HR</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-1 rounded-full bg-[#059669]" />
                  <span>SpO2</span>
                </span>
              </div>

              <button
                type="button"
                onClick={() => setShowDataTable(!showDataTable)}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
              >
                <span>{showDataTable ? 'Hide' : 'View'} Detailed Vitals Log Table</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showDataTable ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Collapsible Detailed Vitals Log Table */}
            {showDataTable && (
              <div className="mt-3 border border-slate-200 rounded-xl overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <tr>
                      <th className="py-2.5 px-3">Date & Time</th>
                      <th className="py-2.5 px-3">BP (Sys/Dia)</th>
                      <th className="py-2.5 px-3">Heart Rate</th>
                      <th className="py-2.5 px-3">SpO2</th>
                      <th className="py-2.5 px-3">Temp</th>
                      <th className="py-2.5 px-3">Resp Rate</th>
                      <th className="py-2.5 px-3">Recorded By</th>
                      <th className="py-2.5 px-3">Clinical Note</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {chartData.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50/70">
                        <td className="py-2 px-3 font-mono text-slate-700 whitespace-nowrap">
                          {row.timestamp}
                        </td>
                        <td className="py-2 px-3 font-mono font-bold text-slate-900">
                          {row.bloodPressureSys}/{row.bloodPressureDia} mmHg
                        </td>
                        <td className="py-2 px-3 font-mono text-blue-700 font-bold">
                          {row.heartRate} bpm
                        </td>
                        <td className="py-2 px-3 font-mono text-emerald-700 font-bold">
                          {row.oxygenSaturation}%
                        </td>
                        <td className="py-2 px-3 font-mono text-amber-700">
                          {row.temperature} °C
                        </td>
                        <td className="py-2 px-3 font-mono text-purple-700">
                          {row.respiratoryRate}/min
                        </td>
                        <td className="py-2 px-3 text-slate-600 truncate max-w-[140px]">
                          {row.recordedBy}
                        </td>
                        <td className="py-2 px-3 text-slate-500 truncate max-w-[180px]" title={row.noteTitle}>
                          {row.noteTitle}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
