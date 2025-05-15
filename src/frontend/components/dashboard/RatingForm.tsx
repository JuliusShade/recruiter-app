import React, { useState } from 'react';
import { Candidate, RatingCriteria } from '../../types';

interface RatingFormProps {
  candidate: Candidate;
  onRatingComplete: (rating: number) => void;
}

export const RatingForm: React.FC<RatingFormProps> = ({ candidate, onRatingComplete }) => {
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState('');

  const criteria: RatingCriteria[] = [
    { id: '1', name: 'Technical Skills', weight: 0.4, description: 'Technical proficiency and knowledge' },
    { id: '2', name: 'Experience', weight: 0.3, description: 'Relevant work experience' },
    { id: '3', name: 'Communication', weight: 0.2, description: 'Communication skills' },
    { id: '4', name: 'Culture Fit', weight: 0.1, description: 'Alignment with company culture' },
  ];

  const handleRatingChange = (criteriaId: string, value: number) => {
    setRatings(prev => ({
      ...prev,
      [criteriaId]: value
    }));
  };

  const calculateTotalRating = () => {
    return Object.entries(ratings).reduce((total, [criteriaId, rating]) => {
      const criteriaWeight = criteria.find(c => c.id === criteriaId)?.weight || 0;
      return total + (rating * criteriaWeight);
    }, 0);
  };

  const handleSubmit = () => {
    const totalRating = calculateTotalRating();
    onRatingComplete(totalRating);
  };

  return (
    <div className="rating-form">
      <h3>Rate Candidate: {candidate.name}</h3>
      {criteria.map(criterion => (
        <div key={criterion.id} className="rating-criterion">
          <label>{criterion.name}</label>
          <div className="rating-input">
            {[1, 2, 3, 4, 5].map(value => (
              <button
                key={value}
                className={`rating-button ${ratings[criterion.id] === value ? 'selected' : ''}`}
                onClick={() => handleRatingChange(criterion.id, value)}
              >
                {value}
              </button>
            ))}
          </div>
          <p className="criterion-description">{criterion.description}</p>
        </div>
      ))}
      <div className="notes-section">
        <label>Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add your notes here..."
        />
      </div>
      <button 
        className="submit-rating"
        onClick={handleSubmit}
      >
        Submit Rating
      </button>
    </div>
  );
};
