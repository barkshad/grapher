import React, { useMemo, useState } from 'react';
import { Photo } from '../types';
import { Search, Share2, Check } from 'lucide-react';

interface GalleryProps {
  photos: Photo[];
  onPhotoClick: (photo: Photo) => void;
}

export const Gallery: React.FC<GalleryProps> = ({ photos, onPhotoClick }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Extract all unique tags
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    photos.forEach(p => p.tags.forEach(t => tags.add(t.toLowerCase())));
    return Array.from(tags).sort();
  }, [photos]);

  // Filter photos
  const filteredPhotos = useMemo(() => {
    return photos.filter(photo => {
      const matchesSearch = photo.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            photo.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTag = selectedTag ? photo.tags.some(t => t.toLowerCase() === selectedTag) : true;
      return matchesSearch && matchesTag;
    });
  }, [photos, searchTerm, selectedTag]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Header & Hero */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/5">
        <div className="space-y-2">
          <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">
            Captured <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-purple-500">Moments</span>
          </h1>
          <p className="text-lg text-secondary max-w-lg">
            A curated collection of visual stories. Explore the world through my lens.
          </p>
        </div>
        
        <div className="flex gap-3">
            <button 
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm font-medium hover:bg-white/10 transition-colors text-secondary hover:text-white"
            >
                {copied ? <Check size={16} className="text-green-400" /> : <Share2 size={16} />}
                {copied ? 'Link Copied' : 'Share Gallery'}
            </button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-6 sticky top-20 z-40 bg-background/95 backdrop-blur py-4 -mx-4 px-4 border-b border-white/5 md:static md:bg-transparent md:p-0 md:border-none">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
             {/* Tag Cloud */}
            <div className="flex flex-wrap gap-2 flex-grow">
                <button 
                    onClick={() => setSelectedTag(null)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 border ${
                        selectedTag === null 
                            ? 'bg-white text-black border-white shadow-lg shadow-white/10 scale-105' 
                            : 'bg-transparent text-secondary border-white/10 hover:border-white/30 hover:text-white'
                    }`}
                >
                    All Work
                </button>
                {allTags.map(tag => (
                    <button
                        key={tag}
                        onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 border capitalize ${
                            selectedTag === tag 
                                ? 'bg-white text-black border-white shadow-lg shadow-white/10 scale-105' 
                                : 'bg-transparent text-secondary border-white/10 hover:border-white/30 hover:text-white'
                        }`}
                    >
                        {tag}
                    </button>
                ))}
            </div>

            {/* Search */}
            <div className="relative group min-w-[200px]">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-secondary group-focus-within:text-accent transition-colors">
                    <Search size={16} />
                </div>
                <input 
                    type="text" 
                    placeholder="Search collection..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm text-white focus:outline-none focus:border-accent/50 focus:bg-white/10 w-full transition-all"
                />
            </div>
        </div>
      </div>

      {/* Masonry Grid */}
      {filteredPhotos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center space-y-4 border border-dashed border-white/10 rounded-2xl bg-white/5">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                <Search size={32} className="text-white/20" />
            </div>
            <div>
                <h3 className="text-xl font-semibold text-white">No photos found</h3>
                <p className="text-secondary mt-1">Try adjusting your search or filters.</p>
            </div>
            {searchTerm || selectedTag ? (
                <button 
                    onClick={() => {setSearchTerm(''); setSelectedTag(null)}}
                    className="text-accent hover:underline text-sm"
                >
                    Clear all filters
                </button>
            ) : null}
        </div>
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
            {filteredPhotos.map((photo) => (
            <div 
                key={photo.id} 
                className="break-inside-avoid group relative cursor-zoom-in overflow-hidden rounded-xl bg-surface shadow-2xl shadow-black/50"
                onClick={() => onPhotoClick(photo)}
            >
                <img 
                    src={photo.url} 
                    alt={photo.title} 
                    className="w-full h-auto object-cover transform transition-transform duration-700 group-hover:scale-105 will-change-transform"
                    loading="lazy"
                />
                
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-6">
                    <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                        <h3 className="text-white font-bold text-lg leading-tight">{photo.title}</h3>
                        <div className="flex items-center justify-between mt-2">
                            <p className="text-white/70 text-xs font-medium uppercase tracking-wider">
                                {new Date(photo.dateUploaded).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                            </p>
                            {photo.tags[0] && (
                                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded text-white backdrop-blur-sm capitalize">
                                    {photo.tags[0]}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            ))}
        </div>
      )}
    </div>
  );
};