
import React, { useState, useMemo } from 'react';
import { Candidate, User } from '../types.ts';
import { Search, CheckCircle2, RefreshCw, XCircle, LogOut, UserCircle, MapPin, Store } from 'lucide-react';

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
      const areaMatch = user.area === 'All' || c.area === user.area;
      const storeName = c["store name"] || '';
      const searchMatch = 
        c.candidate_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        c.area.toLowerCase().includes(searchQuery.toLowerCase()) ||
        storeName.toLowerCase().includes(searchQuery.toLowerCase());
      return areaMatch && searchMatch;
    });
  }, [candidates, user, searchQuery]);

  return (
    <div className="flex flex-col h-screen overflow-hidden animate-fadeIn bg-slate-50">
      <header className="glass-header sticky top-0 z-30 px-6 pt-8 pb-6 shadow-sm border-b border-slate-200/50">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg border-2 border-white ${user.role === 'Supervisor' ? 'bg-indigo-600' : 'bg-rose-500'}`}>
                 <UserCircle className="w-8 h-8 text-white opacity-90" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            <div>
              <h2 className="font-black text-slate-800 text-xl leading-none">{user.name}</h2>
              <div className="flex items-center gap-1.5 mt-2">
                <span className={`text-[10px] font-black text-white px-2 py-0.5 rounded-full uppercase tracking-wider ${user.role === 'Supervisor' ? 'bg-indigo-500' : 'bg-rose-500'}`}>
                  {user.role}
                </span>
                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full uppercase tracking-widest">
                  {user.area}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={onRefresh}
              className={`p-3 rounded-2xl bg-white text-slate-400 hover:text-indigo-600 shadow-sm border border-slate-100 transition-all active:scale-90 ${isRefreshing ? 'animate-spin text-indigo-600 border-indigo-100' : ''}`}
              disabled={isRefreshing}
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button 
              onClick={() => window.location.reload()} 
              className="p-3 rounded-2xl bg-white text-slate-400 hover:text-rose-600 shadow-sm border border-slate-100 transition-all active:scale-90"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
          <input
            type="text"
            placeholder="ค้นหาชื่อ, ร้าน หรือพื้นที่..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all text-sm font-medium shadow-sm outline-none"
          />
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 pb-32">
        {filteredCandidates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-300">
            <Search className="w-12 h-12 mb-4 opacity-20" />
            <p className="font-bold">ไม่พบรายชื่อผู้สมัครในพื้นที่ของคุณ</p>
          </div>
        ) : (
          filteredCandidates.map(candidate => {
            const roleStatus = user.role === 'Supervisor' ? candidate.sup_status : candidate.rec_status;
            const roleScore = user.role === 'Supervisor' ? candidate.sup_score : candidate.rec_score;
            const isDone = roleStatus === 'สัมภาษณ์แล้ว';
            const scoreNum = Number(roleScore) || 0;
            const isPassed = scoreNum >= 80;

            return (
              <button
                key={candidate.candidate_name + candidate.phone}
                onClick={() => !isDone && onSelect(candidate)}
                disabled={isDone}
                className={`w-full text-left bg-white p-6 rounded-[2rem] flex items-center justify-between transition-all relative overflow-hidden border border-slate-100 shadow-sm
                  ${isDone ? 'bg-slate-50/50 shadow-inner' : 'hover:border-indigo-200 hover:shadow-md active:scale-[0.98] group'}`}
              >
                <div className="flex flex-col gap-1.5 flex-1 pr-4">
                  <h3 className="font-black text-slate-800 text-lg leading-tight">{candidate.candidate_name}</h3>
                  
                  <div className="flex flex-col gap-1 mt-0.5">
                    <div className="flex items-center gap-1.5 text-indigo-500">
                      <Store className="w-3.5 h-3.5 shrink-0" />
                      <span className="text-[11px] font-black uppercase tracking-wide">{candidate["store name"] || "N/A"}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <MapPin className="w-3 h-3" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">{candidate.area}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-3">
                    {isDone ? (
                      <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isPassed ? 'bg-green-100 text-green-700' : 'bg-rose-100 text-rose-700'}`}>
                        {isPassed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        {isPassed ? 'ผ่านเกณฑ์' : 'ไม่ผ่าน'}
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-600 text-[10px] font-black uppercase tracking-widest border border-amber-100">
                        รอการประเมิน
                      </div>
                    )}
                  </div>
                </div>

                {isDone ? (
                  <div className="text-right flex flex-col items-end">
                    <div className={`text-3xl font-black tabular-nums leading-none ${isPassed ? 'text-slate-800' : 'text-rose-500'}`}>
                      {scoreNum}
                    </div>
                    <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-1">เต็ม 100</div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-slate-200 group-hover:bg-indigo-600 transition-all">
                    ประเมิน
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
