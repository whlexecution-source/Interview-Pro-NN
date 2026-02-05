
import React, { useState, useMemo } from 'react';
import { Candidate, User } from '../types.ts';
import { Search, MapPin, CheckCircle2, UserCircle2, RefreshCw, XCircle } from 'lucide-react';

interface CandidateListProps {
  candidates: Candidate[];
  user: User;
  onSelect: (candidate: Candidate) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

const CandidateList: React.FC<CandidateListProps> = ({ candidates, user, onSelect, onRefresh, isRefreshing }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCandidates = useMemo(() => {
    return candidates.filter(c => {
      // Recruiter เห็นทุกคนใน Area (หรือทั้งหมดถ้าเป็น All) 
      // Supervisor เห็นเฉพาะคนใน Area ตัวเอง
      const areaMatch = user.area === 'All' || c.area === user.area;
      const searchMatch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.position.toLowerCase().includes(searchQuery.toLowerCase());
      return areaMatch && searchMatch;
    });
  }, [candidates, user, searchQuery]);

  return (
    <div className="flex flex-col h-screen overflow-hidden animate-fadeIn bg-slate-50">
      <header className="glass-header sticky top-0 z-30 px-6 pt-8 pb-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-slate-200 shadow-sm overflow-hidden">
               {/* Avatar หรือ Icon ตาม Role */}
               <div className={`w-full h-full flex items-center justify-center ${user.role === 'Supervisor' ? 'bg-indigo-600' : 'bg-rose-500'}`}>
                  <span className="text-white font-black text-xs">{user.role[0]}</span>
               </div>
            </div>
            <div>
              <h2 className="font-bold text-slate-800 text-lg leading-tight">{user.name}</h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] font-black text-white bg-slate-400 px-1.5 py-0.5 rounded uppercase tracking-wider">{user.role}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{user.area}</span>
              </div>
            </div>
          </div>
          <button 
            onClick={onRefresh}
            className={`p-3 rounded-2xl bg-white text-slate-400 hover:text-indigo-600 shadow-sm border border-slate-100 transition-all active:scale-90 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`}
            disabled={isRefreshing}
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
          <input
            type="text"
            placeholder="ค้นหาผู้สมัคร..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all text-sm font-medium shadow-sm outline-none"
          />
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3 pb-28">
        {filteredCandidates.length === 0 ? (
          <div className="text-center py-20 text-slate-300 font-bold">ไม่พบรายชื่อผู้สมัคร</div>
        ) : (
          filteredCandidates.map(candidate => {
            // เลือกใช้สถานะและคะแนนตาม Role ของผู้ใช้ปัจจุบัน
            const roleStatus = user.role === 'Supervisor' ? candidate.Sup_Status : candidate.Rec_Status;
            const roleScore = user.role === 'Supervisor' ? candidate.Sup_Score : candidate.Rec_Score;
            
            const isDone = roleStatus === 'สัมภาษณ์แล้ว';
            const isPassed = Number(roleScore) >= 80;

            return (
              <button
                key={candidate.id}
                onClick={() => !isDone && onSelect(candidate)}
                disabled={isDone}
                className={`w-full text-left bg-white p-5 rounded-3xl flex items-center justify-between transition-all relative overflow-hidden border border-slate-100 shadow-sm
                  ${isDone ? 'opacity-70 cursor-default grayscale-[0.4]' : 'hover:border-indigo-200 active:scale-[0.98] group'}`}
              >
                <div className="flex flex-col gap-1 flex-1">
                  <div className="flex items-center gap-2">
                     <h3 className="font-bold text-slate-800 text-[17px] leading-tight">{candidate.name}</h3>
                     <span className="text-[10px] text-slate-400 font-bold bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">{candidate.area}</span>
                  </div>
                  <p className="text-xs text-slate-400 font-medium mb-1">{candidate.position}</p>
                  <div className="flex items-center gap-2">
                    {isDone ? (
                      <span className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg ${isPassed ? 'bg-green-100 text-green-600' : 'bg-rose-100 text-rose-600'}`}>
                        {isPassed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        {isPassed ? 'ผ่านเกณฑ์' : 'ไม่ผ่านเกณฑ์'}
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-amber-500 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-100 uppercase tracking-tighter">
                        รอคุณประเมิน
                      </span>
                    )}
                  </div>
                </div>

                {isDone ? (
                  <div className="text-right">
                    <div className="text-2xl font-black text-slate-800 tabular-nums leading-none mb-1">{roleScore}</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">คะแนน</div>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-indigo-100 group-hover:bg-indigo-700 transition-colors">
                    เริ่มประเมิน
                  </div>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default CandidateList;
