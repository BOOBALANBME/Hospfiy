import React, { useState } from 'react';
import { HospitalProvider, useHospital } from './context/HospitalContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { LoginView } from './components/auth/LoginView';

// Views
import { DashboardView } from './components/dashboard/DashboardView';
import { BedManagementView } from './components/beds/BedManagementView';
import { PatientListView } from './components/patients/PatientListView';
import { PatientProfileView } from './components/patients/PatientProfileView';
import { AdmissionListView } from './components/admissions/AdmissionListView';
import { ClinicalRecordsView } from './components/clinical/ClinicalRecordsView';
import { DocumentListView } from './components/documents/DocumentListView';
import { PrescriptionListView } from './components/prescriptions/PrescriptionListView';
import { DischargeListView } from './components/discharge/DischargeListView';
import { ReportsView } from './components/reports/ReportsView';
import { NotificationsView } from './components/notifications/NotificationsView';
import { AuditLogsView } from './components/audit/AuditLogsView';
import { SettingsView } from './components/settings/SettingsView';
import { BiomedicalDeviceView } from './components/biomedical/BiomedicalDeviceView';
import { HospifySplashScreen } from './components/common/HospifySplashScreen';
import { OfflineIndicator } from './components/common/OfflineIndicator';

// Modals
import { PatientRegistrationModal } from './components/patients/PatientRegistrationModal';
import { AdmissionModal } from './components/admissions/AdmissionModal';
import { DischargeModal } from './components/discharge/DischargeModal';
import { AddClinicalNoteModal } from './components/clinical/AddClinicalNoteModal';
import { AddPrescriptionModal } from './components/prescriptions/AddPrescriptionModal';
import { UploadDocumentModal } from './components/documents/UploadDocumentModal';

