
import React, { useState, useMemo } from 'react';
import { Candidate, Question, User, EvaluationAnswer } from '../types.ts';
import { ChevronLeft, Save, AlertCircle, CheckCircle, RefreshCw, Home, Info, Target } from 'lucide-react';
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

  const passScore = 80;
  const isPassing = totalScore >= passScore;

  const handleScore = (q: Question, level: 'Low' | 'Mid' | 'High') => {
    const scoreVal = level === 'Low' ? q.scoreLow : level === 'Mid' ? q.scoreMid : q.scoreHigh;
    setAnswers(prev => ({
      ...prev,
      [q.id]: { questionId: q.id, level, score: Number(scoreVal) || 0 }
    }));
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < questions.length) {
      setError('กรุณาประเมินให้ครบถ้วนก่อนบันทึก');
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
      setError('บันทึกไม่สำเร็จ กรุณาลองใหม่');
      setIsSubmitting(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white h-screen text-center animate-fadeIn">
        <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6 border border-green-100 shadow-sm">
          <CheckCircle className="w-14 h-14 text-green-500 animate-bounce" />
        </div>
        <h2 className="text-2xl font-black text-slate-800 mb-2">ประเมินเรียบร้อย</h2>
        <div className="text-4xl font-black text-slate-900 mb-8">{totalScore} <span className="text-sm font-bold text-slate-400">/ {maxPossibleScore}</span></div>
        <button onClick={onSubmitSuccess} className="w-full max-w-[240px] py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-xl active:scale-95 transition-all">
          กลับหน้าหลัก
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden animate-fadeIn bg-slate-50 relative">
      <header className="glass-header sticky top-0 z-30 px-6 py-5 flex flex-col items-center justify-center border-b border-slate-100">
        <button onClick={onBack} className="absolute left-4 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-slate-800 transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h2 className="font-bold text-slate-800 text-[16px] text-center leading-tight">{candidate.name}</h2>
        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">{candidate.area}</p>
      </header>

      <div className="flex-1 overflow-y-auto px-6 pt-8 pb-48 space-y-10">
        {Object.entries(categories).map(([category, qs]) => (
          <div key={category} className="space-y-6">
            <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 pb-2">{category}</h4>
            
            {qs.map((q, qIndex) => (
              <div key={q.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-xs font-black text-slate-400 shrink-0 shadow-inner">
                    {qIndex + 1}
                  </div>
                  <h5 className="font-bold text-slate-800 text-[16px] leading-snug pt-1.5">{q.question}</h5>
                </div>
                
                {/* Scoring Logic Detail Box (Column F) */}
                <div className="bg-[#F8F9FB] p-6 rounded-[1.5rem] border border-slate-100 text-[12px] leading-relaxed text-slate-500 whitespace-pre-line font-medium">
                  {q.detail || "พิจารณาตามความเหมาะสม"}
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                  {(['High', 'Mid', 'Low'] as const).map(lvl => {
                    const isActive = answers[q.id]?.level === lvl;
                    const score = lvl === 'Low' ? q.scoreLow : lvl === 'Mid' ? q.scoreMid : q.scoreHigh;
                    
                    return (
                      <button
                        key={lvl}
                        onClick={() => handleScore(q, lvl)}
                        className={`py-5 px-1 rounded-2xl transition-all border flex flex-col items-center justify-center gap-1.5
                          ${isActive 
                            ? 'bg-white border-indigo-600 shadow-lg shadow-indigo-100 -translate-y-1 ring-2 ring-indigo-500/20' 
                            : 'bg-white text-slate-400 border-slate-200 active:scale-95'}`}
                      >
                        <span className={`text-[12px] font-bold ${isActive ? 'text-indigo-600' : 'text-slate-800'}`}>
                          {lvl === 'Mid' ? 'Medium' : lvl}
                        </span>
                        <span className={`text-[11px] font-medium ${isActive ? 'text-indigo-400' : 'text-slate-400'}`}>
                          {score} คะแนน
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ))}

        {/* Real-time Summary Card */}
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between text-[11px] font-black text-slate-400 uppercase tracking-widest">
            <span>สรุปคะแนนประเมิน</span>
            <span className={isPassing ? 'text-green-500' : 'text-red-500'}>
              {isPassing ? 'ผ่านเกณฑ์' : 'ยังไม่ถึงเกณฑ์'}
            </span>
          </div>
          <div className="flex items-baseline gap-2 justify-center">
            <span className="text-5xl font-black text-slate-900">{totalScore}</span>
            <span className="text-slate-300 font-bold text-xl">/ {maxPossibleScore}</span>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${isPassing ? 'bg-green-500' : 'bg-amber-500'}`}
              style={{ width: `${(totalScore / maxPossibleScore) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="space-y-4">
          <textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="สรุปจุดเด่นหรือข้อสังเกตเพิ่มเติม..."
            className="w-full bg-white p-6 rounded-[2rem] min-h-[140px] text-sm focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-200 border-slate-200 border outline-none shadow-sm transition-all font-medium placeholder:text-slate-300"
          />
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-6 bg-gradient-to-t from-slate-50 via-slate-50 to-transparent z-40">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-xs font-bold animate-fadeIn">
            <AlertCircle className="w-5 h-5 shrink-0" /> {error}
          </div>
        )}
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`w-full py-5 rounded-2xl font-bold flex items-center justify-center gap-3 text-lg shadow-2xl transition-all active:scale-[0.97]
            ${isSubmitting ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-black'}`}
        >
          {isSubmitting ? <RefreshCw className="w-6 h-6 animate-spin" /> : 'บันทึกการประเมิน'}
        </button>
      </div>
    </div>
  );
};

export default EvaluationForm;
