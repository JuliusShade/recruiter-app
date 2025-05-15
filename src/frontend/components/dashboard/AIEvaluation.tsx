import React, { useState } from 'react';
import { Candidate, CandidateDocument } from '../../types';

interface AIEvaluationProps {
  candidate: Candidate;
  onEvaluationComplete: (score: number, summary: string) => void;
}

export const AIEvaluation: React.FC<AIEvaluationProps> = ({ 
  candidate, 
  onEvaluationComplete 
}) => {
  const [documents, setDocuments] = useState<CandidateDocument[]>([]);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [jobDescription, setJobDescription] = useState('');

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newDocuments: CandidateDocument[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const content = await file.text();
      
      newDocuments.push({
        id: Date.now().toString() + i,
        type: file.name.includes('resume') ? 'resume' : 
              file.name.includes('interview') ? 'interview_notes' : 'other',
        content,
        fileName: file.name,
        uploadedAt: new Date()
      });
    }

    setDocuments(prev => [...prev, ...newDocuments]);
  };

  const evaluateCandidate = async () => {
    setIsEvaluating(true);
    try {
      // Call your backend API that interfaces with OpenAI
      const response = await fetch('/api/evaluate-candidate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          candidateId: candidate.id,
          documents,
          jobDescription
        }),
      });

      const { score, summary } = await response.json();
      onEvaluationComplete(score, summary);
    } catch (error) {
      console.error('Error evaluating candidate:', error);
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="ai-evaluation">
      <h3>AI Candidate Evaluation</h3>
      
      <div className="job-description-section">
        <label>Job Description</label>
        <textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste the job description here..."
          rows={5}
        />
      </div>

      <div className="document-upload-section">
        <label>Upload Candidate Documents</label>
        <input
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.txt"
          onChange={handleFileUpload}
        />
        
        <div className="uploaded-documents">
          {documents.map(doc => (
            <div key={doc.id} className="document-item">
              <span>{doc.fileName}</span>
              <span className="document-type">{doc.type}</span>
            </div>
          ))}
        </div>
      </div>

      <button 
        className="evaluate-button"
        onClick={evaluateCandidate}
        disabled={isEvaluating || documents.length === 0 || !jobDescription}
      >
        {isEvaluating ? 'Evaluating...' : 'Evaluate Candidate'}
      </button>
    </div>
  );
}; 