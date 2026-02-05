
import React, { useState } from 'react';
import { User } from '../types.ts';
import { Phone, LogIn, ShieldCheck, AlertCircle } from 'lucide-react';

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

    const cleanPhone = phoneNumber.trim();

    if (!cleanPhone) {
      setError('กรุณากรอกหมายเลขโทรศัพท์');
      return;
    }

    // แก้ไขจาก u.phone เป็น u.tel ตามหัวตารางใน Sheet hierarchy
    const user = users.find(u => String(u.tel).trim() === cleanPhone);
    
    if (user) {
      onLogin(user);
    } else {
      setError('ไม่พบหมายเลขโทรศัพท์นี้ในระบบ หรือคุณยังไม่ได้รับอนุญาต');
      console.log('Available users:', users);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 animate-fadeIn bg-slate-50 h-screen">
      <div className="mb-12 text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl shadow-indigo-200 mb-6 rotate-3">
          <ShieldCheck className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Interview Pro
        </h1>
        <p className="text-slate-400 mt-2 font-bold uppercase tracking-[0.2em] text-[10px]">Candidate Evaluation System</p>
      </div>

      <div className="w-full max-w-sm bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/60 border border-slate-100">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
              หมายเลขโทรศัพท์
            </label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center group-focus-within:bg-indigo-50 transition-colors">
                <Phone className="w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
              </div>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => {
                  setPhoneNumber(e.target.value);
                  if(error) setError(null);
                }}
                placeholder="08XXXXXXXX"
                className="w-full pl-16 pr-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-500 transition-all text-lg font-black tracking-wider outline-none placeholder:text-slate-300"
                required
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-rose-500 bg-rose-50 p-4 rounded-2xl border border-rose-100 animate-fadeIn">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="text-xs font-bold leading-tight">
                {error}
              </p>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-5 bg-slate-900 hover:bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-100 active:scale-95 transition-all flex items-center justify-center gap-3 text-sm uppercase tracking-widest"
          >
            <LogIn className="w-5 h-5" />
            เข้าสู่ระบบ
          </button>
        </form>
      </div>

      <div className="mt-12 flex flex-col items-center gap-2">
        <p className="text-slate-300 text-[10px] font-black uppercase tracking-[0.3em]">
          Authorized Personnel Only
        </p>
        <div className="h-1 w-8 bg-slate-200 rounded-full"></div>
      </div>
    </div>
  );
};

export default Login;
