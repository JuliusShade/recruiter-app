import React, { useState } from "react";
import { Layout } from "../components/common/Layout";
import { CandidateList } from "../components/dashboard/CandidateList";
import { RatingForm } from "../components/dashboard/RatingForm";
import { SummaryGenerator } from "../components/dashboard/SummaryGenerator";
import { Candidate } from "../types";
import { AIEvaluation } from "../components/dashboard/AIEvaluation";

export const Dashboard: React.FC = () => {
  const [collapsed, setCollapsed] = useState(true);
  const [selectedCandidate, setSelectedCandidate] =
    React.useState<Candidate | null>(null);

  const handleEvaluationComplete = (score: number, summary: string) => {
    if (selectedCandidate) {
      setSelectedCandidate({
        ...selectedCandidate,
        aiScore: score,
        summary,
      });
    }
  };

  return (
    <Layout collapsed={collapsed} setCollapsed={setCollapsed}>
      <div className="dashboard-container">
        <div className="dashboard-grid">
          {/* Left Panel - Candidate List */}
          <div className="candidate-list-panel">
            <CandidateList onSelectCandidate={setSelectedCandidate} />
          </div>

          {/* Right Panel - Rating and Summary */}
          <div className="rating-summary-panel">
            {selectedCandidate ? (
              <>
                <AIEvaluation
                  candidate={selectedCandidate}
                  onEvaluationComplete={handleEvaluationComplete}
                />
                {selectedCandidate.aiScore && (
                  <SummaryGenerator
                    candidate={selectedCandidate}
                    onSummaryGenerate={(summary) => {
                      setSelectedCandidate({
                        ...selectedCandidate,
                        summary,
                      });
                    }}
                  />
                )}
              </>
            ) : (
              <div className="no-candidate-selected">
                Select a candidate to begin evaluation
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};
