import React from 'react';

interface CandidateCardProps {
  candidate: {
    id: string;
    name: string;
    position: string;
    status: 'new' | 'in_review' | 'ready_for_hm';
    rating?: number;
    lastUpdated: Date;
  };
  onSelect: (candidateId: string) => void;
}

export const CandidateCard: React.FC<CandidateCardProps> = ({ candidate, onSelect }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'blue';
      case 'in_review': return 'yellow';
      case 'ready_for_hm': return 'green';
      default: return 'gray';
    }
  };

  return (
    <div 
      className="candidate-card"
      onClick={() => onSelect(candidate.id)}
    >
      <div className="candidate-header">
        <h3>{candidate.name}</h3>
        <span className={`status-badge ${getStatusColor(candidate.status)}`}>
          {candidate.status}
        </span>
      </div>
      <p className="position">{candidate.position}</p>
      {candidate.rating && (
        <div className="rating">
          Rating: {candidate.rating}/5
        </div>
      )}
      <div className="last-updated">
        Last updated: {candidate.lastUpdated.toLocaleDateString()}
      </div>
    </div>
  );
};
