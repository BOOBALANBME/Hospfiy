import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  Patient,
  AdmissionVisit,
  ClinicalRecord,
  Prescription,
  PatientDocument,
} from '../types/hospital';

export interface PdfSummaryOptions {
  visitIdFilter?: string; // 'ALL' or specific visitId
  includeVitals?: boolean;
  includePrescriptions?: boolean;
  includeClinicalNotes?: boolean;
  includeDischarges?: boolean;
  engineerNotes?: string;
}

export const generatePatientSummaryPdf = (
  patient: Patient,
  admissions: AdmissionVisit[],
  clinicalRecords: ClinicalRecord[],
  prescriptions: Prescription[],
  documents: PatientDocument[] = [],
  options: PdfSummaryOptions = {}
): jsPDF => {
  const {
    visitIdFilter = 'ALL',
    includeVitals = true,
    includePrescriptions = true,
    includeClinicalNotes = true,
    includeDischarges = true,
    engineerNotes = 'All telemetry feeds, bedside vital monitors, and clinical records are verified and calibrated per biomedical quality assurance protocols.',
  } = options;

  // Initialize jsPDF (A4 portrait, mm)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let currentY = 15;

  // Primary colors
  const primaryNavy: [number, number, number] = [30, 58, 138]; // #1e3a8a
  const slateDark: [number, number, number] = [30, 41, 59]; // #1e293b
  const slateMuted: [number, number, number] = [100, 116, 139]; // #64748b
  const emeraldGreen: [number, number, number] = [16, 185, 129]; // #10b981
  const roseRed: [number, number, number] = [225, 29, 72]; // #e11d48

  // Helper to check page overflow and add new page
  const checkPageBreak = (neededHeight: number) => {
    if (currentY + neededHeight > pageHeight - 20) {
      doc.addPage();
      currentY = 20;
      renderRunningHeader();
    }
  };

  // Running header on continuation pages
  const renderRunningHeader = () => {
    doc.setFillColor(248, 250, 252);
    doc.rect(14, 8, pageWidth - 28, 9, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...primaryNavy);
    doc.text("HOSPIFY • PATIENT MEDICAL SUMMARY", 18, 14);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...slateMuted);
    doc.text(`Patient: ${patient.fullName} (${patient.id}) | Biomedical Engineer: Boobalan S`, pageWidth - 18, 14, { align: 'right' });

    doc.setDrawColor(226, 232, 240);
    doc.line(14, 18, pageWidth - 14, 18);
  };

  // ==========================================
  // 1. HOSPITAL & CLINICAL ENGINEERING HEADER
  // ==========================================
  doc.setFillColor(...primaryNavy);
  doc.roundedRect(14, currentY, pageWidth - 28, 26, 2, 2, 'F');

  // Title text
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text("HOSPIFY MEDICAL CENTER", 20, currentY + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(219, 234, 254);
  doc.text('Division of Inpatient Medicine & Clinical Informatics System', 20, currentY + 14);

  doc.setFontSize(7.5);
  doc.setTextColor(191, 219, 254);
  doc.text('Certified Electronic Health Record (EHR) • Official Hospital Dossier', 20, currentY + 20);

  // Right-side document metadata badge
  const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('CLINICAL SUMMARY REPORT', pageWidth - 20, currentY + 8, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(219, 234, 254);
  doc.text(`Generated: ${nowStr}`, pageWidth - 20, currentY + 14, { align: 'right' });
  doc.text(`Doc Ref: EHR-SUM-${patient.id}`, pageWidth - 20, currentY + 20, { align: 'right' });

  currentY += 31;

  // ==========================================
  // 2. BIOMEDICAL ENGINEERING VERIFICATION BANNER
  // ==========================================
  doc.setFillColor(240, 249, 255); // light sky
  doc.setDrawColor(186, 230, 253);
  doc.roundedRect(14, currentY, pageWidth - 28, 17, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(3, 105, 161); // sky 700
  doc.text('BIOMEDICAL ENGINEERING & CLINICAL TECHNOLOGY VERIFICATION', 18, currentY + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42); // slate 900
  doc.text(
    'Supervising Biomedical Engineer: Boobalan S  |  Badge: BME-2026  |  Dept: Biomedical Engineering & Medical Devices',
    18,
    currentY + 10.5
  );

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text(
    `Quality Certification: ${engineerNotes}`,
    18,
    currentY + 14.5
  );

  currentY += 21;

  // ==========================================
  // 3. PATIENT DEMOGRAPHICS & CLINICAL PROFILE
  // ==========================================
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...primaryNavy);
  doc.text('1. PATIENT DEMOGRAPHIC & CLINICAL PROFILE', 14, currentY);
  currentY += 4;

  const activeAdm = admissions.find((a) => a.status === 'ACTIVE');

  autoTable(doc, {
    startY: currentY,
    head: [['Field', 'Patient Details', 'Field', 'Clinical Details']],
    body: [
      ['Full Name', patient.fullName, 'Patient ID', patient.id],
      ['Age / Gender', `${patient.age} yrs / ${patient.gender}`, 'Blood Group', patient.bloodGroup],
      ['Date of Birth', patient.dob, 'Current Status', patient.status],
      ['Contact Number', patient.phone, 'Active Bed', activeAdm ? `${activeAdm.bedId} (${activeAdm.wardName})` : 'Not Currently Hospitalized'],
      ['Residential Address', patient.address, 'Attending Doctor', activeAdm ? activeAdm.attendingDoctor : (admissions[0]?.attendingDoctor || 'N/A')],
      ['Emergency Contact', `${patient.emergencyContact.name} (${patient.emergencyContact.relationship}) - ${patient.emergencyContact.phone}`, 'Insurance Policy', `${patient.insuranceProvider || 'Direct'} (${patient.insurancePolicyNumber || 'N/A'})`],
      ['Known Allergies', patient.allergies && patient.allergies.length > 0 ? patient.allergies.join(', ') : 'No Known Drug Allergies (NKDA)', 'Admission History', `${admissions.length} Recorded Hospital Stays`],
    ],
    theme: 'grid',
    styles: { fontSize: 7.5, cellPadding: 2, textColor: [30, 41, 59] },
    headStyles: { fillColor: [241, 245, 249], textColor: [71, 85, 105], fontStyle: 'bold' },
    columnStyles: {
      0: { fontStyle: 'bold', fillColor: [248, 250, 252], cellWidth: 32 },
      1: { cellWidth: 60 },
      2: { fontStyle: 'bold', fillColor: [248, 250, 252], cellWidth: 32 },
      3: { cellWidth: 58 },
    },
    margin: { left: 14, right: 14 },
  });

  currentY = (doc as any).lastAutoTable.finalY + 8;

  // ==========================================
  // 4. HOSPITAL VISITS & ADMISSIONS HISTORY
  // ==========================================
  checkPageBreak(35);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...primaryNavy);
  doc.text(`2. HOSPITAL ADMISSIONS & VISIT HISTORY (${admissions.length} RECORDED VISITS)`, 14, currentY);
  currentY += 4;

  const relevantAdmissions = visitIdFilter === 'ALL'
    ? admissions
    : admissions.filter((a) => a.id === visitIdFilter);

  const admissionRows = relevantAdmissions.map((adm) => [
    `#${adm.visitNumber} (${adm.id})`,
    adm.admissionDate,
    adm.dischargeDate || 'Active Inpatient',
    `${adm.admissionType}\n${adm.department}`,
    `${adm.wardName}\nBed ${adm.bedId}`,
    adm.attendingDoctor,
    adm.initialDiagnosis,
    adm.status,
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [['Visit ID', 'Admitted', 'Discharged', 'Type / Dept', 'Ward / Bed', 'Attending', 'Diagnosis', 'Status']],
    body: admissionRows,
    theme: 'striped',
    styles: { fontSize: 7, cellPadding: 2, textColor: [30, 41, 59], overflow: 'linebreak' },
    headStyles: { fillColor: primaryNavy, textColor: [255, 255, 255], fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 24, fontStyle: 'bold' },
      1: { cellWidth: 20 },
      2: { cellWidth: 20 },
      3: { cellWidth: 24 },
      4: { cellWidth: 24 },
      5: { cellWidth: 22 },
      6: { cellWidth: 32 },
      7: { cellWidth: 16, fontStyle: 'bold' },
    },
    margin: { left: 14, right: 14 },
    didParseCell: (data) => {
      if (data.column.index === 7 && data.section === 'body') {
        const val = data.cell.raw as string;
        if (val === 'ACTIVE') {
          data.cell.styles.textColor = roseRed;
        } else if (val === 'DISCHARGED') {
          data.cell.styles.textColor = emeraldGreen;
        }
      }
    },
  });

  currentY = (doc as any).lastAutoTable.finalY + 8;

  // ==========================================
  // 5. FORMAL DISCHARGE SUMMARIES (IF ANY)
  // ==========================================
  if (includeDischarges) {
    const dischargedWithRecords = relevantAdmissions.filter((a) => a.dischargeRecord);
    if (dischargedWithRecords.length > 0) {
      checkPageBreak(40);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...primaryNavy);
      doc.text(`3. FORMAL DISCHARGE SUMMARIES & CLINICAL OUTCOMES`, 14, currentY);
      currentY += 4;

      dischargedWithRecords.forEach((adm) => {
        const disc = adm.dischargeRecord!;
        checkPageBreak(35);

        autoTable(doc, {
          startY: currentY,
          head: [[`Discharge Dossier: Visit #${adm.visitNumber} (${disc.id})`, `Condition: ${disc.dischargeCondition}`]],
          body: [
            ['Final Diagnosis', disc.finalDiagnosis],
            ['Clinical Summary', disc.clinicalSummary],
            ['Treatment Provided', disc.treatmentSummary],
            ['Medication Instructions', disc.medicationInstructions],
            ['Follow-Up Protocol', disc.followUpInstructions],
            ['Approved & Signed By', `${disc.approvedBy} on ${disc.dischargeDate}`],
          ],
          theme: 'grid',
          styles: { fontSize: 7, cellPadding: 2, textColor: [30, 41, 59] },
          headStyles: { fillColor: [240, 253, 244], textColor: [22, 101, 52], fontStyle: 'bold' },
          columnStyles: {
            0: { cellWidth: 40, fontStyle: 'bold', fillColor: [248, 250, 252] },
            1: { cellWidth: 142 },
          },
          margin: { left: 14, right: 14 },
        });

        currentY = (doc as any).lastAutoTable.finalY + 5;
      });
      currentY += 3;
    }
  }

  // ==========================================
  // 6. CLINICAL NOTES & VITALS PROGRESSION
  // ==========================================
  if (includeClinicalNotes) {
    const filteredRecords = clinicalRecords
      .filter((rec) => {
        if (rec.patientId !== patient.id) return false;
        if (visitIdFilter !== 'ALL' && rec.visitId !== visitIdFilter) return false;
        return true;
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    if (filteredRecords.length > 0) {
      checkPageBreak(40);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...primaryNavy);
      doc.text(
        `4. CLINICAL PROGRESS NOTES & BEDSIDE VITAL SIGNS (${filteredRecords.length} NOTES)`,
        14,
        currentY
      );
      currentY += 4;

      const recordRows = filteredRecords.map((r) => {
        const vitalsStr = r.vitals
          ? `BP: ${r.vitals.bloodPressureSys}/${r.vitals.bloodPressureDia} mmHg\nHR: ${r.vitals.heartRate} bpm | SpO2: ${r.vitals.oxygenSaturation}%\nTemp: ${r.vitals.temperature}°C | RR: ${r.vitals.respiratoryRate}`
          : 'None logged';

        return [
          r.timestamp,
          r.recordType.replace('_', ' '),
          `${r.authorName}\n(${r.authorRole})`,
          `${r.title}\n\n${r.content}`,
          vitalsStr,
        ];
      });

      autoTable(doc, {
        startY: currentY,
        head: [['Date & Time', 'Category', 'Clinician', 'Clinical Progress Note / Assessment', 'Vital Signs']],
        body: recordRows,
        theme: 'striped',
        styles: { fontSize: 7, cellPadding: 2.2, textColor: [30, 41, 59], overflow: 'linebreak' },
        headStyles: { fillColor: [71, 85, 105], textColor: [255, 255, 255], fontStyle: 'bold' },
        columnStyles: {
          0: { cellWidth: 22 },
          1: { cellWidth: 20, fontStyle: 'bold' },
          2: { cellWidth: 24 },
          3: { cellWidth: 76 },
          4: { cellWidth: 40, fontStyle: 'bold', fillColor: [248, 250, 252] },
        },
        margin: { left: 14, right: 14 },
      });

      currentY = (doc as any).lastAutoTable.finalY + 8;
    }
  }

  // ==========================================
  // 7. MEDICATIONS & PRESCRIPTION REGISTRY
  // ==========================================
  if (includePrescriptions) {
    const filteredPrescriptions = prescriptions.filter((rx) => {
      if (rx.patientId !== patient.id) return false;
      if (visitIdFilter !== 'ALL' && rx.visitId !== visitIdFilter) return false;
      return true;
    });

    if (filteredPrescriptions.length > 0) {
      checkPageBreak(35);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...primaryNavy);
      doc.text(`5. MEDICATION & PRESCRIPTION REGISTRY (${filteredPrescriptions.length} ORDERS)`, 14, currentY);
      currentY += 4;

      const rxRows = filteredPrescriptions.map((rx) => [
        rx.medicineName,
        rx.dosage,
        rx.route,
        rx.frequency,
        rx.duration,
        rx.prescribingDoctor,
        rx.instructions || 'Per protocol',
        rx.status,
      ]);

      autoTable(doc, {
        startY: currentY,
        head: [['Medication', 'Dosage', 'Route', 'Frequency', 'Duration', 'Prescriber', 'Instructions', 'Status']],
        body: rxRows,
        theme: 'grid',
        styles: { fontSize: 7, cellPadding: 2, textColor: [30, 41, 59] },
        headStyles: { fillColor: [67, 56, 202], textColor: [255, 255, 255], fontStyle: 'bold' },
        columnStyles: {
          0: { cellWidth: 32, fontStyle: 'bold' },
          1: { cellWidth: 18 },
          2: { cellWidth: 14 },
          3: { cellWidth: 26 },
          4: { cellWidth: 18 },
          5: { cellWidth: 24 },
          6: { cellWidth: 34 },
          7: { cellWidth: 16, fontStyle: 'bold' },
        },
        margin: { left: 14, right: 14 },
        didParseCell: (data) => {
          if (data.column.index === 7 && data.section === 'body') {
            const val = data.cell.raw as string;
            if (val === 'ACTIVE') {
              data.cell.styles.textColor = [37, 99, 235]; // blue
            } else {
              data.cell.styles.textColor = [100, 116, 139]; // gray
            }
          }
        },
      });

      currentY = (doc as any).lastAutoTable.finalY + 8;
    }
  }

  // ==========================================
  // 8. FINAL LEGAL & BIOMEDICAL SIGN-OFF BLOCK
  // ==========================================
  checkPageBreak(38);
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(14, currentY, pageWidth - 28, 28, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...primaryNavy);
  doc.text('HOSPITAL DIGITAL AUTHENTICATION & CLINICAL VERIFICATION', 20, currentY + 6);

  // Left Sign-Off (Physician / Clinical)
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...slateDark);
  doc.text('Attending Physician / Clinical Reviewer:', 20, currentY + 12);
  doc.setFont('helvetica', 'bold');
  doc.text(activeAdm ? activeAdm.attendingDoctor : (admissions[0]?.attendingDoctor || 'Chief of Clinical Services'), 20, currentY + 16.5);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(6.5);
  doc.setTextColor(...slateMuted);
  doc.text('Digitally signed and archived in Hospital Information System', 20, currentY + 21);

  // Right Sign-Off (Biomedical Engineer: Boobalan S)
  const rightX = pageWidth / 2 + 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...slateDark);
  doc.text('Biomedical Engineering & Medical Device Specialist:', rightX, currentY + 12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(3, 105, 161);
  doc.text('Boobalan S, Senior Biomedical Engineer', rightX, currentY + 16.5);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(6.5);
  doc.setTextColor(...slateMuted);
  doc.text('Badge: BME-2026 | Biomedical Engineering & Clinical Technology', rightX, currentY + 21);
  doc.text('Vitals telemetry & patient monitoring data audited & certified', rightX, currentY + 25);

  // ==========================================
  // 9. FOOTERS (ON ALL PAGES)
  // ==========================================
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(226, 232, 240);
    doc.line(14, pageHeight - 12, pageWidth - 14, pageHeight - 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...slateMuted);
    doc.text(
      `Hospify • Patient: ${patient.fullName} (${patient.id}) • Certified by Biomedical Engineer: Boobalan S`,
      14,
      pageHeight - 7.5
    );

    doc.text(
      `Page ${i} of ${totalPages}`,
      pageWidth - 14,
      pageHeight - 7.5,
      { align: 'right' }
    );
  }

  return doc;
};
