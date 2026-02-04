
import React, { useState, useMemo } from 'react';
import { Candidate, User } from '../types.ts';
import { Search, MapPin, CheckCircle2, UserCircle2, ChevronRight, RefreshCw, Clock } from 'lucide-react';

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
      <header className="glass-header sticky top-0 z-30 px-6 pt-8 pb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <UserCircle2 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800 text-lg leading-tight">{user.name}</h2>
              <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                {user.role === 'Recruiter' ? 'เจ้าหน้าที่สรรหา' : 'หัวหน้างาน'}
              </span>
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

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 pb-24">
        <div className="px-2 mb-4">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            {user.role === 'Recruiter' ? 'รายชื่อผู้สมัครทั้งหมด' : `รายชื่อในพื้นที่ ${user.area}`}
          </p>
        </div>

        {filteredCandidates.length === 0 ? (
          <div className="text-center py-20 text-slate-400 font-medium">ไม่พบข้อมูลผู้สมัคร</div>
        ) : (
          filteredCandidates.map(candidate => {
            const isDone = candidate.status === 'สัมภาษณ์แล้ว';
            const isPassed = candidate.totalScore >= 50;

            return (
              <button
                key={candidate.id}
                onClick={() => !isDone && onSelect(candidate)}
                disabled={isDone}
                className={`w-full text-left glass-card p-4 rounded-2xl flex items-center justify-between transition-all relative overflow-hidden
                  ${isDone ? 'opacity-80 grayscale-[0.3]' : 'hover:border-blue-300 active:scale-95 group'}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${isDone ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                    {isDone ? <CheckCircle2 className="w-7 h-7" /> : <Clock className="w-7 h-7" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">{candidate.name}</h3>
                    <p className="text-[10px] text-slate-500 font-medium">{candidate.position}</p>
                    
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span className="text-[10px] text-slate-400 font-semibold">{candidate.area}</span>
                      </div>
                      
                      {/* Badge สถานะ */}
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-tight 
                        ${isDone ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                        {candidate.status}
                      </span>
                    </div>

                    {isDone && (
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-700">คะแนน: {candidate.totalScore}</span>
                        <span className={`text-[10px] font-black px-2 rounded-lg ${isPassed ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
                          {isPassed ? 'ผ่าน' : 'ไม่ผ่าน'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                {!isDone && <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-400 transition-colors" />}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default CandidateList;
