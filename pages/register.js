// File: pages/register.js

import { useState } from 'react';
import { useRouter } from 'next/router';

const DisqualificationMessage = ({ message }) => (
  <div>
    <h2>Service Not Available</h2>
    <p>{message}</p>
    <p>We specialize in IOR services for standard cargo. Thank you for your interest.</p>
  </div>
);

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ /* ... initial state ... */ });
  const [error, setError] = useState('');
  const [isDisqualified, setIsDisqualified] = useState(false);
  const [disqualificationMessage, setDisqualificationMessage] = useState('');
  const router = useRouter();

  const handleNext = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === 'service' && value === 'OTHER') {
      setDisqualificationMessage("Sorry, we only provide IOR services.");
      setIsDisqualified(true);
      return;
    }
    // ... other disqualification logic ...
    setStep(prev => prev + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      router.push('/registration-success'); // A page that says "Check your email!"
    } catch (err) {
      setError(err.message);
    }
  };

  if (isDisqualified) {
    return <DisqualificationMessage message={disqualificationMessage} />;
  }

  return (
    <div>
      {step === 1 && (
        <div>
          <h2>Step 1: Which service are you interested in?</h2>
          <button onClick={() => handleNext('service', 'IMPORT_DIRECT')}>Import Direct</button>
          {/* ... other buttons ... */}
        </div>
      )}
      {/* ... other steps 2, 3, 4 ... */}
      {step === 5 && (
        <div>
          <h2>Great! We can provide you service!</h2>
          <form onSubmit={handleSubmit}>
            <input name="companyName" placeholder="Company Name" required onChange={e => setFormData({...formData, companyName: e.target.value})} />
            <input name="firstName" placeholder="First Name" required onChange={e => setFormData({...formData, firstName: e.target.value})} />
            <input name="lastName" placeholder="Last Name" required onChange={e => setFormData({...formData, lastName: e.target.value})} />
            <input type="email" name="email" placeholder="Email" required onChange={e => setFormData({...formData, email: e.target.value})} />
            <input type="password" name="password" placeholder="Password" required onChange={e => setFormData({...formData, password: e.target.value})} />
            <button type="submit">Create Account</button>
            {error && <p style={{color: 'red'}}>{error}</p>}
          </form>
        </div>
      )}
    </div>
  );
}
