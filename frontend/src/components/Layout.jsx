import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout({ user, onLogout }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex bg-[#05020c] min-h-screen text-slate-100 font-sans overflow-hidden">
      
      {/* Collapsible Sidebar Navigation */}
      <Sidebar 
        user={user} 
        onLogout={onLogout} 
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto">
        <main className="flex-grow p-6 md:p-8 max-w-7xl mx-auto w-full transition-all duration-300">
          <Outlet />
        </main>
      </div>

    </div>
  );
}
