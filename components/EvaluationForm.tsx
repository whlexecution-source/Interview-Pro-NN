
import React, { useState, useMemo } from 'react';
import { Candidate, Question, User, EvaluationAnswer } from '../types.ts';
import { ChevronLeft, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
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

  // ดึงคะแนนจากหัวตาราง low, mid, high (รองรับทั้ง lowercase และ camelCase)
  const getScoreValue = (q: any, level: 'Low' | 'Mid' | 'High'): number => {
    const key = level.toLowerCase(); // 'low', 'mid', 'high'
    const altKey = `score${level}`; // 'scoreLow', etc.
    
    const val = q[key] !== undefined ? q[key] : q[altKey];
    return Number(val) || 0;
  };

  // ดึง ID ของคำถามจาก qid (คอลัมน์ G ใน Sheet)
  const getQuestionId = (q: Question) => {
    // ต้องเป็น String และ Trim เพื่อป้องกันความผิดพลาด
    const id = String(q.qid || '').trim();
    if (id) return id;
    // Fallback กรณี qid ว่าง (ไม่แนะนำ)
    return `${q.category}_${q.question}`.replace(/\s+/g, '_');
  };

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
    return questions.reduce((acc, q) => acc + getScoreValue(q, 'High'), 0);
  }, [questions]);

  const isPassing = totalScore >= 80;

  const handleScore = (q: Question, level: 'Low' | 'Mid' | 'High') => {
    const qId = getQuestionId(q);
    const scoreVal = getScoreValue(q, level);
    
    setAnswers(prev => ({
      ...prev,
      [qId]: { questionId: qId, level, score: scoreVal }
    }));
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < questions.length) {
      setError(`กรุณาประเมินให้ครบทุกหัวข้อ (ทำแล้ว ${Object.keys(answers).length}/${questions.length})`);
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await submitEvaluation({
        action: 'submitEvaluation',
        candidateId: candidate.candidate_name,
        candidateName: candidate.candidate_name,
        area: candidate.area,
        role: user.role,
        evaluatorName: user.name,
        totalScore: totalScore,
        answers: Object.values(answers).map(a => ({
          qid: a.questionId,
          level: a.level,
          score: a.score
        })),
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
        <h2 className="text-2xl font-black text-slate-800 mb-2 uppercase">Complete!</h2>
        <div className="text-4xl font-black text-slate-900 mb-8">{totalScore} <span className="text-sm font-bold text-slate-300">/ {maxPossibleScore}</span></div>
        <div className="text-slate-400 font-medium text-sm animate-pulse">กำลังนำท่านกลับหน้าหลัก...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden animate-fadeIn bg-slate-50 relative">
      <header className="glass-header sticky top-0 z-30 px-6 py-5 flex flex-col items-center justify-center border-b border-slate-100 shadow-sm">
        <button onClick={onBack} className="absolute left-4 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-indigo-600 transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h2 className="font-bold text-slate-800 text-[16px] text-center leading-tight">{candidate.candidate_name}</h2>
        <div className="flex items-center gap-1.5 mt-0.5">
           <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded uppercase tracking-widest">{user.role} EVALUATION</span>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-6 pt-8 pb-48 space-y-10">
        {Object.entries(categories).map(([category, qs]) => (
          <div key={category} className="space-y-6">
            <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] border-l-4 border-indigo-500 pl-3">{category}</h4>
            
            {qs.map((q, qIndex) => {
              const qId = getQuestionId(q);
              return (
                <div key={qId} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-5">
                  <div className="flex items-start gap-4">
                    <span className="text-indigo-600 font-black text-sm pt-1.5">{String(qIndex + 1).padStart(2, '0')}</span>
                    <h5 className="font-bold text-slate-800 text-[16px] leading-snug pt-1.5">{q.question}</h5>
                  </div>
                  
                  <div className="bg-slate-50 p-5 rounded-[1.5rem] border border-slate-100 text-[12px] leading-relaxed text-slate-500 whitespace-pre-line font-medium italic">
                    {q.detail || "พิจารณาตามความเหมาะสม"}
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3 pt-2">
                    {(['Low', 'Mid', 'High'] as const).map(lvl => {
                      const isActive = answers[qId]?.level === lvl;
                      const score = getScoreValue(q, lvl);
                      
                      return (
                        <button
                          key={lvl}
                          onClick={() => handleScore(q, lvl)}
                          className={`py-4 px-1 rounded-2xl transition-all border-2 flex flex-col items-center justify-center gap-1
                            ${isActive 
                              ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100 -translate-y-1' 
                              : 'bg-white text-slate-400 border-slate-100 active:scale-95'}`}
                        >
                          <span className={`text-[11px] font-black uppercase tracking-wider`}>
                            {lvl}
                          </span>
                          <span className={`text-[10px] font-bold ${isActive ? 'text-indigo-100' : 'text-slate-300'}`}>
                            {score} pt
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ))}

        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between text-[11px] font-black text-slate-400 uppercase tracking-widest">
            <span>ผลประเมินเบื้องต้น</span>
            <span className={isPassing ? 'text-green-500' : 'text-rose-500'}>
              {isPassing ? 'ผ่านเกณฑ์' : 'ไม่ถึงเกณฑ์'}
            </span>
          </div>
          <div className="flex items-baseline gap-2 justify-center">
            <span className="text-6xl font-black text-slate-900">{totalScore}</span>
            <span className="text-slate-300 font-bold text-xl">/ {maxPossibleScore}</span>
          </div>
          <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-700 ease-out ${isPassing ? 'bg-green-500' : 'bg-rose-500'}`}
              style={{ width: `${(totalScore / maxPossibleScore) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="space-y-3">
           <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">ข้อเสนอแนะเพิ่มเติม</label>
           <textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="ใส่ข้อมูลเพิ่มเติมเกี่ยวกับผู้สมัคร..."
            className="w-full bg-white p-6 rounded-[2rem] min-h-[140px] text-sm focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-200 border-slate-200 border outline-none shadow-sm transition-all font-medium placeholder:text-slate-200"
          />
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-6 bg-gradient-to-t from-slate-50 via-slate-50/90 to-transparent z-40">
        {error && (
          <div className="mb-4 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 text-xs font-bold animate-fadeIn">
            <AlertCircle className="w-5 h-5 shrink-0" /> {error}
          </div>
        )}
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 text-sm shadow-2xl transition-all active:scale-[0.97]
            ${isSubmitting ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-black'}`}
        >
          {isSubmitting ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Confirm & Save'}
        </button>
      </div>
    </div>
  );
};

export default EvaluationForm;
