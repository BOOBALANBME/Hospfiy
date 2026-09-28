import { User, UserRole } from '../types/hospital';

export interface DepartmentCredentialInfo {
  id: string; // ward ID or 'DEPT-BME' or 'DEPT-ALL'
  code: string;
  name: string;
  username: string; // e.g. "ICU@2000", "BIOMEDICAL@2000"
  passwordHint: string; // "ABC HOSPITAL"
  role: UserRole;
  headName: string;
  badgeNumber: string;
  isBiomedical?: boolean;
  isAdmin?: boolean;
}

export const HOSPITAL_CREDENTIALS: DepartmentCredentialInfo[] = [
  {
    id: 'DEPT-ALL',
    code: 'ADMIN',
    name: 'ABC Hospital - Central Administration',
    username: 'ABC HOSPITAL',
    passwordHint: 'ABC@2000',
    role: 'ADMIN',
    headName: 'Dr. Arthur Vance (Chief Medical Administrator)',
    badgeNumber: 'HOSP-ADM-001',
    isAdmin: true,
  },
  {
    id: 'DEPT-BME',
    code: 'BIOMEDICAL',
    name: 'Biomedical Engineering & Device QA (Boobalan S BME)',
    username: 'BIOMEDICAL@2000',
    passwordHint: 'ABC HOSPITAL',
    role: 'BIOMEDICAL',
    headName: 'Boobalan S (Lead Biomedical Engineer)',
    badgeNumber: 'BME-QA-001',
    isBiomedical: true,
  },
  {
    id: 'WARD-ICU',
    code: 'ICU',
    name: 'Intensive Care Unit (ICU)',
    username: 'ICU@2000',
    passwordHint: 'ABC HOSPITAL',
    role: 'DOCTOR',
    headName: 'Dr. Sarah Jenkins (ICU Director)',
    badgeNumber: 'DOC-ICU-101',
  },
  {
    id: 'WARD-EMERGENCY',
    code: 'EMERGENCY',
    name: 'Emergency & Acute Trauma Care',
    username: 'EMERGENCY@2000',
    passwordHint: 'ABC HOSPITAL',
    role: 'DOCTOR',
    headName: 'Dr. Michael Alvarez (Trauma Head)',
    badgeNumber: 'DOC-ER-102',
  },
  {
    id: 'WARD-CARDIO',
    code: 'CARDIOLOGY',
    name: 'Cardiology & Coronary Care (CCU)',
    username: 'CARDIOLOGY@2000',
    passwordHint: 'ABC HOSPITAL',
    role: 'DOCTOR',
    headName: 'Dr. David Thorne (Chief Cardiologist)',
    badgeNumber: 'DOC-CARD-103',
  },
  {
    id: 'WARD-NEURO',
    code: 'NEUROLOGY',
    name: 'Neurology & Neurosurgery Ward',
    username: 'NEUROLOGY@2000',
    passwordHint: 'ABC HOSPITAL',
    role: 'DOCTOR',
    headName: 'Dr. Elena Rostova (Chief Neurosurgeon)',
    badgeNumber: 'DOC-NEURO-104',
  },
  {
    id: 'WARD-ORTHO',
    code: 'ORTHOPEDICS',
    name: 'Orthopedics & Joint Replacement',
    username: 'ORTHOPEDICS@2000',
    passwordHint: 'ABC HOSPITAL',
    role: 'DOCTOR',
    headName: 'Dr. Marcus Vance (Ortho Surgeon)',
    badgeNumber: 'DOC-ORTHO-105',
  },
  {
    id: 'WARD-PED',
    code: 'PEDIATRICS',
    name: 'Pediatrics & Neonatology (PICU/NICU)',
    username: 'PEDIATRICS@2000',
    passwordHint: 'ABC HOSPITAL',
    role: 'DOCTOR',
    headName: 'Dr. Chloe Adams (Head of Pediatrics)',
    badgeNumber: 'DOC-PED-106',
  },
  {
    id: 'WARD-MAT',
    code: 'MATERNITY',
    name: 'Maternity, Labor & Obstetrics',
    username: 'MATERNITY@2000',
    passwordHint: 'ABC HOSPITAL',
    role: 'DOCTOR',
    headName: 'Dr. Hannah Green (Obstetrics Lead)',
    badgeNumber: 'DOC-MAT-107',
  },
  {
    id: 'WARD-SUR',
    code: 'SURGERY',
    name: 'General Surgery & Post-Op Recovery',
    username: 'SURGERY@2000',
    passwordHint: 'ABC HOSPITAL',
    role: 'DOCTOR',
    headName: 'Dr. Kevin Patel (Head of Surgery)',
    badgeNumber: 'DOC-SUR-108',
  },
  {
    id: 'WARD-GEN-A',
    code: 'GENERAL',
    name: 'General Internal Medicine Ward',
    username: 'GENERAL@2000',
    passwordHint: 'ABC HOSPITAL',
    role: 'DOCTOR',
    headName: 'Dr. Linda Becker (Internal Medicine)',
    badgeNumber: 'DOC-GEN-109',
  },
  {
    id: 'WARD-ONCO',
    code: 'ONCOLOGY',
    name: 'Medical Oncology & Infusion Center',
    username: 'ONCOLOGY@2000',
    passwordHint: 'ABC HOSPITAL',
    role: 'DOCTOR',
    headName: 'Dr. Priya Sharma (Oncology Chief)',
    badgeNumber: 'DOC-ONCO-110',
  },
  {
    id: 'WARD-NEPHRO',
    code: 'NEPHROLOGY',
    name: 'Nephrology & Renal Dialysis Care',
    username: 'NEPHROLOGY@2000',
    passwordHint: 'ABC HOSPITAL',
    role: 'DOCTOR',
    headName: 'Dr. Jonathan Wu (Nephrologist)',
    badgeNumber: 'DOC-NEPH-111',
  },
  {
    id: 'WARD-PULMO',
    code: 'PULMONOLOGY',
    name: 'Pulmonology & Respiratory Care',
    username: 'PULMONOLOGY@2000',
    passwordHint: 'ABC HOSPITAL',
    role: 'DOCTOR',
    headName: 'Dr. Grace Miller (Pulmonology Lead)',
    badgeNumber: 'DOC-PULM-112',
  },
  {
    id: 'WARD-GASTRO',
    code: 'GASTROENTEROLOGY',
    name: 'Gastroenterology & Hepatic Care',
    username: 'GASTROENTEROLOGY@2000',
    passwordHint: 'ABC HOSPITAL',
    role: 'DOCTOR',
    headName: 'Dr. Carlos Mendez (GI Specialist)',
    badgeNumber: 'DOC-GI-113',
  },
  {
    id: 'WARD-ENT-EYE',
    code: 'ENT',
    name: 'ENT & Ophthalmology Ward',
    username: 'ENT@2000',
    passwordHint: 'ABC HOSPITAL',
    role: 'DOCTOR',
    headName: 'Dr. Amara Okafor (ENT & Eye Lead)',
    badgeNumber: 'DOC-ENT-114',
  },
  {
    id: 'WARD-REHAB',
    code: 'REHAB',
    name: 'Rehabilitation & Psychiatry Care',
    username: 'REHAB@2000',
    passwordHint: 'ABC HOSPITAL',
    role: 'DOCTOR',
    headName: 'Dr. Simon Hayes (Rehab Director)',
    badgeNumber: 'DOC-RHB-115',
  },
];

