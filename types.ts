
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
  "store name": string; // แมพตรงกับหัวตาราง Column C
  phone: string;
  sup_status: string;
  sup_score: number | string;
  rec_status: string;
  rec_score: number | string;
}

export interface Question {
  qid: string;
  category: string;
  question: string;
  detail: string;
  low: number;
  mid: number;
  high: number;
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
