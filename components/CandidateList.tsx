
import React, { useState, useMemo } from 'react';
import { Candidate, User } from '../types.ts';
import { Search, MapPin, CheckCircle2, UserCircle2, ChevronRight, RefreshCw, Clock, XCircle } from 'lucide-react';

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
      const areaMatch = user.role === 'Recruiter' || c.area === user.area;
      const searchMatch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.position.toLowerCase().includes(searchQuery.toLowerCase());
      return areaMatch && searchMatch;
    });
  }, [candidates, user, searchQuery]);

  return (
    <div className="flex flex-col h-screen overflow-hidden animate-fadeIn bg-slate-50">
      <header className="glass-header sticky top-0 z-30 px-6 pt-8 pb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-slate-200 shadow-sm">
              <UserCircle2 className="w-7 h-7 text-slate-400" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800 text-lg leading-tight">{user.name}</h2>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{user.area}</span>
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
            placeholder="ค้นหา..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all text-sm font-medium shadow-sm outline-none"
          />
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3 pb-28">
        {filteredCandidates.length === 0 ? (
          <div className="text-center py-20 text-slate-300 font-bold">ไม่พบข้อมูล</div>
        ) : (
          filteredCandidates.map(candidate => {
            const isDone = candidate.status === 'สัมภาษณ์แล้ว';
            const isPassed = Number(candidate.totalScore) >= 80;

            return (
              <button
                key={candidate.id}
                onClick={() => !isDone && onSelect(candidate)}
                disabled={isDone}
                className={`w-full text-left bg-white p-5 rounded-3xl flex items-center justify-between transition-all relative overflow-hidden border border-slate-100 shadow-sm
                  ${isDone ? 'cursor-default' : 'hover:border-indigo-200 active:scale-[0.98] group'}`}
              >
                <div className="flex flex-col gap-1 flex-1">
                  <h3 className="font-bold text-slate-800 text-[17px] leading-tight">{candidate.name}</h3>
                  <div className="flex items-center gap-2">
                    {isDone ? (
                      <span className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg ${isPassed ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        {isPassed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        {isPassed ? 'ผ่าน' : 'ไม่ผ่าน'}
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-amber-500 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-100 uppercase tracking-tighter">
                        รอการประเมิน
                      </span>
                    )}
                  </div>
                </div>

                {isDone ? (
                  <div className="text-right">
                    <div className="text-2xl font-black text-slate-800 tabular-nums leading-none mb-1">{candidate.totalScore}</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">คะแนน</div>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 px-4 py-2 bg-red-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-red-200 group-hover:bg-red-600 transition-colors">
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
