export type UserRole = 'ADMIN' | 'DOCTOR' | 'NURSE' | 'RECEPTION' | 'BIOMEDICAL';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  avatar?: string;
  badgeNumber: string;
}

export type BedStatus = 'AVAILABLE' | 'RESERVED' | 'OCCUPIED' | 'CLEANING' | 'MAINTENANCE';

export type BedType =
  | 'STANDARD'
  | 'ICU'
  | 'CARDIAC'
  | 'ISOLATION'
  | 'PEDIATRIC'
  | 'SURGICAL'
  | 'MATERNITY'
  | 'DIALYSIS'
  | 'ONCOLOGY'
  | 'ORTHOPEDIC'
  | 'REHAB';

export interface Bed {
  id: string; // e.g. "ICU-01", "GEN-101", etc.
  building: string;
  floor: string;
  wardId: string;
  wardName: string;
  roomNumber: string;
  bedType: BedType;
  status: BedStatus;
  currentPatientId?: string;
  currentPatientName?: string;
  currentAdmissionId?: string;
  lastUpdated: string;
  notes?: string;
  equipmentAssigned?: string[];
}

export interface Ward {
  id: string;
  name: string;
  building: string;
  floor: string;
  type: string;
  totalBeds: number;
  headNurse: string;
  contactExtension: string;
}

export interface VitalSign {
  id: string;
  timestamp: string;
  heartRate: number; // bpm
  bloodPressureSys: number; // mmHg
  bloodPressureDia: number; // mmHg
  temperature: number; // °C
  respiratoryRate: number; // breaths/min
  oxygenSaturation: number; // %
  recordedBy: string;
}

export interface ClinicalRecord {
  id: string;
  visitId: string;
  patientId: string;
  timestamp: string;
  recordType: 'DOCTOR_NOTE' | 'NURSING_NOTE' | 'OBSERVATION' | 'PROCEDURE' | 'INVESTIGATION';
  authorName: string;
  authorRole: UserRole;
  title: string;
  content: string;
  symptoms?: string[];
  vitals?: VitalSign;
}

export interface Prescription {
  id: string;
  visitId: string;
  patientId: string;
  medicineName: string;
  dosage: string; // e.g. "500 mg"
  frequency: string; // e.g. "TDS (3 times a day)"
  route: 'Oral' | 'IV' | 'IM' | 'Subcutaneous' | 'Inhalation' | 'Topical';
  duration: string; // e.g. "5 days"
  prescribingDoctor: string;
  prescribedAt: string;
  instructions: string;
  status: 'ACTIVE' | 'COMPLETED' | 'DISCONTINUED';
}

export type DocumentCategory =
  | 'Laboratory Report'
  | 'X-Ray'
  | 'CT Report'
  | 'MRI Report'
  | 'Ultrasound Report'
  | 'Prescription'
  | 'Medical Certificate'
  | 'Discharge Summary'
  | 'Insurance Document'
  | 'Consent Document'
  | 'Other';

export interface PatientDocument {
  id: string;
  patientId: string;
  visitId: string;
  name: string;
  category: DocumentCategory;
  uploadDate: string;
  uploadedBy: string;
  fileType: string;
  fileSize: string;
  summary?: string;
  downloadUrl?: string;
}

export interface DischargeRecord {
  id: string;
  patientId: string;
  admissionId: string;
  admissionDate: string;
  dischargeDate: string;
  attendingDoctor: string;
  finalDiagnosis: string;
  clinicalSummary: string;
  treatmentSummary: string;
  dischargeCondition: 'Recovered' | 'Improved' | 'Stable' | 'Transferred' | 'Against Medical Advice';
  medicationInstructions: string;
  followUpInstructions: string;
  dischargeNotes: string;
  approvedBy: string;
}

export type AdmissionType = 'Emergency' | 'Routine' | 'Referral' | 'Elective' | 'Urgent' | 'Transfer';
export type AdmissionStatus = 'ACTIVE' | 'DISCHARGED';

export interface AdmissionVisit {
  id: string; // e.g. "ADM-2026-081"
  patientId: string;
  visitNumber: number;
  admissionDate: string;
  dischargeDate?: string;
  status: AdmissionStatus;
  admissionType: AdmissionType;
  department: string;
  wardId: string;
  wardName: string;
  bedId: string;
  attendingDoctor: string;
  reasonForAdmission: string;
  initialDiagnosis: string;
  initialClinicalNotes: string;
  dischargeRecord?: DischargeRecord;
}

export interface Patient {
  id: string; // e.g. "PAT-2026-00125"
  fullName: string;
  dob: string; // YYYY-MM-DD
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  phone: string;
  email?: string;
  address: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  bloodGroup: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  allergies: string[];
  chronicConditions: string[];
  registeredDate: string;
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  currentAdmissionId?: string;
  status: 'Inpatient' | 'Outpatient' | 'Discharged';
}

export interface NotificationItem {
  id: string;
  type: 'ADMISSION' | 'DISCHARGE_PENDING' | 'BED_AVAILABLE' | 'CLEANING_REQUIRED' | 'MAINTENANCE_DUE' | 'ADMIN_ALERT';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  relatedBedId?: string;
  relatedPatientId?: string;
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  category: 'PATIENT' | 'BED' | 'ADMISSION' | 'DISCHARGE' | 'CLINICAL' | 'DOCUMENT' | 'AUTH' | 'SYSTEM';
  details: string;
  recordAffected: string;
}

export interface HospitalStats {
  totalBeds: number;
  availableBeds: number;
  occupiedBeds: number;
  reservedBeds: number;
  cleaningBeds: number;
  maintenanceBeds: number;
  totalPatients: number;
  currentAdmissions: number;
  todayAdmissions: number;
  todayDischarges: number;
  occupancyRate: number;
  icuTotal: number;
  icuAvailable: number;
  icuOccupied: number;
  totalDevices?: number;
  workingDevices?: number;
  maintenanceDevices?: number;
}

export type DeviceWorkingStatus =
  | 'WORKING_PROPERLY'
  | 'NEEDS_CALIBRATION'
  | 'UNDER_MAINTENANCE'
  | 'FAULT_DETECTED';

export interface MedicalDevice {
  id: string; // e.g. "DEV-ICU-001"
  name: string; // e.g. "Mindray SV300 ICU Mechanical Ventilator"
  company: string; // e.g. "Mindray Medical", "GE Healthcare", "Philips Healthcare"
  purchaseDate: string; // e.g. "2023-04-15"
  purchaseCost?: string; // e.g. "₹12,80,000"
  warrantyExpiry: string; // e.g. "2028-04-14"
  supplier?: string; // e.g. "Apex MedTech BioEquip India Ltd"
  installationDate?: string; // e.g. "2023-04-20"
  modelNumber: string;
  serialNumber: string;
  category:
    | 'Ventilator'
    | 'Patient Monitor'
    | 'Infusion Pump'
    | 'Defibrillator'
    | 'Dialysis Machine'
    | 'Diagnostic & Imaging'
    | 'Surgical Equipment'
    | 'Respiratory & Suction';
  assignedWardId: string;
  assignedWardName: string;
  assignedBedId: string;
  status: DeviceWorkingStatus;
  lastCheckedDate: string;
  lastCheckedBy: string;
  lastCheckedBadge: string;
  electricalSafetyPassed: boolean;
  calibrationPassed: boolean;
  alarmFunctional: boolean;
  batteryBackupPercent: number;
  notes?: string;
  nextScheduledCheck: string;
}

