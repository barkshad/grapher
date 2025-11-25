import React from 'react';
import { Camera, ShieldCheck, Grid } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: 'gallery' | 'admin';
  onNavigate: (page: 'gallery' | 'admin') => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentPage, onNavigate }) => {
  return (
    <div className="min-h-screen bg-background text-primary font-sans flex flex-col">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div 
              className="flex items-center gap-2 cursor-pointer group" 
              onClick={() => onNavigate('gallery')}
            >
              <div className="w-8 h-8 bg-white text-black rounded-lg flex items-center justify-center transition-transform group-hover:scale-110">
                <Camera size={20} />
              </div>
              <span className="font-bold text-xl tracking-tight">LUMINA</span>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => onNavigate('gallery')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentPage === 'gallery' ? 'text-white bg-white/10' : 'text-secondary hover:text-white'
                }`}
              >
                <span className="flex items-center gap-2"><Grid size={16}/> Gallery</span>
              </button>
              <button
                onClick={() => onNavigate('admin')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentPage === 'admin' ? 'text-white bg-white/10' : 'text-secondary hover:text-white'
                }`}
              >
                 <span className="flex items-center gap-2"><ShieldCheck size={16}/> Admin</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 mt-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-secondary text-sm">
          <p>© {new Date().getFullYear()} Lumina Portfolio. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};