export interface AuthValidationResult {
  success: boolean;
  user?: User;
  targetDepartmentId?: string;
  errorMessage?: string;
}

export function validateHospitalLogin(
  rawUsername: string,
  rawPassword: string,
  selectedDeptId?: string
): AuthValidationResult {
  const username = rawUsername.trim().toUpperCase();
  const password = rawPassword.trim();

  if (!username) {
    return { success: false, errorMessage: 'Please enter a username.' };
  }
  if (!password) {
    return { success: false, errorMessage: 'Please enter a password.' };
  }

  // 1. Check Hospital Main Admin Credentials:
  // username: "ABC HOSPITAL", password: "ABC@2000"
  if (
    username === 'ABC HOSPITAL' ||
    username === 'ABCHOSPITAL' ||
    username === 'ABC' ||
    username === 'ADMIN'
  ) {
    if (password === 'ABC@2000' || password.toUpperCase() === 'ABC HOSPITAL') {
      const adminCred = HOSPITAL_CREDENTIALS[0];
      const user: User = {
        id: 'usr-admin-01',
        name: adminCred.headName,
        email: 'admin@abchospital.med',
        role: 'ADMIN',
        department: 'Central Administration (All Departments)',
        badgeNumber: adminCred.badgeNumber,
      };
      return {
        success: true,
        user,
        targetDepartmentId: 'DEPT-ALL',
      };
    } else {
      return {
        success: false,
        errorMessage: 'Invalid password for ABC HOSPITAL. Required: ABC@2000',
      };
    }
  }

  // 2. Department Login Credentials:
  // DEPARTMENT USER NAME: [department name]@2000 (e.g. ICU@2000, CARDIOLOGY@2000, BIOMEDICAL@2000)
  // PASSWORD: ABC HOSPITAL (or ABC@2000)
  const isDeptPasswordValid =
    password.toUpperCase() === 'ABC HOSPITAL' ||
    password === 'ABC@2000' ||
    password.toUpperCase() === 'ABCHOSPITAL';

  if (!isDeptPasswordValid) {
    return {
      success: false,
      errorMessage:
        'Invalid department password. Password required for department login: ABC HOSPITAL',
    };
  }

  // Find department matching username or selected department
  let matchedDept = HOSPITAL_CREDENTIALS.find(
    (d) =>
      d.username.toUpperCase() === username ||
      d.code.toUpperCase() === username ||
      `${d.code}@2000`.toUpperCase() === username
  );

  // If not matched directly by username string, check if selectedDeptId is provided
  if (!matchedDept && selectedDeptId) {
    matchedDept = HOSPITAL_CREDENTIALS.find((d) => d.id === selectedDeptId);
  }

  // Check if username has @2000 pattern
  if (!matchedDept && username.includes('@2000')) {
    const prefix = username.replace('@2000', '').trim();
    matchedDept = HOSPITAL_CREDENTIALS.find(
      (d) =>
        d.code.toUpperCase().includes(prefix) ||
        prefix.includes(d.code.toUpperCase()) ||
        d.name.toUpperCase().includes(prefix)
    );
  }

  if (matchedDept) {
    const user: User = {
      id: `usr-${matchedDept.code.toLowerCase()}`,
      name: matchedDept.headName,
      email: `${matchedDept.code.toLowerCase()}@abchospital.med`,
      role: matchedDept.role,
      department: matchedDept.name,
      badgeNumber: matchedDept.badgeNumber,
    };

    return {
      success: true,
      user,
      targetDepartmentId: matchedDept.id,
    };
  }

  return {
    success: false,
    errorMessage: `Invalid department username "${rawUsername}". Format: [department name]@2000 (e.g., ICU@2000, CARDIOLOGY@2000, BIOMEDICAL@2000).`,
  };
}
