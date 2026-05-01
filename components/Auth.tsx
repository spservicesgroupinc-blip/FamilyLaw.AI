import React, { useState } from 'react';
import { Icons } from '../constants';
import { api, UserSession } from '../services/api';

interface AuthProps {
  onLogin: (session: UserSession) => void;
  onSignUpClick: () => void;
}

export const Auth: React.FC<AuthProps> = ({ onLogin, onSignUpClick }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const session = await api.login(email, password);
      onLogin(session);
    } catch (err: any) {
      setError(err.message || "Authentication failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-legal-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-legal-900 text-legal-50 mb-4 shadow-lg">
          <Icons.Scale className="w-8 h-8" />
        </div>
        <h2 className="mt-2 text-3xl font-extrabold text-legal-900 font-serif">
          FamilyLaw.AI
        </h2>
        <div className="text-[10px] uppercase tracking-widest font-bold text-legal-500 mt-1 mb-2">An R2 Technologies Project</div>
        <p className="mt-2 text-sm text-legal-600 uppercase tracking-widest font-bold">
          Sign in to your account
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-legal-200">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-[10px] uppercase tracking-widest font-bold text-legal-600 mb-1">Email address</label>
              <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-3 border border-legal-200 rounded focus:border-legal-500 focus:ring-1 focus:ring-legal-500 outline-none font-serif text-sm" />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-widest font-bold text-legal-600 mb-1">Password</label>
              <input required type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-3 border border-legal-200 rounded focus:border-legal-500 focus:ring-1 focus:ring-legal-500 outline-none font-serif text-sm" />
            </div>

            {error && (
              <div className="text-red-600 text-xs font-bold bg-red-50 p-3 rounded border border-red-200">
                {error}
              </div>
            )}

            <div>
              <button disabled={loading} type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-legal-900 hover:bg-legal-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-legal-500 uppercase tracking-wider disabled:opacity-50">
                {loading ? 'Processing...' : 'Sign in'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-legal-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-legal-500">
                  New to FamilyLaw.AI?
                </span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={onSignUpClick}
                className="w-full flex justify-center py-3 px-4 border border-legal-300 rounded-md shadow-sm text-sm font-medium text-legal-700 bg-white hover:bg-legal-50 uppercase tracking-wider"
              >
                Create an account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
