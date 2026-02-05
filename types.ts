
export type Role = 'Recruiter' | 'Supervisor';

export interface User {
  name: string;
  role: Role;
  area: string;
  tel: string; 
}

export interface Candidate {
  candidate_name: string;
  area: string;
  phone: string;
  sup_status: string;
  sup_score: number | string;
  rec_status: string;
  rec_score: number | string;
}

export interface Question {
  qid: string; // อัปเดตจาก id เป็น qid ตามหัวตาราง
  category: string;
  question: string;
  detail: string;
  low: number;  // อัปเดตให้ตรงตาม Sheet
  mid: number;  // อัปเดตให้ตรงตาม Sheet
  high: number; // อัปเดตให้ตรงตาม Sheet
  // รองรับชื่อสำรองเผื่อ API มีการแมพชื่ออื่น
  scoreLow?: number;
  scoreMid?: number;
  scoreHigh?: number;
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
