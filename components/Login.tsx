
import React, { useState } from 'react';
import { User } from '../types';
import { Phone, LogIn, ShieldCheck } from 'lucide-react';

interface LoginProps {
  users: User[];
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ users, onLogin }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const user = users.find(u => u.phone === phoneNumber);
    if (user) {
      onLogin(user);
    } else {
      setError('ไม่พบหมายเลขโทรศัพท์นี้ในระบบ');
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 animate-fadeIn">
      <div className="mb-12 text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl flex items-center justify-center mx-auto shadow-lg mb-6">
          <ShieldCheck className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-800">
          Interview Pro
        </h1>
        <p className="text-slate-500 mt-2 font-medium">Candidate Evaluation System</p>
      </div>

      <div className="w-full glass-card p-6 rounded-3xl shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2 ml-1">
              หมายเลขโทรศัพท์
            </label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="08XXXXXXXX"
                className="w-full pl-12 pr-4 py-4 bg-slate-100 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all text-lg font-medium"
                required
              />
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-sm font-medium animate-fadeIn ml-1">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl font-bold shadow-lg shadow-blue-200 active:scale-95 transition-transform flex items-center justify-center gap-2 text-lg"
          >
            <LogIn className="w-5 h-5" />
            เข้าสู่ระบบ
          </button>
        </form>
      </div>

      <p className="mt-12 text-slate-400 text-sm">
        Authorized Personnel Only
      </p>
    </div>
  );
};

export default Login;
