import { Ward, Bed, BedType, BedStatus } from '../types/hospital';

export interface DepartmentInfo extends Ward {
  code: string;
  iconName: string;
  colorTheme: {
    bg: string;
    text: string;
    border: string;
    badgeBg: string;
    badgeText: string;
    accent: string;
  };
  description: string;
  specialties: string[];
}

export const WARDS: Ward[] = [
  {
    id: 'WARD-ICU',
    name: 'Intensive Care Unit (ICU)',
    building: 'Main Clinical Tower A',
    floor: 'Floor 3',
    type: 'Critical Care & Telemetry',
    totalBeds: 18,
    headNurse: 'Sarah Jenkins, RN',
    contactExtension: 'Ext. 3100',
  },
  {
    id: 'WARD-EMERGENCY',
    name: 'Emergency & Acute Trauma Care',
    building: 'Emergency Pavilion',
    floor: 'Ground Floor',
    type: 'Acute Trauma & Rapid Triage',
    totalBeds: 16,
    headNurse: 'Michael Alvarez, RN',
    contactExtension: 'Ext. 1099',
  },
  {
    id: 'WARD-CARDIO',
    name: 'Cardiology & Coronary Care (CCU)',
    building: 'Main Clinical Tower A',
    floor: 'Floor 4',
    type: 'Cardiovascular & Telemetry',
    totalBeds: 18,
    headNurse: 'David Thorne, RN',
    contactExtension: 'Ext. 4105',
  },
  {
    id: 'WARD-NEURO',
    name: 'Neurology & Neurosurgery Ward',
    building: 'Main Clinical Tower A',
    floor: 'Floor 5',
    type: 'Neurological Sciences & Stroke Unit',
    totalBeds: 16,
    headNurse: 'Elena Rostova, RN',
    contactExtension: 'Ext. 5102',
  },
  {
    id: 'WARD-ORTHO',
    name: 'Orthopedics & Joint Replacement',
    building: 'Clinical Tower B',
    floor: 'Floor 3',
    type: 'Musculoskeletal & Trauma',
    totalBeds: 16,
    headNurse: 'Marcus Vance, RN',
    contactExtension: 'Ext. 2310',
  },
  {
    id: 'WARD-PED',
    name: 'Pediatrics & Neonatology (PICU/NICU)',
    building: 'Clinical Tower B',
    floor: 'Floor 2',
    type: 'Pediatric & Neonatal Intensive Care',
    totalBeds: 18,
    headNurse: 'Chloe Adams, RN',
    contactExtension: 'Ext. 2200',
  },
  {
    id: 'WARD-MAT',
    name: 'Maternity, Labor & Obstetrics',
    building: 'Main Clinical Tower A',
    floor: 'Floor 2',
    type: 'Obstetrics & Maternal-Fetal Medicine',
    totalBeds: 16,
    headNurse: 'Hannah Green, RN',
    contactExtension: 'Ext. 2150',
  },
  {
    id: 'WARD-SUR',
    name: 'General Surgery & Post-Op Recovery',
    building: 'Clinical Tower B',
    floor: 'Floor 4',
    type: 'Surgical Subspecialties & Recovery',
    totalBeds: 18,
    headNurse: 'Kevin Patel, RN',
    contactExtension: 'Ext. 4208',
  },
  {
    id: 'WARD-GEN-A',
    name: 'General Internal Medicine Ward',
    building: 'Clinical Tower B',
    floor: 'Floor 1',
    type: 'Inpatient Medicine & Complex Care',
    totalBeds: 20,
    headNurse: 'Linda Becker, RN',
    contactExtension: 'Ext. 2101',
  },
  {
    id: 'WARD-ONCO',
    name: 'Medical Oncology & Infusion Center',
    building: 'Clinical Tower B',
    floor: 'Floor 5',
    type: 'Oncology, Hematology & Chemotherapy',
    totalBeds: 16,
    headNurse: 'Priya Sharma, RN',
    contactExtension: 'Ext. 5214',
  },
  {
    id: 'WARD-NEPHRO',
    name: 'Nephrology & Renal Dialysis Care',
    building: 'Medical Pavilion C',
    floor: 'Floor 4',
    type: 'Renal Care & Hemodialysis',
    totalBeds: 16,
    headNurse: 'Jonathan Wu, RN',
    contactExtension: 'Ext. 4312',
  },
  {
    id: 'WARD-PULMO',
    name: 'Pulmonology & Respiratory Care',
    building: 'Medical Pavilion C',
    floor: 'Floor 3',
    type: 'Respiratory Care & Mechanical Ventilation',
    totalBeds: 16,
    headNurse: 'Grace Miller, RN',
    contactExtension: 'Ext. 3315',
  },
  {
    id: 'WARD-GASTRO',
    name: 'Gastroenterology & Hepatic Care',
    building: 'Medical Pavilion C',
    floor: 'Floor 2',
    type: 'Digestive Diseases & Endoscopy',
    totalBeds: 16,
    headNurse: 'Carlos Mendez, RN',
    contactExtension: 'Ext. 2318',
  },
  {
    id: 'WARD-ENT-EYE',
    name: 'ENT & Ophthalmology Ward',
    building: 'Medical Pavilion C',
    floor: 'Floor 1',
    type: 'Otolaryngology & Eye Surgery',
    totalBeds: 15,
    headNurse: 'Amara Okafor, RN',
    contactExtension: 'Ext. 1320',
  },
  {
    id: 'WARD-REHAB',
    name: 'Rehabilitation & Psychiatry Care',
    building: 'Medical Pavilion C',
    floor: 'Floor 5',
    type: 'Physical Therapy & Neuro-Psychiatry',
    totalBeds: 15,
    headNurse: 'Simon Hayes, RN',
    contactExtension: 'Ext. 5322',
  },
];

