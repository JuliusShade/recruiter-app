import React from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
  collapsed: boolean;
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}

export const Layout: React.FC<LayoutProps> = ({ children, collapsed, setCollapsed }) => {
  return (
    <div className="app-container">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className="main-container">
        <Header />
        <main className="content">
          {children}
        </main>
      </div>
    </div>
  );
};
