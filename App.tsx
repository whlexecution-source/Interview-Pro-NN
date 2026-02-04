
import React, { useState, useEffect, useCallback } from 'react';
import { User, Candidate, Question, View } from './types';
import { getInitialData } from './services/api';
import Login from './components/Login';
import CandidateList from './components/CandidateList';
import EvaluationForm from './components/EvaluationForm';
import { Loader2, RefreshCw } from 'lucide-react';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<View>('LOGIN');
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  
  const [users, setUsers] = useState<User[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getInitialData();
      if (data.status === 'success') {
        setUsers(data.users);
        setCandidates(data.candidates);
        setQuestions(data.questions);
      } else {
        setError('Data format error from server');
      }
    } catch (err) {
      setError('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาลองใหม่');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setCurrentView('LIST');
  };

  const handleSelectCandidate = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setCurrentView('FORM');
  };

  const handleBackToList = () => {
    setCurrentView('LIST');
    setSelectedCandidate(null);
    fetchData(); // Refresh list after submission
  };

  if (isLoading && currentView === 'LOGIN') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 text-slate-600">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-4" />
        <p className="font-medium">กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  return (
    <div className="flex justify-center min-h-screen bg-slate-100 font-['Sarabun']">
      <main className="w-full max-w-md bg-slate-50 min-h-screen shadow-2xl relative overflow-x-hidden flex flex-col">
        {error && (
          <div className="absolute top-4 left-4 right-4 z-50 p-4 bg-red-100 border border-red-200 rounded-xl flex items-center justify-between animate-fadeIn">
            <span className="text-red-700 text-sm">{error}</span>
            <button 
              onClick={fetchData} 
              className="p-2 bg-red-200 rounded-lg text-red-800"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        )}

        {currentView === 'LOGIN' && (
          <Login users={users} onLogin={handleLogin} />
        )}

        {currentView === 'LIST' && currentUser && (
          <CandidateList 
            candidates={candidates} 
            user={currentUser} 
            onSelect={handleSelectCandidate} 
            onRefresh={fetchData}
            isRefreshing={isLoading}
          />
        )}

        {currentView === 'FORM' && currentUser && selectedCandidate && (
          <EvaluationForm 
            candidate={selectedCandidate} 
            questions={questions} 
            user={currentUser}
            onBack={handleBackToList}
            onSubmitSuccess={handleBackToList}
          />
        )}
      </main>
    </div>
  );
};

export default App;
