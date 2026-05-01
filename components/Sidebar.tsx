import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

  const navItemsMobile = [
    { id: 'dashboard', label: 'Home', icon: IconSet.Gavel },
    { id: 'assistant', label: 'Chat', icon: IconSet.Chat },
    { id: 'drafting', label: 'Draft', icon: IconSet.Scale },
    { id: 'files', label: 'Files', icon: IconSet.Document },
  ];

  return (
    <div className="w-full md:w-20 lg:w-64 bg-legal-900 text-legal-50 flex flex-col justify-between min-h-[4rem] md:h-screen shrink-0 border-t md:border-t-0 md:border-r border-legal-800 z-50 pb-safe md:pb-0 box-content md:box-border">
      <div className="flex-1 md:flex-none flex flex-col w-full h-full md:h-auto overflow-hidden relative">
        <div className="hidden md:flex p-6 flex-col items-center lg:items-start gap-3 border-b border-legal-800">
          <div className="flex items-center gap-3">
            <div className="bg-legal-800 p-2 rounded-lg border border-legal-700">
               <IconSet.Users className="w-5 h-5 text-legal-200" />
            </div>
            <span className="text-2xl font-serif font-bold hidden lg:block tracking-wide text-legal-50">FamilyLaw.AI</span>
          </div>
          <div className="flex flex-col gap-1 items-start w-full">
            <span className="hidden lg:block text-[10px] text-legal-400 uppercase tracking-widest font-medium">AI Partner in Family Court</span>
            <span className="hidden lg:block text-[8px] text-legal-500 uppercase tracking-widest font-bold">An R2 Technologies Project</span>
          </div>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex flex-col w-full h-auto items-center justify-start px-2 mt-8 lg:px-4 space-y-2">
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
              <div className={`p-0 rounded-full transition-colors flex items-center justify-center ${isActive ? 'bg-transparent' : ''}`}>
                 <item.icon className="w-5 h-5" />
              </div>
              <span className={`text-xs uppercase tracking-widest font-medium ${isActive ? 'text-legal-50' : 'text-legal-400'} hidden lg:block`}>
                {item.label}
              </span>
            </button>
          )})}
        </nav>

        {/* Mobile App Navigation (Bottom Bar) */}
        <nav className="md:hidden flex w-full h-full items-center justify-around px-2 gap-1">
          {navItemsMobile.slice(0, 2).map((item) => {
            const isActive = currentView === item.id;
            return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className="flex-1 flex flex-col items-center justify-center gap-1 h-full py-1"
            >
              <div className={`p-1.5 rounded-full transition-colors flex items-center justify-center ${isActive ? 'bg-legal-800 text-legal-50' : 'text-legal-400'}`}>
                 <item.icon className="w-6 h-6" />
              </div>
              <span className={`text-[9px] uppercase tracking-widest font-medium ${isActive ? 'text-legal-50' : 'text-legal-500'}`}>
                {item.label}
              </span>
            </button>
          )})}

          {/* Central Menu Button */}
          <div className="flex-1 flex items-center justify-center -mt-6">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="bg-legal-700 p-4 rounded-full text-legal-50 border-4 border-legal-900 shadow-xl relative active:scale-95 transition-transform"
            >
              <IconSet.Settings className="w-7 h-7" />
            </button>
          </div>

          {navItemsMobile.slice(2, 4).map((item) => {
            const isActive = currentView === item.id;
            return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className="flex-1 flex flex-col items-center justify-center gap-1 h-full py-1"
            >
              <div className={`p-1.5 rounded-full transition-colors flex items-center justify-center ${isActive ? 'bg-legal-800 text-legal-50' : 'text-legal-400'}`}>
                 <item.icon className="w-6 h-6" />
              </div>
              <span className={`text-[9px] uppercase tracking-widest font-medium ${isActive ? 'text-legal-50' : 'text-legal-500'}`}>
                {item.label}
              </span>
            </button>
          )})}
        </nav>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            className="md:hidden fixed bottom-0 left-0 w-full bg-legal-900 border-t border-legal-800 p-6 rounded-t-2xl z-40 pb-safe"
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-legal-50 font-serif text-xl font-bold">Additional Options</h3>
              <button className="text-legal-400 bg-legal-800 p-2 rounded-full" onClick={() => setIsMenuOpen(false)}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
               <button onClick={() => { onViewChange('research'); setIsMenuOpen(false); }} className="flex flex-col items-start gap-2 text-legal-200 p-4 bg-legal-800 rounded-xl border border-legal-700 active:bg-legal-700 transition">
                 <IconSet.Search className="w-6 h-6 text-legal-400" />
                 <span className="font-medium text-sm">Deep Research</span>
               </button>
               <button onClick={() => { onViewChange('profile'); setIsMenuOpen(false); }} className="flex flex-col items-start gap-2 text-legal-200 p-4 bg-legal-800 rounded-xl border border-legal-700 active:bg-legal-700 transition">
                 <IconSet.Settings className="w-6 h-6 text-legal-400" />
                 <span className="font-medium text-sm">Profile & Settings</span>
               </button>
            </div>
            <div className="grid grid-cols-1 gap-3">
               <button onClick={onLogout} className="flex items-center gap-3 text-legal-300 p-4 bg-legal-800 rounded-xl border border-legal-700">
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                   <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                 </svg>
                 <span className="font-medium text-sm">Sign Out</span>
               </button>
               {canInstall && (
                 <button onClick={() => { onInstall(); setIsMenuOpen(false); }} className="flex items-center gap-3 text-legal-300 p-4 bg-legal-800 rounded-xl border border-legal-700">
                   <IconSet.Download className="w-5 h-5" />
                   <span className="font-medium text-sm">Install App</span>
                 </button>
               )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
  );
};

export default Sidebar;