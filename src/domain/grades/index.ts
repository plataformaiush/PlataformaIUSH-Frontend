// src/domain/grades/index.ts

export type GradeStatus = 'approved' | 'in-progress';
export type ModuleStatus = 'completed' | 'in-progress' | 'not-started';
export type CertificateStatus = 'unlocked' | 'locked';

export interface Student {
  id: string;
  name: string;
  progress: number;
  moduleN: number;
  moduleNPlus1: number;
  finalAverage: number;
  status: GradeStatus;
}

export interface Assignment {
  id: string;
  name: string;
  score: number;
  maxScore: number;
  weight: number;
  submittedDate: string;
}

export interface Module {
  id: string;
  name: string;
  score: number;
  maxScore: number;
  completedDate: string;
  status: ModuleStatus;
  assignments: Assignment[];
}

export interface Certificate {
  id: string;
  courseName: string;
  issueDate: string;
  certificateId: string;
  status: CertificateStatus;
  progress?: number;
}

export interface ThemeColors {
  primary: string;
  secondary: string;
  tertiary: string;
  neutral: string;
}
