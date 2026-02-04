
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

  // คำนวณคะแนนรวมแบบ Real-time
  const totalScore = useMemo(() => {
    return Object.values(answers).reduce((acc, curr) => acc + (Number(curr.score) || 0), 0);
  }, [answers]);

  // คำนวณคะแนนเต็ม
  const maxPossibleScore = useMemo(() => {
    return questions.reduce((acc, q) => acc + (Number(q.scoreHigh) || 0), 0);
  }, [questions]);

  // เกณฑ์การผ่านคงที่คือ 80 คะแนน
  const passScore = 80;
  const isPassing = totalScore >= passScore;

  const handleScore = (q: Question, level: 'Low' | 'Mid' | 'High') => {
    const scoreMap = {
      'Low': q.scoreLow,
      'Mid': q.scoreMid,
      'High': q.scoreHigh
    };
    const score = Number(scoreMap[level]) || 0;
    
    setAnswers(prev => ({
      ...prev,
      [q.id]: { questionId: q.id, level, score }
    }));
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < questions.length) {
      setError('กรุณาประเมินให้ครบทุกหัวข้อ (Required all fields)');
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
      setTimeout(() => onSubmitSuccess(), 2000);
    } catch (err) {
      setError('ไม่สามารถบันทึกข้อมูลได้ กรุณาตรวจสอบอินเทอร์เน็ต');
      setIsSubmitting(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white animate-fadeIn text-center h-screen">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
          <CheckCircle className="w-16 h-16 text-green-500 animate-bounce" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">บันทึกเรียบร้อย</h2>
        <p className="text-slate-500 mb-8 font-medium">คะแนนรวม: {totalScore} คะแนน</p>
        <button onClick={onSubmitSuccess} className="flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold active:scale-95 transition-all shadow-lg">
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

      <div className="flex-1 overflow-y-auto px-6 py-6 pb-44 space-y-8">
        {/* Score Dashboard */}
        <div className="p-6 bg-slate-900 rounded-3xl text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
          <div className="flex items-center justify-between mb-6 relative z-10">
            <span className="text-[10px] text-slate-400 uppercase font-black tracking-[0.2em]">คะแนนการประเมิน</span>
            <span className="text-[10px] bg-blue-600/30 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-full font-black uppercase">พื้นที่: {candidate.area}</span>
          </div>
          
          <div className="flex items-end justify-between relative z-10">
            <div className="flex items-baseline gap-2">
              <span className="text-6xl font-black tabular-nums">{totalScore}</span>
              <span className="text-slate-500 font-bold text-xl">/ {maxPossibleScore}</span>
            </div>
            
            <div className="text-right">
              <div className="flex items-center gap-1.5 justify-end text-slate-400 mb-1">
                <Target className="w-3.5 h-3.5" />
                <span className="text-[11px] font-bold">เกณฑ์ผ่าน: {passScore}</span>
              </div>
              <div className={`text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-wider ${isPassing ? 'bg-green-500 text-white' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                {isPassing ? 'ผ่านเกณฑ์' : 'ยังไม่ถึงเกณฑ์'}
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Questions Sections */}
        {Object.entries(categories).map(([category, qs]) => (
          <div key={category} className="space-y-4">
            <div className="flex items-center gap-3 pl-2">
              <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
              <h4 className="text-xs font-black text-blue-600 uppercase tracking-[0.15em]">
                {category}
              </h4>
            </div>
            
            {qs.map(q => (
              <div key={q.id} className="glass-card p-5 rounded-3xl border-none shadow-sm space-y-4 bg-white/50 border border-slate-100">
                <h5 className="font-bold text-slate-800 text-[15px] leading-snug">{q.question}</h5>
                
                {/* Condition Box (Column F) */}
                <div className="w-full bg-blue-50/50 p-4 rounded-2xl text-[11px] text-slate-600 min-h-[60px] flex items-start leading-relaxed whitespace-pre-line border border-blue-100/50">
                  <Info className="w-4 h-4 mr-2 shrink-0 text-blue-400 mt-0.5" />
                  <div className="font-medium">{q.detail || "ไม่มีรายละเอียดประกอบการตัดสินใจ"}</div>
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                  {(['Low', 'Mid', 'High'] as const).map(lvl => {
                    const isActive = answers[q.id]?.level === lvl;
                    const val = lvl === 'Low' ? q.scoreLow : lvl === 'Mid' ? q.scoreMid : q.scoreHigh;
                    
                    return (
                      <button
                        key={lvl}
                        onClick={() => handleScore(q, lvl)}
                        className={`py-4 px-2 rounded-2xl transition-all border-2 flex flex-col items-center justify-center gap-1
                          ${isActive 
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xl shadow-blue-200 -translate-y-1' 
                            : 'bg-white text-slate-400 border-slate-100 active:scale-95'}`}
                      >
                        <span className="text-[9px] font-black uppercase tracking-widest">{lvl}</span>
                        <span className={`text-sm font-black ${isActive ? 'text-white' : 'text-slate-800'}`}>
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

        {/* Comment Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 pl-2">
            <div className="w-1.5 h-6 bg-slate-300 rounded-full"></div>
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.15em]">ความเห็นเพิ่มเติม</h4>
          </div>
          <textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="สรุปจุดเด่นหรือข้อสังเกตที่มีผลต่อการตัดสินใจ..."
            className="w-full glass-card p-6 rounded-3xl min-h-[160px] text-sm focus:ring-4 focus:ring-blue-500/10 border-none outline-none shadow-sm placeholder:text-slate-300 font-medium"
          />
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-6 bg-gradient-to-t from-slate-50 via-slate-50 to-transparent z-40">
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-200 rounded-2xl flex items-center gap-2 text-red-700 text-xs font-bold animate-fadeIn shadow-lg">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`w-full py-5 rounded-2xl font-black flex items-center justify-center gap-3 text-lg shadow-2xl transition-all active:scale-95
            ${isSubmitting ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-black'}`}
        >
          {isSubmitting ? <RefreshCw className="w-6 h-6 animate-spin" /> : <><Save className="w-6 h-6" /> บันทึกการประเมิน</>}
        </button>
      </div>
    </div>
  );
};

export default EvaluationForm;
