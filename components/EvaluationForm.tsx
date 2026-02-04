
import React, { useState, useMemo } from 'react';
import { Candidate, Question, User, EvaluationAnswer } from '../types.ts';
import { ChevronLeft, Save, AlertCircle, CheckCircle, RefreshCw, Home } from 'lucide-react';
import { submitEvaluation } from '../services/api.ts';

interface EvaluationFormProps {
  candidate: Candidate;
  questions: Question[];
  user: User;
  onBack: () => void;
  onSubmitSuccess: () => void;
}

const EvaluationForm: React.FC<EvaluationFormProps> = ({ candidate, questions, user, onBack, onSubmitSuccess }) => {
  const [answers, setAnswers] = useState<Record<string, EvaluationAnswer>>({});
  const [comments, setComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categories = useMemo(() => {
    const map: Record<string, Question[]> = {};
    questions.forEach(q => {
      if (!map[q.category]) map[q.category] = [];
      map[q.category].push(q);
    });
    return map;
  }, [questions]);

  const totalScore = useMemo(() => {
    return Object.values(answers).reduce((acc, curr) => acc + (Number(curr.score) || 0), 0);
  }, [answers]);

  const maxPossibleScore = useMemo(() => {
    return questions.reduce((acc, q) => acc + (Number(q.scoreHigh) || 0), 0);
  }, [questions]);

  const handleScore = (q: Question, level: 'Low' | 'Mid' | 'High') => {
    const rawScore = level === 'Low' ? q.scoreLow : level === 'Mid' ? q.scoreMid : q.scoreHigh;
    const score = Number(rawScore) || 0;
    setAnswers(prev => ({
      ...prev,
      [q.id]: { questionId: q.id, level, score }
    }));
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < questions.length) {
      setError('กรุณาประเมินให้ครบทุกหัวข้อก่อนบันทึก');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await submitEvaluation({
        action: 'submitEvaluation',
        candidateName: candidate.name,
        area: candidate.area,
        role: user.role,
        evaluatorName: user.name,
        totalScore: totalScore,
        maxPossibleScore: maxPossibleScore,
        answers: Object.values(answers),
        comment: comments
      });
      
      setShowSuccess(true);
      setTimeout(() => onSubmitSuccess(), 2500);
    } catch (err) {
      setError('บันทึกข้อมูลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
      setIsSubmitting(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white animate-fadeIn text-center">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="w-16 h-16 text-green-500 animate-bounce" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">บันทึกสำเร็จ</h2>
        <p className="text-slate-500 mb-8">ข้อมูลการประเมินถูกส่งเข้าระบบเรียบร้อยแล้ว</p>
        <button onClick={onSubmitSuccess} className="flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-600 rounded-2xl font-bold active:scale-95 transition-all">
          <Home className="w-5 h-5" /> กลับหน้าหลัก
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden animate-fadeIn relative">
      <header className="glass-header sticky top-0 z-30 px-6 py-4 flex items-center justify-between">
        <button onClick={onBack} className="p-2 -ml-2 text-slate-600 hover:text-blue-600 flex items-center gap-1 font-bold text-sm">
          <ChevronLeft className="w-5 h-5" /> กลับ
        </button>
        <div className="text-center">
          <h2 className="font-bold text-slate-800 text-sm">ประเมิน: {candidate.name}</h2>
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">ID: {candidate.id}</p>
        </div>
        <button onClick={onBack} className="text-slate-400 hover:text-blue-600">
          <Home className="w-5 h-5" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-6 pb-40 space-y-8">
        {/* Profile Card */}
        <div className="p-6 bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl text-white shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">คะแนนการประเมิน</span>
            <span className="text-xs bg-blue-500 px-2 py-0.5 rounded-full font-bold">พื้นที่: {candidate.area}</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-black">{totalScore}</span>
            <span className="text-slate-500 font-bold text-lg">/ {maxPossibleScore}</span>
          </div>
        </div>

        {/* Dynamic Questions */}
        {Object.entries(categories).map(([category, qs]) => (
          <div key={category} className="space-y-4">
            <h4 className="text-xs font-black text-blue-600 uppercase tracking-widest pl-2 border-l-4 border-blue-500">
              {category}
            </h4>
            {qs.map(q => (
              <div key={q.id} className="glass-card p-5 rounded-3xl border-none shadow-sm space-y-4">
                <h5 className="font-bold text-slate-800 text-[15px] leading-snug">{q.question}</h5>
                
                {/* แสดงรายละเอียดจาก Column F */}
                <div className="w-full bg-slate-50 p-4 rounded-xl border border-slate-100 text-[11px] text-slate-600 min-h-[60px] flex items-center leading-relaxed whitespace-pre-line">
                  {q.detail || "ไม่มีรายละเอียดเพิ่มเติม"}
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                  {(['Low', 'Mid', 'High'] as const).map(lvl => {
                    const isActive = answers[q.id]?.level === lvl;
                    const val = lvl === 'Low' ? q.scoreLow : lvl === 'Mid' ? q.scoreMid : q.scoreHigh;
                    return (
                      <button
                        key={lvl}
                        onClick={() => handleScore(q, lvl)}
                        className={`py-3 px-2 rounded-2xl transition-all border-2 flex flex-col items-center
                          ${isActive 
                            ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100' 
                            : 'bg-white text-slate-400 border-slate-100 hover:border-blue-200'}`}
                      >
                        <span className="text-[10px] font-black uppercase mb-1">{lvl}</span>
                        {/* แสดงเฉพาะตัวเลขคะแนน */}
                        <span className={`text-sm font-bold ${isActive ? 'text-white' : 'text-slate-800'}`}>
                          {val}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ))}

        <div className="space-y-4">
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest pl-2 border-l-4 border-slate-300">ความเห็นเพิ่มเติม</h4>
          <textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="สรุปจุดเด่นหรือข้อควรระวังของผู้สมัคร..."
            className="w-full glass-card p-5 rounded-3xl min-h-[140px] text-sm focus:ring-2 focus:ring-blue-500 border-none outline-none shadow-sm"
          />
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-6 bg-gradient-to-t from-slate-50 via-slate-50 to-transparent">
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-200 rounded-2xl flex items-center gap-2 text-red-700 text-xs font-bold animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 text-lg shadow-2xl transition-all active:scale-95
            ${isSubmitting ? 'bg-slate-300 text-slate-500' : 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white'}`}
        >
          {isSubmitting ? <RefreshCw className="w-6 h-6 animate-spin" /> : <><Save className="w-5 h-5" /> บันทึกการประเมิน</>}
        </button>
      </div>
    </div>
  );
};

export default EvaluationForm;
