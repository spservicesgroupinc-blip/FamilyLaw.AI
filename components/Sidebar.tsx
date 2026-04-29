import React from 'react';
import { ViewMode } from '../types';
import { Icons as IconSet } from '../constants';

interface SidebarProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  tokenUsage: number;
  onInstall: () => void;
  canInstall: boolean;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange, tokenUsage, onInstall, canInstall, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const navItems: { id: ViewMode; label: string; icon: React.FC }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: IconSet.Gavel },
    { id: 'assistant', label: 'AI Assistant', icon: IconSet.Chat },
    { id: 'research', label: 'Deep Research', icon: IconSet.Search },
    { id: 'drafting', label: 'Draft Motion', icon: IconSet.Scale },
    { id: 'files', label: 'Case Files', icon: IconSet.Document },
    { id: 'profile', label: 'Settings', icon: IconSet.Settings },
  ];

  const formatTokens = (num: number) => {
    return num > 1000 ? `${(num / 1000).toFixed(1)}k` : num;
  };

  return (
    <>
    <div className="w-full md:w-20 lg:w-64 bg-legal-900 text-legal-50 flex flex-row md:flex-col justify-between h-16 md:h-screen shrink-0 border-t md:border-t-0 md:border-r border-legal-800 z-50 pb-safe md:pb-0">
      <div className="flex-1 md:flex-none flex flex-row items-center justify-between px-4 w-full h-full md:h-auto overflow-hidden">
        <div className="hidden md:flex p-6 flex-col items-center lg:items-start gap-3 border-b border-legal-800">
          <div className="flex items-center gap-3">
            <div className="bg-legal-800 p-2 rounded-lg border border-legal-700">
               <IconSet.Users className="w-5 h-5 text-legal-200" />
            </div>
            <span className="text-2xl font-serif font-bold hidden lg:block tracking-wide text-legal-50">FamilyLaw.AI</span>
          </div>
          <span className="hidden lg:block text-[10px] text-legal-400 uppercase tracking-widest font-medium">AI Partner in Family Court</span>
        </div>
        
        {/* Mobile Hamburger Menu Button */}
        <button className="md:hidden p-2 text-legal-400" onClick={() => setIsMobileMenuOpen(true)}>
            <IconSet.Menu className="w-6 h-6" />
        </button>

        {/* Desktop Nav */}
        <nav className="hidden md:flex flex-col w-full h-auto items-center justify-start mt-8 px-2 lg:px-4 space-y-2">
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`flex items-center justify-start gap-4 px-4 py-3 rounded-lg transition-all duration-200 w-full ${
                isActive
                  ? 'text-legal-50 bg-legal-800 shadow-sm border border-legal-700'
                  : 'text-legal-400 hover:text-legal-100 hover:bg-legal-800/50'
              }`}
            >
               <item.icon className={`w-5 h-5`} />
               <span className={`text-xs uppercase tracking-widest font-medium ${isActive ? 'text-legal-50' : 'text-legal-400'} hidden lg:block`}>
                {item.label}
              </span>
            </button>
          )})}
        </nav>
      </div>

      <div className="hidden md:block p-4 border-t border-legal-800 space-y-4">
        {/* Token Tracker */}
        <div className="bg-legal-800/50 rounded-lg p-3 hidden lg:block border border-legal-800">
            <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-semibold text-legal-400 uppercase tracking-wider">Session Usage</span>
                <div className="flex flex-col items-end">
                  <span className="text-xs font-mono text-legal-200">{formatTokens(tokenUsage)} toks</span>
                  <span className="text-[10px] font-mono text-legal-400">${((tokenUsage / 1000000) * 0.075).toFixed(4)}</span>
                </div>
            </div>
            <div className="h-1 bg-legal-900 rounded-full w-full overflow-hidden">
                <div 
                    className="h-full bg-legal-400 transition-all duration-500" 
                    style={{ width: `${Math.min((tokenUsage / 100000) * 100, 100)}%` }}
                ></div>
            </div>
        </div>

        {canInstall && (
            <button 
                onClick={onInstall}
                className="w-full flex items-center gap-4 px-4 py-3 rounded-lg text-legal-300 hover:bg-legal-800 transition-all duration-200 border border-legal-700"
            >
                <IconSet.Download className="w-5 h-5" />
                <span className="hidden lg:block font-medium text-xs uppercase tracking-widest">Install App</span>
            </button>
        )}

        <button 
            onClick={onLogout}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-lg text-legal-300 hover:bg-legal-800 hover:text-red-400 transition-all duration-200 border border-transparent hover:border-red-900/50"
        >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
            </svg>
            <span className="hidden lg:block font-medium text-xs uppercase tracking-widest">Sign Out</span>
        </button>

        <div className="mt-4 text-center lg:text-left">
           <p className="text-[10px] text-legal-600 uppercase tracking-widest">v1.2.0 • Desktop PWA</p>
        </div>
      </div>
    </div>

    {/* Mobile Menu Overlay */}
    {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-legal-900 z-[100] p-6 flex flex-col">
            <div className="flex justify-end mb-8">
                <button onClick={() => setIsMobileMenuOpen(false)} className="text-legal-400">
                    <IconSet.Settings className="w-8 h-8" /> {/* Reusing Settings Icon as close button for now, or X */}
                </button>
            </div>
            <nav className="flex flex-col space-y-4">
                {navItems.map(item => (
                    <button key={item.id} onClick={() => { onViewChange(item.id); setIsMobileMenuOpen(false); }} className="text-2xl font-serif text-legal-50 py-4 border-b border-legal-800 flex items-center gap-4">
                        <item.icon className="w-6 h-6" />
                        {item.label}
                    </button>
                ))}
            </nav>
            <div className="mt-auto">
                 <button onClick={onLogout} className="text-red-400 font-bold text-xl uppercase tracking-widest">Sign Out</button>
            </div>
        </div>
    )}
    </>
  );
};


export default Sidebar;