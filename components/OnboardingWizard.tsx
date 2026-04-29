import React, { useState } from 'react';
import { UserProfile, Child } from '../types';

interface OnboardingWizardProps {
  mode: 'register' | 'profile_only';
  onComplete: (data: { account?: any, profile: UserProfile }) => Promise<void>;
  onCancel?: () => void;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ mode, onComplete, onCancel }) => {
  const [step, setStep] = useState(mode === 'register' ? 1 : 2);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [account, setAccount] = useState({ email: '', password: '', role: 'Pro Se Litigant' });
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    address: '',
    spouseName: '',
    children: []
  });

  const nextStep = () => {
    setError('');
    if (step === 1 && (!account.email || !account.password)) {
        setError("Email and password are required.");
        return;
    }
    if (step === 2 && (!profile.name || !profile.address)) {
        setError("Name and address are required.");
        return;
    }
    setStep(step + 1);
  }
  const prevStep = () => setStep(step - 1);

  const addChild = () => {
    setProfile({ ...profile, children: [...profile.children, { name: '', age: 0 }] });
  };

  const updateChild = (index: number, field: keyof Child, value: any) => {
    const children = [...profile.children];
    children[index][field] = value;
    setProfile({ ...profile, children });
  };

  const handleFinish = async () => {
      setLoading(true);
      setError('');
      try {
          await onComplete({ account: mode === 'register' ? account : undefined, profile });
      } catch (err: any) {
          setError(err.message || "An error occurred.");
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="fixed inset-0 bg-legal-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-lg w-full border border-legal-200 my-8">
        <h2 className="text-2xl font-serif font-bold text-legal-900 mb-6">
            {mode === 'register' ? 'Create Your Account' : 'Complete Your Profile'}
        </h2>

        {error && (
          <div className="mb-4 text-red-600 text-xs font-bold bg-red-50 p-3 rounded border border-red-200">
            {error}
          </div>
        )}

        {step === 1 && mode === 'register' && (
          <div className="space-y-4">
            <div>
                <label className="block text-sm font-bold text-legal-600 mb-1">Email Address</label>
                <input type="email" value={account.email} onChange={e => setAccount({...account, email: e.target.value})} className="w-full p-3 border border-legal-200 rounded" placeholder="you@example.com" />
            </div>
            <div>
                <label className="block text-sm font-bold text-legal-600 mb-1">Password</label>
                <input type="password" value={account.password} onChange={e => setAccount({...account, password: e.target.value})} className="w-full p-3 border border-legal-200 rounded" placeholder="••••••••" />
            </div>
            <div>
                <label className="block text-sm font-bold text-legal-600 mb-1">Role</label>
                <select value={account.role} onChange={e => setAccount({...account, role: e.target.value})} className="w-full p-3 border border-legal-200 rounded bg-white">
                    <option>Pro Se Litigant</option>
                    <option>Attorney</option>
                    <option>Paralegal</option>
                </select>
            </div>
            <div className="flex gap-2 pt-4">
              {onCancel && <button onClick={onCancel} className="w-full bg-legal-100 text-legal-900 p-3 rounded-lg font-bold hover:bg-legal-200 transition">Cancel</button>}
              <button onClick={nextStep} className="w-full bg-legal-900 text-white p-3 rounded-lg font-bold hover:bg-legal-800 transition">Next</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
                <label className="block text-sm font-bold text-legal-600 mb-1">Full Name</label>
                <input type="text" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} className="w-full p-3 border border-legal-200 rounded" placeholder="John Doe" />
            </div>
            <div>
                <label className="block text-sm font-bold text-legal-600 mb-1">Address</label>
                <input type="text" value={profile.address} onChange={e => setProfile({...profile, address: e.target.value})} className="w-full p-3 border border-legal-200 rounded" placeholder="123 Main St, City, State, ZIP" />
            </div>
            <div className="flex gap-2 pt-4">
              {mode === 'register' && <button onClick={prevStep} className="w-full bg-legal-100 text-legal-900 p-3 rounded-lg font-bold hover:bg-legal-200 transition">Back</button>}
              <button onClick={nextStep} className="w-full bg-legal-900 text-white p-3 rounded-lg font-bold hover:bg-legal-800 transition">Next</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div>
                <label className="block text-sm font-bold text-legal-600 mb-1">Spouse / Ex-Spouse Name</label>
                <input type="text" value={profile.spouseName} onChange={e => setProfile({...profile, spouseName: e.target.value})} className="w-full p-3 border border-legal-200 rounded" placeholder="Jane Doe" />
            </div>

            <div className="pt-2">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-legal-900">Children</h3>
                    <button onClick={addChild} className="text-xs bg-legal-100 text-legal-800 px-2 py-1 rounded font-bold hover:bg-legal-200 transition">+ Add Child</button>
                </div>
                {profile.children.length === 0 && <p className="text-xs text-legal-500 italic">No children added.</p>}
                <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                    {profile.children.map((child, index) => (
                    <div key={index} className="flex gap-2">
                        <input type="text" placeholder="Child's Name" value={child.name} onChange={e => updateChild(index, 'name', e.target.value)} className="w-full p-2 border border-legal-200 rounded text-sm" />
                        <input type="number" placeholder="Age" value={child.age || ''} onChange={e => updateChild(index, 'age', parseInt(e.target.value) || 0)} className="w-20 p-2 border border-legal-200 rounded text-sm" />
                        <button onClick={() => {
                            const newChildren = profile.children.filter((_, i) => i !== index);
                            setProfile({...profile, children: newChildren});
                        }} className="text-red-500 hover:text-red-700 font-bold px-2">&times;</button>
                    </div>
                    ))}
                </div>
            </div>

            <div className="flex gap-2 pt-4">
              <button onClick={prevStep} disabled={loading} className="w-full bg-legal-100 text-legal-900 p-3 rounded-lg font-bold hover:bg-legal-200 transition disabled:opacity-50">Back</button>
              <button onClick={handleFinish} disabled={loading} className="w-full bg-legal-900 text-white p-3 rounded-lg font-bold hover:bg-legal-800 transition disabled:opacity-50">
                  {loading ? 'Saving...' : 'Finish Setup'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
