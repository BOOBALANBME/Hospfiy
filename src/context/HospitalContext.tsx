import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  User,
  UserRole,
  Bed,
  BedStatus,
  Ward,
  Patient,
  AdmissionVisit,
  ClinicalRecord,
  Prescription,
  PatientDocument,
  NotificationItem,
  AuditLogItem,
  HospitalStats,
  AdmissionType,
  DischargeRecord,
  MedicalDevice,
} from '../types/hospital';
import {
  DEMO_USERS,
  WARDS,
  INITIAL_BEDS,
  INITIAL_PATIENTS,
  INITIAL_ADMISSIONS,
  INITIAL_CLINICAL_RECORDS,
  INITIAL_PRESCRIPTIONS,
  INITIAL_DOCUMENTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOGS,
} from '../data/mockHospitalData';
import { INITIAL_BIOMEDICAL_DEVICES } from '../data/biomedicalDevicesData';
import {
  bulkSaveRecords,
  getAllRecords,
  enqueueSyncMutation,
} from '../lib/indexedDb';
import { syncService } from '../lib/syncService';

interface HospitalContextType {
  // Authentication & Role
  currentUser: User;
  allUsers: User[];
  switchUser: (user: User) => void;
  isLoggedIn: boolean;
  login: (email: string) => boolean;
  logout: () => void;

  // Navigation
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedPatientId: string | null;
  setSelectedPatientId: (id: string | null) => void;
  selectedBedId: string | null;
  setSelectedBedId: (id: string | null) => void;
  patientProfileSubTab: string;
  setPatientProfileSubTab: (tab: string) => void;
  navigateToPatient: (patientId: string, subTab?: string) => void;
  navigateToBed: (bedId: string) => void;
  globalSearch: string;
  setGlobalSearch: (query: string) => void;

  // Data & Collections
  wards: Ward[];
  beds: Bed[];
  patients: Patient[];
  admissions: AdmissionVisit[];
  clinicalRecords: ClinicalRecord[];
  prescriptions: Prescription[];
  documents: PatientDocument[];
  notifications: NotificationItem[];
  auditLogs: AuditLogItem[];
  stats: HospitalStats;

  // Actions
  updateBedStatus: (bedId: string, newStatus: BedStatus, notes?: string) => { success: boolean; message: string };
  addBed: (bedData: Omit<Bed, 'id' | 'lastUpdated'> & { id?: string }) => { success: boolean; message: string; bed?: Bed };
  addDevice: (deviceData: Omit<MedicalDevice, 'id'> & { id?: string }) => { success: boolean; message: string; device?: MedicalDevice };
  registerPatient: (patientData: Omit<Patient, 'id' | 'registeredDate'>) => Patient;
  createAdmission: (data: {
    patientId: string;
    admissionType: AdmissionType;
    department: string;
    wardId: string;
    bedId: string;
    attendingDoctor: string;
    reasonForAdmission: string;
    initialDiagnosis: string;
    initialClinicalNotes: string;
  }) => { success: boolean; admissionId?: string; message: string };
  processDischarge: (data: {
    admissionId: string;
    finalDiagnosis: string;
    clinicalSummary: string;
    treatmentSummary: string;
    dischargeCondition: 'Recovered' | 'Improved' | 'Stable' | 'Transferred' | 'Against Medical Advice';
    medicationInstructions: string;
    followUpInstructions: string;
    dischargeNotes: string;
  }) => { success: boolean; message: string; dischargeRecord?: DischargeRecord };
  addClinicalRecord: (record: Omit<ClinicalRecord, 'id' | 'timestamp' | 'authorName' | 'authorRole'>) => void;
  addPrescription: (prescription: Omit<Prescription, 'id' | 'prescribedAt' | 'prescribingDoctor'>) => void;
  updatePrescriptionStatus: (prescriptionId: string, status: 'ACTIVE' | 'COMPLETED' | 'DISCONTINUED') => void;
  uploadDocument: (doc: Omit<PatientDocument, 'id' | 'uploadDate' | 'uploadedBy'>) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  resetToDemoData: () => void;

  // Biomedical & Medical Device Inspection
  devices: MedicalDevice[];
  verifyDeviceWorking: (
    deviceId: string,
    engineerName?: string,
    engineerBadge?: string,
    notes?: string
  ) => void;
  reportDeviceFault: (
    deviceId: string,
    faultReason: string,
    putBedOnMaintenance?: boolean
  ) => void;

  // Helpers
  getPatientById: (id: string) => Patient | undefined;
  getBedById: (id: string) => Bed | undefined;
  getAdmissionsByPatient: (patientId: string) => AdmissionVisit[];
  getActiveAdmissionForPatient: (patientId: string) => AdmissionVisit | undefined;
  getAvailableBeds: (wardId?: string) => Bed[];
  canUserPerform: (action: string) => boolean;
}

const STORAGE_KEYS = {
  CURRENT_USER: 'hospify_hospital_user_v4',
  BEDS: 'hospify_hospital_beds_v4',
  PATIENTS: 'hospify_hospital_patients_v4',
  ADMISSIONS: 'hospify_hospital_admissions_v4',
  RECORDS: 'hospify_hospital_records_v4',
  PRESCRIPTIONS: 'hospify_hospital_prescriptions_v4',
  DOCUMENTS: 'hospify_hospital_docs_v4',
  NOTIFICATIONS: 'hospify_hospital_notifs_v4',
  AUDIT_LOGS: 'hospify_hospital_audit_v4',
  DEVICES: 'hospify_hospital_devices_v5',
};

