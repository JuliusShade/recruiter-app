import React, { useState } from "react";
import { Layout } from "../components/common/Layout";
import { PositionForm } from "../components/positions/PositionForm";
import { PositionList } from "../components/positions/PositionList";

export const Positions: React.FC = () => {
  const [collapsed, setCollapsed] = useState(true);

  return (
    <Layout collapsed={collapsed} setCollapsed={setCollapsed}>
      <div className="dashboard-container">
        <h2>Positions</h2>
        <PositionForm
          onPositionAdded={() => {
            /* refresh list if needed */
          }}
        />
        <PositionList />
      </div>
    </Layout>
  );
};
