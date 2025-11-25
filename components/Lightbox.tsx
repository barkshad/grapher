import React, { useEffect } from 'react';
import { Photo } from '../types';
import { X, Calendar, Tag, Info } from 'lucide-react';

interface LightboxProps {
  photo: Photo | null;
  onClose: () => void;
}

export const Lightbox: React.FC<LightboxProps> = ({ photo, onClose }) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (photo) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEsc);
    }
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleEsc);
    };
  }, [photo, onClose]);

  if (!photo) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 animate-fade-in">
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors p-2 z-10"
      >
        <X size={32} />
      </button>

      <div className="flex flex-col lg:flex-row w-full max-w-6xl h-full lg:h-[85vh] gap-6">
        {/* Image Container */}
        <div className="flex-grow flex items-center justify-center relative bg-black/20 rounded-lg overflow-hidden">
          <img 
            src={photo.url} 
            alt={photo.title} 
            className="max-w-full max-h-full object-contain shadow-2xl"
          />
        </div>

        {/* Info Panel */}
        <div className="w-full lg:w-96 flex-shrink-0 bg-surface rounded-2xl p-6 lg:p-8 flex flex-col text-left border border-white/10 overflow-y-auto">
          <h2 className="text-2xl font-bold text-white mb-2">{photo.title}</h2>
          <div className="flex items-center gap-2 text-sm text-secondary mb-6">
            <Calendar size={14} />
            <span>{new Date(photo.dateUploaded).toLocaleDateString()}</span>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Info size={14} /> Description
              </h3>
              <p className="text-white/90 leading-relaxed text-sm">
                {photo.description || "No description provided."}
              </p>
            </div>

            {photo.tags.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Tag size={14} /> Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {photo.tags.map(tag => (
                    <span key={tag} className="px-2 py-1 bg-white/5 rounded text-xs text-secondary border border-white/10">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
