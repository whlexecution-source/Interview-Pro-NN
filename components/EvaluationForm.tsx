
import React, { useState, useMemo, useEffect } from 'react';
import { Candidate, Question, User, EvaluationAnswer } from '../types.ts';
import { ChevronLeft, Save, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
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
    return Object.values(answers).reduce((acc, curr) => acc + curr.score, 0);
  }, [answers]);

  const handleScore = (q: Question, level: 'Low' | 'Mid' | 'High') => {
    const levelScore = level === 'Low' ? 1 : level === 'Mid' ? 2 : 3;
    const calculatedScore = (levelScore * q.weight) / 100;
    
    setAnswers(prev => ({
      ...prev,
      [q.id]: {
        questionId: q.id,
        level,
        score: parseFloat(calculatedScore.toFixed(2))
      }
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
      const payload = {
        candidateId: candidate.id,
        evaluatorId: user.id,
        evaluatorName: user.name,
        answers: Object.values(answers),
        totalScore: totalScore.toFixed(2),
        comments: comments,
        timestamp: new Date().toISOString()
      };
      
      await submitEvaluation(payload);
      setShowSuccess(true);
      setTimeout(() => {
        onSubmitSuccess();
      }, 2000);
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
        <p className="text-slate-500">ข้อมูลการประเมินถูกส่งเข้าสู่ระบบ Google Sheets เรียบร้อยแล้ว</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden animate-fadeIn relative">
      <header className="glass-header sticky top-0 z-30 px-6 py-4 flex items-center justify-between">
        <button onClick={onBack} className="p-2 -ml-2 text-slate-600 hover:text-blue-600">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="text-center">
          <h2 className="font-bold text-slate-800">แบบประเมินผู้สมัคร</h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{candidate.name}</p>
        </div>
        <div className="w-10"></div>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-6 pb-40 space-y-8">
        {/* Profile Card */}
        <div className="p-5 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl text-white shadow-lg">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
              <span className="text-xl font-bold">{candidate.name.charAt(0)}</span>
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">{candidate.name}</h3>
              <p className="text-blue-100 text-xs">{candidate.position}</p>
            </div>
          </div>
          <div className="h-px bg-white/10 w-full mb-3"></div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-blue-200 uppercase font-bold">คะแนนรวมสุทธิ</span>
            <span className="text-2xl font-black">{totalScore.toFixed(2)}</span>
          </div>
        </div>

        {/* Dynamic Questions */}
        {Object.entries(categories).map(([category, qs]) => (
          <div key={category} className="space-y-4">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest pl-2 border-l-4 border-blue-500">
              หมวด: {category}
            </h4>
            {qs.map(q => (
              <div key={q.id} className="glass-card p-5 rounded-3xl space-y-4">
                <div>
                  <h5 className="font-bold text-slate-800 text-sm">{q.question}</h5>
                  <p className="text-xs text-slate-500 mt-1">{q.detail}</p>
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  {(['Low', 'Mid', 'High'] as const).map(lvl => {
                    const isActive = answers[q.id]?.level === lvl;
                    return (
                      <button
                        key={lvl}
                        onClick={() => handleScore(q, lvl)}
                        className={`py-3 px-2 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all border-2
                          ${isActive 
                            ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-100' 
                            : 'bg-white text-slate-400 border-slate-100 hover:border-blue-200'}`}
                      >
                        {lvl === 'Low' ? 'ระดับ 1' : lvl === 'Mid' ? 'ระดับ 2' : 'ระดับ 3'}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ))}

        {/* Comments */}
        <div className="space-y-4">
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest pl-2 border-l-4 border-slate-300">
            ความคิดเห็นเพิ่มเติมจากผู้สัมภาษณ์
          </h4>
          <textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="ระบุรายละเอียด หรือข้อเสนอแนะเพิ่มเติม..."
            className="w-full glass-card p-4 rounded-3xl min-h-[120px] text-sm focus:ring-2 focus:ring-blue-500 border-none outline-none"
          />
        </div>
      </div>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-6 bg-gradient-to-t from-slate-50 via-slate-50 to-transparent">
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-200 rounded-2xl flex items-center gap-2 text-red-700 text-xs font-bold animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 text-lg shadow-xl transition-all active:scale-95
            ${isSubmitting ? 'bg-slate-300 text-slate-500' : 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-blue-200'}`}
        >
          {isSubmitting ? (
            <RefreshCw className="w-6 h-6 animate-spin" />
          ) : (
            <>
              <Save className="w-5 h-5" />
              บันทึกผลการประเมิน
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default EvaluationForm;
