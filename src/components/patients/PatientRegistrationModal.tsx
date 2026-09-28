import React, { useState } from 'react';
import { UserPlus, Sparkles, CheckCircle, AlertCircle, Heart, Shield, Plus, X } from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { Modal } from '../common/Modal';
import { Patient } from '../../types/hospital';

interface PatientRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegistered?: (newPatient: Patient) => void;
}

export const PatientRegistrationModal: React.FC<PatientRegistrationModalProps> = ({
  isOpen,
  onClose,
  onRegistered,
}) => {
  const { registerPatient, patients } = useHospital();

  const nextIdPreview = `PAT-2026-${String(patients.length + 126).padStart(5, '0')}`;

  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('1985-06-15');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Female');
  const [phone, setPhone] = useState('+1 (555) ');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [bloodGroup, setBloodGroup] = useState<Patient['bloodGroup']>('O+');

  // Emergency contact
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyRel, setEmergencyRel] = useState('Spouse');
  const [emergencyPhone, setEmergencyPhone] = useState('');

  // Allergies & Chronic Conditions
  const [allergyInput, setAllergyInput] = useState('');
  const [allergies, setAllergies] = useState<string[]>(['No Known Drug Allergies (NKDA)']);
  const [chronicInput, setChronicInput] = useState('');
  const [chronicConditions, setChronicConditions] = useState<string[]>([]);

  // Insurance
  const [insuranceProvider, setInsuranceProvider] = useState('BlueCross MedShield');
  const [insurancePolicyNumber, setInsurancePolicyNumber] = useState('BCM-771-09');

  const [error, setError] = useState<string | null>(null);
  const [successPatient, setSuccessPatient] = useState<Patient | null>(null);

  // Auto calculate age
  const calculateAge = (dobString: string): number => {
    try {
      const birth = new Date(dobString);
      const diff = Date.now() - birth.getTime();
      const ageDate = new Date(diff);
      return Math.abs(ageDate.getUTCFullYear() - 1970) || 0;
    } catch {
      return 30;
    }
  };

  const handleAddAllergy = () => {
    if (!allergyInput.trim()) return;
    // If NKDA is present and we're adding an allergy, remove NKDA
    setAllergies((prev) =>
      prev.filter((a) => a !== 'No Known Drug Allergies (NKDA)').concat(allergyInput.trim())
    );
    setAllergyInput('');
  };

  const handleRemoveAllergy = (index: number) => {
    setAllergies((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddChronic = () => {
    if (!chronicInput.trim()) return;
    setChronicConditions((prev) => [...prev, chronicInput.trim()]);
    setChronicInput('');
  };

  const handleRemoveChronic = (index: number) => {
    setChronicConditions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) {
      setError('Please provide the patient’s full legal name.');
      return;
    }

    if (!emergencyName.trim() || !emergencyPhone.trim()) {
      setError('Emergency contact name and telephone number are mandatory for patient intake.');
      return;
    }

    const age = calculateAge(dob);

    const newPatient = registerPatient({
      fullName: fullName.trim(),
      dob,
      age,
      gender,
      phone: phone.trim(),
      email: email.trim() || undefined,
      address: address.trim() || 'Internal Hospital Area',
      emergencyContact: {
        name: emergencyName.trim(),
        relationship: emergencyRel,
        phone: emergencyPhone.trim(),
      },
      bloodGroup,
      allergies: allergies.length > 0 ? allergies : ['NKDA'],
      chronicConditions,
      insuranceProvider: insuranceProvider.trim() || undefined,
      insurancePolicyNumber: insurancePolicyNumber.trim() || undefined,
      status: 'Outpatient',
    });

    setSuccessPatient(newPatient);

    if (onRegistered) {
      onRegistered(newPatient);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Hospital Patient Registration"
      subtitle="Issue Permanent Medical Record & Unique Patient ID"
      maxWidth="3xl"
      id="patient-registration-modal"
    >
      {successPatient ? (
        <div className="p-6 text-center space-y-4">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h4 className="text-lg font-bold text-slate-900">Patient Successfully Registered</h4>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            Permanent Patient ID{' '}
            <strong className="font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              {successPatient.id}
            </strong>{' '}
            has been assigned to <strong>{successPatient.fullName}</strong>. This ID is permanent for
            all future admissions.
          </p>

          <div className="flex items-center justify-center gap-3 pt-4">
            <button
              onClick={() => {
                setSuccessPatient(null);
                onClose();
              }}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg"
            >
              Done
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Header Preview Banner */}
          <div className="p-3 bg-blue-50/80 rounded-xl border border-blue-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span className="font-semibold text-blue-950">Next Permanent Patient ID:</span>
              <span className="font-mono font-bold text-blue-700 bg-white px-2 py-0.5 rounded border border-blue-200">
                {nextIdPreview}
              </span>
            </div>
            <span className="text-[11px] text-blue-700">Permanent across all visits</span>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Demographics */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              1. Basic Demographics
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Legal Name *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Eleanor Bennett"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Gender *</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none"
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Date of Birth (DOB) *
                </label>
                <input
                  type="date"
                  required
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none"
                />
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Calculated Age: {calculateAge(dob)} years
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Primary Phone *
                </label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Blood Group *
                </label>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value as any)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none font-mono font-bold"
                >
                  <option value="A+">A Positive (A+)</option>
                  <option value="A-">A Negative (A-)</option>
                  <option value="B+">B Positive (B+)</option>
                  <option value="B-">B Negative (B-)</option>
                  <option value="AB+">AB Positive (AB+)</option>
                  <option value="AB-">AB Negative (AB-)</option>
                  <option value="O+">O Positive (O+)</option>
                  <option value="O-">O Negative (O-)</option>
                </select>
              </div>

              <div className="md:col-span-3">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Residential Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street, City, State, ZIP"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Emergency Contact */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              2. Emergency Contact
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Contact Name *
                </label>
                <input
                  type="text"
                  required
                  value={emergencyName}
                  onChange={(e) => setEmergencyName(e.target.value)}
                  placeholder="e.g. Thomas Bennett"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Relationship *
                </label>
                <select
                  value={emergencyRel}
                  onChange={(e) => setEmergencyRel(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none"
                >
                  <option value="Spouse">Spouse</option>
                  <option value="Parent">Parent</option>
                  <option value="Child">Child</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Guardian">Guardian</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Emergency Phone *
                </label>
                <input
                  type="text"
                  required
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Clinical Allergies & Chronic Conditions */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>3. Medical History & Allergies</span>
              <span className="text-[11px] text-rose-600 font-semibold">Critical safety checks</span>
            </div>

            {/* Allergies tag manager */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Drug / Food Allergies:
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={allergyInput}
                  onChange={(e) => setAllergyInput(e.target.value)}
                  placeholder="e.g. Penicillin (Anaphylaxis), Sulfa drugs..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddAllergy();
                    }
                  }}
                  className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddAllergy}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {allergies.map((allg, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200"
                  >
                    <span>{allg}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAllergy(idx)}
                      className="text-rose-400 hover:text-rose-700"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Chronic Conditions */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Known Chronic Medical Conditions:
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={chronicInput}
                  onChange={(e) => setChronicInput(e.target.value)}
                  placeholder="e.g. Hypertension, Type 2 Diabetes, Asthma..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddChronic();
                    }
                  }}
                  className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddChronic}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {chronicConditions.map((cond, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"
                  >
                    <span>{cond}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveChronic(idx)}
                      className="text-blue-400 hover:text-blue-700"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Section 4: Insurance & Billing */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              4. Insurance Identification
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Insurance Provider
                </label>
                <input
                  type="text"
                  value={insuranceProvider}
                  onChange={(e) => setInsuranceProvider(e.target.value)}
                  placeholder="e.g. BlueCross / Medicare / Aetna"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Policy / Member ID
                </label>
                <input
                  type="text"
                  value={insurancePolicyNumber}
                  onChange={(e) => setInsurancePolicyNumber(e.target.value)}
                  placeholder="e.g. BCM-8910-22X"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white outline-none"
                />
              </div>
            </div>
          </div>

          {/* Footer Submit */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200"
            >
              Cancel
            </button>
            <button
              id="submit-register-patient-btn"
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Confirm & Issue Patient ID</span>
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};
