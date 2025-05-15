import React, { useState } from 'react';
import { Candidate } from '../../types';

interface SummaryGeneratorProps {
  candidate: Candidate;
  onSummaryGenerate: (summary: string) => void;
}

export const SummaryGenerator: React.FC<SummaryGeneratorProps> = ({ 
  candidate, 
  onSummaryGenerate 
}) => {
  const [guidelines, setGuidelines] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const generateSummary = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          candidateId: candidate.id,
          guidelines,
          aiScore: candidate.aiScore
        }),
      });

      const { summary } = await response.json();
      onSummaryGenerate(summary);
    } catch (error) {
      console.error('Error generating summary:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="summary-generator">
      <h3>Generate Candidate Summary</h3>
      
      {candidate.aiScore && (
        <div className="ai-score">
          <h4>AI Evaluation Score: {candidate.aiScore}/100</h4>
        </div>
      )}

      <div className="guidelines-section">
        <label>Summary Guidelines</label>
        <textarea
          value={guidelines}
          onChange={(e) => setGuidelines(e.target.value)}
          placeholder="Enter any specific guidelines for the summary (e.g., focus on technical skills, highlight cultural fit, etc.)..."
          rows={4}
        />
      </div>

      <button 
        className="generate-button"
        onClick={generateSummary}
        disabled={isGenerating || !candidate.aiScore}
      >
        {isGenerating ? 'Generating...' : 'Generate Summary'}
      </button>
    </div>
  );
};
