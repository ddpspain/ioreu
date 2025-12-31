// File: pages/register.js

import { useState } from 'react';
import { useRouter } from 'next/router';

// A simple component to show disqualification messages
const DisqualificationMessage = ({ message } ) => (
  <div style={{ padding: '2rem', textAlign: 'center', maxWidth: '600px', margin: 'auto' }}>
    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Service Not Available</h2>
    <p style={{ color: '#555' }}>{message}</p>
    <p style={{ marginTop: '1rem' }}>We specialize in IOR services for standard cargo. Thank you for your interest.</p>
  </div>
);

// A simple button component for consistent styling
const StepButton = ({ onClick, children }) => (
  <button
    onClick={onClick}
    style={{
      display: 'block',
      width: '100%',
      padding: '12px',
      margin: '8px 0',
      fontSize: '1rem',
      textAlign: 'left',
      border: '1px solid #ccc',
      borderRadius: '4px',
      cursor: 'pointer',
      backgroundColor: '#f9f9f9'
    }}
  >
    {children}
  </button>
);


export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    service: '',
    healthCertificate: '',
    vatRefund: '',
    serviceType: '',
    companyName: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDisqualified, setIsDisqualified] = useState(false);
  const [disqualificationMessage, setDisqualificationMessage] = useState('');
  const router = useRouter();

  const handleNext = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Qualification Logic
    if (field === 'service' && value === 'OTHER') {
      setDisqualificationMessage("Sorry, we only provide IOR services.");
      setIsDisqualified(true);
      return;
    }
    if (field === 'healthCertificate' && value === 'YES') {
      setDisqualificationMessage("Sorry, we don't provide services for Health Cargo.");
      setIsDisqualified(true);
      return;
    }
    if (field === 'vatRefund' && value === 'YES') {
      setDisqualificationMessage("Sorry, we don't provide VAT refund services.");
      setIsDisqualified(true);
      return;
    }

    setStep(prev => prev + 1);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'An unknown error occurred.');
      }

      // On success, redirect to a confirmation page
      router.push('/registration-success'); // We will create this page next

    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isDisqualified) {
    return <DisqualificationMessage message={disqualificationMessage} />;
  }

  return (
    <div style={{ maxWidth: '600px', margin: 'auto', padding: '2rem' }}>
      {step === 1 && (
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Step 1: Which service are you interested in?</h2>
          <StepButton onClick={() => handleNext('service', 'IMPORT_DIRECT')}>Import Direct</StepButton>
          <StepButton onClick={() => handleNext('service', 'IMPORT_INDIRECT')}>Import Indirect</StepButton>
          <StepButton onClick={() => handleNext('service', 'EXPORT_DIRECT')}>Export Direct</StepButton>
          <StepButton onClick={() => handleNext('service', 'OTHER')}>Other Logistics Services</StepButton>
        </div>
      )}

      {step === 2 && (
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Step 2: Does the cargo require a Health Certificate?</h2>
          <StepButton onClick={() => handleNext('healthCertificate', 'NO')}>No</StepButton>
          <StepButton onClick={() => handleNext('healthCertificate', 'YES')}>Yes</StepButton>
        </div>
      )}

      {step === 3 && (
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Step 3: Are you looking for import VAT refund?</h2>
          <StepButton onClick={() => handleNext('vatRefund', 'NO')}>No</StepButton>
<StepButton onClick={() => handleNext('vatRefund', 'YES')}>Yes</StepButton>
        </div>
      )}

      {step === 4 && (
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Step 4: Do you need a ONE TIME service or MONTHLY service?</h2>
          <StepButton onClick={() => handleNext('serviceType', 'ONE_TIME')}>One Time Service</StepButton>
          <StepButton onClick={() => handleNext('serviceType', 'MONTHLY')}>Monthly / Regular Services</StepButton>
        </div>
      )}

      {step === 5 && (
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#28a745' }}>Great! We can provide you service!</h2>
          <p style={{ color: '#555', marginBottom: '1.5rem' }}>Please fill out your details to create an account.</p>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input name="companyName" placeholder="Company Name" required onChange={handleFormChange} style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
            <input name="firstName" placeholder="First Name" required onChange={handleFormChange} style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
            <input name="lastName" placeholder="Last Name" required onChange={handleFormChange} style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
            <input type="email" name="email" placeholder="Email Address" required onChange={handleFormChange} style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
            <input type="password" name="password" placeholder="Password (min. 8 characters)" required onChange={handleFormChange} style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
            <button type="submit" disabled={isSubmitting} style={{ padding: '12px', border: 'none', borderRadius: '4px', backgroundColor: '#007bff', color: 'white', cursor: 'pointer' }}>
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </button>
            {error && <p style={{ color: 'red', marginTop: '0.5rem' }}>{error}</p>}
          </form>
        </div>
      )}
    </div>
  );
}
