import React, { useState } from 'react';
import { CandidateCard } from './CandidateCard';
import { Candidate } from '../../types';

export const CandidateList: React.FC<{
  onSelectCandidate: (candidate: Candidate) => void;
}> = ({ onSelectCandidate }) => {
  const [filter, setFilter] = useState<'all' | 'new' | 'in_review' | 'ready_for_hm'>('all');
  
  // This would come from your Supabase database
  const [candidates, setCandidates] = useState<Candidate[]>([
    {
      id: '1',
      name: 'John Doe',
      position: 'Senior React Developer',
      status: 'new',
      lastUpdated: new Date(),
      documents: []
    },
    // Add more mock data as needed
  ]);

  const filteredCandidates = candidates.filter(
    candidate => filter === 'all' || candidate.status === filter
  );

  return (
    <div className="candidate-list">
      <div className="candidate-list-header">
        <h2>Candidates</h2>
        <div className="filters">
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value as any)}
          >
            <option value="all">All</option>
            <option value="new">New</option>
            <option value="in_review">In Review</option>
            <option value="ready_for_hm">Ready for HM</option>
          </select>
        </div>
      </div>
      <div className="candidate-grid">
        {filteredCandidates.map(candidate => (
          <CandidateCard
            key={candidate.id}
            candidate={candidate}
            onSelect={() => onSelectCandidate(candidate)}
          />
        ))}
      </div>
    </div>
  );
};
