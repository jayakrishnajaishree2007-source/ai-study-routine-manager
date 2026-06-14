import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  GraduationCap, 
  Home, 
  CheckSquare, 
  Flame, 
  BarChart2, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function Sidebar({ user, onLogout, isCollapsed, onToggleCollapse }) {
  const navItems = [
    { name: 'Dashboard', path: '/', icon: Home },
    { name: 'My Routine', path: '/routine', icon: CheckSquare },
    { name: 'Motivation', path: '/motivation', icon: Flame },
    { name: 'Analytics', path: '/analytics', icon: BarChart2 },
  ];

  return (
    <aside className={`bg-[#05020c] border-r border-[#231b42] flex flex-col h-screen sticky top-0 text-slate-100 flex-shrink-0 z-40 transition-all duration-300 ${
      isCollapsed ? 'w-20' : 'w-64'
    }`}>
      
      {/* Brand Header */}
      <div className={`border-b border-[#231b42] flex items-center justify-between transition-all duration-300 ${
        isCollapsed ? 'flex-col gap-3 py-5 px-2' : 'p-6'
      }`}>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-purple-600/20 border border-purple-500/30 flex-shrink-0">
            <GraduationCap className="w-6 h-6 text-purple-400" />
          </div>
          {!isCollapsed && (
            <div className="animate-fadeIn">
              <h2 className="text-base font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400">
                AI StudySync
              </h2>
              <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Intelligent Portal</p>
            </div>
          )}
        </div>

        {/* Collapse Toggle Button */}
        <button
          onClick={onToggleCollapse}
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          className={`p-1.5 rounded-lg border border-[#231b42] bg-[#05020c] text-slate-400 hover:text-slate-200 hover:bg-[#231b42]/40 transition-all focus:outline-none`}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className={`flex-grow p-4 flex flex-col gap-2 mt-4 ${isCollapsed ? 'items-center' : ''}`}>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              title={isCollapsed ? item.name : undefined}
              className={({ isActive }) =>
                `flex items-center rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                  isCollapsed ? 'justify-center w-12 h-12 p-0' : 'px-4 py-3 w-full gap-3'
                } ${
                  isActive
                    ? 'bg-purple-600 text-slate-100 shadow-md shadow-purple-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#231b42]/30'
                }`
              }
            >
              <Icon className="w-4.5 h-4.5 flex-shrink-0" />
              {!isCollapsed && <span className="animate-fadeIn">{item.name}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Section: Profile/Settings and Logout */}
      <div className={`p-4 border-t border-[#231b42] flex flex-col gap-1.5 ${isCollapsed ? 'items-center' : ''}`}>
        
        {/* User Card */}
        {isCollapsed ? (
          <div 
            title={user?.full_name || 'Alex Mercer'} 
            className="w-10 h-10 rounded-full bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold text-xs mb-2 cursor-pointer"
          >
            {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'A'}
          </div>
        ) : (
          <div className="flex items-center gap-3 px-4 py-2 mb-2 bg-[#231b42]/20 border border-[#231b42]/30 rounded-xl w-full animate-fadeIn">
            <div className="w-8 h-8 rounded-full bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold text-xs flex-shrink-0">
              {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-200 truncate">{user?.full_name || 'Alex Mercer'}</p>
              <p className="text-[9px] text-slate-500 truncate">{user?.email || 'demo@student.com'}</p>
            </div>
          </div>
        )}

        {/* Settings Route Link */}
        <NavLink
          to="/settings"
          title={isCollapsed ? "Settings" : undefined}
          className={({ isActive }) =>
            `flex items-center rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
              isCollapsed ? 'justify-center w-12 h-12 p-0' : 'px-4 py-2.5 w-full gap-3'
            } ${
              isActive
                ? 'bg-purple-600/30 text-purple-300 border border-purple-500/20 shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#231b42]/30'
            }`
          }
        >
          <Settings className="w-4.5 h-4.5 flex-shrink-0" />
          {!isCollapsed && <span className="animate-fadeIn">Settings</span>}
        </NavLink>

        {/* Logout Link */}
        <button
          onClick={onLogout}
          title={isCollapsed ? "Logout" : undefined}
          className={`flex items-center rounded-xl text-xs font-bold uppercase tracking-wider text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 transition-all text-left ${
            isCollapsed ? 'justify-center w-12 h-12 p-0' : 'px-4 py-2.5 w-full gap-3'
          }`}
        >
          <LogOut className="w-4.5 h-4.5 flex-shrink-0" />
          {!isCollapsed && <span className="animate-fadeIn">Logout</span>}
        </button>
      </div>

    </aside>
  );
}
