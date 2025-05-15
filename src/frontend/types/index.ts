export interface Candidate {
  id: string;
  name: string;
  position: string;
  status: 'new' | 'in_review' | 'ready_for_hm';
  documents: CandidateDocument[];
  aiScore?: number;
  rating?: number;
  summary?: string;
  lastUpdated: Date;
  email?: string;
  phone?: string;
  experience?: string;
  skills?: string[];
}

export interface CandidateDocument {
  id: string;
  type: 'resume' | 'interview_notes' | 'job_description' | 'other';
  content: string;
  fileName: string;
  uploadedAt: Date;
}

export interface RatingCriteria {
  id: string;
  name: string;
  weight: number;
  description: string;
}

export interface Rating {
  candidateId: string;
  criteriaId: string;
  score: number;
  notes: string;
}
