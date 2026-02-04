
import React, { useState, useMemo } from 'react';
import { Candidate, User } from '../types';
import { Search, MapPin, CheckCircle2, UserCircle2, ChevronRight, RefreshCw } from 'lucide-react';

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
    <div className="flex flex-col h-screen overflow-hidden animate-fadeIn">
      {/* Sticky Header */}
      <header className="glass-header sticky top-0 z-30 px-6 pt-8 pb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <UserCircle2 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800 text-lg leading-tight">{user.name}</h2>
              <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">{user.role}</span>
            </div>
          </div>
          <button 
            onClick={onRefresh}
            className={`p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all ${isRefreshing ? 'animate-spin' : ''}`}
            disabled={isRefreshing}
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="ค้นหาชื่อ หรือตำแหน่งงาน..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-100 border-none rounded-xl focus:ring-2 focus:ring-blue-500 transition-all text-sm font-medium"
          />
        </div>
      </header>

      {/* List Body */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 pb-24">
        <div className="px-2 mb-4">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            {user.role === 'Recruiter' ? 'Candidates (All Areas)' : `Candidates in ${user.area}`}
          </p>
        </div>

        {filteredCandidates.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-400 font-medium">ไม่พบข้อมูลผู้สมัคร</p>
          </div>
        ) : (
          filteredCandidates.map(candidate => (
            <button
              key={candidate.id}
              onClick={() => onSelect(candidate)}
              className="w-full text-left glass-card p-4 rounded-2xl flex items-center justify-between hover:border-blue-300 transition-all active:scale-95 group relative overflow-hidden"
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${candidate.status === 'สัมภาษณ์แล้ว' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                  {candidate.status === 'สัมภาษณ์แล้ว' ? <CheckCircle2 className="w-7 h-7" /> : <UserCircle2 className="w-7 h-7" />}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 group-hover:text-blue-700 transition-colors">{candidate.name}</h3>
                  <p className="text-xs text-slate-500 font-medium">{candidate.position}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span className="text-[10px] text-slate-400 font-semibold">{candidate.area}</span>
                  </div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-400 transition-colors" />
              
              {candidate.status === 'สัมภาษณ์แล้ว' && (
                <div className="absolute top-0 right-0">
                  <div className="bg-green-500 text-white text-[9px] px-2 py-0.5 rounded-bl-lg font-bold">DONE</div>
                </div>
              )}
            </button>
          ))
        )}
      </div>

      {/* Floating Indicators */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto pointer-events-none">
         <div className="px-6 py-4 bg-gradient-to-t from-slate-50 via-slate-50 to-transparent">
            {/* Soft gradient to prevent harsh cut-off */}
         </div>
      </div>
    </div>
  );
};

export default CandidateList;