export const DEPARTMENTS_METADATA: Record<string, {
  code: string;
  iconName: string;
  colorTheme: {
    bg: string;
    text: string;
    border: string;
    badgeBg: string;
    badgeText: string;
    accent: string;
  };
  description: string;
  specialties: string[];
}> = {
  'WARD-ICU': {
    code: 'ICU',
    iconName: 'Activity',
    colorTheme: {
      bg: 'bg-rose-50',
      text: 'text-rose-900',
      border: 'border-rose-200',
      badgeBg: 'bg-rose-100',
      badgeText: 'text-rose-800',
      accent: 'rose',
    },
    description: 'Level 1 Critical Care providing multi-organ telemetry and life-support intervention.',
    specialties: ['Invasive Hemodynamics', 'Mechanical Ventilation', 'Arterial Monitoring', 'Septic Shock Management'],
  },
  'WARD-EMERGENCY': {
    code: 'ER',
    iconName: 'Flame',
    colorTheme: {
      bg: 'bg-red-50',
      text: 'text-red-900',
      border: 'border-red-200',
      badgeBg: 'bg-red-100',
      badgeText: 'text-red-800',
      accent: 'red',
    },
    description: 'Rapid resuscitation and triage bays for acute medical crises and trauma.',
    specialties: ['Triage Scoring', 'Resuscitation Bays', 'Acute Trauma', 'Poison Control'],
  },
  'WARD-CARDIO': {
    code: 'CCU',
    iconName: 'HeartPulse',
    colorTheme: {
      bg: 'bg-pink-50',
      text: 'text-pink-900',
      border: 'border-pink-200',
      badgeBg: 'bg-pink-100',
      badgeText: 'text-pink-800',
      accent: 'pink',
    },
    description: 'Continuous 12-lead ECG telemetry monitoring and post-angioplasty coronary observation.',
    specialties: ['Holter Telemetry', 'Post-Cath Monitoring', 'Arrhythmia Management', 'Heart Failure Care'],
  },
  'WARD-NEURO': {
    code: 'NEU',
    iconName: 'Brain',
    colorTheme: {
      bg: 'bg-indigo-50',
      text: 'text-indigo-900',
      border: 'border-indigo-200',
      badgeBg: 'bg-indigo-100',
      badgeText: 'text-indigo-800',
      accent: 'indigo',
    },
    description: 'Neuro-vascular stroke unit and specialized post-craniotomy inpatient monitoring.',
    specialties: ['Stroke Telemetry', 'Intracranial Pressure (ICP)', 'EEG Monitoring', 'Seizure Precautions'],
  },
  'WARD-ORTHO': {
    code: 'ORT',
    iconName: 'Bone',
    colorTheme: {
      bg: 'bg-amber-50',
      text: 'text-amber-900',
      border: 'border-amber-200',
      badgeBg: 'bg-amber-100',
      badgeText: 'text-amber-800',
      accent: 'amber',
    },
    description: 'Orthopedic inpatient suite for total joint replacements, spinal surgeries, and skeletal traction.',
    specialties: ['Joint Arthroplasty', 'Spinal Fixation', 'Traction Beds', 'Early Mobility Protocols'],
  },
  'WARD-PED': {
    code: 'PED',
    iconName: 'Baby',
    colorTheme: {
      bg: 'bg-sky-50',
      text: 'text-sky-900',
      border: 'border-sky-200',
      badgeBg: 'bg-sky-100',
      badgeText: 'text-sky-800',
      accent: 'sky',
    },
    description: 'Family-centered pediatric and neonatal inpatient ward with dedicated child-friendly rooms.',
    specialties: ['Neonatal Incubators', 'Pediatric Pulmonology', 'Child Life Therapy', 'Pediatric Fluid Protocols'],
  },
  'WARD-MAT': {
    code: 'MAT',
    iconName: 'HeartHandshake',
    colorTheme: {
      bg: 'bg-fuchsia-50',
      text: 'text-fuchsia-900',
      border: 'border-fuchsia-200',
      badgeBg: 'bg-fuchsia-100',
      badgeText: 'text-fuchsia-800',
      accent: 'fuchsia',
    },
    description: 'Integrated labor, delivery, recovery, and postpartum (LDRP) birthing suites.',
    specialties: ['Fetal Heart Monitoring', 'Postpartum Care', 'Lactation Consultation', 'High-Risk Pregnancy'],
  },
  'WARD-SUR': {
    code: 'SUR',
    iconName: 'Scissors',
    colorTheme: {
      bg: 'bg-blue-50',
      text: 'text-blue-900',
      border: 'border-blue-200',
      badgeBg: 'bg-blue-100',
      badgeText: 'text-blue-800',
      accent: 'blue',
    },
    description: 'Post-anesthesia surgical recovery ward with surgical drainage and wound care monitoring.',
    specialties: ['Post-Op Telemetry', 'Negative Pressure Wound Therapy', 'PCA Pumps', 'Surgical Drain Care'],
  },
  'WARD-GEN-A': {
    code: 'GEN',
    iconName: 'Stethoscope',
    colorTheme: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-900',
      border: 'border-emerald-200',
      badgeBg: 'bg-emerald-100',
      badgeText: 'text-emerald-800',
      accent: 'emerald',
    },
    description: 'Comprehensive adult internal medicine treating metabolic, infectious, and systemic conditions.',
    specialties: ['Multimorbidity', 'Geriatric Consultation', 'Infectious Diseases', 'Diabetes & Endocrinology'],
  },
  'WARD-ONCO': {
    code: 'ONC',
    iconName: 'Shield',
    colorTheme: {
      bg: 'bg-violet-50',
      text: 'text-violet-900',
      border: 'border-violet-200',
      badgeBg: 'bg-violet-100',
      badgeText: 'text-violet-800',
      accent: 'violet',
    },
    description: 'HEPA-filtered positive pressure oncology inpatient rooms for chemotherapy infusion.',
    specialties: ['HEPA Filtration', 'Chemotherapy Infusion', 'Neutropenic Isolation', 'Palliative Oncology'],
  },
  'WARD-NEPHRO': {
    code: 'NEP',
    iconName: 'Droplet',
    colorTheme: {
      bg: 'bg-teal-50',
      text: 'text-teal-900',
      border: 'border-teal-200',
      badgeBg: 'bg-teal-100',
      badgeText: 'text-teal-800',
      accent: 'teal',
    },
    description: 'Renal care unit featuring bedside hemodialysis and continuous renal replacement therapy.',
    specialties: ['Hemodialysis', 'Peritoneal Dialysis', 'CRRT Protocol', 'Electrolyte Imbalance'],
  },
  'WARD-PULMO': {
    code: 'PUL',
    iconName: 'Wind',
    colorTheme: {
      bg: 'bg-cyan-50',
      text: 'text-cyan-900',
      border: 'border-cyan-200',
      badgeBg: 'bg-cyan-100',
      badgeText: 'text-cyan-800',
      accent: 'cyan',
    },
    description: 'Dedicated respiratory ward managing severe asthma, COPD exacerbation, and pneumonia.',
    specialties: ['High-Flow Nasal Cannula', 'BiPAP / CPAP Monitoring', 'Chest Tube Drainage', 'Blood Gas Analysis'],
  },
  'WARD-GASTRO': {
    code: 'GAS',
    iconName: 'Apple',
    colorTheme: {
      bg: 'bg-orange-50',
      text: 'text-orange-900',
      border: 'border-orange-200',
      badgeBg: 'bg-orange-100',
      badgeText: 'text-orange-800',
      accent: 'orange',
    },
    description: 'Gastroenterology and hepatic unit treating acute pancreatitis, GI bleeds, and liver cirrhosis.',
    specialties: ['GI Bleed Telemetry', 'Total Parenteral Nutrition (TPN)', 'Paracentesis', 'Hepatic Encephalopathy'],
  },
  'WARD-ENT-EYE': {
    code: 'ENT',
    iconName: 'Eye',
    colorTheme: {
      bg: 'bg-lime-50',
      text: 'text-lime-900',
      border: 'border-lime-200',
      badgeBg: 'bg-lime-100',
      badgeText: 'text-lime-800',
      accent: 'lime',
    },
    description: 'Specialized head, neck, and sensory recovery ward for corneal transplants and microvascular ENT procedures.',
    specialties: ['Airway Observation', 'Microsurgical Flap Checks', 'Post-Cataract Care', 'Head & Neck Oncology'],
  },
  'WARD-REHAB': {
    code: 'REH',
    iconName: 'Accessibility',
    colorTheme: {
      bg: 'bg-slate-50',
      text: 'text-slate-900',
      border: 'border-slate-200',
      badgeBg: 'bg-slate-100',
      badgeText: 'text-slate-800',
      accent: 'slate',
    },
    description: 'Subacute physical therapy, stroke rehab, gait training, and neuro-psychiatric recuperation.',
    specialties: ['Gait Retraining', 'Cognitive Rehabilitation', 'Occupational Therapy', 'Physiotherapy Gym'],
  },
};

