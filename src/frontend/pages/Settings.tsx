import React, { useState } from "react";
import { Layout } from "../components/common/Layout";

export const Settings: React.FC = () => {
  const [collapsed, setCollapsed] = useState(true);

  return (
    <Layout collapsed={collapsed} setCollapsed={setCollapsed}>
      <div className="dashboard-container">
        <h2>Settings</h2>
        {/* Add your settings page content here */}
      </div>
    </Layout>
  );
};
