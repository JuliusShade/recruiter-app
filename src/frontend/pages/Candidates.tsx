import React, { useState } from "react";
import { Layout } from "../components/common/Layout";
import { CandidateForm } from '../components/candidates/CandidateForm';
import { CandidateList } from '../components/candidates/CandidateList';

export const Candidates: React.FC = () => {
  const [collapsed, setCollapsed] = useState(true);

  return (
    <Layout key="candidates-layout" collapsed={collapsed} setCollapsed={setCollapsed}>
      <div className="dashboard-container">
        <h2>Candidates</h2>
        <CandidateForm onCandidateAdded={() => {/* refresh list if needed */}} />
        <CandidateList />
      </div>
    </Layout>
  );
};