const HospitalContext = createContext<HospitalContextType | undefined>(undefined);

export const HospitalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load from LocalStorage with fallbacks
  const [currentUser, setCurrentUser] = useState<User>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      return saved ? JSON.parse(saved) : DEMO_USERS[0];
    } catch {
      return DEMO_USERS[0];
    }
  });

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [selectedBedId, setSelectedBedId] = useState<string | null>(null);
  const [patientProfileSubTab, setPatientProfileSubTab] = useState<string>('overview');
  const [globalSearch, setGlobalSearch] = useState<string>('');

  const [wards] = useState<Ward[]>(WARDS);

  const [beds, setBeds] = useState<Bed[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BEDS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 100) {
          return parsed;
        }
      }
      return INITIAL_BEDS;
    } catch {
      return INITIAL_BEDS;
    }
  });

  const [patients, setPatients] = useState<Patient[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PATIENTS);
      return saved ? JSON.parse(saved) : INITIAL_PATIENTS;
    } catch {
      return INITIAL_PATIENTS;
    }
  });

  const [admissions, setAdmissions] = useState<AdmissionVisit[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ADMISSIONS);
      return saved ? JSON.parse(saved) : INITIAL_ADMISSIONS;
    } catch {
      return INITIAL_ADMISSIONS;
    }
  });

  const [clinicalRecords, setClinicalRecords] = useState<ClinicalRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.RECORDS);
      return saved ? JSON.parse(saved) : INITIAL_CLINICAL_RECORDS;
    } catch {
      return INITIAL_CLINICAL_RECORDS;
    }
  });

  const [prescriptions, setPrescriptions] = useState<Prescription[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRESCRIPTIONS);
      return saved ? JSON.parse(saved) : INITIAL_PRESCRIPTIONS;
    } catch {
      return INITIAL_PRESCRIPTIONS;
    }
  });

  const [documents, setDocuments] = useState<PatientDocument[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DOCUMENTS);
      return saved ? JSON.parse(saved) : INITIAL_DOCUMENTS;
    } catch {
      return INITIAL_DOCUMENTS;
    }
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  });

  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
    } catch {
      return INITIAL_AUDIT_LOGS;
    }
  });

  const [devices, setDevices] = useState<MedicalDevice[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DEVICES);
      return saved ? JSON.parse(saved) : INITIAL_BIOMEDICAL_DEVICES;
    } catch {
      return INITIAL_BIOMEDICAL_DEVICES;
    }
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BEDS, JSON.stringify(beds));
    bulkSaveRecords('beds', beds).catch(() => {});
  }, [beds]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(patients));
    bulkSaveRecords('patients', patients).catch(() => {});
  }, [patients]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ADMISSIONS, JSON.stringify(admissions));
    bulkSaveRecords('admissions', admissions).catch(() => {});
  }, [admissions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(clinicalRecords));
  }, [clinicalRecords]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRESCRIPTIONS, JSON.stringify(prescriptions));
  }, [prescriptions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(auditLogs));
    bulkSaveRecords('auditLogs', auditLogs).catch(() => {});
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DEVICES, JSON.stringify(devices));
    bulkSaveRecords('devices', devices).catch(() => {});
  }, [devices]);

  // Initial IndexedDB hydration and background cloud synchronization
  useEffect(() => {
    async function initOfflineAndSync() {
      try {
        const [dbPatients, dbBeds, dbDevices, dbAdmissions, dbLogs] = await Promise.all([
          getAllRecords<Patient>('patients'),
          getAllRecords<Bed>('beds'),
          getAllRecords<MedicalDevice>('devices'),
          getAllRecords<AdmissionVisit>('admissions'),
          getAllRecords<AuditLogItem>('auditLogs'),
        ]);

        if (dbPatients.length > 0) {
          setPatients(dbPatients);
        } else {
          bulkSaveRecords('patients', patients).catch(() => {});
        }

        if (dbBeds.length > 0) {
          setBeds(dbBeds);
        } else {
          bulkSaveRecords('beds', beds).catch(() => {});
        }

        if (dbDevices.length > 0) {
          setDevices(dbDevices);
        } else {
          bulkSaveRecords('devices', devices).catch(() => {});
        }

        if (dbAdmissions.length > 0) {
          setAdmissions(dbAdmissions);
        } else {
          bulkSaveRecords('admissions', admissions).catch(() => {});
        }

        if (dbLogs.length > 0) {
          setAuditLogs(dbLogs);
        } else {
          bulkSaveRecords('auditLogs', auditLogs).catch(() => {});
        }
      } catch (err) {
        console.warn('Notice initializing IndexedDB storage:', err);
      }

      // Initial cloud sync if online
      if (typeof navigator !== 'undefined' && navigator.onLine) {
        syncService.triggerSync().catch(() => {});
      }
    }

    initOfflineAndSync();
  }, []);

  // Audit logger helper
  const logAction = (
    category: AuditLogItem['category'],
    action: string,
    details: string,
    recordAffected: string
  ) => {
    const newLog: AuditLogItem = {
      id: `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      category,
      action,
      details,
      recordAffected,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const addNotification = (
    type: NotificationItem['type'],
    title: string,
    message: string,
    priority: NotificationItem['priority'] = 'medium',
    relatedBedId?: string,
    relatedPatientId?: string
  ) => {
    const newNotif: NotificationItem = {
      id: `NOTIF-${Date.now()}`,
      type,
      title,
      message,
      timestamp: 'Just now',
      read: false,
      priority,
      relatedBedId,
      relatedPatientId,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  // Role permissions checker
  const canUserPerform = (action: string): boolean => {
    const role = currentUser.role;
    if (role === 'ADMIN') return true;

    switch (action) {
      case 'ADMIT_PATIENT':
        return role === 'RECEPTION' || role === 'DOCTOR';
      case 'REGISTER_PATIENT':
        return role === 'RECEPTION';
      case 'DISCHARGE_PATIENT':
        return role === 'DOCTOR';
      case 'ADD_CLINICAL_NOTE':
        return role === 'DOCTOR' || role === 'NURSE';
      case 'ADD_PRESCRIPTION':
        return role === 'DOCTOR';
      case 'UPDATE_BED_STATUS':
        return role === 'NURSE' || role === 'BIOMEDICAL' || role === 'RECEPTION';
      case 'CONFIRM_CLEANING':
        return role === 'NURSE' || role === 'BIOMEDICAL';
      case 'SET_MAINTENANCE':
        return role === 'BIOMEDICAL';
      case 'VIEW_AUDIT_LOGS':
        return false;
      default:
        return true;
    }
  };

  // Real-time calculated stats
  const stats: HospitalStats = useMemo(() => {
    const totalBeds = beds.length;
    const availableBeds = beds.filter((b) => b.status === 'AVAILABLE').length;
    const occupiedBeds = beds.filter((b) => b.status === 'OCCUPIED').length;
    const reservedBeds = beds.filter((b) => b.status === 'RESERVED').length;
    const cleaningBeds = beds.filter((b) => b.status === 'CLEANING').length;
    const maintenanceBeds = beds.filter((b) => b.status === 'MAINTENANCE').length;
    const currentAdmissions = admissions.filter((a) => a.status === 'ACTIVE').length;

    const icuBeds = beds.filter((b) => b.wardId === 'WARD-ICU');
    const icuTotal = icuBeds.length;
    const icuAvailable = icuBeds.filter((b) => b.status === 'AVAILABLE').length;
    const icuOccupied = icuBeds.filter((b) => b.status === 'OCCUPIED').length;

    // Today count estimation
    const todayStr = '2026-09-21';
    const todayAdmissions = admissions.filter((a) => a.admissionDate.startsWith(todayStr)).length;
    const todayDischarges = admissions.filter((a) => a.dischargeDate && a.dischargeDate.startsWith(todayStr)).length;

    const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

    return {
      totalBeds,
      availableBeds,
      occupiedBeds,
      reservedBeds,
      cleaningBeds,
      maintenanceBeds,
      totalPatients: patients.length,
      currentAdmissions,
      todayAdmissions,
      todayDischarges,
      occupancyRate,
      icuTotal,
      icuAvailable,
      icuOccupied,
      totalDevices: devices.length,
      workingDevices: devices.filter((d) => d.status === 'WORKING_PROPERLY').length,
      maintenanceDevices: devices.filter((d) => d.status === 'UNDER_MAINTENANCE' || d.status === 'FAULT_DETECTED').length,
    };
  }, [beds, admissions, patients, devices]);

  // Bed status transitions with medical workflow validation
  const updateBedStatus = (bedId: string, newStatus: BedStatus, notes?: string): { success: boolean; message: string } => {
    const targetBed = beds.find((b) => b.id === bedId);
    if (!targetBed) {
      return { success: false, message: `Bed ${bedId} not found.` };
    }

    const currentStatus = targetBed.status;

    // Validation rules
    if (currentStatus === 'OCCUPIED' && newStatus === 'AVAILABLE') {
      return {
        success: false,
        message: `Invalid transition! Bed ${bedId} is currently OCCUPIED by a patient. Must be discharged to CLEANING first.`,
      };
    }

    if (currentStatus === 'OCCUPIED' && newStatus === 'MAINTENANCE') {
      return {
        success: false,
        message: `Cannot place bed ${bedId} into MAINTENANCE while occupied by patient ${targetBed.currentPatientName || ''}. Transfer patient first.`,
      };
    }

    if (currentStatus === 'CLEANING' && newStatus === 'OCCUPIED') {
      return {
        success: false,
        message: `Sanitary Protocol Violation: Bed ${bedId} must complete terminal CLEANING and be verified AVAILABLE before patient occupancy.`,
      };
    }

    const nowFormatted = new Date().toISOString().replace('T', ' ').substring(0, 16);

    setBeds((prev) =>
      prev.map((b) => {
        if (b.id === bedId) {
          const updated: Bed = {
            ...b,
            status: newStatus,
            lastUpdated: nowFormatted,
            notes: notes !== undefined ? notes : b.notes,
          };
          if (newStatus === 'AVAILABLE' || newStatus === 'MAINTENANCE') {
            updated.currentPatientId = undefined;
            updated.currentPatientName = undefined;
            updated.currentAdmissionId = undefined;
          }
          return updated;
        }
        return b;
      })
    );

    logAction(
      'BED',
      `Bed Status: ${currentStatus} → ${newStatus}`,
      `Updated bed ${bedId} from ${currentStatus} to ${newStatus}.${notes ? ` Note: ${notes}` : ''}`,
      `Bed ${bedId}`
    );

    if (newStatus === 'CLEANING') {
      addNotification(
        'CLEANING_REQUIRED',
        `Cleaning Required: Bed ${bedId}`,
        `Bed ${bedId} (${targetBed.wardName}) requires terminal cleaning and sanitization.`,
        'high',
        bedId
      );
    } else if (newStatus === 'AVAILABLE') {
      addNotification(
        'BED_AVAILABLE',
        `Bed Ready: ${bedId}`,
        `Bed ${bedId} (${targetBed.wardName}) is now sanitized, inspected, and ready for patient intake.`,
        'low',
        bedId
      );
    } else if (newStatus === 'MAINTENANCE') {
      addNotification(
        'MAINTENANCE_DUE',
        `Bed Flagged for Maintenance: ${bedId}`,
        `Biomedical engineering flagged bed ${bedId}. Reason: ${notes || 'Service overhaul'}`,
        'medium',
        bedId
      );
    }

    enqueueSyncMutation('beds', 'STATUS_CHANGE', bedId, { status: newStatus, notes }).catch(() => {});
    syncService.triggerSync().catch(() => {});

    return { success: true, message: `Bed ${bedId} status updated to ${newStatus}.` };
  };

  // Patient Registration
  const registerPatient = (patientData: Omit<Patient, 'id' | 'registeredDate'>): Patient => {
    // Generate sequential unique ID: PAT-2026-00XXX
    const nextSeq = patients.length + 126;
    const formattedId = `PAT-2026-${String(nextSeq).padStart(5, '0')}`;
    const nowFormatted = new Date().toISOString().replace('T', ' ').substring(0, 16);

    const newPatient: Patient = {
      ...patientData,
      id: formattedId,
      registeredDate: nowFormatted,
      status: 'Outpatient',
    };

    setPatients((prev) => [newPatient, ...prev]);

    logAction(
      'PATIENT',
      'Patient Registered',
      `Registered new patient ${newPatient.fullName} (DOB: ${newPatient.dob}, Blood Group: ${newPatient.bloodGroup}). Assigned permanent ID ${newPatient.id}.`,
      newPatient.id
    );

    addNotification(
      'ADMISSION',
      `New Patient Registered: ${newPatient.fullName}`,
      `Permanent Patient ID ${newPatient.id} generated. Ready for triage or admission assignment.`,
      'low',
      undefined,
      newPatient.id
    );

    enqueueSyncMutation('patients', 'CREATE', newPatient.id, newPatient).catch(() => {});
    syncService.triggerSync().catch(() => {});

    return newPatient;
  };

  // Create Admission & Auto-assign Bed
  const createAdmission = (data: {
    patientId: string;
    admissionType: AdmissionType;
    department: string;
    wardId: string;
    bedId: string;
    attendingDoctor: string;
    reasonForAdmission: string;
    initialDiagnosis: string;
    initialClinicalNotes: string;
  }): { success: boolean; admissionId?: string; message: string } => {
    const patient = patients.find((p) => p.id === data.patientId);
    if (!patient) {
      return { success: false, message: `Patient with ID ${data.patientId} does not exist.` };
    }

    const bed = beds.find((b) => b.id === data.bedId);
    if (!bed) {
      return { success: false, message: `Selected bed ${data.bedId} does not exist.` };
    }

    if (bed.status !== 'AVAILABLE' && bed.status !== 'RESERVED') {
      return {
        success: false,
        message: `Bed ${data.bedId} is currently ${bed.status}. Only AVAILABLE or RESERVED beds can be assigned.`,
      };
    }

    // Determine visit number based on existing patient visits
    const priorVisits = admissions.filter((a) => a.patientId === data.patientId);
    const visitNumber = priorVisits.length + 1;

    const admissionId = `ADM-2026-${String(admissions.length + 10).padStart(3, '0')}`;
    const nowFormatted = new Date().toISOString().replace('T', ' ').substring(0, 16);

    const newAdmission: AdmissionVisit = {
      id: admissionId,
      patientId: data.patientId,
      visitNumber,
      admissionDate: nowFormatted,
      status: 'ACTIVE',
      admissionType: data.admissionType,
      department: data.department,
      wardId: data.wardId,
      wardName: bed.wardName,
      bedId: data.bedId,
      attendingDoctor: data.attendingDoctor,
      reasonForAdmission: data.reasonForAdmission,
      initialDiagnosis: data.initialDiagnosis,
      initialClinicalNotes: data.initialClinicalNotes,
    };

    // 1. Add Admission Visit
    setAdmissions((prev) => [newAdmission, ...prev]);

    // 2. Update Bed: set status to OCCUPIED and assign patient
    setBeds((prev) =>
      prev.map((b) => {
        if (b.id === data.bedId) {
          return {
            ...b,
            status: 'OCCUPIED',
            currentPatientId: data.patientId,
            currentPatientName: patient.fullName,
            currentAdmissionId: admissionId,
            lastUpdated: nowFormatted,
          };
        }
        return b;
      })
    );

    // 3. Update Patient: set active admission and inpatient status
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id === data.patientId) {
          return {
            ...p,
            currentAdmissionId: admissionId,
            status: 'Inpatient',
          };
        }
        return bVal(p);
      })
    );

    function bVal(p: Patient): Patient {
      return p;
    }

    // 4. Initial clinical note if provided
    if (data.initialClinicalNotes.trim()) {
      const initNote: ClinicalRecord = {
        id: `CR-ADM-${Date.now()}`,
        visitId: admissionId,
        patientId: data.patientId,
        timestamp: nowFormatted,
        recordType: 'DOCTOR_NOTE',
        authorName: data.attendingDoctor || currentUser.name,
        authorRole: 'DOCTOR',
        title: `Admission Note - Visit ${visitNumber} (${data.admissionType})`,
        content: `Reason for Admission: ${data.reasonForAdmission}\nInitial Diagnosis: ${data.initialDiagnosis}\n\nClinical Notes:\n${data.initialClinicalNotes}`,
      };
      setClinicalRecords((prev) => [initNote, ...prev]);
    }

    logAction(
      'ADMISSION',
      'Patient Admitted & Bed Assigned',
      `Admitted ${patient.fullName} (${patient.id}) into ${bed.wardName} - Bed ${bed.id}. Diagnosis: ${data.initialDiagnosis}`,
      `${patient.id} (${admissionId})`
    );

    addNotification(
      'ADMISSION',
      `New Admission: ${patient.fullName}`,
      `Assigned to Bed ${bed.id} (${bed.wardName}). Attending: ${data.attendingDoctor}.`,
      'high',
      bed.id,
      patient.id
    );

    enqueueSyncMutation('admissions', 'CREATE', newAdmission.id, newAdmission).catch(() => {});
    syncService.triggerSync().catch(() => {});

    return {
      success: true,
      admissionId,
      message: `Patient ${patient.fullName} successfully admitted to bed ${bed.id}. Bed status is now OCCUPIED.`,
    };
  };

  // Process Discharge Workflow
  const processDischarge = (data: {
    admissionId: string;
    finalDiagnosis: string;
    clinicalSummary: string;
    treatmentSummary: string;
    dischargeCondition: 'Recovered' | 'Improved' | 'Stable' | 'Transferred' | 'Against Medical Advice';
    medicationInstructions: string;
    followUpInstructions: string;
    dischargeNotes: string;
  }): { success: boolean; message: string; dischargeRecord?: DischargeRecord } => {
    const admission = admissions.find((a) => a.id === data.admissionId);
    if (!admission) {
      return { success: false, message: `Admission ${data.admissionId} not found.` };
    }

    const patient = patients.find((p) => p.id === admission.patientId);
    const bed = beds.find((b) => b.id === admission.bedId);
    const nowFormatted = new Date().toISOString().replace('T', ' ').substring(0, 16);

    const dischargeRecord = {
      id: `DISC-${Date.now()}`,
      patientId: admission.patientId,
      admissionId: admission.id,
      admissionDate: admission.admissionDate,
      dischargeDate: nowFormatted,
      attendingDoctor: admission.attendingDoctor,
      finalDiagnosis: data.finalDiagnosis,
      clinicalSummary: data.clinicalSummary,
      treatmentSummary: data.treatmentSummary,
      dischargeCondition: data.dischargeCondition,
      medicationInstructions: data.medicationInstructions,
      followUpInstructions: data.followUpInstructions,
      dischargeNotes: data.dischargeNotes,
      approvedBy: currentUser.name,
    };

    // 1. Update Admission to DISCHARGED with attached discharge record
    setAdmissions((prev) =>
      prev.map((a) => {
        if (a.id === data.admissionId) {
          return {
            ...a,
            status: 'DISCHARGED',
            dischargeDate: nowFormatted,
            dischargeRecord,
          };
        }
        return a;
      })
    );

    // 2. Remove patient from active bed & transition bed to CLEANING
    if (bed) {
      setBeds((prev) =>
        prev.map((b) => {
          if (b.id === bed.id) {
            return {
              ...b,
              status: 'CLEANING',
              currentPatientId: undefined,
              currentPatientName: undefined,
              currentAdmissionId: undefined,
              lastUpdated: nowFormatted,
              notes: `Vacated upon discharge of ${patient?.fullName || 'patient'}. Terminal sanitization required.`,
            };
          }
          return b;
        })
      );
    }

    // 3. Update Patient: status to Discharged, clear currentAdmissionId
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id === admission.patientId) {
          return {
            ...p,
            currentAdmissionId: undefined,
            status: 'Discharged',
          };
        }
        return p;
      })
    );

    // 4. Auto-generate Discharge Summary document into patient's documents collection
    const dischargeDoc: PatientDocument = {
      id: `DOC-DISC-${Date.now()}`,
      patientId: admission.patientId,
      visitId: admission.id,
      name: `Discharge_Summary_${admission.id}.pdf`,
      category: 'Discharge Summary',
      uploadDate: nowFormatted,
      uploadedBy: currentUser.name,
      fileType: 'Official Clinical Summary',
      fileSize: '320 KB',
      summary: `Final Diagnosis: ${data.finalDiagnosis}. Condition: ${data.dischargeCondition}. Follow-up: ${data.followUpInstructions}`,
    };
    setDocuments((prev) => [dischargeDoc, ...prev]);

    logAction(
      'DISCHARGE',
      'Patient Discharged & Bed Moved to CLEANING',
      `Discharged ${patient?.fullName || admission.patientId} from ${bed?.id || 'ward'}. Final Diagnosis: ${data.finalDiagnosis}. Bed status moved to CLEANING.`,
      `${admission.patientId} (${admission.id})`
    );

    addNotification(
      'CLEANING_REQUIRED',
      `Bed ${bed?.id} Vacated - Terminal Cleaning Required`,
      `${patient?.fullName} discharged. Bed ${bed?.id} in ${bed?.wardName} is now in CLEANING status.`,
      'high',
      bed?.id,
      patient?.id
    );

    enqueueSyncMutation('admissions', 'UPDATE', admission.id, {
      status: 'DISCHARGED',
      dischargeDate: nowFormatted,
      dischargeRecord,
    }).catch(() => {});
    syncService.triggerSync().catch(() => {});

    return {
      success: true,
      message: `Patient ${patient?.fullName || ''} discharged successfully. Bed ${bed?.id} has automatically transitioned to CLEANING.`,
      dischargeRecord,
    };
  };

  // Clinical record addition
  const addClinicalRecord = (record: Omit<ClinicalRecord, 'id' | 'timestamp' | 'authorName' | 'authorRole'>) => {
    const nowFormatted = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const newRecord: ClinicalRecord = {
      ...record,
      id: `CR-${Date.now()}`,
      timestamp: nowFormatted,
      authorName: currentUser.name,
      authorRole: currentUser.role,
    };

    setClinicalRecords((prev) => [newRecord, ...prev]);

    logAction(
      'CLINICAL',
      `Clinical Record Added (${record.recordType})`,
      `Added ${record.recordType} titled "${record.title}". Author: ${currentUser.name}.`,
      `${record.patientId} (${record.visitId})`
    );
  };

  // Prescription addition
  const addPrescription = (prescription: Omit<Prescription, 'id' | 'prescribedAt' | 'prescribingDoctor'>) => {
    const nowFormatted = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const newPrescription: Prescription = {
      ...prescription,
      id: `RX-${Date.now()}`,
      prescribedAt: nowFormatted,
      prescribingDoctor: currentUser.name,
    };

    setPrescriptions((prev) => [newPrescription, ...prev]);

    logAction(
      'CLINICAL',
      'Prescription Issued',
      `Prescribed ${prescription.medicineName} (${prescription.dosage}, ${prescription.frequency}, ${prescription.route}) for ${prescription.duration}.`,
      `${prescription.patientId} (${prescription.visitId})`
    );
  };

  const updatePrescriptionStatus = (prescriptionId: string, status: 'ACTIVE' | 'COMPLETED' | 'DISCONTINUED') => {
    setPrescriptions((prev) =>
      prev.map((rx) => {
        if (rx.id === prescriptionId) {
          return { ...rx, status };
        }
        return rx;
      })
    );
    logAction(
      'CLINICAL',
      `Prescription Status Changed to ${status}`,
      `Updated prescription ${prescriptionId} status to ${status}.`,
      prescriptionId
    );
  };

  // Document upload
  const uploadDocument = (doc: Omit<PatientDocument, 'id' | 'uploadDate' | 'uploadedBy'>) => {
    const nowFormatted = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const newDoc: PatientDocument = {
      ...doc,
      id: `DOC-${Date.now()}`,
      uploadDate: nowFormatted,
      uploadedBy: currentUser.name,
    };

    setDocuments((prev) => [newDoc, ...prev]);

    logAction(
      'DOCUMENT',
      `Document Uploaded (${doc.category})`,
      `Uploaded "${doc.name}" under category ${doc.category}.`,
      `${doc.patientId} (${doc.visitId})`
    );
  };

  // Notifications
  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // Reset to default demo data
  const resetToDemoData = () => {
    localStorage.removeItem(STORAGE_KEYS.BEDS);
    localStorage.removeItem(STORAGE_KEYS.PATIENTS);
    localStorage.removeItem(STORAGE_KEYS.ADMISSIONS);
    localStorage.removeItem(STORAGE_KEYS.RECORDS);
    localStorage.removeItem(STORAGE_KEYS.PRESCRIPTIONS);
    localStorage.removeItem(STORAGE_KEYS.DOCUMENTS);
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
    localStorage.removeItem(STORAGE_KEYS.AUDIT_LOGS);
    localStorage.removeItem(STORAGE_KEYS.DEVICES);

    setBeds(INITIAL_BEDS);
    setPatients(INITIAL_PATIENTS);
    setAdmissions(INITIAL_ADMISSIONS);
    setClinicalRecords(INITIAL_CLINICAL_RECORDS);
    setPrescriptions(INITIAL_PRESCRIPTIONS);
    setDocuments(INITIAL_DOCUMENTS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setDevices(INITIAL_BIOMEDICAL_DEVICES);

    logAction('SYSTEM', 'Demo Database Reset', 'Restored pristine sample hospital database.', 'System');
  };

  // Biomedical & Medical Device Testing and Verification
  const verifyDeviceWorking = (
    deviceId: string,
    engineerName: string = currentUser.name,
    engineerBadge: string = currentUser.badgeNumber,
    notes?: string
  ) => {
    const targetDev = devices.find((d) => d.id === deviceId);
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);

    setDevices((prev) =>
      prev.map((dev) => {
        if (dev.id === deviceId) {
          return {
            ...dev,
            status: 'WORKING_PROPERLY',
            lastCheckedDate: nowStr,
            lastCheckedBy: engineerName,
            lastCheckedBadge: engineerBadge,
            electricalSafetyPassed: true,
            calibrationPassed: true,
            alarmFunctional: true,
            batteryBackupPercent: Math.max(dev.batteryBackupPercent, 96),
            notes: notes || 'Medical device verified operational and working properly by Biomedical Engineering.',
          };
        }
        return dev;
      })
    );

    // If the device is assigned to a bed currently in MAINTENANCE, clear the bed to AVAILABLE
    if (targetDev && targetDev.assignedBedId) {
      const assignedBed = beds.find((b) => b.id === targetDev.assignedBedId);
      if (assignedBed && assignedBed.status === 'MAINTENANCE') {
        updateBedStatus(
          assignedBed.id,
          'AVAILABLE',
          `Biomedical device clearance approved by ${engineerName} (${engineerBadge}). ${targetDev.name} tested and certified working properly.`
        );
      }
    }

    logAction(
      'SYSTEM',
      'Biomedical Device Certified Working',
      `Device ${deviceId} (${targetDev?.name || ''}) passed safety, calibration, and functional tests by ${engineerName}.`,
      deviceId
    );

    addNotification(
      'ADMIN_ALERT',
      'Medical Device Working Verified',
      `${targetDev?.name || deviceId} at ${targetDev?.assignedWardName || 'facility'} confirmed 100% operational by Biomedical Engineer ${engineerName}.`,
      'low',
      targetDev?.assignedBedId
    );
  };

  const reportDeviceFault = (
    deviceId: string,
    faultReason: string,
    putBedOnMaintenance: boolean = true
  ) => {
    const targetDev = devices.find((d) => d.id === deviceId);
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);

    setDevices((prev) =>
      prev.map((dev) => {
        if (dev.id === deviceId) {
          return {
            ...dev,
            status: 'FAULT_DETECTED',
            lastCheckedDate: nowStr,
            lastCheckedBy: currentUser.name,
            lastCheckedBadge: currentUser.badgeNumber,
            calibrationPassed: false,
            notes: `FAULT LOGGED: ${faultReason}`,
          };
        }
        return dev;
      })
    );

    if (targetDev && targetDev.assignedBedId && putBedOnMaintenance) {
      updateBedStatus(
        targetDev.assignedBedId,
        'MAINTENANCE',
        `Biomedical Hold: Medical device ${targetDev.name} reported with fault: ${faultReason}`
      );
    }

    logAction(
      'SYSTEM',
      'Biomedical Device Fault Logged',
      `Equipment defect reported on ${deviceId}: ${faultReason}`,
      deviceId
    );

    addNotification(
      'MAINTENANCE_DUE',
      'Device Malfunction - Biomedical Alert',
      `Fault reported on ${targetDev?.name || deviceId}: "${faultReason}". Device taken offline for bench inspection.`,
      'urgent',
      targetDev?.assignedBedId
    );
  };

  // Add New Hospital Bed
  const addBed = (
    bedData: Omit<Bed, 'id' | 'lastUpdated'> & { id?: string }
  ): { success: boolean; message: string; bed?: Bed } => {
    // Generate or format bed ID
    let bedId = bedData.id?.trim().toUpperCase();
    if (!bedId) {
      const wardPrefix = bedData.wardId.replace('WARD-', '').slice(0, 4);
      const existingInWard = beds.filter((b) => b.wardId === bedData.wardId);
      const nextNum = existingInWard.length + 1;
      bedId = `${wardPrefix}-${String(nextNum).padStart(2, '0')}`;
    }

    // Check duplicate
    if (beds.some((b) => b.id.toUpperCase() === bedId)) {
      return {
        success: false,
        message: `Bed ID "${bedId}" already exists. Please assign a unique bed identifier.`,
      };
    }

    const nowFormatted = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const newBed: Bed = {
      ...bedData,
      id: bedId,
      lastUpdated: nowFormatted,
      status: bedData.status || 'AVAILABLE',
      equipmentAssigned: bedData.equipmentAssigned || [],
    };

    setBeds((prev) => [...prev, newBed]);

    logAction(
      'BED',
      'Hospital Bed Commissioned',
      `Commissioned new hospital bed ${newBed.id} (${newBed.bedType}) in ${newBed.wardName}, Room ${newBed.roomNumber}, Floor ${newBed.floor}.`,
      newBed.id
    );

    addNotification(
      'ADMIN_ALERT',
      `New Hospital Bed Added: ${newBed.id}`,
      `Bed ${newBed.id} (${newBed.bedType}) commissioned in ${newBed.wardName}. Status: ${newBed.status}.`,
      'low',
      newBed.id
    );

    enqueueSyncMutation('beds', 'CREATE', newBed.id, newBed).catch(() => {});
    syncService.triggerSync().catch(() => {});

    return {
      success: true,
      message: `Bed ${newBed.id} successfully commissioned in ${newBed.wardName}.`,
      bed: newBed,
    };
  };

  // Add New Biomedical / Medical Device
  const addDevice = (
    deviceData: Omit<MedicalDevice, 'id'> & { id?: string }
  ): { success: boolean; message: string; device?: MedicalDevice } => {
    // Generate device ID if not provided
    let devId = deviceData.id?.trim().toUpperCase();
    if (!devId) {
      const deptCode = deviceData.assignedWardId
        .replace('WARD-', '')
        .replace('DEPT-', '')
        .slice(0, 4);
      const randomSeq = Math.floor(100 + Math.random() * 900);
      devId = `DEV-${deptCode}-${randomSeq}`;
    }

    // Check duplicate
    if (devices.some((d) => d.id.toUpperCase() === devId)) {
      return {
        success: false,
        message: `Device ID "${devId}" already exists. Please provide a unique device ID.`,
      };
    }

    const nowFormatted = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const newDevice: MedicalDevice = {
      ...deviceData,
      id: devId,
      company: deviceData.company || 'Certified OEM',
      purchaseDate: deviceData.purchaseDate || new Date().toISOString().slice(0, 10),
      purchaseCost: deviceData.purchaseCost || '₹1,50,000',
      warrantyExpiry: deviceData.warrantyExpiry || 'Active (5 Years)',
      supplier: deviceData.supplier || 'Authorized MedTech Distributor',
      lastCheckedDate: deviceData.lastCheckedDate || nowFormatted,
      lastCheckedBy: deviceData.lastCheckedBy || currentUser.name,
      lastCheckedBadge: deviceData.lastCheckedBadge || currentUser.badgeNumber,
      status: deviceData.status || 'WORKING_PROPERLY',
      electricalSafetyPassed: deviceData.electricalSafetyPassed ?? true,
      calibrationPassed: deviceData.calibrationPassed ?? true,
      alarmFunctional: deviceData.alarmFunctional ?? true,
      batteryBackupPercent: deviceData.batteryBackupPercent ?? 100,
      nextScheduledCheck: deviceData.nextScheduledCheck || '2026-12-31',
    };

    setDevices((prev) => [newDevice, ...prev]);

    // Also update assigned bed's equipmentAssigned if assigned to a clinical bed
    if (newDevice.assignedBedId && newDevice.assignedBedId !== 'BME-BENCH-1') {
      setBeds((prevBeds) =>
        prevBeds.map((bed) => {
          if (bed.id === newDevice.assignedBedId) {
            const currentEq = bed.equipmentAssigned || [];
            if (!currentEq.includes(newDevice.name)) {
              return {
                ...bed,
                equipmentAssigned: [...currentEq, newDevice.name],
              };
            }
          }
          return bed;
        })
      );
    }

    logAction(
      'SYSTEM',
      'Medical Device Registered & Added',
      `Registered new ${newDevice.name} (${newDevice.id}) by ${newDevice.company} in ${newDevice.assignedWardName}.`,
      newDevice.id
    );

    addNotification(
      'ADMIN_ALERT',
      `New Device Registered: ${newDevice.name}`,
      `${newDevice.name} (${newDevice.company}) added to ${newDevice.assignedWardName} (Bed: ${newDevice.assignedBedId}).`,
      'low',
      newDevice.assignedBedId
    );

    enqueueSyncMutation('devices', 'CREATE', newDevice.id, newDevice).catch(() => {});
    syncService.triggerSync().catch(() => {});

    return {
      success: true,
      message: `Medical device ${newDevice.name} (${newDevice.id}) registered successfully.`,
      device: newDevice,
    };
  };

  // Auth & Role helpers
  const switchUser = (user: User) => {
    setCurrentUser(user);
    logAction('AUTH', `Role Switched to ${user.role}`, `Session switched to ${user.name} (${user.department})`, user.id);
  };

  const login = (email: string): boolean => {
    const matched = DEMO_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (matched) {
      setCurrentUser(matched);
      setIsLoggedIn(true);
      logAction('AUTH', 'User Login', `Authenticated session for ${matched.name}`, matched.id);
      return true;
    }
    // Fallback if typed custom email
    const genericUser: User = {
      id: `USR-${Date.now()}`,
      name: email.split('@')[0],
      email,
      role: 'DOCTOR',
      department: 'General Staff',
      badgeNumber: 'STF-500',
    };
    setCurrentUser(genericUser);
    setIsLoggedIn(true);
    return true;
  };

  const logout = () => {
    setIsLoggedIn(false);
  };

  // Helpers
  const getPatientById = (id: string) => patients.find((p) => p.id === id);
  const getBedById = (id: string) => beds.find((b) => b.id === id);
  const getAdmissionsByPatient = (patientId: string) =>
    admissions
      .filter((a) => a.patientId === patientId)
      .sort((a, b) => b.visitNumber - a.visitNumber);

  const getActiveAdmissionForPatient = (patientId: string) =>
    admissions.find((a) => a.patientId === patientId && a.status === 'ACTIVE');

  const getAvailableBeds = (wardId?: string) =>
    beds.filter((b) => (b.status === 'AVAILABLE' || b.status === 'RESERVED') && (!wardId || b.wardId === wardId));

  const navigateToPatient = (patientId: string, subTab: string = 'overview') => {
    setSelectedPatientId(patientId);
    setPatientProfileSubTab(subTab);
    setActiveTab('patient-profile');
  };

  const navigateToBed = (bedId: string) => {
    setSelectedBedId(bedId);
    setActiveTab('beds');
  };

  const value = {
    currentUser,
    allUsers: DEMO_USERS,
    switchUser,
    isLoggedIn,
    login,
    logout,
    activeTab,
    setActiveTab,
    selectedPatientId,
    setSelectedPatientId,
    selectedBedId,
    setSelectedBedId,
    patientProfileSubTab,
    setPatientProfileSubTab,
    navigateToPatient,
    navigateToBed,
    globalSearch,
    setGlobalSearch,
    wards,
    beds,
    patients,
    admissions,
    clinicalRecords,
    prescriptions,
    documents,
    notifications,
    auditLogs,
    devices,
    verifyDeviceWorking,
    reportDeviceFault,
    stats,
    updateBedStatus,
    addBed,
    addDevice,
    registerPatient,
    createAdmission,
    processDischarge,
    addClinicalRecord,
    addPrescription,
    updatePrescriptionStatus,
    uploadDocument,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    resetToDemoData,
    getPatientById,
    getBedById,
    getAdmissionsByPatient,
    getActiveAdmissionForPatient,
    getAvailableBeds,
    canUserPerform,
  };

  return <HospitalContext.Provider value={value}>{children}</HospitalContext.Provider>;
};

export const useHospital = () => {
  const context = useContext(HospitalContext);
  if (!context) {
    throw new Error('useHospital must be used within a HospitalProvider');
  }
  return context;
};