const HospitalAppContent: React.FC = () => {
  const { activeTab, setActiveTab, selectedPatientId, navigateToPatient } = useHospital();

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [showSplashAnimation, setShowSplashAnimation] = useState<boolean>(true);

  // Modal States
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isAdmissionModalOpen, setIsAdmissionModalOpen] = useState(false);
  const [admissionPatientId, setAdmissionPatientId] = useState<string | undefined>(undefined);
  const [admissionBedId, setAdmissionBedId] = useState<string | undefined>(undefined);
  const [admissionWardId, setAdmissionWardId] = useState<string | undefined>(undefined);

  const [isDischargeModalOpen, setIsDischargeModalOpen] = useState(false);
  const [dischargeAdmissionId, setDischargeAdmissionId] = useState<string>('');

  const [isAddNoteModalOpen, setIsAddNoteModalOpen] = useState(false);
  const [noteTarget, setNoteTarget] = useState<{ patientId: string; visitId: string }>({
    patientId: '',
    visitId: '',
  });

  const [isAddRxModalOpen, setIsAddRxModalOpen] = useState(false);
  const [rxTarget, setRxTarget] = useState<{ patientId: string; visitId: string }>({
    patientId: '',
    visitId: '',
  });

  const [isUploadDocModalOpen, setIsUploadDocModalOpen] = useState(false);
  const [docTarget, setDocTarget] = useState<{ patientId: string; visitId: string }>({
    patientId: '',
    visitId: '',
  });

  // Modal openers
  const handleOpenAdmission = (patientId?: string, bedId?: string, wardId?: string) => {
    setAdmissionPatientId(patientId);
    setAdmissionBedId(bedId);
    setAdmissionWardId(wardId);
    setIsAdmissionModalOpen(true);
  };

  const handleOpenDischarge = (admissionId: string) => {
    setDischargeAdmissionId(admissionId);
    setIsDischargeModalOpen(true);
  };

  const handleOpenAddNote = (patientId: string, visitId: string) => {
    setNoteTarget({ patientId, visitId });
    setIsAddNoteModalOpen(true);
  };

  const handleOpenAddRx = (patientId: string, visitId: string) => {
    setRxTarget({ patientId, visitId });
    setIsAddRxModalOpen(true);
  };

  const handleOpenUploadDoc = (patientId: string, visitId: string) => {
    setDocTarget({ patientId, visitId });
    setIsUploadDocModalOpen(true);
  };

  // 1. Play Logo Intro Animation first
  if (showSplashAnimation) {
    return (
      <HospifySplashScreen onComplete={() => setShowSplashAnimation(false)} />
    );
  }

  // 2. Once animation completes, show Login Page if not authenticated
  if (!isAuthenticated) {
    return <LoginView onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  // 3. Authenticated: Render Main Hospital Portal
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800 antialiased selection:bg-blue-600 selection:text-white">
      {/* Top Global Header */}
      <Header
        onLogout={() => setIsAuthenticated(false)}
        onReplayIntro={() => setShowSplashAnimation(true)}
      />

      {/* Main Structural Layout: Sidebar + Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar />

        {/* Dynamic Workspace Container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <DashboardView
              onOpenRegisterModal={() => setIsRegisterModalOpen(true)}
              onOpenAdmissionModal={handleOpenAdmission}
            />
          )}

          {activeTab === 'beds' && <BedManagementView />}

          {activeTab === 'patients' && (
            <PatientListView
              onOpenRegisterModal={() => setIsRegisterModalOpen(true)}
              onOpenAdmissionModal={handleOpenAdmission}
            />
          )}

          {activeTab === 'patient-profile' && (
            <PatientProfileView
              onOpenAdmissionModal={handleOpenAdmission}
              onOpenDischargeModal={handleOpenDischarge}
              onOpenAddNoteModal={handleOpenAddNote}
              onOpenAddRxModal={handleOpenAddRx}
              onOpenUploadDocModal={handleOpenUploadDoc}
            />
          )}

          {activeTab === 'admissions' && (
            <AdmissionListView
              onOpenAdmissionModal={handleOpenAdmission}
              onOpenDischargeModal={handleOpenDischarge}
            />
          )}

          {activeTab === 'clinical' && (
            <ClinicalRecordsView onOpenAddNoteModal={handleOpenAddNote} />
          )}

          {activeTab === 'documents' && <DocumentListView />}

          {activeTab === 'prescriptions' && (
            <PrescriptionListView onOpenAddRxModal={handleOpenAddRx} />
          )}

          {activeTab === 'discharges' && <DischargeListView />}

          {activeTab === 'biomedical' && <BiomedicalDeviceView />}

          {activeTab === 'reports' && <ReportsView />}

          {activeTab === 'notifications' && <NotificationsView />}

          {activeTab === 'audit' && <AuditLogsView />}

          {activeTab === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Global Modals */}
      <PatientRegistrationModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onRegistered={(newPatient) => {
          navigateToPatient(newPatient.id);
        }}
      />

      {isAdmissionModalOpen && (
        <AdmissionModal
          isOpen={true}
          onClose={() => setIsAdmissionModalOpen(false)}
          preselectedPatientId={admissionPatientId}
          preselectedBedId={admissionBedId}
          preselectedWardId={admissionWardId}
          onOpenRegisterModal={() => {
            setIsAdmissionModalOpen(false);
            setIsRegisterModalOpen(true);
          }}
          onAdmissionCreated={() => {
            setActiveTab('admissions');
          }}
        />
      )}

      {isDischargeModalOpen && dischargeAdmissionId && (
        <DischargeModal
          isOpen={true}
          onClose={() => setIsDischargeModalOpen(false)}
          admissionId={dischargeAdmissionId}
          onDischargeCompleted={() => {
            setActiveTab('discharges');
          }}
        />
      )}

      {isAddNoteModalOpen && noteTarget.patientId && (
        <AddClinicalNoteModal
          isOpen={true}
          onClose={() => setIsAddNoteModalOpen(false)}
          patientId={noteTarget.patientId}
          visitId={noteTarget.visitId}
        />
      )}

      {isAddRxModalOpen && rxTarget.patientId && (
        <AddPrescriptionModal
          isOpen={true}
          onClose={() => setIsAddRxModalOpen(false)}
          patientId={rxTarget.patientId}
          visitId={rxTarget.visitId}
        />
      )}

      {isUploadDocModalOpen && docTarget.patientId && (
        <UploadDocumentModal
          isOpen={true}
          onClose={() => setIsUploadDocModalOpen(false)}
          patientId={docTarget.patientId}
          visitId={docTarget.visitId}
        />
      )}

      {/* Floating Offline Mode Banner & Connection Status */}
      <OfflineIndicator />
    </div>
  );
};

export function App() {
  return (
    <HospitalProvider>
      <HospitalAppContent />
    </HospitalProvider>
  );
}

export default App;