// Generates 15 to 20 realistic beds for each of the 15 wards (Total 250 beds)
function generateAllBeds(): Bed[] {
  const result: Bed[] = [];

  // Configuration for each ward's bed generation
  const configs: Array<{
    wardId: string;
    wardName: string;
    building: string;
    floor: string;
    count: number;
    prefix: string;
    bedType: BedType;
    roomPrefix: string;
    equipmentPool: string[];
  }> = [
    {
      wardId: 'WARD-ICU',
      wardName: 'Intensive Care Unit (ICU)',
      building: 'Main Clinical Tower A',
      floor: 'Floor 3',
      count: 18,
      prefix: 'ICU-',
      bedType: 'ICU',
      roomPrefix: 'Room 3',
      equipmentPool: ['Philips IntelliVue Multi-Lead Monitor', 'Hamilton-C6 Mechanical Ventilator', 'Baxter Sigma Spectrum IV Pump', 'Arterial Blood Gas Line'],
    },
    {
      wardId: 'WARD-EMERGENCY',
      wardName: 'Emergency & Acute Trauma Care',
      building: 'Emergency Pavilion',
      floor: 'Ground Floor',
      count: 16,
      prefix: 'ER-',
      bedType: 'SURGICAL',
      roomPrefix: 'Bay ',
      equipmentPool: ['Zoll R-Series Defibrillator & ECG', 'Mindray Multi-Param Vital Monitor', 'Wall Suction & High-Flow O2'],
    },
    {
      wardId: 'WARD-CARDIO',
      wardName: 'Cardiology & Coronary Care (CCU)',
      building: 'Main Clinical Tower A',
      floor: 'Floor 4',
      count: 18,
      prefix: 'CARD-4',
      bedType: 'CARDIAC',
      roomPrefix: 'Room 4',
      equipmentPool: ['GE Healthcare Apex Telemetry Transmitter', 'Automated External Pacing Unit', 'Alaris Smart IV Infusion Pump'],
    },
    {
      wardId: 'WARD-NEURO',
      wardName: 'Neurology & Neurosurgery Ward',
      building: 'Main Clinical Tower A',
      floor: 'Floor 5',
      count: 16,
      prefix: 'NEU-5',
      bedType: 'STANDARD',
      roomPrefix: 'Room 5',
      equipmentPool: ['Natus Continuous Video EEG Telemetry', 'ICP Pressure Transducer', 'Continuous Pulse Oximeter'],
    },
    {
      wardId: 'WARD-ORTHO',
      wardName: 'Orthopedics & Joint Replacement',
      building: 'Clinical Tower B',
      floor: 'Floor 3',
      count: 16,
      prefix: 'ORT-3',
      bedType: 'ORTHOPEDIC',
      roomPrefix: 'Room 3',
      equipmentPool: ['Balkan Frame Skeletal Traction', 'Continuous Passive Motion (CPM) Machine', 'DVT Sequential Compression Device'],
    },
    {
      wardId: 'WARD-PED',
      wardName: 'Pediatrics & Neonatology (PICU/NICU)',
      building: 'Clinical Tower B',
      floor: 'Floor 2',
      count: 18,
      prefix: 'PED-2',
      bedType: 'PEDIATRIC',
      roomPrefix: 'Room 2',
      equipmentPool: ['Giraffe Omnibed Infant Incubator', 'Masimo Rainbow Pediatric Pulse Oximeter', 'B. Braun Perfusor Syringe Pump'],
    },
    {
      wardId: 'WARD-MAT',
      wardName: 'Maternity, Labor & Obstetrics',
      building: 'Main Clinical Tower A',
      floor: 'Floor 2',
      count: 16,
      prefix: 'MAT-2',
      bedType: 'MATERNITY',
      roomPrefix: 'Suite 2',
      equipmentPool: ['GE Corometrics Fetal/Maternal Monitor', 'Hill-Rom Affinity 4 Birthing Bed', 'Panda Infant Warmer'],
    },
    {
      wardId: 'WARD-SUR',
      wardName: 'General Surgery & Post-Op Recovery',
      building: 'Clinical Tower B',
      floor: 'Floor 4',
      count: 18,
      prefix: 'SUR-4',
      bedType: 'SURGICAL',
      roomPrefix: 'Room 4',
      equipmentPool: ['KCI VAC Ulta Negative Pressure Therapy', 'Bair Hugger Patient Warming System', 'Welch Allyn Vital Signs Monitor'],
    },
    {
      wardId: 'WARD-GEN-A',
      wardName: 'General Internal Medicine Ward',
      building: 'Clinical Tower B',
      floor: 'Floor 1',
      count: 20,
      prefix: 'GEN-1',
      bedType: 'STANDARD',
      roomPrefix: 'Room 1',
      equipmentPool: ['Welch Allyn Connex Spot Monitor', 'CareFusion Alaris Syringe Pump', 'Low-Air-Loss Pressure Relief Mattress'],
    },
    {
      wardId: 'WARD-ONCO',
      wardName: 'Medical Oncology & Infusion Center',
      building: 'Clinical Tower B',
      floor: 'Floor 5',
      count: 16,
      prefix: 'ONC-5',
      bedType: 'ONCOLOGY',
      roomPrefix: 'Room 5',
      equipmentPool: ['HEPA Continuous Laminar Air Filter', 'Chemotherapy Closed Transfer IV System', 'Comfort Electric Recliner Bed'],
    },
    {
      wardId: 'WARD-NEPHRO',
      wardName: 'Nephrology & Renal Dialysis Care',
      building: 'Medical Pavilion C',
      floor: 'Floor 4',
      count: 16,
      prefix: 'NEP-4',
      bedType: 'DIALYSIS',
      roomPrefix: 'Room 4',
      equipmentPool: ['Fresenius 5008S Dialysis Machine', 'In-Line Blood Volume Monitor', 'Purified RO Water Connection'],
    },
    {
      wardId: 'WARD-PULMO',
      wardName: 'Pulmonology & Respiratory Care',
      building: 'Medical Pavilion C',
      floor: 'Floor 3',
      count: 16,
      prefix: 'PUL-3',
      bedType: 'ISOLATION',
      roomPrefix: 'Room 3',
      equipmentPool: ['Airvo 2 High Flow Nasal Cannula', 'Respironics V60 BiPAP Ventilator', 'Atrium Oasis Dry Suction Chest Drain'],
    },
    {
      wardId: 'WARD-GASTRO',
      wardName: 'Gastroenterology & Hepatic Care',
      building: 'Medical Pavilion C',
      floor: 'Floor 2',
      count: 16,
      prefix: 'GAS-2',
      bedType: 'STANDARD',
      roomPrefix: 'Room 2',
      equipmentPool: ['Olympus Mobile Video Cart', 'Kangaroo Joey Enteral Feeding Pump', 'Suction Canister System'],
    },
    {
      wardId: 'WARD-ENT-EYE',
      wardName: 'ENT & Ophthalmology Ward',
      building: 'Medical Pavilion C',
      floor: 'Floor 1',
      count: 15,
      prefix: 'ENT-1',
      bedType: 'SURGICAL',
      roomPrefix: 'Room 1',
      equipmentPool: ['Haag-Streit Slit Lamp Unit', 'Storz Micro-ENT Fiberoptic Light Source', 'Head-Elevated Precision Bed'],
    },
    {
      wardId: 'WARD-REHAB',
      wardName: 'Rehabilitation & Psychiatry Care',
      building: 'Medical Pavilion C',
      floor: 'Floor 5',
      count: 15,
      prefix: 'REH-5',
      bedType: 'REHAB',
      roomPrefix: 'Room 5',
      equipmentPool: ['Hoyer Patient Ceiling Lift', 'Low-Height Anti-Fall Sensory Mattress', 'Overbed Physical Therapy Trapeze'],
    },
  ];

  // Specific occupied beds that correspond to existing mock admissions
  const PRESET_OCCUPIED_BEDS: Record<string, { patientId: string; patientName: string; admissionId: string; notes: string }> = {
    'ICU-01': {
      patientId: 'PAT-2026-00125',
      patientName: 'Eleanor Bennett',
      admissionId: 'ADM-2026-003',
      notes: 'Arterial line & central line active. Invasive hemodynamics monitoring. Verified by BME Boobalan S.',
    },
    'ICU-04': {
      patientId: 'PAT-2026-00104',
      patientName: 'Martha Jenkins',
      admissionId: 'ADM-2026-008',
      notes: 'Acute respiratory distress. BiPAP support and continuous SpO2 telemetry.',
    },
    'ER-02': {
      patientId: 'PAT-2026-00105',
      patientName: 'Tariq Al-Mansoor',
      admissionId: 'ADM-2026-009',
      notes: 'Post motor vehicle accident triage. Cervical collar stabilized, awaiting imaging.',
    },
    'CARD-402': {
      patientId: 'PAT-2026-00106',
      patientName: 'William Sterling',
      admissionId: 'ADM-2026-010',
      notes: 'Unstable angina observation. Continuous 12-lead telemetry channel active.',
    },
    'CARD-403': {
      patientId: 'PAT-2026-00108',
      patientName: 'Marcus Vance',
      admissionId: 'ADM-2026-002',
      notes: 'Post-NSTEMI stabilization. Beta-blocker titration in progress.',
    },
    'PED-201': {
      patientId: 'PAT-2026-00109',
      patientName: 'Liam Chen',
      admissionId: 'ADM-2026-004',
      notes: 'Acute status asthmaticus. Continuous nebulizer and pediatric telemetry.',
    },
    'GEN-101': {
      patientId: 'PAT-2026-00102',
      patientName: 'Elena Martinez',
      admissionId: 'ADM-2026-006',
      notes: 'Pneumonia IV antibiotic therapy day 2. Stable, resting comfortably.',
    },
    'GEN-103': {
      patientId: 'PAT-2026-00101',
      patientName: "Mary O'Connor",
      admissionId: 'ADM-2026-005',
      notes: 'Cellulitis right lower limb. Elevating leg and IV Cefazolin infusion.',
    },
    'GEN-104': {
      patientId: 'PAT-2026-00100',
      patientName: 'Thomas Bennett',
      admissionId: 'ADM-2026-001',
      notes: 'Post-op lap cholecystectomy day 1. Ambulation encouraged, diet tolerated.',
    },
  };

  // Additional mock occupants across various wards to make each department feel alive
  const ADDITIONAL_OCCUPANTS: Array<{
    targetWard: string;
    bedIndex: number;
    patientId: string;
    patientName: string;
    notes: string;
  }> = [
    { targetWard: 'WARD-NEURO', bedIndex: 2, patientId: 'PAT-2026-00115', patientName: 'Sophia Lin', notes: 'Post ischemic stroke tPA therapy. NIHSS score monitored every 4 hours.' },
    { targetWard: 'WARD-ORTHO', bedIndex: 3, patientId: 'PAT-2026-00118', patientName: 'Arthur Pendelton', notes: 'Right total hip arthroplasty day 1. Physical therapy session completed.' },
    { targetWard: 'WARD-MAT', bedIndex: 1, patientId: 'PAT-2026-00122', patientName: 'Claire Dupont', notes: 'Active labor stage 1. Fetal heart rate baseline 142 bpm reactive.' },
    { targetWard: 'WARD-SUR', bedIndex: 4, patientId: 'PAT-2026-00128', patientName: 'Gordon Ramsey', notes: 'Emergency appendectomy recovery. Surgical dressing dry and intact.' },
    { targetWard: 'WARD-ONCO', bedIndex: 2, patientId: 'PAT-2026-00130', patientName: 'Deepak Patel', notes: 'Cycle 3 FOLFOX chemotherapy infusion. Antiemetic premedication administered.' },
    { targetWard: 'WARD-NEPHRO', bedIndex: 1, patientId: 'PAT-2026-00133', patientName: 'Maria Vasquez', notes: 'End-stage renal disease. Intermittent hemodialysis schedule (MWF).' },
    { targetWard: 'WARD-PULMO', bedIndex: 3, patientId: 'PAT-2026-00136', patientName: 'Harold Finch', notes: 'COPD acute exacerbation. High-flow oxygen 40% with SpO2 maintaining at 92%.' },
    { targetWard: 'WARD-GASTRO', bedIndex: 2, patientId: 'PAT-2026-00140', patientName: 'Nancy Wheeler', notes: 'Acute pancreatitis under conservative bowel rest and fluid resuscitation.' },
    { targetWard: 'WARD-ENT-EYE', bedIndex: 1, patientId: 'PAT-2026-00142', patientName: 'Ethan Hunt', notes: 'Post endoscopic sinus surgery (FESS). Nasal splints in place.' },
    { targetWard: 'WARD-REHAB', bedIndex: 2, patientId: 'PAT-2026-00145', patientName: 'Margaret Thatcher', notes: 'Post-stroke gait rehabilitation. Parallel bars training underway.' },
  ];

  configs.forEach((cfg) => {
    for (let i = 1; i <= cfg.count; i++) {
      // Calculate formatted id:
      // For ICU: ICU-01, ICU-02 ... ICU-18
      // For ER: ER-01, ER-02 ... ER-16
      // For others: e.g. CARD-401..418, NEU-501..516, etc.
      let bedId = '';
      if (cfg.prefix === 'ICU-' || cfg.prefix === 'ER-') {
        bedId = `${cfg.prefix}${String(i).padStart(2, '0')}`;
      } else {
        bedId = `${cfg.prefix}${String(i).padStart(2, '0')}`;
      }

      // Room grouping: ~3-4 beds per room
      const roomNum = Math.ceil(i / 3);
      const roomNumber = `${cfg.roomPrefix}${roomNum < 10 ? '0' + roomNum : roomNum}`;

      // Check preset occupancy
      const preset = PRESET_OCCUPIED_BEDS[bedId];
      const additionalOcc = ADDITIONAL_OCCUPANTS.find((o) => o.targetWard === cfg.wardId && o.bedIndex === i);

      let status: BedStatus = 'AVAILABLE';
      let currentPatientId: string | undefined = undefined;
      let currentPatientName: string | undefined = undefined;
      let currentAdmissionId: string | undefined = undefined;
      let notes: string | undefined = undefined;

      if (preset) {
        status = 'OCCUPIED';
        currentPatientId = preset.patientId;
        currentPatientName = preset.patientName;
        currentAdmissionId = preset.admissionId;
        notes = preset.notes;
      } else if (additionalOcc) {
        status = 'OCCUPIED';
        currentPatientId = additionalOcc.patientId;
        currentPatientName = additionalOcc.patientName;
        notes = additionalOcc.notes;
      } else if (i === cfg.count) {
        // Last bed in maintenance or cleaning
        status = 'MAINTENANCE';
        notes = 'Biomedical engineering telemetry audit & sensor calibration (Lead: Boobalan S, BME-2026).';
      } else if (i === cfg.count - 1) {
        status = 'CLEANING';
        notes = 'Terminal sanitization & UV-C environmental disinfection in progress.';
      } else if (i === 5 || i === 9) {
        status = 'OCCUPIED';
        currentPatientName = `Inpatient #${cfg.prefix}${i * 11}`;
        notes = 'Admitted under standard clinical protocol.';
      } else if (i === 7) {
        status = 'RESERVED';
        notes = 'Reserved for inbound emergency referral transfer.';
      } else {
        status = 'AVAILABLE';
        notes = 'Sanitized, inspected, and ready for immediate patient assignment.';
      }

      // Bed equipment
      const equipmentAssigned = [
        cfg.equipmentPool[(i - 1) % cfg.equipmentPool.length],
        cfg.equipmentPool[i % cfg.equipmentPool.length],
      ];

      result.push({
        id: bedId,
        building: cfg.building,
        floor: cfg.floor,
        wardId: cfg.wardId,
        wardName: cfg.wardName,
        roomNumber,
        bedType: cfg.bedType,
        status,
        currentPatientId,
        currentPatientName,
        currentAdmissionId,
        lastUpdated: '2026-09-21 21:00',
        notes,
        equipmentAssigned,
      });
    }
  });

  return result;
}

export const INITIAL_BEDS: Bed[] = generateAllBeds();
