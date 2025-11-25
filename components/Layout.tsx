import React from 'react';
import { Camera, ShieldCheck, Grid, Globe } from 'lucide-react';
import { ViewMode } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentView: ViewMode;
  onNavigate: (view: ViewMode) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentView, onNavigate }) => {
  const isGallery = currentView === ViewMode.GALLERY;
  const isAdmin = currentView === ViewMode.ADMIN;

  return (
    <div className="min-h-screen bg-background text-primary font-sans flex flex-col">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-background/90 backdrop-blur-xl border-b border-white/5 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button 
              onClick={() => onNavigate(ViewMode.GALLERY)} 
              className="flex items-center gap-3 group focus:outline-none"
            >
              <div className="w-9 h-9 bg-white text-black rounded-lg flex items-center justify-center transition-transform group-hover:rotate-6 shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                <Camera size={20} strokeWidth={2.5} />
              </div>
              <div className="flex flex-col text-left">
                <span className="font-bold text-xl tracking-tight text-white leading-none">LUMINA</span>
                <span className="text-[10px] text-accent tracking-widest uppercase font-semibold">Portfolio</span>
              </div>
            </button>

            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={() => onNavigate(ViewMode.GALLERY)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                  isGallery 
                    ? 'text-black bg-white shadow-[0_0_20px_rgba(255,255,255,0.15)]' 
                    : 'text-secondary hover:text-white hover:bg-white/5'
                }`}
              >
                <Grid size={16} /> 
                <span className="hidden sm:inline">Gallery</span>
              </button>
              <button
                onClick={() => onNavigate(ViewMode.ADMIN)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                  isAdmin 
                    ? 'text-white bg-accent/90 shadow-[0_0_20px_rgba(59,130,246,0.4)]' 
                    : 'text-secondary hover:text-white hover:bg-white/5'
                }`}
              >
                 <ShieldCheck size={16} />
                 <span className="hidden sm:inline">Admin</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 mt-auto bg-black/20">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center justify-center text-center gap-4">
          <div className="flex items-center gap-2 text-white/20">
            <Camera size={24} />
          </div>
          <div className="text-secondary text-sm">
            <p>© {new Date().getFullYear()} Lumina Portfolio.</p>
            <p className="text-white/20 mt-1 text-xs">Professional Photography Showcase</p>
          </div>
        </div>
      </footer>
    </div>
  );
};