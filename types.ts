
export type Role = 'Recruiter' | 'Supervisor';

export interface User {
  id: string;
  name: string;
  phone: string;
  role: Role;
  area: string;
}

export interface Candidate {
  id: string;
  name: string;
  position: string;
  area: string;
  // ข้อมูลที่ดึงจาก Sheets ชุดใหม่
  Sup_Status: string;
  Sup_Score: number;
  Rec_Status: string;
  Rec_Score: number;
}

export interface Question {
  id: string;
  category: string;
  question: string;
  detail: string;
  scoreLow: number;
  scoreMid: number;
  scoreHigh: number;
}

export interface EvaluationAnswer {
  questionId: string;
  level: 'Low' | 'Mid' | 'High';
  score: number;
}

export interface InitialDataResponse {
  status: 'success' | 'error';
  users: User[];
  candidates: Candidate[];
  questions: Question[];
}

export type View = 'LOGIN' | 'LIST' | 'FORM';
